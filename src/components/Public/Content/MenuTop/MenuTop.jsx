import { LayoutList, Search, X } from 'lucide-react';
import { useState } from 'react';
import styles from './MenuTop.module.css';

function MenuTop() {
    const [isSearching, setIsSearching] = useState(false);

    return (
        <div className={styles.menuTopWrap}>
            <div className={styles.menuTop}>

                {/* Chưa tìm */}
                {!isSearching && (
                    <div className={styles.menuLeft}>
                        <span className={styles.title}>MENU</span>
                        <span className={styles.iconWrap}>
                            <LayoutList size={40} color='#00456f' strokeWidth={2} />
                        </span>
                    </div>
                )}

                {/* Hiển ô tìm */}
                {isSearching && (
                    <div className={styles.searchInputWrap}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className={styles.searchInput}
                            autoFocus
                        />
                    </div>
                )}

                {/* Trả về nút tìm */}
                <div>
                    {!isSearching
                        ? (<button className={styles.searchBtn} onClick={() => setIsSearching(true)}>
                            <Search size={40} color='#00456f' strokeWidth={3} />
                        </button>)
                        : (<button className={styles.searchBtn} onClick={() => setIsSearching(false)} >
                            <X size={40} color='#00456f' strokeWidth={3} />
                        </button>
                        )
                    }
                </div>
            </div>

            <div className={styles.divider} />
        </div>
    );
}

export default MenuTop;
