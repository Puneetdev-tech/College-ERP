import {
  FaTachometerAlt,
  FaBoxes,
  FaShoppingCart,
  FaClipboardList,
  FaChartBar,
  FaBell,
  FaCog,
  FaTruck,
  FaFilePdf
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Inventory", icon: <FaBoxes />, path: "/inventory" },
    { name: "Place Order", icon: <FaShoppingCart />, path: "/place-order" },
    { name: "Issue Stock", icon: <FaClipboardList />, path: "/issue-stock" },
    { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
    { name: "Notifications", icon: <FaBell />, path: "/dashboard" },
    { name: "Settings", icon: <FaCog />, path: "/dashboard" },
    { name: "Receive Order", icon: <FaTruck />, path: "/receive-order" },
    { name: "Reports", icon: <FaFilePdf />, path: "/reports" }
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-800 to-indigo-900 text-white fixed">

      <div className="p-6 border-b border-white/20">
        <h1 className="text-2xl font-bold">
          RJIT STORE
        </h1>
      </div>

      <div className="p-4">
        {menus.map((menu, index) => {
          const isActive = location.pathname === menu.path || 
            (menu.path !== "/dashboard" && location.pathname.startsWith(menu.path));
          return (
            <div
              key={index}
              onClick={() => navigate(menu.path)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 mb-2 ${
                isActive 
                  ? "bg-white/20 font-semibold text-white shadow-inner" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {menu.icon}
              <span>{menu.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}