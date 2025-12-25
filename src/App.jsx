import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import Dashboard from "./pages/Admin/Dashboard";
import ItemManage from "./pages/Admin/ItemManage";
import CategoryManage from "./pages/Admin/CategoryManage";
import OptionManage from "./pages/Admin/OptionManage";
import OptionGroupManage from "./pages/Admin/OptionGroupManage";
import StaffManage from "./pages/Admin/StaffManage";

import OrderConfirm from "./pages/Public/OrderConfirm";
import PaymentMethod from "./pages/Public/PaymentMethod";
import OrderStatus from "./pages/Public/OrderStatus";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public*/}
        <Route path="/" element={<PublicLayout />}>
        </Route>
        <Route path="/order-confirm" element={<OrderConfirm />} />
        <Route path="/payment-method" element={<PaymentMethod />} />
        <Route path="/order-status" element={<OrderStatus />} />
        {/* admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="items-manage" element={<ItemManage />} />
          <Route path="categories-manage" element={<CategoryManage />} />
          <Route path="options-manage" element={<OptionManage />} />
          <Route path="option-groups-manage" element={<OptionGroupManage />} />

          <Route path="tables-manage" element={<Dashboard />} />
          <Route path="staffs-manage" element={<StaffManage />} />

          <Route path="orders-manage" element={<Dashboard />} />
          <Route path="invoices-manage" element={<Dashboard />} />
          <Route path="coupons-manage" element={<Dashboard />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
