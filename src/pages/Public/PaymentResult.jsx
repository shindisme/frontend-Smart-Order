// import { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { MdCheckCircle, MdError } from 'react-icons/md';
// import invoiceService from '../../services/invoiceService';
// import { CartStorage } from '../../utils/cartStorage';
// import styles from './PaymentResult.module.css';

// function PaymentResult() {
//     const navigate = useNavigate();
//     const [searchParams] = useSearchParams();

//     const [status, setStatus] = useState('processing');
//     const [message, setMessage] = useState('Đang xử lý thanh toán...');

//     const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
//     const vnp_TxnRef = searchParams.get('vnp_TxnRef');
//     const tableId = searchParams.get('table');

//     useEffect(() => {
//         processPayment();
//     }, []);

//     const processPayment = async () => {
//         try {
//             if (vnp_ResponseCode === '00') {
//                 try {
//                     await invoiceService.pay(vnp_TxnRef);

//                     if (tableId) {
//                         CartStorage.clearCart(tableId);
//                     }

//                     localStorage.removeItem('selectedPaymentMethod');

//                     setStatus('success');
//                     setMessage('Thanh toán thành công!');
//                     toast.success('Thanh toán thành công!');
//                 } catch (error) {
//                     console.error('Lỗi', error);
//                     setStatus('failed');
//                     setMessage('Lỗi cập nhật thanh toán. Vui lòng liên hệ nhân viên!');
//                 }
//             } else {
//                 setStatus('failed');
//                 setMessage(getErrorMessage(vnp_ResponseCode));
//                 toast.error('Thanh toán thất bại!');
//             }
//         } catch (error) {
//             console.error('Lỗi: ', error);
//             setStatus('failed');
//             setMessage('Có lỗi xảy ra. Vui lòng thử lại!');
//         }
//     };

//     const getErrorMessage = (code) => {
//         const errorMessages = {
//             '07': 'Giao dịch nghi ngờ gian lận',
//             '09': 'Thẻ chưa đăng ký InternetBanking',
//             '10': 'Xác thực sai quá 3 lần',
//             '11': 'Hết hạn chờ thanh toán',
//             '12': 'Thẻ/Tài khoản bị khóa',
//             '13': 'Nhập sai mật khẩu OTP',
//             '24': 'Khách hàng hủy giao dịch',
//             '51': 'Tài khoản không đủ số dư',
//             '65': 'Vượt quá hạn mức giao dịch',
//             '75': 'Ngân hàng đang bảo trì',
//             '79': 'Nhập sai mật khẩu quá số lần quy định',
//         };
//         return errorMessages[code] || 'Giao dịch không thành công';
//     };

//     const handleBackToOrder = () => {
//         navigate(tableId ? `/order?table=${tableId}` : '/');
//     };

//     const handleBackToMenu = () => {
//         navigate(tableId ? `/?table=${tableId}` : '/');
//     };

//     const handleRetryPayment = () => {
//         navigate(tableId ? `/payment?table=${tableId}` : '/');
//     };

//     return (
//         <div className={styles.container}>
//             <div className={styles.card}>
//                 {status === 'processing' && (
//                     <div className={styles.processing}>
//                         <div className={styles.spinner}></div>
//                         <h2>{message}</h2>
//                         <p className={styles.subtext}>Vui lòng không tắt trang này...</p>
//                     </div>
//                 )}

//                 {status === 'success' && (
//                     <div className={styles.success}>
//                         <div className={styles.iconWrapper}>
//                             <MdCheckCircle className={styles.icon} />
//                         </div>
//                         <h2>Thanh toán thành công!</h2>
//                         <p className={styles.message}>Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xác nhận.</p>

//                         <div className={styles.info}>
//                             <div className={styles.infoRow}>
//                                 <span>Mã giao dịch:</span>
//                                 <strong>{vnp_TxnRef?.slice(0, 8).toUpperCase()}</strong>
//                             </div>
//                             {tableId && (
//                                 <div className={styles.infoRow}>
//                                     <span>Bàn:</span>
//                                     <strong>{tableId}</strong>
//                                 </div>
//                             )}
//                         </div>

//                         <div className={styles.actions}>
//                             <button
//                                 className={styles.btnPrimary}
//                                 onClick={handleBackToOrder}
//                             >
//                                 Xem đơn hàng
//                             </button>
//                             <button
//                                 className={styles.btnSecondary}
//                                 onClick={handleBackToMenu}
//                             >
//                                 Về Menu
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {status === 'failed' && (
//                     <div className={styles.failed}>
//                         <div className={styles.iconWrapper}>
//                             <MdError className={styles.icon} />
//                         </div>
//                         <h2>Thanh toán thất bại!</h2>
//                         <p className={styles.message}>{message}</p>

//                         <div className={styles.actions}>
//                             <button
//                                 className={styles.btnPrimary}
//                                 onClick={handleRetryPayment}
//                             >
//                                 Thử lại
//                             </button>
//                             <button
//                                 className={styles.btnSecondary}
//                                 onClick={handleBackToMenu}
//                             >
//                                 Về Menu
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default PaymentResult;
