import itemService from '../../../../services/itemService';
import styles from './Item.module.css';

function ItemCard({ item, setSelectedItem, setShowOptionsModal }) {
    const { name, price, size, img, item_id } = item;

    const formatMoneyVND = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const handleOpenOptionsModal = async () => {
        try {
            const itemDetail = await itemService.getById(item_id);
            // console.log('Chi tiết món:', itemDetail);
            setSelectedItem(itemDetail);
            setShowOptionsModal(true);
        } catch (error) {
            console.error('Lỗi:', error);
        }
    };

    return (
        <div className={styles.itemCard}>
            <div className={styles.imageContainer}>
                <img
                    src={`${import.meta.env.VITE_IMG_URL}${img}`}
                    alt={name}
                />
            </div>

            <div className={styles.itemName}>{name}</div>

            <div className={styles.itemFooter}>
                <div className={styles.itemInfo}>
                    <span className={styles.itemSize}>{size || 'M - L'}</span>
                    <span className={styles.itemPrice}>
                        {formatMoneyVND(price)} đ
                    </span>
                </div>

                <button
                    className={styles.addButton}
                    onClick={handleOpenOptionsModal}
                    aria-label={`Thêm ${name} vào giỏ hàng`}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default ItemCard;
