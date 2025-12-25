import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { MdOutlineShoppingCart } from "react-icons/md";

function Footer({ cartCount, showCartModal, setShowCartModal }) {
    const hasCartItems = cartCount > 0;

    const handleToggleCart = () => {
        setShowCartModal(!showCartModal);
    };

    return (
        <div className={`${styles.footer} ${hasCartItems ? styles.show : ''}`}>
            <div className={styles.content}>
                {/* Cart Button */}
                <button
                    className={styles.cartButton}
                    onClick={handleToggleCart}
                    aria-label="Giỏ hàng"
                >
                    <MdOutlineShoppingCart size={30} />
                    <span className={styles.cartBadge}>{cartCount}</span>
                </button>

                {/* Confirm Button */}
                <Link
                    to='/order-confirm'
                    className={styles.confirmButton}
                >
                    Xác Nhận
                </Link>
            </div>
        </div>
    );
}

export default Footer;
