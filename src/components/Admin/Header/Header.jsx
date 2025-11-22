import React from "react";
import styles from "./Header.module.css";

function Header() {
  return (
    <div className={styles.headerWrap}>
      <div className={styles.left}>

      </div>
      <div className={styles.right}>
        <span>Xin chào, Admin</span>
        <div className={styles.avatar}></div>
      </div>
    </div>
  );
}

export default Header;
