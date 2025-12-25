import { useEffect, useState } from 'react';
import categoryService from '../../../../services/categoryService.js';
import styles from './CategoryTab.module.css';

function CategoryTabs({ onCategoryChange }) {
    const [categories, setCategories] = useState([]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const handleTabClick = (categoryId, tabIndex) => {
        setActiveTabIndex(tabIndex);
        if (onCategoryChange) {
            onCategoryChange(categoryId);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data);
            } catch (error) {
                console.log('Lỗi tải danh mục:', error);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className={styles.categoryTabs}>
            <button
                className={`${styles.categoryTab} ${activeTabIndex === 0 ? styles.active : ''}`}
                onClick={() => handleTabClick('0', 0)}
            >
                Tất cả
            </button>

            {categories.map((category, index) => (
                <button
                    key={category.category_id}
                    className={`${styles.categoryTab} ${activeTabIndex === index + 1 ? styles.active : ''}`}
                    onClick={() => handleTabClick(category.category_id, index + 1)}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}

export default CategoryTabs;
