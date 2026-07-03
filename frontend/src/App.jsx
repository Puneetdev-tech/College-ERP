import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider, useStore } from "./context/StoreContext";

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
import AccessDenied from "./pages/AccessDenied";
import Maintenance from "./pages/Maintenance";
import LegacyInventory from "./pages/LegacyInventory";
import LegacySanitaryInventory from "./pages/LegacySanitaryInventory";
import LegacyElectricalInventory from "./pages/LegacyElectricalInventory";

function ProtectedRoute({ children, requiredPermission }) {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermission && !currentUser.permissions?.includes(requiredPermission)) {
    return <AccessDenied />;
  }

  return children;
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute requiredPermission="Dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute requiredPermission="Inventory"><Inventory /></ProtectedRoute>} />
          <Route path="/inventory/:department" element={<ProtectedRoute requiredPermission="Inventory"><DepartmentInventory /></ProtectedRoute>} />
          <Route path="/inventory/items" element={<ProtectedRoute requiredPermission="Inventory"><InventoryTable /></ProtectedRoute>} />
          <Route path="/inventory/legacy" element={<ProtectedRoute requiredPermission="Inventory"><LegacyInventory /></ProtectedRoute>} />
          <Route path="/inventory/legacy-sanitary" element={<ProtectedRoute requiredPermission="Inventory"><LegacySanitaryInventory /></ProtectedRoute>} />
          <Route path="/inventory/legacy-electrical" element={<ProtectedRoute requiredPermission="Inventory"><LegacyElectricalInventory /></ProtectedRoute>} />
          <Route path="/place-order" element={<ProtectedRoute requiredPermission="Place Order"><PlaceOrder /></ProtectedRoute>} />
          <Route path="/receive-order" element={<ProtectedRoute requiredPermission="Receive Order"><ReceiveOrder /></ProtectedRoute>} />
          <Route path="/issue-stock" element={<ProtectedRoute requiredPermission="Issue Stock"><IssueStock /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requiredPermission="Analytics"><Analytics /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute requiredPermission="Reports"><Reports /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute requiredPermission="Notifications"><Notifications /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute requiredPermission="Users"><UserManagement /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredPermission="Settings"><Settings /></ProtectedRoute>} />
          <Route path="/maintenance" element={<ProtectedRoute requiredPermission="Maintenance"><Maintenance /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;