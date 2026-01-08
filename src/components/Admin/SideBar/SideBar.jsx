import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarContent,
} from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { BiSolidCoupon, BiFoodMenu } from "react-icons/bi";
import { FaConciergeBell, FaTag, FaUser } from "react-icons/fa";
import { MdOutlineTableBar, MdDashboard } from "react-icons/md";
import { TbInvoice, TbShoppingCartCog } from "react-icons/tb";
import { CgOptions } from "react-icons/cg";
import { LuUngroup } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import authService from "../../../services/authService";
import logo from '../../../assets/logo.png';
import './SideBar.css';

function SideBar({ setCollapsed, collapsed }) {
  const sizeIcon = 24;
  const [isMobile, setIsMobile] = useState(false);

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed, setCollapsed]);

  const handleMenuClick = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <>
      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <ProSidebar collapsed={collapsed} breakPoint="md">
        <SidebarHeader>
          <div
            className="sidebar-header"
            onClick={() => !isMobile && setCollapsed(!collapsed)}
          >
            {!collapsed && (
              <>
                <div className="header-content">
                  <img src={logo} className="logoAdmin" alt="Logo" />
                  <span>Smart Order</span>
                </div>
                {isMobile && (
                  <IoMdClose
                    size={28}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCollapsed(true);
                    }}
                  />
                )}
              </>
            )}
            {collapsed && <img src={logo} className="logoAdmin" alt="Logo" />}
          </div>
        </SidebarHeader>

        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem icon={<MdDashboard />} onClick={handleMenuClick}>
              Dashboard
              <NavLink to="" />
            </MenuItem>

            {isAdmin && (
              <SubMenu title="Quản lý menu" icon={<BiFoodMenu size={sizeIcon} />}>
                <MenuItem icon={<FaConciergeBell size={18} />} onClick={handleMenuClick}>
                  Sản phẩm
                  <NavLink to="items-manage" />
                </MenuItem>
                <MenuItem icon={<FaTag size={18} />} onClick={handleMenuClick}>
                  Danh mục
                  <NavLink to="categories-manage" />
                </MenuItem>
                <MenuItem icon={<CgOptions size={18} />} onClick={handleMenuClick}>
                  Lựa chọn
                  <NavLink to="options-manage" />
                </MenuItem>
                <MenuItem icon={<LuUngroup size={18} />} onClick={handleMenuClick}>
                  Nhóm lựa chọn
                  <NavLink to="option-groups-manage" />
                </MenuItem>
              </SubMenu>
            )}

            {!isAdmin && (
              <MenuItem icon={<FaConciergeBell size={sizeIcon} />} onClick={handleMenuClick}>
                Xem sản phẩm
                <NavLink to="items-manage" />
              </MenuItem>
            )}

            <MenuItem icon={<MdOutlineTableBar size={sizeIcon} />} onClick={handleMenuClick}>
              Quản lý bàn
              <NavLink to="tables-manage" />
            </MenuItem>

            {isAdmin && (
              <MenuItem icon={<FaUser size={sizeIcon} />} onClick={handleMenuClick}>
                Quản lý nhân viên
                <NavLink to="staffs-manage" />
              </MenuItem>
            )}

            <MenuItem icon={<TbShoppingCartCog size={sizeIcon} />} onClick={handleMenuClick}>
              Đơn hàng
              <NavLink to="orders-manage" />
            </MenuItem>

            <MenuItem icon={<TbInvoice size={sizeIcon} />} onClick={handleMenuClick}>
              Hóa đơn
              <NavLink to="invoices-manage" />
            </MenuItem>

            {isAdmin && (
              <MenuItem icon={<BiSolidCoupon size={sizeIcon} />} onClick={handleMenuClick}>
                Khuyến mãi
                <NavLink to="coupons-manage" />
              </MenuItem>
            )}
          </Menu>
        </SidebarContent>
      </ProSidebar>
    </>
  );
}

export default SideBar;
