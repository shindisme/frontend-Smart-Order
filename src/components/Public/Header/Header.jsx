import styles from "./Header.module.css";
import logo from "../../../assets/logo.png";
import { FaBars } from "react-icons/fa";

function Header({ isCollapsed, setIsCollapsed }) {
    return (
        <div className={styles.headerWrap}>
            <div className={styles.header}>
                <div className={styles.logoWrap}>
                    <img src={logo} alt="Logo" className={styles.logo} />
                </div>

                <div
                    className={styles.sidebar}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <FaBars size={40} color="#0B3C60" />
                </div>
            </div>
        </div>
    );
}
export default Header;
