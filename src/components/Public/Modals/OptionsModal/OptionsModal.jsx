import { useEffect, useState } from "react";
import styles from "./OptionsModal.module.css";

function OptionsModal({ showModal, setShowModal, selectedItem, setCartItems }) {
    const [optionGroups, setOptionGroups] = useState([]);
    const [quantity, setQuantity] = useState(1);

    const formatMoneyVND = (amount) => {
        const money = Number(amount) || 0;
        return money.toLocaleString("vi-VN") + "đ";
    };

    const calculateTotalPrice = () => {
        let optionsSubtotal = 0;

        for (let i = 0; i < optionGroups.length; i++) {
            const group = optionGroups[i];
            for (let j = 0; j < group.options.length; j++) {
                const option = group.options[j];
                if (option.selected) {
                    optionsSubtotal += Number(option.additionalPrice || 0);
                }
            }
        }

        const basePrice = Number(selectedItem?.price || 0);
        return (basePrice + optionsSubtotal) * quantity;
    };

    const handleAddToCart = () => {
        const selectedOptions = [];

        for (let i = 0; i < optionGroups.length; i++) {
            const group = optionGroups[i];

            for (let j = 0; j < group.options.length; j++) {
                const option = group.options[j];

                if (option.selected) {
                    selectedOptions.push({
                        groupName: group.name,
                        optionName: option.name,
                        additionalPrice: option.additionalPrice
                    });
                }
            }
        }

        const cartItem = {
            id: crypto.randomUUID(),
            itemId: selectedItem.item_id,
            name: selectedItem.name,
            basePrice: Number(selectedItem.price),
            quantity: quantity,
            imageUrl: selectedItem.img,
            selectedOptions: selectedOptions,
            totalPrice: calculateTotalPrice()
        };

        setCartItems((prevCart) => [...prevCart, cartItem]);

        // Reset state
        setOptionGroups([]);
        setQuantity(1);
        setShowModal(false);
    };

    const handleToggleOption = (groupId, optionId, selectionType) => {
        setOptionGroups((prevGroups) => {
            return prevGroups.map((group) => {
                if (group.groupId !== groupId) {
                    return group;
                }

                if (selectionType === "single") {
                    const updatedOptions = group.options.map((option) => {
                        return {
                            ...option,
                            selected: option.optionId === optionId
                        };
                    });

                    return { ...group, options: updatedOptions };
                }

                const updatedOptions = group.options.map((option) => {
                    if (option.optionId === optionId) {
                        return { ...option, selected: !option.selected };
                    }
                    return option;
                });

                return { ...group, options: updatedOptions };
            });
        });
    };

    const incrementQuantity = () => {
        setQuantity((prev) => prev + 1);
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    useEffect(() => {
        if (!showModal || !selectedItem) {
            if (!showModal) {
                setOptionGroups([]);
                setQuantity(1);
            }
            return;
        }

        if (!selectedItem.groups || selectedItem.groups.length === 0) {
            setOptionGroups([]);
            return;
        }

        const processedGroups = selectedItem.groups.map((group) => {
            const isSingleSelection = group.type === 0;
            const isSizeGroup = group.name.toLowerCase().includes('size');

            const processedOptions = group.options.map((option) => {
                let shouldSelect = false;

                if (isSizeGroup) {
                    shouldSelect = option.name.toUpperCase().includes('M');
                }

                return {
                    ...option,
                    optionId: option.option_id,
                    additionalPrice: option.plus_price,
                    selected: shouldSelect
                };
            });

            return {
                ...group,
                groupId: group.group_id,
                selectionType: isSingleSelection ? "single" : "multi",
                options: processedOptions
            };
        });

        const sortedGroups = processedGroups.sort((a, b) => {
            const isASize = a.name.toLowerCase().includes('size');
            const isBSize = b.name.toLowerCase().includes('size');

            if (isASize) return -1;
            if (isBSize) return 1;
            return 0;
        });

        setOptionGroups(sortedGroups);
    }, [selectedItem, showModal]);

    if (!showModal || !selectedItem) {
        return null;
    }

    return (
        <>
            {/* Overlay */}
            <div
                className={`${styles.overlay} ${styles.show}`}
                onClick={closeModal}
            />

            {/* Modal */}
            <div className={`${styles.modal} ${styles.show}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.topBar}>
                        <h3>Thêm món mới</h3>
                        <button
                            className={styles.closeButton}
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Item Info */}
                    <div className={styles.itemInfo}>
                        <img
                            src={`${import.meta.env.VITE_IMG_URL}${selectedItem.img}`}
                            alt={selectedItem.name}
                            className={styles.itemImage}
                        />

                        <div className={styles.itemDetails}>
                            <h4 className={styles.itemName}>
                                {selectedItem.name}
                            </h4>
                            <span className={styles.itemPrice}>
                                {formatMoneyVND(selectedItem.price)}
                            </span>
                        </div>

                        <div className={styles.quantityControls}>
                            <button onClick={decrementQuantity}>-</button>
                            <span>{quantity}</span>
                            <button onClick={incrementQuantity}>+</button>
                        </div>
                    </div>

                    {/* Options */}
                    {optionGroups.map((group) => (
                        <div key={group.groupId} className={styles.optionGroup}>
                            <div className={styles.groupHeader}>
                                <span className={styles.groupName}>
                                    {group.name}
                                </span>
                                <small className={styles.selectionHint}>
                                    {group.selectionType === "single"
                                        ? "(Chọn 1)"
                                        : "(Chọn nhiều)"}
                                </small>
                            </div>

                            {group.options.map((option) => (
                                <label
                                    key={option.optionId}
                                    className={styles.optionRow}
                                    onClick={() =>
                                        handleToggleOption(
                                            group.groupId,
                                            option.optionId,
                                            group.selectionType
                                        )
                                    }
                                >
                                    <div className={styles.optionInfo}>
                                        <span className={styles.optionName}>
                                            {option.name}
                                        </span>
                                        <p className={styles.optionPrice}>
                                            +{formatMoneyVND(option.additionalPrice)}
                                        </p>
                                    </div>

                                    {group.selectionType === "single" ? (
                                        <input
                                            type="radio"
                                            checked={option.selected}
                                            onChange={() => { }}
                                        />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={option.selected}
                                            onChange={() => { }}
                                        />
                                    )}
                                </label>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        className={styles.addToCartButton}
                        onClick={handleAddToCart}
                    >
                        Thêm vào giỏ hàng – {formatMoneyVND(calculateTotalPrice())}
                    </button>
                </div>
            </div>
        </>
    );
}

export default OptionsModal;
