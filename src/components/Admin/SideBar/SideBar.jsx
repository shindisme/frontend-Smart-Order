import { useState } from "react";
import styles from "./Sidebar.module.css";
import { NavLink } from "react-router-dom";

function Sidebar() {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.sidebarWrap}>
      <div className={styles.logo}>Smart Order</div>

      <ul className={styles.nav}>
        <li className={styles.navItem}>
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Dashboard
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="menu-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Quản lý menu
            {/* Danh mục, Sản phẩm, nhóm tùy chọn, tùy chonmj */}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="tables-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Quản lý bàn
            {/* Danh mục, Sản phẩm, nhóm tùy chọn, tùy chonmj */}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="orders-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Đơn hàng
            {/* Danh mục, Sản phẩm, nhóm tùy chọn, tùy chonmj */}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="invoices-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Hóa đơn
            {/* Danh mục, Sản phẩm, nhóm tùy chọn, tùy chonmj */}
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="staffs-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Nhân viên
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="reports-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Báo cáo - Thống kê
          </NavLink>
        </li>

        <li className={styles.navItem}>
          <NavLink
            to="reports-manage"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            Khuyến mãi
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
