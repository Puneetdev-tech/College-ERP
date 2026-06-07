import {
  FaHome,
  FaBoxes,
  FaClipboardList,
  FaTruck,
  FaChartBar,
  FaFilePdf,
  FaBell,
  FaUsers,
  FaCog,
  FaShoppingCart
} from "react-icons/fa";

export const menuConfig = {
  Admin: [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Place Order", icon: <FaShoppingCart />, path: "/place-order" },
    { name: "Receive Order", icon: <FaTruck />, path: "/receive-order" },
    { name: "Issue Stock", icon: <FaClipboardList />, path: "/issue-stock" },
    { name: "Inventory", icon: <FaBoxes />, path: "/inventory" },
    { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
    { name: "Reports", icon: <FaFilePdf />, path: "/reports" },
    { name: "Notifications", icon: <FaBell />, path: "/notifications" },
    { name: "Users", icon: <FaUsers />, path: "/users" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
  ],

  StoreManager: [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Receive Order", icon: <FaTruck />, path: "/receive-order" },
    { name: "Issue Stock", icon: <FaClipboardList />, path: "/issue-stock" },
    { name: "Inventory", icon: <FaBoxes />, path: "/inventory" },
    { name: "Reports", icon: <FaFilePdf />, path: "/reports" },
    { name: "Notifications", icon: <FaBell />, path: "/notifications" },
  ],

  PurchaseOfficer: [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Place Order", icon: <FaShoppingCart />, path: "/place-order" },
    { name: "Receive Order", icon: <FaTruck />, path: "/receive-order" },
    { name: "Reports", icon: <FaFilePdf />, path: "/reports" },
    { name: "Notifications", icon: <FaBell />, path: "/notifications" },
  ],

  Principal: [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Analytics", icon: <FaChartBar />, path: "/analytics" },
    { name: "Reports", icon: <FaFilePdf />, path: "/reports" },
  ]
};