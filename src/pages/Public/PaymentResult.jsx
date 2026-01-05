import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdCheckCircle, MdError } from 'react-icons/md';
import invoiceService from '../../services/invoiceService';
import styles from './PaymentResult.module.css';

function PaymentResult() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState('processing'); // processing, success, failed
    const [message, setMessage] = useState('Đang xử lý thanh toán...');

    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // invoice_id
    const tableId = searchParams.get('table') || localStorage.getItem('table_id');

    useEffect(() => {
        processPayment();
    }, []);

    const processPayment = async () => {
        try {
            // ✅ KIỂM TRA RESPONSE CODE
            if (vnp_ResponseCode === '00') {
                // Thành công
                try {
                    // ✅ CẬP NHẬT INVOICE STATUS
                    await invoiceService.pay(vnp_TxnRef);

                    // ✅ XÓA LOCALSTORAGE
                    localStorage.removeItem('currentInvoice');
                    localStorage.removeItem('guestCart');
                    localStorage.removeItem('selectedPaymentMethod');

                    setStatus('success');
                    setMessage('Thanh toán thành công!');
                    toast.success('Thanh toán thành công!');
                } catch (error) {
                    console.error('Error updating payment:', error);
                    setStatus('failed');
                    setMessage('Lỗi cập nhật thanh toán. Vui lòng liên hệ nhân viên!');
                }
            } else {
                // Thất bại
                setStatus('failed');
                setMessage(getErrorMessage(vnp_ResponseCode));
                toast.error('Thanh toán thất bại!');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            setStatus('failed');
            setMessage('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    };

    const getErrorMessage = (code) => {
        const errorMessages = {
            '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
            '09': 'Giao dịch không thành công do: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
            '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
            '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
            '12': 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa',
            '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
            '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
            '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư',
            '65': 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
            '75': 'Ngân hàng thanh toán đang bảo trì',
            '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
        };
        return errorMessages[code] || 'Giao dịch không thành công';
    };

    const handleBackToOrder = () => {
        if (tableId) {
            navigate(`/order?table=${tableId}`);
        } else {
            navigate('/');
        }
    };

    const handleBackToMenu = () => {
        if (tableId) {
            navigate(`/?table=${tableId}`);
        } else {
            navigate('/');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {status === 'processing' && (
                    <div className={styles.processing}>
                        <div className={styles.spinner}></div>
                        <h2>{message}</h2>
                    </div>
                )}

                {status === 'success' && (
                    <div className={styles.success}>
                        <MdCheckCircle className={styles.icon} />
                        <h2>Thanh toán thành công!</h2>
                        <p className={styles.message}>{message}</p>
                        <div className={styles.info}>
                            <div className={styles.infoRow}>
                                <span>Mã giao dịch:</span>
                                <strong>{vnp_TxnRef?.slice(0, 8).toUpperCase()}</strong>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleBackToOrder}
                            >
                                Xem đơn hàng
                            </button>
                            <button
                                className={styles.btnSecondary}
                                onClick={handleBackToMenu}
                            >
                                Về Menu
                            </button>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className={styles.failed}>
                        <MdError className={styles.icon} />
                        <h2>Thanh toán thất bại!</h2>
                        <p className={styles.message}>{message}</p>
                        <div className={styles.actions}>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleBackToOrder}
                            >
                                Thử lại
                            </button>
                            <button
                                className={styles.btnSecondary}
                                onClick={handleBackToMenu}
                            >
                                Về Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentResult;
