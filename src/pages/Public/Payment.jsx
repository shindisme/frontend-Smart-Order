import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowUndoSharp } from "react-icons/io5";
import { FaMoneyBillWave, FaWallet } from 'react-icons/fa';
import { MdTableRestaurant, MdReceiptLong } from 'react-icons/md';
import invoiceService from '../../services/invoiceService';
import styles from './Payment.module.css';

const PAYMENT_METHODS = [
    {
        id: 'cash',
        name: 'Tiền mặt (COD)',
        icon: <FaMoneyBillWave size={24} />,
        description: 'Thanh toán bằng tiền mặt cho nhân viên',
    },
    {
        id: 'vnpay',
        name: 'VNPay',
        icon: <FaWallet size={24} />,
        description: 'Thanh toán qua cổng VNPay',
    }
];

function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const [invoice, setInvoice] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!tableId) {
            toast.error('Không tìm thấy bàn');
            navigate('/');
            return;
        }

        loadInvoice();
        loadSavedMethod();
    }, [tableId]);

    const loadInvoice = async () => {
        try {
            setLoading(true);
            const res = await invoiceService.getPendingByTable(tableId);

            if (res?.data) {
                setInvoice(res.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error('Không tìm thấy hóa đơn chưa thanh toán');
                navigate(`/order?table=${tableId}`);
            } else {
                toast.error('Lỗi tải hóa đơn');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadSavedMethod = () => {
        try {
            const saved = localStorage.getItem('selectedPaymentMethod');
            if (saved) {
                const method = JSON.parse(saved);
                setSelectedMethod(method);
            }
        } catch (err) {
            console.error('Error loading payment method:', err);
        }
    };

    const handleBack = () => {
        navigate(`/order?table=${tableId}`);
    };

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
        localStorage.setItem('selectedPaymentMethod', JSON.stringify(method));
    };

    const handlePayment = async () => {
        if (!selectedMethod) {
            toast.warning('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        if (!invoice?.invoice_id) {
            toast.error('Không tìm thấy hóa đơn!');
            return;
        }

        setIsProcessing(true);

        try {
            if (selectedMethod.id === 'vnpay') {
                localStorage.setItem('table_id', tableId);

                const returnUrl = `${window.location.origin}/payment-result?table=${tableId}`;
                const vnpayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?` +
                    `vnp_Amount=${invoice.final_total * 100}` +
                    `&vnp_TxnRef=${invoice.invoice_id}` +
                    `&vnp_ReturnUrl=${encodeURIComponent(returnUrl)}`;

                toast.info('Đang chuyển đến cổng thanh toán VNPay...');

                setTimeout(() => {
                    window.location.href = vnpayUrl;
                }, 1000);

            } else if (selectedMethod.id === 'cash') {
                await invoiceService.pay(invoice.invoice_id);

                localStorage.removeItem('currentInvoice');
                localStorage.removeItem('guestCart');
                localStorage.removeItem('selectedPaymentMethod');

                toast.success('Đã xác nhận thanh toán tiền mặt!');

                setTimeout(() => {
                    navigate(`/order?table=${tableId}`);
                }, 1500);
            }
        } catch (error) {
            toast.error('Lỗi khi thanh toán: ' + (error.response?.data?.message || error.message));
            setIsProcessing(false);
        }
    };

    const formatMoney = (num) => num?.toLocaleString('vi-VN') + 'đ';

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return null;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={handleBack}>
                    <IoArrowUndoSharp size={24} />
                </button>
                <h3>Thanh toán</h3>
            </header>

            <main className={styles.main}>
                <div className={styles.invoiceCard}>
                    <h4>Thông tin hóa đơn</h4>

                    <div className={styles.invoiceRow}>
                        <span><MdTableRestaurant size={20} /> Bàn:</span>
                        <strong>{invoice.table_name || 'N/A'}</strong>
                    </div>

                    <div className={styles.invoiceRow}>
                        <span><MdReceiptLong size={20} /> Mã HĐ:</span>
                        <strong>{invoice.invoice_id.slice(0, 8).toUpperCase()}</strong>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.invoiceRow}>
                        <span>Tổng tiền:</span>
                        <span>{formatMoney(invoice.total)}</span>
                    </div>

                    {invoice.discount > 0 && (
                        <div className={styles.invoiceRow}>
                            <span>Giảm giá:</span>
                            <span className={styles.discount}>-{formatMoney(invoice.discount)}</span>
                        </div>
                    )}

                    <div className={styles.invoiceTotal}>
                        <span>Tổng thanh toán:</span>
                        <strong>{formatMoney(invoice.final_total)}</strong>
                    </div>
                </div>

                <div className={styles.methodsSection}>
                    <h4>Chọn phương thức thanh toán</h4>

                    <div className={styles.methodsGrid}>
                        {PAYMENT_METHODS.map(method => (
                            <div
                                key={method.id}
                                className={`${styles.methodCard} ${selectedMethod?.id === method.id ? styles.selected : ''
                                    }`}
                                onClick={() => handleSelectMethod(method)}
                            >
                                <div className={styles.methodIcon}>
                                    {method.icon}
                                </div>

                                <div className={styles.methodInfo}>
                                    <h5>{method.name}</h5>
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
                </div>
            </main>

            <footer className={styles.footer}>
                <button
                    className={styles.payButton}
                    onClick={handlePayment}
                    disabled={!selectedMethod || isProcessing}
                >
                    {isProcessing ? 'Đang xử lý...' : `Thanh toán ${formatMoney(invoice.final_total)}`}
                </button>
            </footer>
        </div>
    );
}

export default Payment;
