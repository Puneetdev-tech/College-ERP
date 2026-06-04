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
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;