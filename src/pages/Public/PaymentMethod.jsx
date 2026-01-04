import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './PaymentMethod.module.css';
import { FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import { IoArrowUndoSharp } from "react-icons/io5";

const PAYMENT_METHODS = [
    {
        id: 'cash',
        name: 'Tiền mặt (COD)',
        icon: <FaMoneyBillWave size={24} />,
        description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    },
    {
        id: 'vnpay',
        name: 'VNPay',
        icon: <FaWallet size={24} />,
        description: 'Thanh toán qua cổng VNPay',
    }
];

function PaymentMethod() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const [selectedMethod, setSelectedMethod] = useState(null);

    useEffect(() => {
        if (!tableId) {
            toast.error('Không tìm thấy bàn');
            navigate('/');
            return;
        }

        // ✅ LOAD PHƯƠNG THỨC ĐÃ LƯU
        const saved = localStorage.getItem('selectedPaymentMethod');
        if (saved) {
            try {
                const parsedMethod = JSON.parse(saved);
                setSelectedMethod(parsedMethod);
            } catch (err) {
                console.error('Error parsing saved payment method:', err);
            }
        }
    }, [tableId, navigate]);

    const handleBack = () => {
        navigate(`/order?table=${tableId}`);
    };

    const handleSelect = (method) => {
        setSelectedMethod(method);
    };

    const handleConfirm = () => {
        if (!selectedMethod) {
            toast.warning('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        localStorage.setItem('selectedPaymentMethod', JSON.stringify(selectedMethod));

        navigate(`/order?table=${tableId}`);
    };

    if (!tableId) {
        return null;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={handleBack}>
                    <IoArrowUndoSharp size={24} />
                </button>
                <h3>Phương thức thanh toán</h3>
            </header>

            <main className={styles.main}>
                <div className={styles.methodsGrid}>
                    {PAYMENT_METHODS.map(method => (
                        <div
                            key={method.id}
                            className={`${styles.methodCard} ${selectedMethod?.id === method.id ? styles.selected : ''
                                }`}
                            onClick={() => handleSelect(method)}
                        >
                            <div
                                className={styles.methodIcon}
                                style={{ color: method.color }}
                            >
                                {method.icon}
                            </div>

                            <div className={styles.methodInfo}>
                                <h4>{method.name}</h4>
                                <p>{method.description}</p>
                            </div>

                            <div className={styles.radioWrapper}>
                                <input
                                    type="radio"
                                    checked={selectedMethod?.id === method.id}
                                    onChange={() => { }}
                                    aria-label={method.name}
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </main>

            <footer className={styles.footer}>
                <button
                    className={styles.confirmButton}
                    onClick={handleConfirm}
                    disabled={!selectedMethod}
                >
                    Xác nhận
                </button>
            </footer>
        </div>
    );
}

export default PaymentMethod;
