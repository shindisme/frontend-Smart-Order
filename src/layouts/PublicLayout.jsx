import { useState } from "react";
import Home from "../pages/Public/Home";
import './PublicLayout.module.css';
import Header from "../components/Public/Header/Header";
import MenuTop from "../components/Public/Content/MenuTop/MenuTop";
import CategoryTabs from "../components/Public/Content/CategoryTabs/CategoryTabs";
import Item from "../components/Public/Content/Item/ItemContainer";
import Footer from "../components/Public/Footer/Footer";
import SideBar from "../components/Public/Header/SideBar/SideBar";
import CartModal from "../components/Public/Footer/Cart/CartModal";

import styles from './PublicLayout.module.css';

function PublicLayout() {

    const [activeCategoryTab, setActiveCategoryTab] = useState(0);
    const [collapsed, setCollapsed] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const handleChangeCategoryTab = (categoryId) => {
        setActiveCategoryTab(categoryId);
    };

    return (
        <div className={styles.publicLayout}>
            {/* header */}
            <header>
                <Header collapsed={collapsed} setCollapsed={setCollapsed} />
            </header>

            {/* Main */}
            <main className={styles.container}>
                {/* Sidebar */}
                {collapsed && <SideBar setCollapsed={setCollapsed} />}
                {showCart && <CartModal showCart={showCart} setShowCart={setShowCart} />}

                {/* Contemt */}
                <div className={styles.content} >
                    <MenuTop />
                    <CategoryTabs onChangeCategoryTab={handleChangeCategoryTab} />
                    <Item activeCategoryTab={activeCategoryTab} setCartCount={setCartCount} />
                </div>
            </main>

            <footer>
                <Footer cartCount={cartCount} setShowCart={setShowCart} showCart={showCart} />
            </footer>
        </div>
    );
};
export default PublicLayout;