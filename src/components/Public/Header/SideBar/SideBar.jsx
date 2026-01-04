import { NavLink, useSearchParams } from 'react-router-dom';
import styles from './SideBar.module.css';

function SideBar({ isCollapsed, setIsCollapsed }) {
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table');

    const closeSideBar = () => setIsCollapsed(false);

    return (
        <>
            {isCollapsed && <div className={styles.overlay} onClick={closeSideBar} />}
            <aside className={`${styles.sidebarWrap} ${isCollapsed ? styles.active : ''}`}>
                <ul className={styles.list}>
                    <li className={styles.item}>
                        <NavLink
                            to={tableId ? `/order?table=${tableId}` : '/order'}
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}
                        >
                            Theo dõi đơn
                        </NavLink>
                    </li>
                    <li className={styles.item}>
                        <NavLink
                            to={tableId ? `/info?table=${tableId}` : '/info'}
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}
                        >
                            Thông tin quán
                        </NavLink>
                    </li>
                    <li className={styles.item}>
                        <NavLink
                            to={tableId ? `/support?table=${tableId}` : '/support'}
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}
                        >
                            Hỗ trợ
                        </NavLink>
                    </li>
                </ul>
            </aside>
        </>
    );
}

export default SideBar;
