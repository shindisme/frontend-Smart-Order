import styles from './CartModal.module.css'

function CartModal({ showCart, setShowCart }) {
    return (
        <>
            <div
                className={`${styles.overlay} ${showCart ? styles.show : ""}`}
                onClick={() => setShowCart(false)}
            />

            <div className={`${styles.cartModalWrap} ${showCart ? styles.show : ""}`}>
                CartModal
            </div>
        </>
    );
};

export default CartModal;