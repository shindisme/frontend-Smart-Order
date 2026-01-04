import { useState } from 'react';
import styles from './MenuTop.module.css';
import { FiSearch } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

function MenuTop({ searchTerm, onSearchChange }) {
    const [isSearchActive, setIsSearchActive] = useState(false);

    const handleSearchToggle = () => {
        setIsSearchActive(!isSearchActive);
        if (isSearchActive) {
            onSearchChange('');
        }
    };

    const handleInputChange = (event) => {
        onSearchChange(event.target.value);
    };

    return (
        <div className={styles.menuTop}>
            <div className={styles.menuTopContent}>
                {!isSearchActive && (
                    <div className={styles.menuTitle}>
                        <span className={styles.title}>MENU</span>
                    </div>
                )}

                {isSearchActive && (
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm món..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={handleInputChange}
                            autoFocus
                        />
                    </div>
                )}

                <button
                    className={styles.searchButton}
                    onClick={handleSearchToggle}
                    aria-label={isSearchActive ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
                >
                    {!isSearchActive ? (
                        <FiSearch size={40} color='#00456f' strokeWidth={3} />
                    ) : (
                        <RxCross1 size={40} color='#00456f' strokeWidth={1} />
                    )}
                </button>
            </div>

            <div className={styles.divider} />
        </div>
    );
}

export default MenuTop;
