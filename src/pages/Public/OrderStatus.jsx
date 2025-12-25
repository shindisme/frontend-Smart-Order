import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './OrderStatus.module.css';
import { IoArrowUndo } from 'react-icons/io5';
import { FaCheckCircle } from 'react-icons/fa';

function OrderStatus() {
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        // Load order data from localStorage or API
        const pendingOrder = localStorage.getItem('pendingOrder');

        if (pendingOrder) {
            setOrderData(JSON.parse(pendingOrder));
        } else {
            // Nếu không có order, redirect về home
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    }, [navigate]);

    const formatMoney = (num) =>
        Number(num).toLocaleString('vi-VN') + 'đ';

    return (
        <div className={styles.orderStatusPage}>
            <header className={styles.header}>
                <NavLink to='/' className={styles.backButton}>
                    <IoArrowUndo size={24} />
                </NavLink>
                <h2 className={styles.title}>Trạng thái đơn hàng</h2>
            </header>

            <main className={styles.main}>
                <div className={styles.successIcon}>
                    <FaCheckCircle size={80} color="#10b981" />
                </div>

                <h2 className={styles.successTitle}>Đặt hàng thành công!</h2>
                <p className={styles.successMessage}>
                    Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
                </p>

                {orderData && (
                    <div className={styles.orderInfo}>
                        <div className={styles.infoRow}>
                            <span>Mã đơn hàng:</span>
                            <strong>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</strong>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Số lượng món:</span>
                            <strong>{orderData.items.length} món</strong>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Tổng tiền:</span>
                            <strong className={styles.totalAmount}>
                                {formatMoney(orderData.finalTotal)}
                            </strong>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Phương thức:</span>
                            <strong>{orderData.paymentMethod?.name || 'Chưa thanh toán'}</strong>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Trạng thái:</span>
                            <strong className={styles.statusBadge}>
                                {orderData.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý'}
                            </strong>
                        </div>
                    </div>
                )}

                <NavLink to='/' className={styles.backHomeButton}>
                    Quay về trang chủ
                </NavLink>
            </main>
        </div>
    );
}

export default OrderStatus;
