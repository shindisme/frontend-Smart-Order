// src/pages/Payment/Payment.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowUndoSharp } from "react-icons/io5";
import { RiCoupon2Line } from 'react-icons/ri';
import { MdTableRestaurant, MdReceiptLong } from 'react-icons/md';
import { BiMoney, BiWallet } from 'react-icons/bi';
import invoiceService from '../../services/invoiceService';
import { CartStorage } from '../../utils/cartStorage';
import CouponModal from '../../components/Public/Modals/CouponModal/CouponModal';
import styles from './Payment.module.css';
import { IoIosArrowForward } from "react-icons/io";
import paymentService from '../../services/paymentService';

const PAYMENT_METHODS = [
    {
        id: 'cash',
        name: 'Tiền mặt',
        icon: <BiMoney size={32} fill='#0B3C60' />,
    },
    {
        id: 'vnpay',
        name: 'VNPay',
        icon: <BiWallet size={32} fill='#0B3C60' />,
    }
];

function Payment() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const [invoice, setInvoice] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            setError(null);

            const invoicesRes = await invoiceService.getAll();

            if (invoicesRes?.data) {
                const pending = invoicesRes.data.find(
                    inv => String(inv.table_id) === String(tableId) && inv.status === 0
                );

                if (pending) {
                    const detailRes = await invoiceService.getById(pending.invoice_id);
                    setInvoice(detailRes?.data || pending);
                } else {
                    setError('Không tìm thấy hóa đơn chưa thanh toán');
                    toast.error('Không tìm thấy hóa đơn chưa thanh toán');
                    setTimeout(() => navigate(`/order?table=${tableId}`), 1500);
                }
            } else {
                throw new Error('No data in response');
            }
        } catch (error) {
            console.error('Error loading invoice:', error);
            setError(error.message || 'Lỗi tải hóa đơn');
            toast.error('Lỗi tải hóa đơn');
            setTimeout(() => navigate(`/order?table=${tableId}`), 2000);
        } finally {
            setLoading(false);
        }
    };

    const loadSavedMethod = () => {
        try {
            const saved = localStorage.getItem('selectedPaymentMethod');
            if (saved) {
                setSelectedMethod(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved method:', error);
        }
    };

    const handleBack = () => {
        navigate(`/order?table=${tableId}`);
    };

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
        localStorage.setItem('selectedPaymentMethod', JSON.stringify(method));
    };

    const handleApplyCoupon = (couponData) => {
        setCouponCode(couponData.code);
        setAppliedCoupon(couponData);
        setShowCouponModal(false);
        toast.success(`Đã áp dụng mã ${couponData.code}!`);
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setAppliedCoupon(null);
        toast.info('Đã xóa mã giảm giá');
    };

    const calculateDiscount = () => {
        if (!appliedCoupon || !invoice) return 0;

        const total = invoice.total || 0;

        if (appliedCoupon.type === 0) {
            let discount = Math.floor(total * appliedCoupon.value / 100);
            if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
                discount = appliedCoupon.max_discount;
            }
            return discount;
        } else {
            return Math.min(appliedCoupon.value, total);
        }
    };

    const getFinalTotal = () => {
        const total = invoice?.total || 0;
        const discount = calculateDiscount();
        return Math.max(0, total - discount);
    };

    const handleVNPayment = async () => {
        try {
            setIsProcessing(true);

            const amount = getFinalTotal();

            if (!amount || amount <= 0) {
                toast.error('Số tiền không hợp lệ');
                return;
            }

            const res = await paymentService.createVnpayPayment({
                invoice_id: invoice.invoice_id,
                amount
            });

            const data = res.data;

            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                toast.error(data.message || 'Lỗi tạo link thanh toán');
            }
        } catch (error) {
            console.error('VNPay lỗi:', error);
            toast.error(error.response?.data?.message || 'Lỗi tạo link thanh toán');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCashPayment = async () => {
        try {
            setIsProcessing(true);

            await invoiceService.pay(invoice.invoice_id, couponCode || null);
            CartStorage.clearCart(tableId);
            localStorage.removeItem('selectedPaymentMethod');

            toast.success('Đã xác nhận thanh toán!');
            setTimeout(() => navigate(`/order?table=${tableId}`), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi thanh toán');
        } finally {
            setIsProcessing(false);
        }
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

        if (selectedMethod.id === 'cash') {
            await handleCashPayment();
        } else if (selectedMethod.id === 'vnpay') {
            await handleVNPayment();
        }
    };

    const formatMoney = (num) => {
        return (num || 0).toLocaleString('vi-VN') + 'đ';
    };

    // ✅ THÊM LOADING STATE
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <p>Đang tải hóa đơn...</p>
                </div>
            </div>
        );
    }

    // ✅ THÊM ERROR STATE
    if (error || !invoice) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Có lỗi xảy ra</h2>
                    <p>{error || 'Không tìm thấy hóa đơn'}</p>
                    <button className={styles.btnPrimary} onClick={() => navigate(`/order?table=${tableId}`)}>
                        Quay lại đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    const discount = calculateDiscount();
    const finalTotal = getFinalTotal();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={handleBack}>
                    <IoArrowUndoSharp size={24} />
                </button>
                <h3>Thanh toán</h3>
            </header>

            <main className={styles.main}>
                <div className={styles.card}>
                    <h4>Thông tin hóa đơn</h4>

                    <div className={styles.row}>
                        <span><MdTableRestaurant size={20} /> Bàn:</span>
                        <strong>{invoice.table_name || 'N/A'}</strong>
                    </div>

                    <div className={styles.row}>
                        <span><MdReceiptLong size={20} /> Mã HĐ:</span>
                        <strong>{invoice.invoice_id?.slice(0, 8).toUpperCase() || 'N/A'}</strong>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.row}>
                        <span>Tổng tiền:</span>
                        <span>{formatMoney(invoice.total)}</span>
                    </div>

                    {discount > 0 && (
                        <div className={styles.row}>
                            <span>Giảm giá:</span>
                            <span className={styles.discount}>-{formatMoney(discount)}</span>
                        </div>
                    )}

                    <div className={styles.totalRow}>
                        <span>Tổng thanh toán:</span>
                        <strong>{formatMoney(finalTotal)}</strong>
                    </div>
                </div>

                <button className={styles.couponBtn} onClick={() => setShowCouponModal(true)}>
                    <RiCoupon2Line size={20} />
                    <span>{couponCode ? 'Mã: ' + couponCode : 'Áp dụng mã'}</span>
                    {couponCode && (
                        <button
                            className={styles.removeBtn}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCoupon();
                            }}
                        >
                            Xóa
                        </button>
                    )}

                    <IoIosArrowForward size={20} />
                </button>

                <div className={styles.methodSection}>
                    {PAYMENT_METHODS.map(method => (
                        <label
                            key={method.id}
                            className={`${styles.methodCard} ${selectedMethod?.id === method.id ? styles.active : ''}`}
                        >
                            <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedMethod?.id === method.id}
                                onChange={() => handleSelectMethod(method)}
                            />
                            <div className={styles.methodIcon}>{method.icon}</div>
                            <span>{method.name}</span>
                        </label>
                    ))}
                </div>
            </main>

            <footer className={styles.footer}>
                <button
                    className={styles.payBtn}
                    onClick={handlePayment}
                    disabled={!selectedMethod || isProcessing}
                >
                    {isProcessing ? 'Đang xử lý...' : `Thanh toán ${formatMoney(finalTotal)}`}
                </button>
            </footer>

            {showCouponModal && (
                <CouponModal
                    show={showCouponModal}
                    onClose={() => setShowCouponModal(false)}
                    onApply={handleApplyCoupon}
                    orderTotal={invoice.total}
                />
            )}
        </div>
    );
}

export default Payment;
