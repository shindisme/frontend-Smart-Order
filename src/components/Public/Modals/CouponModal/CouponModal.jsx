import { useState, useEffect } from "react";
import styles from "./CouponModal.module.css";
import { MdClose, MdCheckCircle } from "react-icons/md";
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
            console.error('Error fetching coupons:', error);
        }
    };

    const handleValidate = async (code) => {
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
            toast.success('Mã hợp lệ!');
        } catch (error) {
            setValidationResult({ valid: false });
            toast.error(error.response?.data?.message || 'Mã không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!validationResult?.valid) {
            toast.warning('Vui lòng kiểm tra mã trước');
            return;
        }

        onApply({
            id: validationResult.coupon.coupon_id,
            code: validationResult.coupon.code,
            discount: validationResult.discount
        });
        onClose();
    };

    const formatMoney = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
    };

    if (!show) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />

            <div className={styles.modal}>
                <div className={styles.header}>
                    <div>
                        <h3>Chọn mã giảm giá</h3>
                        <small>Tổng đơn: {formatMoney(orderTotal)}</small>
                    </div>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <MdClose size={24} />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Nhập mã giảm giá..."
                            value={selectedCode}
                            onChange={(e) => setSelectedCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleValidate(selectedCode)}
                        />
                        <button
                            onClick={() => handleValidate(selectedCode)}
                            disabled={loading}
                            className={styles.checkBtn}
                        >
                            {loading ? '...' : 'Kiểm tra'}
                        </button>
                    </div>

                    {validationResult && (
                        <div className={validationResult.valid ? styles.validBox : styles.invalidBox}>
                            {validationResult.valid ? (
                                <>
                                    <MdCheckCircle size={24} />
                                    <div>
                                        <strong>Mã hợp lệ!</strong>
                                        <p>Giảm: {formatMoney(validationResult.discount)}</p>
                                        {validationResult.coupon.description && (
                                            <small>{validationResult.coupon.description}</small>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p>Mã không hợp lệ hoặc không đủ điều kiện</p>
                            )}
                        </div>
                    )}

                    <div className={styles.divider}>
                        <span>Hoặc chọn mã có sẵn</span>
                    </div>

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
                                        className={`${styles.couponItem} ${!canUse ? styles.disabled : ''}`}
                                        onClick={() => canUse && setSelectedCode(coupon.code)}
                                    >
                                        <div className={styles.couponLeft}>
                                            <h5>{coupon.code}</h5>
                                            <p>{coupon.description || 'Giảm giá đơn hàng'}</p>
                                            <small>
                                                Giảm: {formatMoney(discount)} • Đơn tối thiểu: {formatMoney(coupon.min_amount)}
                                            </small>
                                        </div>
                                        {!canUse && (
                                            <span className={styles.badge}>Không đủ điều kiện</span>
                                        )}
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
