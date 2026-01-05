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
    MdRestaurant
} from 'react-icons/md';
import ConfirmModal from '../../components/Public/Modals/ConfirmModal/ConfirmModal';
import styles from './OrderTracking.module.css';

function OrderTracking() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const [pendingInvoice, setPendingInvoice] = useState(null);
    const [paidInvoices, setPaidInvoices] = useState([]);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tableId) {
            navigate('/');
            return;
        }
        loadData();
    }, [tableId]);

    const loadData = async () => {
        try {
            setLoading(true);

            const invoicesRes = await invoiceService.getAll();

            if (invoicesRes?.data) {
                const tableInvoices = invoicesRes.data.filter(inv => String(inv.table_id) === String(tableId));

                const pending = tableInvoices.find(inv => inv.status === 0);
                const paid = tableInvoices.filter(inv => inv.status === 1);

                if (pending) {
                    try {
                        const detailRes = await invoiceService.getById(pending.invoice_id);
                        setPendingInvoice(detailRes?.data || pending);
                    } catch (err) {
                        console.error('Error loading pending invoice:', err);
                        setPendingInvoice(pending);
                    }
                }

                if (paid.length > 0) {
                    const paidWithDetails = await Promise.all(
                        paid.map(async (inv) => {
                            try {
                                const detailRes = await invoiceService.getById(inv.invoice_id);
                                return detailRes?.data || inv;
                            } catch (err) {
                                console.error('Error loading paid invoice:', err);
                                return inv;
                            }
                        })
                    );
                    setPaidInvoices(paidWithDetails);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            if (error.response?.status !== 404) {
                toast.error('Lỗi tải dữ liệu');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddMore = () => {
        navigate(`/?table=${tableId}`);
    };

    const handleGoToPayment = () => {
        if (!pendingInvoice) {
            toast.warning('Không có hóa đơn cần thanh toán');
            return;
        }
        navigate(`/payment?table=${tableId}`);
    };

    const handleCancelConfirm = async () => {
        if (!pendingInvoice?.orders) {
            toast.warning('Không có đơn hàng nào để hủy!');
            setShowCancelModal(false);
            return;
        }

        try {
            const pendingOrders = pendingInvoice.orders.filter(o => o.state === 0);

            if (pendingOrders.length === 0) {
                toast.warning('Không có đơn hàng chờ xử lý để hủy!');
                setShowCancelModal(false);
                return;
            }

            await Promise.all(
                pendingOrders.map(order => orderService.delete(order.order_id))
            );

            toast.success('Đã hủy đơn hàng chờ xử lý');
            setShowCancelModal(false);
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi hủy đơn');
        }
    };

    const getOrderState = (state) => {
        switch (state) {
            case 0: return { text: 'Chờ xử lý', color: '#f59e0b', icon: MdHourglassEmpty };
            case 1: return { text: 'Đang làm', color: '#3b82f6', icon: MdRestaurant };
            case 2: return { text: 'Hoàn thành', color: '#10b981', icon: MdCheckCircle };
            default: return { text: 'Không xác định', color: '#6b7280', icon: MdAccessTime };
        }
    };

    const formatMoney = (num) => num?.toLocaleString('vi-VN') + 'đ';
    const formatTime = (date) => new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

    const renderInvoiceDetail = (invoice, isPaid = false) => (
        <>
            <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                    <span><MdTableRestaurant size={20} /> Bàn:</span>
                    <strong>{invoice.table_name}</strong>
                </div>
                <div className={styles.infoRow}>
                    <span><MdReceiptLong /> Mã HĐ:</span>
                    <strong>{invoice.invoice_id.slice(0, 13).toUpperCase()}</strong>
                </div>
                {isPaid && invoice.paid_at && (
                    <div className={styles.infoRow}>
                        <span>Thanh toán lúc:</span>
                        <strong>{new Date(invoice.paid_at).toLocaleString('vi-VN')}</strong>
                    </div>
                )}
            </div>

            <div className={styles.ordersList}>
                {invoice.orders && invoice.orders.length > 0 ? (
                    invoice.orders.map((order, idx) => {
                        const stateInfo = getOrderState(order.state);
                        const StateIcon = stateInfo.icon;

                        return (
                            <div key={order.order_id} className={styles.orderCard}>
                                <div className={styles.orderHeader}>
                                    <div>
                                        <span className={styles.orderNumber}>Lần {idx + 1}</span>
                                        <span className={styles.orderTime}>{formatTime(order.created_at)}</span>
                                    </div>
                                    <div className={styles.orderState} style={{ color: stateInfo.color }}>
                                        <StateIcon size={18} />
                                        <span>{stateInfo.text}</span>
                                    </div>
                                </div>

                                <div className={styles.items}>
                                    {order.items?.map(item => (
                                        <div key={item.order_detail_id} className={styles.item}>
                                            <img
                                                src={`${import.meta.env.VITE_IMG_URL}${item.img}`}
                                                alt={item.name}
                                                className={styles.itemImg}
                                            />
                                            <div className={styles.itemDetails}>
                                                <p className={styles.itemName}>{item.name}</p>
                                                {item.options?.length > 0 && (
                                                    <p className={styles.itemNote}>
                                                        {item.options.map(opt => opt.name).join(', ')}
                                                    </p>
                                                )}
                                                <div className={styles.itemFooter}>
                                                    <span className={styles.quantity}>x{item.quantity}</span>
                                                    <span className={styles.price}>{formatMoney(item.total)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                        Không có đơn hàng
                    </p>
                )}
            </div>

            <div className={styles.summaryCard}>
                <div className={styles.billRow}>
                    <span>Tổng tiền:</span>
                    <span>{formatMoney(invoice.total || 0)}</span>
                </div>
                {invoice.discount > 0 && (
                    <div className={styles.discountRow}>
                        <span>Giảm giá:</span>
                        <span className={styles.discountAmount}>-{formatMoney(invoice.discount)}</span>
                    </div>
                )}
                <div className={styles.totalRow}>
                    <span>Tổng thanh toán:</span>
                    <strong className={styles.totalAmount}>{formatMoney(invoice.final_total || 0)}</strong>
                </div>
            </div>
        </>
    );

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Đang tải...</div>
            </div>
        );
    }

    if (!pendingInvoice && paidInvoices.length === 0) {
        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <button className={styles.backBtn} onClick={handleAddMore}>
                        <IoArrowUndoSharp size={24} />
                    </button>
                    <h1>Đơn hàng</h1>
                </header>
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

    const hasPendingOrders = pendingInvoice?.orders?.some(o => o.state === 0);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={handleAddMore}>
                    <IoArrowUndoSharp size={24} />
                </button>
                <h1>Đơn hàng</h1>
            </header>

            {pendingInvoice && (
                <>
                    <div className={styles.sectionHeader}>
                        <h2>Chưa thanh toán</h2>
                        <span className={styles.pending}>
                            <MdAccessTime /> Chờ thanh toán
                        </span>
                    </div>

                    {renderInvoiceDetail(pendingInvoice, false)}

                    <div className={styles.footer}>
                        <button className={styles.btnPrimary} onClick={handleGoToPayment}>
                            <MdPayment /> Thanh toán
                        </button>

                        {hasPendingOrders && (
                            <button className={styles.btnDanger} onClick={() => setShowCancelModal(true)}>
                                <MdCancel /> Hủy đơn chưa xác nhận
                            </button>
                        )}
                    </div>
                </>
            )}

            {paidInvoices.length > 0 && (
                <>
                    <div className={styles.sectionHeader} style={{ marginTop: pendingInvoice ? '40px' : '0' }}>
                        <h2>Đã thanh toán</h2>
                        <span className={styles.paid}>
                            <MdCheckCircle /> Hoàn tất
                        </span>
                    </div>

                    {paidInvoices.map(invoice => (
                        <div key={invoice.invoice_id} className={styles.paidSection}>
                            {renderInvoiceDetail(invoice, true)}
                        </div>
                    ))}
                </>
            )}

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
