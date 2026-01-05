import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import invoiceService from '../../services/invoiceService';
import orderService from '../../services/orderService';
import styles from './OrderConfirm.module.css';
import { IoArrowUndoSharp } from "react-icons/io5";
import { RiCoupon2Line } from 'react-icons/ri';
import { MdKeyboardArrowRight } from "react-icons/md";
import CouponModal from '../../components/Public/Modals/CouponModal/CouponModal';
import tableService from '../../services/tableService';

function OrderConfirm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const [items, setItems] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [couponDetail, setCouponDetail] = useState(null);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [oldInvoice, setOldInvoice] = useState(null);

    const formatMoney = (num) => Number(num).toLocaleString('vi-VN') + 'đ';

    if (!tableId) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 24,
                background: "var(--bg-color)"
            }}>
                <div>
                    <h2 style={{ marginBottom: 16, color: "var(--text-primary-color)" }}>
                        Vui lòng quét mã QR tại bàn
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: "12px 24px",
                            background: "var(--primary-color)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    useEffect(() => {
        localStorage.setItem('table_id', tableId);

        const cart = localStorage.getItem('guestCart');
        if (cart) {
            const parsedCart = JSON.parse(cart);
            setItems(parsedCart);
        } else {
            toast.error('Giỏ hàng trống!');
            navigate(`/?table=${tableId}`);
        }
    }, [navigate, tableId]);

    useEffect(() => {
        const loadPendingInvoice = async () => {
            try {
                const res = await invoiceService.getPendingByTable(tableId);

                if (res?.data) {
                    setOldInvoice(res.data);
                } else if (res) {
                    setOldInvoice(res);
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error('Error loading invoice:', error);
                }
            }
        };

        if (tableId) {
            loadPendingInvoice();
        }
    }, [tableId]);

    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const finalPrice = totalPrice - discount;
    const grandTotal = oldInvoice ? oldInvoice.final_total + finalPrice : finalPrice;

    const handleApplyCoupon = (couponData) => {
        setDiscount(couponData.discount);
        setCouponDetail(couponData);
        setShowCouponModal(false);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            let invoice = JSON.parse(localStorage.getItem('currentInvoice') || 'null');

            if (!invoice?.invoice_id && oldInvoice) {
                invoice = oldInvoice;
            }

            const newOrderTotal = totalPrice - discount;

            if (!invoice?.invoice_id) {
                const res = await invoiceService.insert({
                    table_id: tableId,
                    coupon_id: couponDetail?.id || null,
                    total: totalPrice,
                    discount: discount,
                    final_total: newOrderTotal
                });

                invoice = {
                    invoice_id: res.invoice_id,
                    table_id: tableId,
                    total: totalPrice,
                    discount: discount,
                    final_total: newOrderTotal,
                    coupon_code: couponDetail?.code || null,
                    status: 0
                };

                localStorage.setItem('currentInvoice', JSON.stringify(invoice));
            }

            const orderItems = items.map((item) => {
                const itemId = item.id || item.itemId || item.item_id;

                if (!itemId) {
                    throw new Error(`Món "${item.name}" thiếu thông tin ID`);
                }

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
                invoice_id: invoice.invoice_id,
                table_id: tableId,
                user_id: null,
                items: orderItems,
                note: null
            });

            try {
                await tableService.update(tableId, { state: 1 });
            } catch (tableError) {
                toast.warning('Lỗi cập nhật trạng thái bàn');
            }

            localStorage.removeItem('guestCart');
            toast.success('Đơn hàng đã được gửi!');
            navigate(`/order?table=${tableId}`);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;

            if (errorMsg.includes('không còn tồn tại') || errorMsg.includes('không tồn tại')) {
                toast.error('Một số món không còn tồn tại, vui lòng đặt lại!');
                localStorage.removeItem('guestCart');
                setTimeout(() => navigate(`/?table=${tableId}`), 2000);
            } else {
                toast.error(errorMsg || 'Có lỗi xảy ra!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <>
            <header className={styles.header}>
                <NavLink to={`/?table=${tableId}`} className={styles.headerBackBtn}>
                    <IoArrowUndoSharp size={24} />
                </NavLink>
                <h2 className={styles.headerTitle}>Xác nhận đơn</h2>
            </header>

            <main className={styles.main}>
                {oldInvoice && (
                    <section className={styles.cardOldOrder}>
                        <div className={styles.oldOrderHeader}>
                            <h4>Đơn hàng trước đó</h4>
                            <span className={styles.oldOrderBadge}>Chưa thanh toán</span>
                        </div>
                        <div className={styles.oldOrderRow}>
                            <span>Tổng đơn cũ:</span>
                            <strong>{formatMoney(oldInvoice.final_total)}</strong>
                        </div>
                    </section>
                )}

                <section className={styles.cardOrder}>
                    {items.map((item, index) => (
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
                                <p className={styles.orderNote}>
                                    {item.selectedOptions?.length > 0
                                        ? item.selectedOptions.map(opt => opt.optionName).join(', ')
                                        : 'Không có tùy chọn'
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className={styles.cardCoupon} onClick={() => setShowCouponModal(true)}>
                    <div className={styles.couponRow}>
                        <div className={styles.couponLeft}>
                            <RiCoupon2Line size={20} />
                            <span>{couponDetail ? `Voucher: ${couponDetail.code}` : 'Thêm voucher'}</span>
                        </div>
                        <MdKeyboardArrowRight size={20} />
                    </div>
                </section>

                <section className={styles.cardBill}>
                    <h3 className={styles.billTitle}>Chi tiết thanh toán</h3>

                    {oldInvoice && (
                        <div className={styles.billRow}>
                            <span>Đơn trước:</span>
                            <span>{formatMoney(oldInvoice.final_total)}</span>
                        </div>
                    )}

                    <div className={styles.billRow}>
                        <span>Đơn mới ({items.length} món):</span>
                        <span>{formatMoney(totalPrice)}</span>
                    </div>

                    {discount > 0 && (
                        <div className={styles.billRow}>
                            <span>Mã khuyến mãi:</span>
                            <span className={styles.billDiscount}>-{formatMoney(discount)}</span>
                        </div>
                    )}

                    <div className={styles.billTotal}>
                        <span>Tổng thanh toán:</span>
                        <span>{formatMoney(grandTotal)}</span>
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <button
                    className={styles.paySubmit}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Đang xử lý...' : `Gửi đơn - ${formatMoney(grandTotal)}`}
                </button>
            </footer>

            <CouponModal
                show={showCouponModal}
                onClose={() => setShowCouponModal(false)}
                onApply={handleApplyCoupon}
                orderTotal={totalPrice}
            />
        </>
    );
}

export default OrderConfirm;
