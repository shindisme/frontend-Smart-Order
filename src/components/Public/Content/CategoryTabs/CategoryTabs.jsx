import { useState } from 'react';
import styles from './CategoryTab.module.css';

function CategoryTabs({ onChangeCategoryTab }) {

    const categories = [
        { id: 0, name: 'Tất cả' },
        { id: 1, name: 'Trà sữa' },
        { id: 2, name: 'Trà trái cây' },
        { id: 3, name: 'Sinh tố - Đá xay' },
        { id: 4, name: 'Nước ép' },
        { id: 6, name: 'Món ăn 1' },
        { id: 7, name: 'Món ăn 2' },
        { id: 7, name: 'Món ăn 3' },
    ];

    const [activeTab, setActiveTab] = useState(0);


    const handleChangeTabCategory = (category, index) => {
        setActiveTab(index);
        if (onChangeCategoryTab) {
            onChangeCategoryTab(category.id);
        }
    };
    return (
        <div className={styles.tabs}>
            {categories.map((category, index) => (
                <button
                    key={category.id}
                    className={`${styles.tab} ${index === activeTab ? styles.active : ''}`}
                    onClick={() => handleChangeTabCategory(category, index)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
export default CategoryTabs;