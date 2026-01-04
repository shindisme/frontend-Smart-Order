import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowUndoSharp } from "react-icons/io5";

import orderService from '../../services/orderService';
import invoiceService from '../../services/invoiceService';
import {
    MdPayment,
    MdCancel,
    MdCheckCircle,
    MdAccessTime,
    MdTableRestaurant,
    MdReceiptLong,
    MdHourglassEmpty,
    MdRestaurant,
    MdOutlinePayment
} from 'react-icons/md';
import ConfirmModal from '../../components/Public/Modals/ConfirmModal/ConfirmModal';
import styles from './OrderTracking.module.css';

function OrderTracking() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const [orders, setOrders] = useState([]);
    const [invoice, setInvoice] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    useEffect(() => {
        if (!tableId) {
            navigate('/');
            return;
        }
        loadOrders();
        loadPaymentMethod();
    }, [tableId]);

    const loadOrders = async () => {
        try {
            setLoading(true);

            // ✅ LẤY TẤT CẢ ORDERS CỦA BÀN (CẢ ĐÃ THANH TOÁN)
            const ordersRes = await orderService.getByTableId(tableId);

            if (ordersRes?.data) {
                const ordersWithDetails = await Promise.all(
                    ordersRes.data.map(async (order) => {
                        try {
                            const detailRes = await orderService.getById(order.order_id);
                            return detailRes?.data || order;
                        } catch (err) {
                            return order;
                        }
                    })
                );

                setOrders(ordersWithDetails);
            }

            // ✅ LẤY INVOICE PENDING TRƯỚC
            try {
                const pendingInvoiceRes = await invoiceService.getPendingByTable(tableId);
                if (pendingInvoiceRes?.data) {
                    setInvoice(pendingInvoiceRes.data);
                }
            } catch (err) {
                // ✅ KHÔNG CÓ PENDING, THỬ LẤY INVOICE ĐÃ THANH TOÁN GẦN NHẤT
                if (err.response?.status === 404) {
                    try {
                        const allInvoicesRes = await invoiceService.getByTableId(tableId);
                        if (allInvoicesRes?.data && allInvoicesRes.data.length > 0) {
                            // Lấy invoice mới nhất
                            const latestInvoice = allInvoicesRes.data[0];
                            setInvoice(latestInvoice);
                        }
                    } catch (invoiceErr) {
                        console.error('Error loading invoices:', invoiceErr);
                    }
                } else {
                    console.error('Error loading invoice:', err);
                }
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                toast.error('Lỗi tải đơn hàng');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentMethod = () => {
        try {
            const saved = localStorage.getItem('selectedPaymentMethod');
            if (saved) {
                const method = JSON.parse(saved);
                setSelectedPaymentMethod(method);
            }
        } catch (err) {
            console.error('Error loading payment method:', err);
        }
    };

    const handleAddMore = () => {
        navigate(`/?table=${tableId}`);
    };

    const handleChoosePayment = () => {
        navigate(`/payment-method?table=${tableId}`);
    };

    const handlePayNow = async () => {
        if (!invoice?.invoice_id) {
            toast.error('Không có hóa đơn để thanh toán!');
            return;
        }

        if (!selectedPaymentMethod) {
            toast.warning('Vui lòng chọn phương thức thanh toán!');
            navigate(`/payment-method?table=${tableId}`);
            return;
        }

        try {
            if (selectedPaymentMethod.id === 'vnpay') {
                toast.info('Đang chuyển đến cổng thanh toán VNPay...');
                window.location.href = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${invoice.final_total * 100}&vnp_TxnRef=${invoice.invoice_id}`;
            } else if (selectedPaymentMethod.id === 'momo') {
                toast.info('Đang chuyển đến ví Momo...');
            } else if (selectedPaymentMethod.id === 'bank') {
                toast.success('Vui lòng chuyển khoản theo thông tin đã gửi!');
            } else if (selectedPaymentMethod.id === 'cash') {
                await invoiceService.pay(invoice.invoice_id);
                toast.success('Đã xác nhận thanh toán tiền mặt!');

                // ✅ XÓA LOCALSTORAGE SAU KHI THANH TOÁN
                localStorage.removeItem('currentInvoice');
                localStorage.removeItem('guestCart');
                localStorage.removeItem('selectedPaymentMethod');

                loadOrders();
            }
        } catch (error) {
            toast.error('Lỗi khi thanh toán: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancelConfirm = async () => {
        try {
            const pendingOrders = orders.filter(o => o.state === 0);

            if (pendingOrders.length === 0) {
                toast.warning('Không có đơn hàng nào để hủy!');
                setShowCancelModal(false);
                return;
            }

            // ✅ XÓA ORDERS TRƯỚC
            console.log('🗑️ Đang xóa orders:', pendingOrders.map(o => o.order_id));

            await Promise.all(
                pendingOrders.map(order => orderService.delete(order.order_id))
            );

            // ✅ KIỂM TRA CÒN ORDERS NÀO KHÔNG
            const remainingOrders = orders.filter(o => o.state !== 0);

            if (remainingOrders.length === 0 && invoice?.invoice_id && invoice.status === 0) {
                // ✅ CHỈ XÓA INVOICE NẾU KHÔNG CÒN ORDERS VÀ CHƯA THANH TOÁN
                try {
                    console.log('🗑️ Đang xóa invoice:', invoice.invoice_id);
                    await invoiceService.delete(invoice.invoice_id);
                    console.log('✅ Đã xóa invoice');
                } catch (invoiceError) {
                    console.error('❌ Lỗi xóa invoice:', invoiceError.response?.data);
                    toast.warning('Đơn hàng đã hủy nhưng hóa đơn chưa xóa được. Vui lòng liên hệ nhân viên!');
                }
            }

            // ✅ XÓA LOCALSTORAGE
            localStorage.removeItem('currentInvoice');
            localStorage.removeItem('guestCart');
            localStorage.removeItem('selectedPaymentMethod');

            toast.success('Đã hủy đơn hàng chờ xử lý');
            setShowCancelModal(false);

            // ✅ RELOAD HOẶC NAVIGATE
            if (remainingOrders.length === 0) {
                navigate(`/?table=${tableId}`);
            } else {
                loadOrders();
            }
        } catch (error) {
            console.error('❌ Error:', error);
            toast.error(error.response?.data?.message || error.message || 'Lỗi khi hủy đơn');
        }
    };

    const getOrderState = (state) => {
        switch (state) {
            case 0: return {
                text: 'Chờ xử lý',
                color: '#f59e0b',
                icon: MdHourglassEmpty
            };
            case 1: return {
                text: 'Đang làm',
                color: '#3b82f6',
                icon: MdRestaurant
            };
            case 2: return {
                text: 'Hoàn thành',
                color: '#10b981',
                icon: MdCheckCircle
            };
            default: return {
                text: 'Không xác định',
                color: '#6b7280',
                icon: MdAccessTime
            };
        }
    };

    const formatMoney = (num) => num?.toLocaleString('vi-VN') + 'đ';
    const formatTime = (date) => new Date(date).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const calculateTotal = () => {
        return orders.reduce((sum, order) => {
            const orderTotal = order.items?.reduce(
                (itemSum, item) => itemSum + Number(item.total),
                0
            ) || 0;
            return sum + orderTotal;
        }, 0);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Đang tải...</div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <MdReceiptLong className={styles.emptyIcon} />
                    <h2>Chưa có đơn hàng</h2>
                    <p>Hãy gọi món ngay!</p>
                    <button className={styles.btnPrimary} onClick={handleAddMore}>
                        Xem Menu
                    </button>
                </div>
            </div>
        );
    }

    const isPaid = invoice?.status === 1;
    const hasPendingOrders = orders.some(o => o.state === 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={handleAddMore}>
                    <IoArrowUndoSharp size={24} />
                </button>
                <h1>Đơn hàng</h1>
                <div className={styles.status}>
                    {isPaid ? (
                        <span className={styles.paid}>
                            <MdCheckCircle /> Đã thanh toán
                        </span>
                    ) : (
                        <span className={styles.pending}>
                            <MdAccessTime /> Chưa thanh toán
                        </span>
                    )}
                </div>
            </header>

            <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                    <span className='fs-6'><MdTableRestaurant size={30} /> Bàn:</span>
                    <strong>{orders[0]?.table_name}</strong>
                </div>
                {invoice?.invoice_id && (
                    <div className={styles.infoRow}>
                        <span><MdReceiptLong /> Mã HĐ:</span>
                        <strong>{invoice.invoice_id.slice(0, 8).toUpperCase()}</strong>
                    </div>
                )}
            </div>

            <div className={styles.ordersList}>
                <h2>Món đã gọi ({orders.length} lần)</h2>
                {orders.map((order, idx) => {
                    const stateInfo = getOrderState(order.state);
                    const StateIcon = stateInfo.icon;

                    return (
                        <div key={order.order_id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <span className={styles.orderNumber}>Lần {idx + 1}</span>
                                    <span className={styles.orderTime}>
                                        {formatTime(order.created_at)}
                                    </span>
                                </div>
                                <div
                                    className={styles.orderState}
                                    style={{ color: stateInfo.color }}
                                >
                                    <StateIcon size={18} />
                                    <span>{stateInfo.text}</span>
                                </div>
                            </div>

                            <div className={styles.items}>
                                {order.items?.map(item => (
                                    <div key={item.order_detail_id} className={styles.item}>
                                        <img
                                            src={`${import.meta.env.VITE_IMG_URL}${item.img}` || '/placeholder.png'}
                                            alt={item.name}
                                            className={styles.itemImg}
                                        />
                                        <div className={styles.itemDetails}>
                                            <p className={styles.itemName}>{item.name}</p>
                                            {item.note && (
                                                <p className={styles.itemNote}>Ghi chú: {item.note}</p>
                                            )}
                                            <div className={styles.itemFooter}>
                                                <span className={styles.quantity}>x{item.quantity}</span>
                                                <span className={styles.price}>{formatMoney(item.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.orderTotal}>
                                Tổng lần {idx + 1}: <strong>
                                    {formatMoney(
                                        order.items?.reduce((sum, item) => sum + Number(item.total), 0) || 0
                                    )}
                                </strong>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.summaryCard}>
                {invoice && (
                    <>
                        {invoice.discount > 0 && (
                            <div className={styles.discountRow}>
                                <span>Giảm giá:</span>
                                <span className={styles.discountAmount}>
                                    -{formatMoney(invoice.discount)}
                                </span>
                            </div>
                        )}
                        <div className={styles.totalRow}>
                            <span>Tổng thanh toán:</span>
                            <strong className={styles.totalAmount}>
                                {formatMoney(invoice.final_total || calculateTotal())}
                            </strong>
                        </div>
                    </>
                )}
                {!invoice && (
                    <div className={styles.totalRow}>
                        <span>Tổng cộng:</span>
                        <strong className={styles.totalAmount}>
                            {formatMoney(calculateTotal())}
                        </strong>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                {isPaid ? (
                    <>
                        <div className={styles.thankYou}>
                            <MdCheckCircle className={styles.thankYouIcon} />
                            <h3>Cảm ơn bạn!</h3>
                            <p>Đơn hàng đã thanh toán thành công</p>
                        </div>
                        <button className={styles.btnSecondary} onClick={handleAddMore}>
                            Về Menu
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.footerTop}>
                            <button className={styles.btnOutline} onClick={handleChoosePayment}>
                                <MdOutlinePayment /> Chọn thanh toán
                            </button>
                            {hasPendingOrders && (
                                <button
                                    className={styles.btnDanger}
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    <MdCancel /> Hủy đơn chưa xác nhận
                                </button>
                            )}
                        </div>

                        {selectedPaymentMethod && (
                            <div className={styles.selectedMethod}>
                                Phương thức: <strong>{selectedPaymentMethod.parentName || selectedPaymentMethod.name}</strong>
                            </div>
                        )}

                        <button className={styles.btnPrimary} onClick={handlePayNow}>
                            <MdPayment /> Thanh toán ngay
                        </button>
                    </>
                )}
            </div>

            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelConfirm}
                title="Hủy đơn hàng"
                message="Bạn chắc chắn muốn hủy các đơn chờ xử lý?"
                confirmText="Hủy đơn"
                cancelText="Quay lại"
            />
        </div>
    );
}

export default OrderTracking;
