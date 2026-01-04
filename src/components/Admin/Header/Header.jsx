import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdPerson, MdLogout, MdKeyboardArrowDown } from "react-icons/md";
import authService from "../../../services/authService";
import styles from "./Header.module.css";

function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const user = authService.getCurrentUser();

  const userName = user?.fullname || user?.username || 'User';
  const userRole = user?.role === 'admin' ? 'Admin' : 'Nhân viên';

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      console.log('Logout error:', error);
      navigate("/login");
    }
  };

  const handleProfile = () => {
    navigate("/admin/profile");
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.headerWrap}>
      <div className={styles.left}>
        <h1 className={styles.title}>Dashboard</h1>
        <span className={styles.badge}>{userRole}</span>
      </div>

      <div className={styles.right}>
        <div
          className={styles.userMenu}
          ref={dropdownRef}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className={styles.userName}>Xin chào, {userName}</span>
          <MdKeyboardArrowDown
            className={`${styles.dropdownIcon} ${showDropdown ? styles.rotate : ''}`}
            size={20}
            fill="black"
          />

          {showDropdown && (
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownItem}
                onClick={handleProfile}
              >
                <MdPerson size={18} />
                <span>Hồ sơ</span>
              </button>

              <div className={styles.divider}></div>

              <button
                className={`${styles.dropdownItem} ${styles.logout}`}
                onClick={handleLogout}
              >
                <MdLogout size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
