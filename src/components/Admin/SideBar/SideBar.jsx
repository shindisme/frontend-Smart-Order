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

import logo from '../../../assets/logo.png';

import './SideBar.css'

function SideBar({ setCollapsed, collapsed }) {
  const sizeIcon = 24;

  return (
    <>
      <ProSidebar
        collapsed={collapsed}
        style={{
          height: "100vh",
        }}
      >
        <SidebarHeader>
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: "14px 10px",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              textAlign: "center",
              letterSpacing: '1px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            <img src={logo} className="logoAdmin" />
            Smart Order
          </div>
        </SidebarHeader>

        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem icon={<MdDashboard />}>
              Dashboard
              <NavLink to="" />
            </MenuItem>

            <SubMenu title="Quản lý menu" icon={<BiFoodMenu size={sizeIcon} />}>
              <MenuItem icon={<FaConciergeBell size={18} />}>
                Sản phẩm
                <NavLink to="items-manage" />
              </MenuItem>
              <MenuItem icon={<FaTag size={18} />}>
                Danh mục
                <NavLink to="categories-manage" />
              </MenuItem>
              <MenuItem icon={<CgOptions size={18} />}>
                Lựa chon
                <NavLink to="options-manage" />
              </MenuItem>
              <MenuItem icon={<LuUngroup size={18} />}>
                Nhóm lựa chọn
                <NavLink to="option-groups-manage" />
              </MenuItem>
            </SubMenu>

            <MenuItem icon={<MdOutlineTableBar size={sizeIcon} />}>
              Quản lý bàn
              <NavLink to="tables-manage" />
            </MenuItem>

            <MenuItem icon={<FaUser size={sizeIcon} />}>
              Quản lý nhân viên
              <NavLink to="staffs-manage" />
            </MenuItem>

            <MenuItem icon={<TbShoppingCartCog size={sizeIcon} />}>
              Đơn hàng
              <NavLink to="orders-manage" />
            </MenuItem>

            <MenuItem icon={<TbInvoice size={sizeIcon} />}>
              Hóa đơn
              <NavLink to="invoices-manage" />
            </MenuItem>

            <MenuItem icon={<BiSolidCoupon size={sizeIcon} />}>
              Khuyến mãi
              <NavLink to="coupons-manage" />
            </MenuItem>
          </Menu>
        </SidebarContent>
      </ProSidebar>
    </>
  );
}

export default SideBar;
