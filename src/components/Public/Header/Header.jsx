import { Menu } from 'lucide-react';
import styles from "./Header.module.css";
import logo from "../../../assets/logo.png";
import SideBar from './SideBar/SideBar';

function Header({ collapsed, setCollapsed }) {
    return (
        <div className={styles.headerWrap}>
            <div className={styles.header}>
                <div className={styles.logoWrap}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                </div>
                <div className={styles.tableWrap}>
                    <div className={styles.tableName}>Bàn 1</div>
                </div>
                <div className={styles.sidebar} onClick={() => setCollapsed(!collapsed)}>
                    <Menu size={40} strokeWidth={3} color='#0B3C60' style={{
                        filter: "drop-shadow(0px 4px 4px rgba(0,0,0,0.25))"
                    }} />
                </div>


            </div>
        </div >
    );
}

export default Header;
