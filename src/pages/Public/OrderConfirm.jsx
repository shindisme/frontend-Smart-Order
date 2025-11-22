import { Link } from 'react-router-dom';
import styles from './OrderConfirm.module.css';

function OrderConfirm() {

    return (
        <div className={styles.orderConfirmWrap}>
            <Link to='/'>Quay về</Link>
            <h1>Trang Xác Nhận Đơn Hàng</h1>
        </div>
    );
};

export default OrderConfirm;