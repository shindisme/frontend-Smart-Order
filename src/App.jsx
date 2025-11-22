import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import Dashboard from "./pages/Admin/Dashboard";
import OrderConfirm from "./pages/Public/OrderConfirm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public*/}
        <Route path="/" element={<PublicLayout />}>
        </Route>
        <Route path="/order-confirm" element={<OrderConfirm />} />

        {/* admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="menu-manage" element={<Dashboard />} >
          </Route>

          <Route path="tables-manage" element={<Dashboard />} />
          <Route path="orders-manage" element={<Dashboard />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
