import { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaBoxes,
  FaShoppingCart,
  FaClipboardList,
  FaChartBar,
  FaBell,
  FaCog,
  FaTruck,
  FaFilePdf,
  FaUsers,
  FaSignOutAlt
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { menuConfig } from "../data/menuConfig";
import { useStore } from "../context/StoreContext";
import { playUISound } from "./useSpeech";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useStore();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("rjit_sidebarCollapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("rjit_sidebarCollapsed", isCollapsed);
    if (isCollapsed) {
      document.body.classList.add("sidebar-collapsed");
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  }, [isCollapsed]);

  const isActive = (menu) =>
    location.pathname === menu.path ||
    (menu.path !== "/dashboard" && location.pathname.startsWith(menu.path));

  // If currentUser permissions exist, filter from the Admin's full menu config. Otherwise fallback.
  const allMenus = menuConfig.Admin;
  const menus = currentUser?.permissions
    ? allMenus.filter((m) => currentUser.permissions.includes(m.name))
    : (menuConfig[currentUser?.role?.replace(/\s+/g, "") || "Admin"] || []);

  const handleLogout = () => {
    playUISound("modal-close");
    logout();
    navigate("/");
  };

  return (
    <div className={`sidebar-container ${isCollapsed ? "w-20" : "w-64"} h-screen fixed flex flex-col justify-between overflow-hidden z-40 transition-all duration-300`}>
      <div>
        <div className={`border-b border-slate-200/50 dark:border-white/10 flex items-center transition-all duration-300 ${
          isCollapsed ? "p-4 flex-col justify-center gap-2" : "p-6 justify-between"
        }`}>
          <h1 className={`font-bold tracking-wide sidebar-title transition-all duration-300 ${
            isCollapsed ? "text-lg text-blue-600 dark:text-cyan-400" : "text-2xl"
          }`}>
            {isCollapsed ? "RJIT" : "RJIT STORE"}
          </h1>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors cursor-pointer text-xl p-1 rounded hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            ☰
          </button>
        </div>
 
        <div className={`overflow-y-auto overflow-x-hidden pr-1 sidebar-scrollbar ${
          isCollapsed ? "p-2 max-h-[calc(100vh-190px)]" : "p-4 max-h-[calc(100vh-220px)]"
        }`}>
          {menus.map((menu, index) => (
            <div
              key={index}
              onClick={() => { playUISound("nav"); navigate(menu.path); }}
              className={`sidebar-item flex items-center gap-3 rounded-xl cursor-pointer mb-1.5 ${
                isActive(menu) ? "active" : ""
              } ${isCollapsed ? "justify-center p-2.5" : "py-2 px-3.5"}`}
              title={isCollapsed ? menu.name : undefined}
            >
              <span className="text-lg flex-shrink-0">{menu.icon}</span>
              <span className={`transition-all duration-350 ease-in-out whitespace-nowrap overflow-hidden ${
                isCollapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"
              }`}>
                {menu.name}
              </span>
            </div>
          ))}
        </div>
      </div>
 
      <div className={`border-t border-slate-200/50 dark:border-white/10 mb-4 space-y-3 transition-all duration-300 ${
        isCollapsed ? "p-2" : "p-4"
      }`}>
        <div 
          className={`bg-slate-100/60 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 transition-all duration-300 ${
            isCollapsed ? "p-2 flex justify-center cursor-help" : "px-3 py-2"
          }`} 
          title={isCollapsed ? `${currentUser?.name || "Guest"} (${currentUser?.role || "Visitor"})` : undefined}
          onClick={() => navigate("/settings")}
        >
          {isCollapsed ? (
            currentUser?.photo ? (
              <img src={currentUser.photo} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/20 shadow-md" alt="Avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "G"}
              </div>
            )
          ) : (
            <div className="flex items-center gap-3">
              {currentUser?.photo ? (
                <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/20 flex-shrink-0" alt="Avatar" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-cyan-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "G"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider">Logged In As</p>
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-white mt-0.5">{currentUser?.name || "Guest"}</p>
                <p className="text-xs text-blue-600 dark:text-cyan-300 truncate font-medium">{currentUser?.role || "Visitor"}</p>
              </div>
            </div>
          )}
        </div>
 
        <div
          onClick={handleLogout}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 text-rose-600 dark:text-rose-350 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 dark:hover:text-rose-200 font-semibold ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <FaSignOutAlt className="text-lg flex-shrink-0" />
          <span className={`transition-all duration-350 ease-in-out whitespace-nowrap overflow-hidden ${
            isCollapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"
          }`}>
            Logout
          </span>
        </div>
      </div>
    </div>
  );
}