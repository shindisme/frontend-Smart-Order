import { useState } from "react";
import styles from "./CouponModal.module.css";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const mockCheckCoupon = (code) => {
    const coupons = {
        GIAM15: { discount: 15000, description: "Giảm 15.000đ cho đơn bất kỳ" },
        FREESHIP: { discount: 10000, description: "Giảm 10.000đ phí vận chuyển" },
    };

    const coupon = coupons[code.trim().toUpperCase()];

    if (coupon) {
        return { success: true, data: coupon };
    }

    return { success: false, message: "Mã không hợp lệ" };
}

function CouponModal({ show, onClose, onApply }) {

    const [code, setCode] = useState("");
    const [result, setResult] = useState(null);

    if (!show) return null;

    const handleCheck = async () => {
        const res = await mockCheckCoupon(code.trim());
        setResult(res);
    };

    const handleApply = () => {
        if (result?.success) {
            onApply(result.data);
            onClose();
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />

            <div className={styles.modal}>
                <h3>Nhập mã giảm giá</h3>

                <div className={styles.inputRow}>
                    <input
                        type="text"
                        placeholder="Nhập mã..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <button className={styles.checkBtn} onClick={handleCheck}>
                        <IoCheckmarkCircleOutline size={22} />
                    </button>
                </div>

                {/* Kết quả kiểm tra mã */}
                <div className={styles.resultBox}>
                    {result === null && <p> </p>}

                    {result && !result.success && (
                        <p className={styles.invalid}>❌ {result.message}</p>
                    )}

                    {result && result.success && (
                        <div className={styles.validBox}>
                            <p><b>Mã hợp lệ!</b></p>
                            <p>-{result.data.discount.toLocaleString("vi-VN")}đ</p>
                            <p>{result.data.description}</p>
                        </div>
                    )}
                </div>

                <button
                    className={styles.applyBtn}
                    disabled={!result?.success}
                    onClick={handleApply}
                >
                    Áp dụng
                </button>
            </div>
        </>
    );
}

export default CouponModal;
