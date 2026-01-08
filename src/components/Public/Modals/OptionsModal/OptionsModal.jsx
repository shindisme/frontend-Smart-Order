import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./OptionsModal.module.css";

function OptionsModal({ showModal, setShowModal, selectedItem, addItem }) {
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
        const missingRequiredGroup = optionGroups.find(group => {
            const hasSelection = group.options.some(opt => opt.selected);
            return group.selectionType === "single" && !hasSelection;
        });

        if (missingRequiredGroup) {
            toast.warning(`Vui lòng chọn ${missingRequiredGroup.name}!`);
            return;
        }

        const selectedOptions = [];

        for (let i = 0; i < optionGroups.length; i++) {
            const group = optionGroups[i];

            for (let j = 0; j < group.options.length; j++) {
                const option = group.options[j];

                if (option.selected) {
                    selectedOptions.push({
                        optionId: option.optionId,
                        groupName: group.name,
                        optionName: option.name,
                        additionalPrice: option.additionalPrice
                    });
                }
            }
        }

        const itemId = selectedItem.item_id || selectedItem.data?.item_id || selectedItem.id;

        if (!itemId) {
            toast.error('Lỗi: Không tìm thấy ID món!');
            return;
        }

        const cartItem = {
            id: itemId,
            name: selectedItem.name,
            basePrice: Number(selectedItem.price),
            price: Number(selectedItem.price),
            quantity: quantity,
            imageUrl: selectedItem.img,
            selectedOptions: selectedOptions,
            totalPrice: calculateTotalPrice(),
            note: ""
        };

        addItem(cartItem);
        toast.success(`Đã thêm vào giỏ hàng!`);

        // reset với đóng modal
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
                    // chonn 1
                    const updatedOptions = group.options.map((option) => ({
                        ...option,
                        selected: option.optionId === optionId
                    }));

                    return { ...group, options: updatedOptions };
                } else {
                    // chọn nhiều
                    const updatedOptions = group.options.map((option) => {
                        if (option.optionId === optionId) {
                            return { ...option, selected: !option.selected };
                        }
                        return option;
                    });

                    return { ...group, options: updatedOptions };
                }
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
        setOptionGroups([]);
        setQuantity(1);
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

                if (isSizeGroup && isSingleSelection) {
                    const optionNameUpper = option.name.toLowerCase();
                    shouldSelect = optionNameUpper == 'size m'
                }

                return {
                    ...option,
                    optionId: option.option_id,
                    additionalPrice: option.plus_price || 0,
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

            if (isASize && !isBSize) return -1;
            if (!isASize && isBSize) return 1;
            return 0;
        });

        setOptionGroups(sortedGroups);
    }, [selectedItem, showModal]);

    if (!showModal || !selectedItem) {
        return null;
    }

    return (
        <>
            <div
                className={`${styles.overlay} ${styles.show}`}
                onClick={closeModal}
            />

            <div className={`${styles.modal} ${styles.show}`}>
                <div className={styles.header}>
                    <div className={styles.topBar}>
                        <h3>Thêm món mới</h3>
                        <button
                            className={styles.closeButton}
                            onClick={closeModal}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className={styles.content}>
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
                            <button
                                onClick={decrementQuantity}
                                type="button"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span>{quantity}</span>
                            <button
                                onClick={incrementQuantity}
                                type="button"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {optionGroups.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            Món này không có tùy chọn
                        </p>
                    )}

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
                                    className={`${styles.optionRow} ${option.selected ? styles.selected : ''}`}
                                >
                                    <div className={styles.optionInfo}>
                                        <span className={styles.optionName}>
                                            {option.name}
                                        </span>
                                        {option.additionalPrice > 0 && (
                                            <p className={styles.optionPrice}>
                                                +{formatMoneyVND(option.additionalPrice)}
                                            </p>
                                        )}
                                    </div>

                                    {group.selectionType === "single" ? (
                                        <input
                                            type="radio"
                                            name={`group-${group.groupId}`}
                                            checked={option.selected || false}
                                            onChange={() =>
                                                handleToggleOption(
                                                    group.groupId,
                                                    option.optionId,
                                                    group.selectionType
                                                )
                                            }
                                        />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={option.selected || false}
                                            onChange={() =>
                                                handleToggleOption(
                                                    group.groupId,
                                                    option.optionId,
                                                    group.selectionType
                                                )
                                            }
                                        />
                                    )}
                                </label>
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button
                        type="button"
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
