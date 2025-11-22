import styles from './Item.module.css';
import ItemCard from './ItemCard';

function Item({ activeCategoryTab, setCartCount }) {
    const items = [
        {
            id: 1,
            categoryId: 1,
            image: 'https://feelingteaonline.com/wp-content/uploads/2020/08/s%C6%B0a-tuoi-tc-%C4%91%C6%B0%E1%BB%9Dng-%C4%91en.jpg',
            name: 'Trà sữa trân châu đường đen',
            size: 'M - L',
            price: '25.0.00đ'
        },
        {
            id: 2,
            categoryId: 1,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIeEmmpy9LGrEP4EFaEmjbffXtxmrd-7YwPA&s',
            name: 'Trà sữa trân châu truyền thống',
            size: 'M - L',
            price: '23.000đ'
        },
        {
            id: 3,
            categoryId: 2,
            image: 'https://qcbyfresh.com/uploads/shops/2024_12/20.png',
            name: 'Trà trái cây nhiệt đới',
            size: 'M - L',
            price: '27.000đ'
        },
        {
            id: 4,
            categoryId: 3,
            image: 'https://cafebuivan.com/thumbs/500x470x2/upload/product/sinh-to-bo-9679.png',
            name: 'Sinh tố bơ đá xay',
            size: 'M',
            price: '30.000đ'
        },
        {
            id: 5,
            image: 'https://feelingteaonline.com/wp-content/uploads/2020/08/s%C6%B0a-tuoi-tc-%C4%91%C6%B0%E1%BB%9Dng-%C4%91en.jpg',
            categoryId: 1,
            name: 'Trà sữa trân châu đường đen',
            size: 'M - L',
            price: '25.000đ'
        },
        {
            id: 6,
            categoryId: 1,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIeEmmpy9LGrEP4EFaEmjbffXtxmrd-7YwPA&s',
            name: 'Trà sữa trân châu truyền thốngTrà sữa trân châu truyền thống',
            size: 'M - L',
            price: '23.000đ'
        },
        {
            id: 7,
            categoryId: 1,
            image: 'https://feelingteaonline.com/wp-content/uploads/2020/08/s%C6%B0a-tuoi-tc-%C4%91%C6%B0%E1%BB%9Dng-%C4%91en.jpg',
            name: 'Trà sữa trân châu đường đen',
            size: 'M - L',
            price: '25.000đ'
        },
        {
            id: 8,
            categoryId: 1,
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIeEmmpy9LGrEP4EFaEmjbffXtxmrd-7YwPA&s',
            name: 'Trà sữa trân châu truyền thống',
            size: 'M - L',
            price: '23.000đ'
        }
    ];

    const filteredItems = activeCategoryTab === 0 ? items : items.filter(item => item.categoryId === activeCategoryTab);

    const handleAddToCart = (item) => {
        console.log("Đã thêm:", item);
    }
    return (
        <div className={styles.itemContainerWrap}>
            {
                filteredItems.map((item) =>
                    <ItemCard
                        key={item.id}
                        name={item.name}
                        image={item.image}
                        size={item.size}
                        price={item.price}
                        handleAddToCart={handleAddToCart}
                        setCartCount={setCartCount}

                    />
                )
            }
        </div>
    );
};
export default Item;