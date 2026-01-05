import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../hooks/useCart';
import orderService from '../../services/orderService';
import styles from './OrderConfirm.module.css';
import { IoArrowUndoSharp } from "react-icons/io5";

function OrderConfirm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const { cart, clearCart, getTotalPrice, isEmpty } = useCart(tableId, 1);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatMoney = (num) => Number(num).toLocaleString('vi-VN') + 'đ';

    useEffect(() => {
        if (!tableId) {
            navigate('/');
            return;
        }

        if (isEmpty) {
            navigate(`/?table=${tableId}`);
        }
    }, [tableId, isEmpty, navigate]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const orderItems = cart.map((item) => {
                const itemId = item.id || item.itemId || item.item_id;

                const validOptions = (item.selectedOptions || [])
                    .map((opt) => ({
                        option_id: opt.optionId || opt.option_id
                    }))
                    .filter(opt => opt.option_id);

                return {
                    item_id: itemId,
                    quantity: item.quantity,
                    total: item.totalPrice,
                    note: item.note || null,
                    options: validOptions
                };
            });

            await orderService.create({
                table_id: tableId,
                user_id: null,
                items: orderItems,
                note: null
            });

            clearCart();

            toast.success('Đơn hàng đã được gửi!');
            navigate(`/order?table=${tableId}`);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;

            if (errorMsg.includes('không tồn tại')) {
                clearCart();
                setTimeout(() => navigate(`/?table=${tableId}`), 2000);
            } else {
                toast.error(errorMsg || 'Có lỗi xảy ra!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!tableId) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Vui lòng quét mã QR tại bàn</h2>
                    <button onClick={() => navigate('/')} style={{ marginTop: '16px', padding: '12px 24px' }}>
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    // Nếu cart empty, component sẽ redirect ở useEffect

    return (
        <>
            <header className={styles.header}>
                <NavLink to={`/?table=${tableId}`} className={styles.headerBackBtn}>
                    <IoArrowUndoSharp size={24} />
                </NavLink>
                <h2 className={styles.headerTitle}>Xác nhận đơn</h2>
            </header>

            <main className={styles.main}>
                <section className={styles.cardOrder}>
                    {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className={styles.orderRow}>
                            <img
                                src={`${import.meta.env.VITE_IMG_URL}${item.imageUrl}`}
                                alt={item.name}
                                className={styles.orderImg}
                            />
                            <div className={styles.orderContent}>
                                <div className={styles.orderTop}>
                                    <span className={styles.orderQty}>x{item.quantity}</span>
                                    <h6 className={styles.orderName}>{item.name}</h6>
                                    <span className={styles.orderPrice}>{formatMoney(item.totalPrice)}</span>
                                </div>
                                {item.selectedOptions?.length > 0 && (
                                    <p className={styles.orderNote}>
                                        {item.selectedOptions.map(opt => opt.optionName).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </section>

                <section className={styles.cardBill}>
                    <h3 className={styles.billTitle}>Chi tiết</h3>
                    <div className={styles.billRow}>
                        <span>Tổng cộng ({cart.length} món):</span>
                        <span>{formatMoney(getTotalPrice())}</span>
                    </div>
                    <div className={styles.billTotal}>
                        <span>Thanh toán:</span>
                        <span>{formatMoney(getTotalPrice())}</span>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <button
                    className={styles.paySubmit}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    Gửi đơn - {formatMoney(getTotalPrice())}
                </button>
            </footer>
        </>
    );
}

export default OrderConfirm;
