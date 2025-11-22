import styles from './Item.module.css';

function ItemCard({ name, price, size, image, handleAddToCart, setCartCount }) {
    // console.log({ name, price, size, image });
    return (
        <div className={styles.itemCardWrap}>
            <div className={styles.imageWrap}>
                <img src={image} alt={name} />
            </div>
            <div className={styles.name}>{name}</div>
            <div className={styles.content}>
                <div className={styles.info}>
                    <span className={styles.size}>{size}</span>
                    <span className={styles.price}>{price}</span>
                </div>

                <button
                    className={styles.plusBtn}
                    onClick={() => {
                        setCartCount(prev => prev + 1);
                        handleAddToCart({ name, price, size, image });
                    }}
                >
                    +
                </button>
            </div>
        </div >
    );
};

export default ItemCard;