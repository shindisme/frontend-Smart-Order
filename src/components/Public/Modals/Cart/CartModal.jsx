import styles from "./CartModal.module.css";

function CartModal({ showCartModal, setShowCartModal, cartItems = [], setCartItems }) {
    const isCartEmpty = cartItems.length === 0;

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
                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
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
                    return {
                        ...item,
                        quantity: item.quantity - 1,
                    };
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
            alert("Giỏ hàng đang trống.");
            return;
        }

        const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");
        if (!confirmed) return;

        setCartItems([]);
    };

    const handleCloseModal = () => {
        setShowCartModal(false);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${showCartModal ? styles.show : ""}`}
                onClick={handleCloseModal}
            />

            {/* Cart Modal */}
            <div className={`${styles.cartModal} ${showCartModal ? styles.show : ""}`}>
                {/* Header */}
                <div className={styles.header}>
                    <span className={styles.headerTitle}>Giỏ hàng</span>

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

                {/* Cart Items List */}
                <div className={styles.cartList}>
                    {isCartEmpty && (
                        <div className={styles.emptyMessage}>
                            Giỏ hàng hiện đang trống.
                        </div>
                    )}

                    {cartItems.map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                            {/* Item Image */}
                            <img
                                src={`${import.meta.env.VITE_IMG_URL}${item.imageUrl}`}
                                alt={item.name}
                                className={styles.itemImage}
                            />

                            {/* Item Info */}
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

                                {/* Selected Options */}
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    <ul className={styles.optionsList}>
                                        {item.selectedOptions.map((option, index) => (
                                            <li key={index} className={styles.optionItem}>
                                                <span className={styles.optionName}>
                                                    {option.optionName}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {/* Controls */}
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

                {/* Footer */}
                <div className={styles.footer}>
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
