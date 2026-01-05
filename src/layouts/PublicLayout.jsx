import { useEffect, useState } from "react";
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
import { useSearchParams } from "react-router-dom";
import tableService from "../services/tableService";

function PublicLayout() {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

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

    if (!tableId) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 24,
                background: "var(--bg-color)"
            }}>
                <div>
                    <h2 style={{ marginBottom: 16, color: "var(--text-primary-color)" }}>
                        Vui lòng quét mã QR tại bàn
                    </h2>
                    <p style={{ color: "#999" }}>Để đặt món, vui lòng quét mã QR trên bàn</p>
                </div>
            </div>
        );
    }

    useEffect(() => {
        const fetchTable = async () => {
            try {
                const res = await tableService.getById(tableId);

                if (res && res.data && res.data.table_id) {
                    localStorage.setItem("table_id", res.data.table_id);
                } else if (res && res.table_id) {
                    localStorage.setItem("table_id", res.table_id);
                } else {
                    console.error("Không tìm thấy table_id trong response:", res);
                }
            } catch (error) {
                console.error("Bàn không tồn tại:", error);
            }
        };

        if (tableId) {
            fetchTable();
        }
    }, [tableId]);

    return (
        <div className={styles.publicLayout}>
            <header>
                <Header
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            </header>

            <main className={styles.container}>
                {isCollapsed && (
                    <SideBar setIsSidebarOpen={setIsCollapsed} />
                )}

                {showCartModal && (
                    <CartModal
                        showCartModal={showCartModal}
                        setShowCartModal={setShowCartModal}
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                    />
                )}

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
