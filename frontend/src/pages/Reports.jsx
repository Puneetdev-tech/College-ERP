import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FaFileExcel,
  FaBuilding,
  FaBoxes,
  FaCalendarAlt,
  FaChartBar,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
  FaPrint,
  FaFilePdf
} from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

// Department to Category mapping for purchase orders filtering
const DEPT_CATEGORIES = {
  Stationary: ["Stationery"],
  Hostel: ["Furniture", "Electronics"],
  Sports: ["Sports"],
  Laboratory: ["Equipment", "Stationery"],
  "IT Department": ["Electronics"],
  Library: ["Furniture", "Electronics"],
  Office: ["Furniture", "Electronics"],
  Medical: ["Equipment"]
};

export default function Reports() {
  const navigate = useNavigate();
  const { inventory, issuedStock, orders, systemSettings } = useStore();
  const collegeInfo = systemSettings?.collegeInfo;

  // Active Report Category: 'department', 'category', 'monthly', or null
  const [activeReportType, setActiveReportType] = useState(null);

  // Configuration options
  const [selectedDepartment, setSelectedDepartment] = useState("IT Department");
  const [selectedCategory, setSelectedCategory] = useState("Electronics");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");

  // Dual report type checkboxes
  const [includeIssued, setIncludeIssued] = useState(true);
  const [includeOrdered, setIncludeOrdered] = useState(true);

  // Interaction feed alerts
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerDownload = (reportName, isBulk = false) => {
    if (!includeIssued && !includeOrdered) {
      setToastMessage("⚠ Please select at least one report type (Issued or Ordered).");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    setLoading(true);
    let typeDesc = "";
    if (includeIssued && includeOrdered) typeDesc = "combined (Issued & Ordered)";
    else if (includeIssued) typeDesc = "Stock Issued";
    else typeDesc = "Items Ordered";

    setToastMessage(`Compiling ${isBulk ? "bulk" : "individual"} ${typeDesc} report for ${reportName}...`);

    setTimeout(() => {
      setLoading(false);
      setToastMessage(`✓ ${isBulk ? "Bulk" : "Selected"} ${typeDesc} report for "${reportName}" downloaded successfully!`);
      setTimeout(() => setToastMessage(""), 4000);
    }, 1500);
  };

  // Unique categories in inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Helper date matching function
  const isWithinRange = (dateStr) => {
    if (!dateStr) return false;
    const cleanDate = dateStr.split(" ")[0]; // Extract YYYY-MM-DD
    return cleanDate >= startDate && cleanDate <= endDate;
  };

  // 1. FILTER ISSUED STOCK LOGS
  const filteredIssued = issuedStock.filter((log) => {
    if (!isWithinRange(log.date)) return false;
    if (activeReportType === "department" && log.department !== selectedDepartment) return false;
    if (activeReportType === "category" && (log.category || "").toLowerCase() !== (selectedCategory || "").toLowerCase()) return false;
    return true;
  });

  // 2. FILTER PURCHASE ORDERS
  const filteredOrders = orders.filter((order) => {
    if (!isWithinRange(order.orderDate)) return false;
    if (activeReportType === "category" && (order.category || "").toLowerCase() !== (selectedCategory || "").toLowerCase()) return false;
    if (activeReportType === "department") {
      const allowedCategories = DEPT_CATEGORIES[selectedDepartment] || [];
      if (!allowedCategories.some((cat) => (cat || "").toLowerCase() === (order.category || "").toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  const reportCards = [
    {
      type: "department",
      title: "Department Report",
      description: "Disbursements and orders sorted by college divisions.",
      icon: <FaBuilding size={28} />,
      colorClass: "from-blue-600 to-indigo-700 shadow-blue-500/10 hover:shadow-blue-500/25"
    },
    {
      type: "category",
      title: "Category Report",
      description: "Drill down of logs based on asset classifications.",
      icon: <FaBoxes size={28} />,
      colorClass: "from-purple-600 to-pink-700 shadow-purple-500/10 hover:shadow-purple-500/25"
    },
    {
      type: "monthly",
      title: "Monthly Audit Report",
      description: "General monthly transaction log ledger of issues and orders.",
      icon: <FaCalendarAlt size={28} />,
      colorClass: "from-amber-500 to-orange-700 shadow-amber-500/10 hover:shadow-amber-500/25"
    },
    {
      type: "analytics",
      title: "Usage Analytics",
      description: "Go to visual double-bar and active-pie analytics charts.",
      icon: <FaChartBar size={28} />,
      colorClass: "from-emerald-500 to-teal-700 shadow-emerald-500/10 hover:shadow-emerald-500/25",
      isLink: true
    }
  ];

  const departmentsList = [
    "Stationary",
    "Hostel",
    "Sports",
    "Laboratory",
    "IT Department",
    "Library",
    "Office",
    "Medical"
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* Title Section */}
        <div className="mt-8 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Reports Center
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Generate, preview, and print official institutional spreadsheets and transaction ledgers.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border ${
            loading ? "bg-indigo-600 text-white border-indigo-500 animate-pulse animate-bounce" : "bg-emerald-600 text-white border-emerald-500"
          }`}>
            {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaCheckCircle className="text-lg text-emerald-300" />}
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Re-designed 3D Card selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportCards.map((card, index) => {
            const isSelected = activeReportType === card.type;
            return (
              <div
                key={index}
                onClick={() => {
                  if (card.isLink) {
                    navigate("/analytics");
                  } else {
                    setActiveReportType(card.type === activeReportType ? null : card.type);
                  }
                }}
                className={`card-3d relative rounded-3xl p-6 cursor-pointer border overflow-hidden transition-all duration-300 transform ${
                  isSelected
                    ? `bg-gradient-to-br ${card.colorClass} text-white border-transparent scale-[1.03] rotate-1 shadow-2xl`
                    : "bg-white text-slate-800 border-slate-100 dark:border-slate-800 dark:bg-slate-900 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-50 dark:bg-slate-800/80 text-indigo-600 dark:text-cyan-400"
                }`}>
                  {card.icon}
                </div>

                <h3 className="font-black text-lg mb-1">{card.title}</h3>
                <p className={`text-xs leading-relaxed ${isSelected ? "text-white/80" : "text-slate-400 dark:text-slate-400"}`}>
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conditional Configuration Panel */}
        {activeReportType ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 transition-all duration-500 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b pb-5 mb-6 border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-850 dark:text-white capitalize">
                  {activeReportType} Configuration
                </h2>
                <p className="text-slate-400 text-xs mt-1">Select dates and toggle categories to compile preview documents.</p>
              </div>
              
              <button 
                onClick={() => setActiveReportType(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold px-3.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel Selection
              </button>
            </div>

            {/* Inputs & Parameters Panel */}
            <div className="space-y-6 mb-8">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                {/* Dynamic Parameter Dropdown */}
                {activeReportType === "department" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Target Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeReportType === "category" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Asset Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Filters */}
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Checkboxes & Action Row */}
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-6 items-center">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Include:</span>
                  
                  <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-slate-300 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeIssued}
                      onChange={(e) => setIncludeIssued(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Disbursed Logs</span>
                  </label>

                  <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-slate-300 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeOrdered}
                      onChange={(e) => setIncludeOrdered(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Purchase Shipments</span>
                  </label>
                </div>

                {/* Print and Export Buttons */}
                <div className="flex flex-wrap gap-3 no-print">
                  <button
                    disabled={loading}
                    onClick={() => triggerDownload(
                      activeReportType === "department" ? selectedDepartment : activeReportType === "category" ? selectedCategory : `${startDate} to ${endDate}`
                    )}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 transition disabled:opacity-50 text-xs"
                  >
                    <FaFileExcel className="text-sm" />
                    <span>Export Excel</span>
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition disabled:opacity-50 text-xs"
                  >
                    <FaPrint className="text-sm" />
                    <span>Print Report</span>
                  </button>

                  {(activeReportType === "department" || activeReportType === "category") && (
                    <button
                      disabled={loading}
                      onClick={() => triggerDownload(
                        activeReportType === "department" ? "All Departments" : "All Categories",
                        true
                      )}
                      className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95 transition disabled:opacity-50 text-xs"
                    >
                      <FaDownload className="text-sm" />
                      <span>Download Bulk</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Premium printed-sheet mockup preview container */}
            <div className="space-y-6 mt-8 border-t pt-6 border-slate-150 dark:border-slate-800 live-report-container">
              
              <div className="flex items-center justify-between mb-2 no-print">
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Live Preview Document Sheet
                </h3>
                <span className="text-slate-400 text-xs font-bold bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-200/40 dark:border-slate-800">
                  <FaInfoCircle />
                  <span>Audit Dates: {startDate} to {endDate}</span>
                </span>
              </div>

              {/* Institution Banners Mockup */}
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-4 shadow-inner">
                <div className="flex items-center gap-5">
                  {collegeInfo?.logo ? (
                    <img src={collegeInfo.logo} alt="College Logo" className="w-16 h-16 rounded-2xl object-contain bg-white border border-slate-200 p-1.5 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                      {collegeInfo?.name ? collegeInfo.name[0] : "C"}
                    </div>
                  )}
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{collegeInfo?.name || "RJ Institute of Technology"}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">{collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <span>Phone: {collegeInfo?.phone || "+91 11 2690 7400"}</span>
                      <span>Email: {collegeInfo?.email || "info@rjit.edu.in"}</span>
                      <span>Web: {collegeInfo?.website || "www.rjit.edu.in"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-900/50 shadow-sm">
                    Official Audit Sheet
                  </span>
                </div>
              </div>

              {/* 1. DISBURSED LOGS PREVIEW */}
              {includeIssued && (
                <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Stock Disbursement Ledger ({filteredIssued.length} transaction logs)</span>
                    </h4>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">Item Details</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">Category</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Department</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Faculty</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Qty</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Issue Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {filteredIssued.length > 0 ? (
                          filteredIssued.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-3.5 text-sm font-semibold text-slate-700 dark:text-slate-350">
                                {log.item} <span className="text-xs text-slate-400 font-normal">({log.type})</span>
                              </td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{log.category}</td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{log.department}</td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{log.faculty}</td>
                              <td className="p-3.5 text-sm font-black text-slate-800 dark:text-white">{log.quantity}</td>
                              <td className="p-3.5 text-xs text-slate-500">{log.date}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-sm text-slate-400 font-medium bg-white dark:bg-slate-950">
                              No disbursed assets found in this configuration range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. ORDER SHIPMENTS PREVIEW */}
              {includeOrdered && (
                <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Purchase Order Shipments Registry ({filteredOrders.length} records)</span>
                    </h4>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Item Details</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Supplier</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Category</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Qty</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Per Unit</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Total Cost</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Order Date</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-3.5 text-sm font-semibold text-slate-700 dark:text-slate-350">
                                {order.item} <span className="text-xs text-slate-400 font-normal">({order.type})</span>
                              </td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{order.supplier}</td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{order.category}</td>
                              <td className="p-3.5 text-sm font-black text-slate-800 dark:text-white">{order.quantity}</td>
                              <td className="p-3.5 text-sm font-semibold text-slate-700 dark:text-slate-350">₹{order.pricePerUnit?.toLocaleString()}</td>
                              <td className="p-3.5 text-sm font-black text-slate-850 dark:text-white">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                              <td className="p-3.5 text-xs text-slate-500">{order.orderDate}</td>
                              <td className="p-3.5 text-sm">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  order.status === "Pending" 
                                    ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400" 
                                    : order.status === "Approved"
                                    ? "bg-amber-550/20 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450"
                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="p-8 text-center text-sm text-slate-400 font-medium bg-white dark:bg-slate-950">
                              No purchase shipments found in this configuration range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Official Seal / Sign-off block at bottom */}
              <div className="pt-10 flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-800 mt-8">
                <div className="text-slate-400 font-bold uppercase tracking-wider">
                  Generated by: {systemSettings?.collegeInfo?.name || "RJIT STORE SYSTEM"}
                </div>
                <div className="text-center border-t border-slate-300 dark:border-slate-800 pt-2 w-48 text-slate-650 dark:text-slate-300 font-semibold">
                  Authorized Signature
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Empty Selector Guide */
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FaFilePdf className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">Select a Report Configuration</h2>
            <p className="text-slate-450 text-sm max-w-md mx-auto">
              Please click one of the interactive card grids above (Department, Category, or Monthly Audit) to configure filters and view live mockups.
            </p>
          </div>
        )}

      </div>

      {activeReportType && createPortal(
        <div className="hidden print-report-layout p-8 bg-white text-black font-sans min-h-screen">
          {/* Header Banners */}
          <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6">
            {collegeInfo?.logo ? (
              <img src={collegeInfo.logo} alt="College Logo" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 border border-slate-300 flex items-center justify-center font-black text-2xl bg-blue-900 text-white rounded">
                {collegeInfo?.name ? collegeInfo.name[0] : "C"}
              </div>
            )}
            <div className="text-right">
              <h1 className="text-2xl font-bold">{collegeInfo?.name || "RJ Institute of Technology"}</h1>
              <p className="text-xs text-slate-500">{collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
              <p className="text-xs text-slate-500">Phone: {collegeInfo?.phone || "+91 11 2690 7400"} | Email: {collegeInfo?.email || "info@rjit.edu.in"}</p>
              <p className="text-xs text-slate-500">Website: {collegeInfo?.website || "www.rjit.edu.in"}</p>
            </div>
          </div>

          {/* Title and Date Range */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800">
              {activeReportType === "department" ? `${selectedDepartment} Department Report` : activeReportType === "category" ? `${selectedCategory} Category Report` : "Monthly Audit Report"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Date Range: {startDate} to {endDate}
            </p>
          </div>

          {/* 1. DISBURSED LOGS PREVIEW */}
          {includeIssued && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-850 text-sm mb-3 uppercase tracking-wider border-b pb-1 border-slate-200">
                Stock Disbursement Ledger ({filteredIssued.length} transaction logs)
              </h3>
              <table className="w-full border-collapse border border-slate-200 text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-2 border border-slate-200 font-bold uppercase">Item Details</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Category</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Department</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Faculty</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Qty</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Issue Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssued.length > 0 ? (
                    filteredIssued.map((log) => (
                      <tr key={log.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-200 font-semibold">{log.item} ({log.type})</td>
                        <td className="p-2 border border-slate-200">{log.category}</td>
                        <td className="p-2 border border-slate-200">{log.department}</td>
                        <td className="p-2 border border-slate-200">{log.faculty}</td>
                        <td className="p-2 border border-slate-200 font-bold">{log.quantity}</td>
                        <td className="p-2 border border-slate-200">{log.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-400 italic">
                        No disbursed assets found in this configuration range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. ORDER SHIPMENTS PREVIEW */}
          {includeOrdered && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-850 text-sm mb-3 uppercase tracking-wider border-b pb-1 border-slate-200">
                Purchase Order Shipments Registry ({filteredOrders.length} records)
              </h3>
              <table className="w-full border-collapse border border-slate-200 text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-2 border border-slate-200 font-bold uppercase">Item Details</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Supplier</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Category</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Qty</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Per Unit</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Total Cost</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Order Date</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-200 font-semibold">{order.item} ({order.type})</td>
                        <td className="p-2 border border-slate-200">{order.supplier}</td>
                        <td className="p-2 border border-slate-200">{order.category}</td>
                        <td className="p-2 border border-slate-200 font-bold">{order.quantity}</td>
                        <td className="p-2 border border-slate-200">₹{order.pricePerUnit?.toLocaleString()}</td>
                        <td className="p-2 border border-slate-200 font-bold">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                        <td className="p-2 border border-slate-200">{order.orderDate}</td>
                        <td className="p-2 border border-slate-200 font-bold">{order.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-slate-400 italic">
                        No purchase shipments found in this configuration range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Seal / Sign-off block at bottom */}
          <div className="pt-10 flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-800 mt-8">
            <div className="text-slate-400 font-bold uppercase tracking-wider">
              Generated by: {collegeInfo?.name || "RJIT STORE SYSTEM"}
            </div>
            <div className="text-center border-t border-slate-350 pt-2 w-48 text-slate-650 font-bold uppercase">
              Authorized Signature
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}