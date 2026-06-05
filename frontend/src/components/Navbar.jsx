import { useState } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaSun,
  FaMoon,
  FaDesktop,
  FaChevronRight
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { 
    currentUser, 
    inventory, 
    orders, 
    issuedStock, 
    systemSettings, 
    updateSystemSettings,
    notifications
  } = useStore();

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Define authorized pages
  const allPages = [
    { name: "Dashboard", path: "/dashboard", permission: "Dashboard" },
    { name: "Place Order", path: "/place-order", permission: "Place Order" },
    { name: "Receive Order", path: "/receive-order", permission: "Receive Order" },
    { name: "Issue Stock", path: "/issue-stock", permission: "Issue Stock" },
    { name: "Inventory", path: "/inventory", permission: "Inventory" },
    { name: "Analytics", path: "/analytics", permission: "Analytics" },
    { name: "Reports", path: "/reports", permission: "Reports" },
    { name: "Notifications", path: "/notifications", permission: "Notifications" },
    { name: "Users", path: "/users", permission: "Users" },
    { name: "Settings", path: "/settings", permission: "Settings" }
  ];

  const authorizedPages = allPages.filter(
    (p) => currentUser?.permissions?.includes(p.permission)
  );

  // Perform search matches
  const hasQuery = query.trim().length > 0;
  
  const pageMatches = hasQuery
    ? authorizedPages.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const inventoryMatches = hasQuery
    ? inventory
        .filter(
          (item) =>
            item.item.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase()) ||
            item.subcategory.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const orderMatches = hasQuery
    ? orders
        .filter(
          (o) =>
            o.id.toLowerCase().includes(query.toLowerCase()) ||
            o.supplier.toLowerCase().includes(query.toLowerCase()) ||
            o.item.toLowerCase().includes(query.toLowerCase()) ||
            o.status.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const issueMatches = hasQuery
    ? issuedStock
        .filter(
          (log) =>
            `#is-${String(log.id).padStart(3, "0")}`.includes(query.toLowerCase()) ||
            log.item.toLowerCase().includes(query.toLowerCase()) ||
            log.department.toLowerCase().includes(query.toLowerCase()) ||
            log.faculty.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const hasResults =
    pageMatches.length > 0 ||
    inventoryMatches.length > 0 ||
    orderMatches.length > 0 ||
    issueMatches.length > 0;

  // Theme cycler: light -> dark
  const cycleTheme = () => {
    const currentTheme = systemSettings?.theme || "light";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    
    updateSystemSettings({
      ...systemSettings,
      theme: nextTheme
    });
  };

  const renderThemeIcon = () => {
    const currentTheme = systemSettings?.theme || "light";
    if (currentTheme === "light") return <FaSun className="text-amber-500 text-lg" />;
    return <FaMoon className="text-cyan-400 text-lg" />;
  };

  const getThemeTitle = () => {
    const currentTheme = systemSettings?.theme || "light";
    return `Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`;
  };

  const handleResultClick = (action) => {
    action();
    setQuery("");
    setIsFocused(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex justify-between items-center z-30 relative">
      
      {/* Universal Search Container */}
      <div className="relative w-96">
        <FaSearch className="absolute left-4 top-4 text-slate-400 z-10" />
        <input
          type="text"
          placeholder="Search items, orders, or pages..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/40 outline-none w-full border border-transparent focus:border-indigo-500/20 transition-all font-medium placeholder-slate-400 text-slate-700 dark:text-slate-200"
        />

        {/* Floating Glassmorphic Dropdown */}
        {isFocused && hasQuery && (
          <div className="absolute top-14 left-0 w-[420px] bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-2xl rounded-2xl p-4 overflow-y-auto max-h-[420px] z-50 animate-fadeIn">
            {!hasResults ? (
              <div className="p-6 text-center text-sm text-slate-400 font-semibold">
                No matching results found
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* 1. Page Matches */}
                {pageMatches.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider mb-1 px-1">Pages</h4>
                    <div className="space-y-1">
                      {pageMatches.map((p, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleResultClick(() => navigate(p.path));
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <span>{p.name}</span>
                          <FaChevronRight className="text-[10px] text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Inventory Items */}
                {inventoryMatches.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-1 px-1">Inventory Items</h4>
                    <div className="space-y-1">
                      {inventoryMatches.map((item, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleResultClick(() => navigate(`/inventory/items?category=${encodeURIComponent(item.category)}`));
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition flex flex-col gap-0.5"
                        >
                          <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-100">
                            <span>{item.item}</span>
                            <span className="text-xs text-slate-400 font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              Stock: {item.stock}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-450 dark:text-slate-400">
                            {item.category} &gt; {item.subcategory} ({item.type})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Orders */}
                {orderMatches.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-1 px-1">Purchase Orders</h4>
                    <div className="space-y-1">
                      {orderMatches.map((o, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleResultClick(() => {
                              if (currentUser?.permissions?.includes("Receive Order")) {
                                navigate(`/receive-order?search=${encodeURIComponent(o.id)}`);
                              } else {
                                navigate(`/place-order?search=${encodeURIComponent(o.id)}`);
                              }
                            });
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition flex flex-col gap-0.5"
                        >
                          <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-100">
                            <span>{o.id} - {o.item}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                              o.status === "Pending" ? "bg-yellow-500" : o.status === "Approved" ? "bg-amber-500" : "bg-green-500"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-450 dark:text-slate-400">
                            Supplier: {o.supplier} | Qty: {o.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Issued Logs */}
                {issueMatches.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-rose-500 tracking-wider mb-1 px-1">Issued Stock Logs</h4>
                    <div className="space-y-1">
                      {issueMatches.map((log, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleResultClick(() => navigate(`/issue-stock?search=${encodeURIComponent(log.id)}`));
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition flex flex-col gap-0.5"
                        >
                          <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-100">
                            <span>#IS-{String(log.id).padStart(3, "0")} - {log.item}</span>
                            <span className="text-xs text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                              Qty: {log.quantity}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-450 dark:text-slate-400">
                            Dept: {log.department} | Faculty: {log.faculty}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">

        <div
          className="relative cursor-pointer text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-cyan-400 transition-colors duration-200 p-1.5"
          onClick={() => navigate("/notifications")}
          title="Notifications"
        >
          <FaBell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/settings")}>

          {currentUser?.photo ? (
            <img src={currentUser.photo} alt="Avatar" className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm" />
          ) : (
            <FaUserCircle size={32} className="text-slate-400 dark:text-slate-500" />
          )}

          <div className="hidden sm:block text-left">
            <p className="font-bold text-sm text-slate-850 dark:text-white leading-tight">
              {currentUser?.name || "Guest User"}
            </p>

            <p className="text-[10px] font-bold text-blue-600 dark:text-cyan-300 uppercase mt-0.5 tracking-wide">
              {currentUser?.role || "Visitor"}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}