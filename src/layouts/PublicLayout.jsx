import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import Header from "../components/Public/Header/Header";
import MenuTop from "../components/Public/Content/MenuTop/MenuTop";
import CategoryTabs from "../components/Public/Content/CategoryTabs/CategoryTabs";
import ItemContainer from "../components/Public/Content/Item/ItemContainer";
import Footer from "../components/Public/Footer/Footer";
import SideBar from "../components/Public/Header/SideBar/SideBar";
import CartModal from "../components/Public/Modals/Cart/CartModal";
import OptionsModal from "../components/Public/Modals/OptionsModal/OptionsModal";

import styles from './PublicLayout.module.css';

function PublicLayout() {
    const [activeCategoryId, setActiveCategoryId] = useState('0');

    const [selectedItem, setSelectedItem] = useState(null);
    const [showOptionsModal, setShowOptionsModal] = useState(false);

    const [isCollapsed, setIsCollapsed] = useState(false);

    const [showCartModal, setShowCartModal] = useState(false);
    const [cartItems, setCartItems] = useLocalStorage('guestCart', []);

    const [searchTerm, setSearchTerm] = useState('');

    const handleCategoryChange = (categoryId) => {
        setActiveCategoryId(categoryId);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
    };
    return (
        <div className={styles.publicLayout}>
            {/* Header */}
            <header>
                <Header
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            </header>

            {/* Main */}
            <main className={styles.container}>
                {/* Sidebar */}
                {isCollapsed && (
                    <SideBar setIsSidebarOpen={setIsCollapsed} />
                )}

                {/* Cart Modal */}
                {showCartModal && (
                    <CartModal
                        showCartModal={showCartModal}
                        setShowCartModal={setShowCartModal}
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                    />
                )}

                {/* Content */}
                <div className={styles.content}>
                    <MenuTop
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                    />

                    <CategoryTabs
                        onCategoryChange={handleCategoryChange}
                    />

                    <ItemContainer
                        activeCategoryId={activeCategoryId}
                        searchTerm={searchTerm}
                        setSelectedItem={setSelectedItem}
                        setShowOptionsModal={setShowOptionsModal}
                    />

                    {/* Options Modal */}
                    {showOptionsModal && (
                        <OptionsModal
                            showModal={showOptionsModal}
                            setShowModal={setShowOptionsModal}
                            selectedItem={selectedItem}
                            setCartItems={setCartItems}
                        />
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer>
                {!showOptionsModal && cartItems.length > 0 && (
                    <Footer
                        cartCount={cartItems.length}
                        showCartModal={showCartModal}
                        setShowCartModal={setShowCartModal}
                    />
                )}
            </footer>
        </div>
    );
}

export default PublicLayout;
