import { useState, useEffect } from "react";
import styles from "./CouponModal.module.css";
import { MdClose, MdCheckCircle } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import couponService from "../../../../services/couponService";
import { toast } from "react-toastify";

function CouponModal({ show, onClose, onApply, orderTotal = 0 }) {
    const [coupons, setCoupons] = useState([]);
    const [selectedCode, setSelectedCode] = useState("");
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchCoupons();
            setValidationResult(null);
            setSelectedCode("");
        }
    }, [show]);

    const fetchCoupons = async () => {
        try {
            const res = await couponService.getAll();
            const activeCoupons = (res.data || []).filter(c => c.state === 1);
            setCoupons(activeCoupons);
        } catch (error) {
            console.error('Lỗi', error);
        }
    };

    const handleValidate = async (codeToValidate = null) => {
        const code = codeToValidate || selectedCode;

        if (!code.trim()) {
            toast.warning('Vui lòng nhập mã');
            return;
        }

        setLoading(true);
        try {
            const res = await couponService.validate(code.trim(), orderTotal);
            setValidationResult({
                valid: true,
                coupon: res.data.coupon,
                discount: res.data.discount
            });
        } catch (error) {
            setValidationResult({ valid: false });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!validationResult?.valid) {
            return;
        }

        onApply({
            id: validationResult.coupon.coupon_id,
            code: validationResult.coupon.code,
            type: validationResult.coupon.type,
            value: validationResult.coupon.value,
            max_discount: validationResult.coupon.max_discount,
            discount: validationResult.discount
        });
        onClose();
    };

    const handleSelectCoupon = (code) => {
        setSelectedCode(code);
        handleValidate(code);
    };

    const formatMoney = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
    };

    if (!show) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />

            <div className={styles.modal}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <MdClose size={24} />
                </button>

                <div className={styles.header}>
                    <h3>Nhập mã giảm giá</h3>
                </div>

                <div className={styles.body}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="text"
                            placeholder="Nhập mã..."
                            value={selectedCode}
                            onChange={(e) => setSelectedCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                            className={styles.input}
                        />
                        <button
                            onClick={() => handleValidate()}
                            disabled={loading}
                            className={styles.checkBtn}
                        >
                            <MdCheckCircle size={24} />
                        </button>
                    </div>

                    {validationResult && (
                        <div className={validationResult.valid ? styles.validMsg : styles.invalidMsg}>
                            {validationResult.valid ? (
                                <p>Giảm: <strong>{formatMoney(validationResult.discount)}</strong></p>
                            ) : (
                                <p>Mã không hợp lệ hoặc không đủ điều kiện</p>
                            )}
                        </div>
                    )}

                    <div className={styles.couponList}>
                        {coupons.length === 0 ? (
                            <p className={styles.empty}>Không có mã giảm giá</p>
                        ) : (
                            coupons.map((coupon) => {
                                const canUse = orderTotal >= coupon.min_amount;
                                const discount = coupon.type === 0
                                    ? Math.min((orderTotal * coupon.value) / 100, coupon.max_discount || Infinity)
                                    : coupon.value;

                                return (
                                    <div
                                        key={coupon.coupon_id}
                                        className={`${styles.couponCard} ${!canUse ? styles.disabled : ''}`}
                                        onClick={() => canUse && handleSelectCoupon(coupon.code)}
                                    >
                                        <div className={styles.couponIcon}>
                                            <RiCoupon2Line size={24} />
                                        </div>
                                        <div className={styles.couponInfo}>
                                            <h5>{coupon.code}</h5>
                                            <p>{coupon.description || 'Giảm giá đơn hàng'}</p>
                                        </div>
                                        {!canUse && <span className={styles.badge}>Chưa đủ</span>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        onClick={handleApply}
                        disabled={!validationResult?.valid}
                        className={styles.applyBtn}
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </>
    );
}

export default CouponModal;
