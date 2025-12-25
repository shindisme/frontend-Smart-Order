import { useEffect, useState } from 'react';
import styles from './Item.module.css';
import ItemCard from './ItemCard';
import itemService from '../../../../services/itemService';

function ItemContainer({ activeCategoryId, searchTerm, setSelectedItem, setShowOptionsModal }) {
    const [items, setItems] = useState([]);

    // filter theo cate tab
    const itemsByCategory = activeCategoryId === '0'
        ? items
        : items.filter(item => item.category_id === activeCategoryId);

    // filter theo search
    const filteredItems = searchTerm
        ? itemsByCategory.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : itemsByCategory;


    // const removeDiacritics = (str) => {
    //     return str
    //         .normalize('NFD')
    //         .replace(/[\u0300-\u036f]/g, '')
    //         .replace(/đ/g, 'd')
    //         .replace(/Đ/g, 'D')
    //         .toLowerCase(

    //     );
    // };
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const itemData = await itemService.getAll();
                setItems(itemData);
            } catch (error) {
                console.log('Lỗi tải menu: ', error);
            }
        };

        fetchItems();
    }, []);

    return (
        <div className={styles.itemContainer}>
            {filteredItems.length === 0 ? (
                <div className={styles.emptyMessage}>
                    {searchTerm
                        ? `Không tìm thấy món nào`
                        : 'Không có món nào trong danh mục này'
                    }
                </div>
            ) : (
                filteredItems.map((item) => (
                    <ItemCard
                        key={item.item_id}
                        item={item}
                        setSelectedItem={setSelectedItem}
                        setShowOptionsModal={setShowOptionsModal}
                    />
                ))
            )}
        </div>
    );
}

export default ItemContainer;
