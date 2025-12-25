import { NavLink } from 'react-router-dom';
import styles from './SideBar.module.css'

function SideBar(setCollapsed) {
    const closeSideBar = () => setCollapsed(false)

    return (
        <>
            <div className={styles.overlay} />
            <aside className={styles.sidebarWrap}>
                <ul className={styles.list}>
                    <li className={styles.item}>

                        <NavLink to='/'
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}>
                            Menu
                        </NavLink>
                    </li>
                    {/* <li className={styles.item}>
                        <NavLink
                            to='foods'
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}>
                            Đồ ăn
                        </NavLink>
                    </li> */}
                    <li className={styles.item}>
                        <NavLink
                            to='order'
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}>
                            Đơn
                        </NavLink>
                    </li>
                    <li className={styles.item}>
                        <NavLink
                            to='info'
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}>
                            Thông tin quán
                        </NavLink>
                    </li>
                    <li className={styles.item}>
                        <NavLink
                            to='support'
                            className={({ isActive }) => isActive ? "tab active" : "tab"}
                            onClick={closeSideBar}>
                            Hỗ trợ
                        </NavLink>
                    </li>
                </ul>

            </aside >
        </>
    );
};

export default SideBar;