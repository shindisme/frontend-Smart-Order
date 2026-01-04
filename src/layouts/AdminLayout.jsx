import { useState } from "react";
import styles from "./AdminLayout.module.css";
import Sidebar from "../components/Admin/SideBar/SideBar";
import Header from "../components/Admin/Header/Header";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`${styles.adminLayout} ${collapsed ? styles.collapsed : ""}`}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </aside>

      {/* Header */}
      <div className={styles.main}>
        <header className={styles.header}>
          <Header />
        </header>

        {/*  Content */}
        <main className={styles.content}>
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;
