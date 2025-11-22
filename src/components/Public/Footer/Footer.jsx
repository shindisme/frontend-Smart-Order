import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { ShoppingCart } from 'lucide-react';

function Footer({ cartCount, showCart, setShowCart }) {
    const isShow = cartCount > 0;

    return (
        <>
            <div className={`${styles.footerWrap} ${isShow ? styles.show : ''}`}>
                <div className={styles.content}>

                    {/* Cart */}
                    <button className={styles.cartBtn} onClick={() => setShowCart(!showCart)}>
                        <ShoppingCart size={30} strokeWidth={2.3} />
                        <span className={styles.amount}>{cartCount}</span>
                    </button>

                    {/* Xác nhận */}
                    <Link to='/order-confirm' className={styles.confirmBtn}>
                        Xác Nhận
                    </Link>

                </div>
            </div >
        </>
    );
};

export default Footer;