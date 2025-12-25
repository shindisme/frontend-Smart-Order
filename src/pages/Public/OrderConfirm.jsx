import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './OrderConfirm.module.css';
import { IoArrowUndo } from 'react-icons/io5';
import { RiCoupon2Line } from 'react-icons/ri';
import { IoIosArrowForward } from 'react-icons/io';
import CouponModal from '../../components/Public/Modals/CouponModal/CouponModal';

function OrderConfirm() {
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [couponDetail, setCouponDetail] = useState(null);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [isPaymentFlow, setIsPaymentFlow] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const formatMoney = (num) =>
        Number(num).toLocaleString('vi-VN') + 'đ';

    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('guestCart');

            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);

                if (parsedCart && parsedCart.length > 0) {
                    setItems(parsedCart);
                } else {
                    alert('Giỏ hàng trống. Vui lòng chọn món!');
                    navigate('/');
                }
            } else {
                alert('Giỏ hàng trống. Vui lòng chọn món!');
                navigate('/');
            }
        } catch (error) {
            console.error('Lỗi đọc giỏ hàng:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const savedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
        if (savedPaymentMethod) {
            setSelectedPaymentMethod(JSON.parse(savedPaymentMethod));
            setIsPaymentFlow(true);
        }
    }, []);

    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalPrice = totalPrice - discount;

    const handleApplyCoupon = (couponData) => {
        setDiscount(couponData.discount);
        setCouponDetail(couponData);
        setShowCouponModal(false);
    };

    const handleTogglePaymentFlow = () => {
        setIsPaymentFlow(!isPaymentFlow);
    };

    const handleMainAction = async () => {
        if (items.length === 0) {
            alert('Giỏ hàng trống!');
            return;
        }

        // FLOW 1: CHỈ ĐẶT MÓN - GỬI ĐƠN VỀ ADMIN (pending, unpaid)
        if (!isPaymentFlow) {
            const confirmed = window.confirm(
                'Xác nhận gửi đơn hàng? Bạn có thể tiếp tục mua và thanh toán sau.'
            );

            if (!confirmed) return;

            try {
                const orderData = {
                    items: items,
                    subtotal: totalPrice,
                    discount: discount,
                    finalTotal: finalPrice,
                    coupon: couponDetail,
                    orderDate: new Date().toISOString(),
                    status: 'pending', // ✅ Đơn chờ xử lý
                    paymentStatus: 'unpaid', // ✅ Chưa thanh toán
                    paymentMethod: null
                };

                console.log('📦 Đơn hàng (gửi về admin - pending):', orderData);

                // ✅ TODO: GỬI ORDER ĐẾN API ADMIN
                // const response = await orderService.create(orderData);

                await new Promise(resolve => setTimeout(resolve, 500));

                // ✅ LƯU ORDER VÀO localStorage để hiển thị ở OrderStatus
                localStorage.setItem('pendingOrder', JSON.stringify(orderData));

                // ✅ XÓA CART sau khi gửi đơn thành công
                localStorage.removeItem('guestCart');

                alert('✅ Đơn hàng đã được gửi! Bạn có thể tiếp tục mua.');

                // Chuyển đến trang OrderStatus
                navigate('/order-status');
            } catch (error) {
                console.error('❌ Lỗi tạo đơn:', error);
                alert('Có lỗi xảy ra. Vui lòng thử lại!');
            }
        }
        // FLOW 2: ĐẶT MÓN + THANH TOÁN LUÔN
        else {
            if (!selectedPaymentMethod) {
                alert('Vui lòng chọn phương thức thanh toán!');
                return;
            }

            const confirmed = window.confirm(
                `Xác nhận đặt ${items.length} món với tổng tiền ${formatMoney(finalPrice)}?\nPhương thức: ${selectedPaymentMethod.name}`
            );

            if (!confirmed) return;

            try {
                const orderData = {
                    items: items,
                    subtotal: totalPrice,
                    discount: discount,
                    finalTotal: finalPrice,
                    coupon: couponDetail,
                    orderDate: new Date().toISOString(),
                    status: 'confirmed', // Đơn đã xác nhận
                    paymentStatus: 'pending',
                    paymentMethod: selectedPaymentMethod
                };

                console.log('📦 Đơn hàng (có thanh toán):', orderData);

                // TODO: Call API to create order with payment
                // const response = await orderService.createWithPayment(orderData);

                await new Promise(resolve => setTimeout(resolve, 500));

                if (selectedPaymentMethod.id === 'cash') {
                    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
                    localStorage.removeItem('guestCart');
                    localStorage.removeItem('selectedPaymentMethod');

                    alert('✅ Đặt hàng thành công! Thanh toán khi nhận hàng.');
                    navigate('/order-status');
                } else {
                    localStorage.setItem('pendingOrder', JSON.stringify(orderData));

                    alert(`Đang chuyển đến cổng thanh toán ${selectedPaymentMethod.name}...`);

                    setTimeout(() => {
                        localStorage.removeItem('guestCart');
                        localStorage.removeItem('selectedPaymentMethod');

                        alert('✅ Thanh toán thành công!');
                        navigate('/order-status');
                    }, 2000);
                }
            } catch (error) {
                console.error('❌ Lỗi đặt hàng:', error);
                alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
            }
        }
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <>
            <header className={styles.header}>
                <NavLink to='/' className={styles.headerBackBtn}>
                    <IoArrowUndo size={24} />
                </NavLink>
                <h2 className={styles.headerTitle}>Xác nhận đơn</h2>
            </header>

            <main className={styles.main}>
                <section className={styles.cardOrder}>
                    {items.map(item => (
                        <div key={item.id} className={styles.orderRow}>
                            <img
                                src={`${import.meta.env.VITE_IMG_URL}${item.imageUrl}`}
                                alt={item.name}
                                className={styles.orderImg}
                            />

                            <div className={styles.orderContent}>
                                <div className={styles.orderTop}>
                                    <span className={styles.orderQty}>
                                        x{item.quantity}
                                    </span>
                                    <h6 className={styles.orderName}>{item.name}</h6>
                                    <span className={styles.orderPrice}>
                                        {formatMoney(item.totalPrice)}
                                    </span>
                                </div>

                                <p className={styles.orderNote}>
                                    {item.selectedOptions && item.selectedOptions.length > 0
                                        ? item.selectedOptions.map(opt => opt.optionName).join(', ')
                                        : 'Không có ghi chú'
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section
                    className={styles.cardCoupon}
                    onClick={() => setShowCouponModal(true)}
                >
                    <div className={styles.couponRow}>
                        <div className={styles.couponLeft}>
                            <span className={styles.couponIcon}>
                                <RiCoupon2Line size={20} />
                            </span>
                            <span className={styles.couponText}>
                                {couponDetail
                                    ? `Voucher: ${couponDetail.code}`
                                    : 'Thêm voucher'
                                }
                            </span>
                        </div>

                        <IoIosArrowForward size={20} className={styles.couponArrow} />
                    </div>
                </section>

                <section className={styles.cardBill}>
                    <h3 className={styles.billTitle}>Chi tiết thanh toán</h3>

                    <div className={styles.billRow}>
                        <span>Tổng giá món ({items.length} món)</span>
                        <span>{formatMoney(totalPrice)}</span>
                    </div>

                    {couponDetail && discount > 0 && (
                        <div className={styles.billRow}>
                            <span>Mã khuyến mãi</span>
                            <span className={styles.billDiscount}>
                                -{formatMoney(discount)}
                            </span>
                        </div>
                    )}

                    <div className={styles.billTotal}>
                        <span>Tổng thanh toán</span>
                        <span>{formatMoney(finalPrice)}</span>
                    </div>
                </section>

                <CouponModal
                    show={showCouponModal}
                    onClose={() => setShowCouponModal(false)}
                    onApply={handleApplyCoupon}
                />
            </main>

            <footer className={styles.footer}>
                <div className={styles.payOptions}>
                    <button
                        className={`${styles.payBtnOutline} ${!isPaymentFlow ? styles.active : ''}`}
                        onClick={() => setIsPaymentFlow(false)}
                    >
                        Chỉ đặt món
                    </button>

                    <button
                        className={`${styles.payBtnBank} ${isPaymentFlow ? styles.active : ''}`}
                        onClick={handleTogglePaymentFlow}
                    >
                        {selectedPaymentMethod ? selectedPaymentMethod.name : 'Chọn thanh toán'}
                    </button>
                </div>

                <NavLink
                    to='/payment-method'
                    className={styles.payChangeBtn}
                    onClick={() => {
                        localStorage.setItem('orderConfirmState', JSON.stringify({
                            discount,
                            couponDetail
                        }));
                    }}
                >
                    Phương thức thanh toán
                </NavLink>

                <button
                    className={styles.paySubmit}
                    onClick={handleMainAction}
                >
                    {isPaymentFlow
                        ? `Đặt đơn – ${formatMoney(finalPrice)}`
                        : 'Gửi đơn'
                    }
                </button>
            </footer>
        </>
    );
}

export default OrderConfirm;
