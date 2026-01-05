import { toast } from "react-toastify";
import styles from "./CartModal.module.css";

function CartModal({ showCartModal, setShowCartModal, cartItems = [], setCartItems }) {
    const isCartEmpty = cartItems.length === 0;

    const calculateItemPrice = (item) => {
        const basePrice = Number(item.basePrice) || 0;

        const optionsPrice = (item.selectedOptions || []).reduce((sum, opt) => {
            return sum + (Number(opt.additionalPrice) || 0);
        }, 0);

        return (basePrice + optionsPrice) * item.quantity;
    };

    const handleNoteChange = (itemId, noteValue) => {
        const updatedItems = cartItems.map(item => {
            if (item.id === itemId) {
                return { ...item, note: noteValue };
            }
            return item;
        });

        setCartItems(updatedItems);
    };

    const handleIncreaseQuantity = (itemId) => {
        const updatedItems = cartItems.map((item) => {
            if (item.id === itemId) {
                const newQuantity = item.quantity + 1;
                const newItem = {
                    ...item,
                    quantity: newQuantity
                };
                newItem.totalPrice = calculateItemPrice(newItem);
                return newItem;
            }
            return item;
        });

        setCartItems(updatedItems);
    };

    const handleDecreaseQuantity = (itemId) => {
        const currentItem = cartItems.find((item) => item.id === itemId);
        if (!currentItem) return;

        if (currentItem.quantity > 1) {
            const updatedItems = cartItems.map((item) => {
                if (item.id === itemId) {
                    const newQuantity = item.quantity - 1;
                    const newItem = {
                        ...item,
                        quantity: newQuantity
                    };
                    newItem.totalPrice = calculateItemPrice(newItem);
                    return newItem;
                }
                return item;
            });

            setCartItems(updatedItems);
        } else {
            const confirmed = window.confirm(
                "Số lượng đang là 1. Bạn có muốn xóa món này khỏi giỏ hàng không?"
            );
            if (confirmed) {
                const updatedItems = cartItems.filter((item) => item.id !== itemId);
                setCartItems(updatedItems);
            }
        }
    };

    const handleRemoveItem = (itemId) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa món này khỏi giỏ hàng?");
        if (!confirmed) return;

        const updatedItems = cartItems.filter((item) => item.id !== itemId);
        setCartItems(updatedItems);
    };

    const handleClearCart = () => {
        if (isCartEmpty) {
            toast.warn("Giỏ hàng đang trống.");
            return;
        }

        const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
        if (!confirmed) return;

        setCartItems([]);
    };

    const handleCloseModal = () => {
        setShowCartModal(false);
    };

    const formatMoney = (num) => {
        return Number(num).toLocaleString('vi-VN') + 'đ';
    };

    const getTotalPrice = () => {
        return cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    };

    return (
        <>
            <div
                className={`${styles.overlay} ${showCartModal ? styles.show : ""}`}
                onClick={handleCloseModal}
            />

            <div className={`${styles.cartModal} ${showCartModal ? styles.show : ""}`}>
                <div className={styles.header}>
                    <span className={styles.headerTitle}>
                        Giỏ hàng {!isCartEmpty && `(${cartItems.length})`}
                    </span>

                    <div className={styles.headerActions}>
                        {!isCartEmpty && (
                            <button
                                type="button"
                                className={styles.clearButton}
                                onClick={handleClearCart}
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.cartList}>
                    {isCartEmpty && (
                        <div className={styles.emptyMessage}>
                            Giỏ hàng hiện đang trống.
                        </div>
                    )}

                    {cartItems.map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                            <img
                                src={`${import.meta.env.VITE_IMG_URL}${item.imageUrl}`}
                                alt={item.name}
                                className={styles.itemImage}
                            />

                            <div className={styles.itemInfo}>
                                <div className={styles.itemHeader}>
                                    <div className={styles.itemName}>{item.name}</div>
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>

                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    <ul className={styles.optionsList}>
                                        {item.selectedOptions.map((option, index) => (
                                            <li key={index} className={styles.optionItem}>
                                                <span className={styles.optionName}>
                                                    {option.optionName}
                                                </span>
                                                {option.additionalPrice > 0 && (
                                                    <span className={styles.optionPrice}>
                                                        +{formatMoney(option.additionalPrice)}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className={styles.itemPrice}>
                                    {formatMoney(item.totalPrice)}
                                </div>

                                <div className={styles.itemControls}>
                                    <div className={styles.quantityControls}>
                                        <button
                                            type="button"
                                            className={styles.quantityButton}
                                            onClick={() => handleDecreaseQuantity(item.id)}
                                        >
                                            -
                                        </button>
                                        <span className={styles.quantityValue}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.quantityButton}
                                            onClick={() => handleIncreaseQuantity(item.id)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Ghi chú cho món này..."
                                        className={styles.noteInput}
                                        value={item.note || ""}
                                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    {!isCartEmpty && (
                        <div className={styles.totalSection}>
                            <span>Tổng cộng:</span>
                            <strong>{formatMoney(getTotalPrice())}</strong>
                        </div>
                    )}
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={handleCloseModal}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </>
    );
}

export default CartModal;
