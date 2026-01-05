import { toast } from "react-toastify";
import styles from "./CartModal.module.css";

function CartModal({
    showCartModal,
    setShowCartModal,
    cart = [],
    setCart,
    removeItem,
    updateItem,
    clearCart,
    getTotalPrice
}) {
    const isCartEmpty = cart.length === 0;

    const calculateItemPrice = (item) => {
        const basePrice = Number(item.basePrice) || Number(item.price) || 0;

        const optionsPrice = (item.selectedOptions || []).reduce((sum, opt) => {
            return sum + (Number(opt.additionalPrice) || 0);
        }, 0);

        return (basePrice + optionsPrice) * item.quantity;
    };

    const handleNoteChange = (index, noteValue) => {
        const item = cart[index];
        updateItem(index, { ...item, note: noteValue });
    };

    const handleIncreaseQuantity = (index) => {
        const item = cart[index];
        const newQuantity = item.quantity + 1;
        const updatedItem = {
            ...item,
            quantity: newQuantity
        };
        updatedItem.totalPrice = calculateItemPrice(updatedItem);
        updateItem(index, updatedItem);
    };

    const handleDecreaseQuantity = (index) => {
        const item = cart[index];

        if (item.quantity > 1) {
            const newQuantity = item.quantity - 1;
            const updatedItem = {
                ...item,
                quantity: newQuantity
            };
            updatedItem.totalPrice = calculateItemPrice(updatedItem);
            updateItem(index, updatedItem);
        } else {
            const confirmed = window.confirm(
                "Số lượng đang là 1. Bạn có muốn xóa món này khỏi giỏ hàng không?"
            );
            if (confirmed) {
                removeItem(index);
            }
        }
    };

    const handleRemoveItem = (index) => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa món này khỏi giỏ hàng?");
        if (!confirmed) return;

        removeItem(index);
    };

    const handleClearCart = () => {
        if (isCartEmpty) {
            toast.warn("Giỏ hàng đang trống.");
            return;
        }

        const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
        if (!confirmed) return;

        clearCart();
    };

    const handleCloseModal = () => {
        setShowCartModal(false);
    };

    const formatMoney = (num) => {
        return Number(num).toLocaleString('vi-VN') + 'đ';
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
                        Giỏ hàng {!isCartEmpty && `(${cart.length})`}
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

                    {cart.map((item, index) => (
                        <div key={`${item.id}-${index}`} className={styles.cartItem}>
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
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        Xóa
                                    </button>
                                </div>

                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    <ul className={styles.optionsList}>
                                        {item.selectedOptions.map((option, optIndex) => (
                                            <li key={optIndex} className={styles.optionItem}>
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
                                            onClick={() => handleDecreaseQuantity(index)}
                                        >
                                            -
                                        </button>
                                        <span className={styles.quantityValue}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.quantityButton}
                                            onClick={() => handleIncreaseQuantity(index)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Ghi chú cho món này..."
                                        className={styles.noteInput}
                                        value={item.note || ""}
                                        onChange={(e) => handleNoteChange(index, e.target.value)}
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
