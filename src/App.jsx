import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ItemManage from "./pages/Admin/ItemManage";
import CategoryManage from "./pages/Admin/CategoryManage";
import OptionManage from "./pages/Admin/OptionManage";
import OptionGroupManage from "./pages/Admin/OptionGroupManage";
import StaffManage from "./pages/Admin/StaffManage";
import TableManage from "./pages/Admin/TableManage";

import OrderConfirm from "./pages/Public/OrderConfirm";
import Payment from "./pages/Public/Payment";
import OrderStatus from "./pages/Public/OrderStatus";
import OrderTracking from "./pages/Public/OrderTracking";
import Login from "./pages/Admin/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Bounce, ToastContainer } from 'react-toastify';
import Profile from "./pages/Admin/Profile";
import OrderManage from "./pages/Admin/OrderManage";
import CouponManage from "./pages/Admin/CouponManage";
import InvoiceManage from "./pages/Admin/InvoiceManage";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* public*/}
        <Route path="/" element={<PublicLayout />} />
        <Route path="/order-confirm" element={<OrderConfirm />} />
        <Route path="/payment-method" element={<Payment />} />
        <Route path="/order-status" element={<OrderStatus />} />
        <Route path="/order" element={<OrderTracking />} />

        {/* admin */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />

            <Route path="items-manage" element={<ItemManage />} />
            <Route path="categories-manage" element={<CategoryManage />} />
            <Route path="options-manage" element={<OptionManage />} />
            <Route path="option-groups-manage" element={<OptionGroupManage />} />
            <Route path="tables-manage" element={<TableManage />} />
            <Route path="staffs-manage" element={<StaffManage />} />
            <Route path="orders-manage" element={<OrderManage />} />
            <Route path="invoices-manage" element={<InvoiceManage />} />
            <Route path="coupons-manage" element={<CouponManage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter >
  );
}

export default App;
