import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Inventory from "./pages/Inventory";
import DepartmentInventory from "./pages/DepartmentInventory";
import InventoryTable from "./pages/InventoryTable";
import PlaceOrder from "./pages/PlaceOrder";
import ReceiveOrder from "./pages/ReceiveOrder";
import IssueStock from "./pages/IssueStock";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";


function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/:department" element={<DepartmentInventory />} />
          <Route path="/inventory/items" element={<InventoryTable />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/receive-order" element={<ReceiveOrder />} />
          <Route path="/issue-stock" element={<IssueStock />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;