import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileExcel,
  FaBuilding,
  FaBoxes,
  FaCalendarAlt,
  FaChartBar,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";

// Department to Category mapping for purchase orders filtering
const DEPT_CATEGORIES = {
  Hostel: ["Furniture", "Electronics"],
  Sports: ["Sports"],
  Laboratory: ["Equipment", "Stationery"],
  "IT Department": ["Electronics"],
  Library: ["Furniture", "Electronics"],
  Office: ["Furniture", "Electronics"],
  Maintenance: ["Equipment"],
  Medical: ["Equipment"]
};

export default function Reports() {
  const navigate = useNavigate();
  const { inventory, issuedStock, orders } = useStore();

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
    // Date filter
    if (!isWithinRange(log.date)) return false;

    // Department filter
    if (activeReportType === "department" && log.department !== selectedDepartment) return false;

    // Category filter
    if (activeReportType === "category" && log.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;

    return true;
  });

  // 2. FILTER PURCHASE ORDERS
  const filteredOrders = orders.filter((order) => {
    // Date filter
    if (!isWithinRange(order.orderDate)) return false;

    // Category filter
    if (activeReportType === "category" && order.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;

    // Department filter (filter orders by mapping categories to departments)
    if (activeReportType === "department") {
      const allowedCategories = DEPT_CATEGORIES[selectedDepartment] || [];
      if (!allowedCategories.some((cat) => cat.toLowerCase() === order.category.toLowerCase())) {
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
      icon: <FaBuilding size={24} />
    },
    {
      type: "category",
      title: "Category Report",
      description: "Drill down of logs based on asset classifications.",
      icon: <FaBoxes size={24} />
    },
    {
      type: "monthly",
      title: "Monthly Audit Report",
      description: "General monthly transaction log ledger of issues and orders.",
      icon: <FaCalendarAlt size={24} />
    },
    {
      type: "analytics",
      title: "Usage Analytics",
      description: "Go to visual double-bar and active-pie analytics charts.",
      icon: <FaChartBar size={24} />,
      isLink: true
    }
  ];

  const departmentsList = [
    "Hostel",
    "Sports",
    "Laboratory",
    "IT Department",
    "Library",
    "Office",
    "Maintenance",
    "Medical"
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
            Reports Center
          </h1>
          <p className="text-slate-500 mt-1">
            Generate, view, and export detailed inventories and audit ledger documents.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border ${
            loading ? "bg-blue-600 text-white border-blue-500 animate-pulse" : "bg-emerald-600 text-white border-emerald-500"
          }`}>
            {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaCheckCircle className="text-lg" />}
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Selection Cards Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
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
                className={`group relative rounded-3xl p-6 cursor-pointer border transition-all duration-300 transform hover:-translate-y-1 ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-700 to-indigo-900 text-white border-blue-800 shadow-xl shadow-blue-900/15 scale-[1.02]"
                    : "bg-white text-slate-800 border-slate-100 hover:border-slate-200 hover:shadow-lg shadow-sm"
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                }`}>
                  {card.icon}
                </div>

                <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                <p className={`text-xs leading-relaxed ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conditional Configuration Panel */}
        {activeReportType ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 transition-all duration-500 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b pb-5 mb-6 border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 capitalize">
                  {activeReportType} Report Configuration
                </h2>
                <p className="text-slate-400 text-xs mt-1">Configure options, filter by date range, select report sectors and compile files.</p>
              </div>
              
              <button 
                onClick={() => setActiveReportType(null)} 
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel Selection
              </button>
            </div>

            {/* Inputs & Parameters Panel */}
            <div className="space-y-6 mb-8">
              
              <div className="grid grid-cols-4 gap-6 items-end">
                {/* Dynamic Parameter Dropdown */}
                {activeReportType === "department" && (
                  <div className="col-span-2">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Select College Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeReportType === "category" && (
                  <div className="col-span-2">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Select Asset Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Filters (applicable to all dynamically now) */}
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Checkboxes & Action Row */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex gap-6 items-center">
                  <span className="text-slate-500 font-bold text-xs uppercase tracking-wider mr-2">Include in Report:</span>
                  
                  <label className="flex items-center gap-2.5 font-semibold text-slate-700 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeIssued}
                      onChange={(e) => setIncludeIssued(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Stock Issued Records</span>
                  </label>

                  <label className="flex items-center gap-2.5 font-semibold text-slate-700 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeOrdered}
                      onChange={(e) => setIncludeOrdered(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Items Ordered / Purchase Orders</span>
                  </label>
                </div>

                {/* Compilation Action buttons */}
                <div className="flex gap-3">
                  <button
                    disabled={loading}
                    onClick={() => triggerDownload(
                      activeReportType === "department" ? selectedDepartment : activeReportType === "category" ? selectedCategory : `${startDate} to ${endDate}`
                    )}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 text-sm"
                  >
                    <FaDownload />
                    <span>Download Report</span>
                  </button>

                  {(activeReportType === "department" || activeReportType === "category") && (
                    <button
                      disabled={loading}
                      onClick={() => triggerDownload(
                        activeReportType === "department" ? "All Departments" : "All Categories",
                        true
                      )}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 text-sm"
                    >
                      <FaFileExcel />
                      <span>Download All (Bulk)</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Live Preview Content Grid */}
            <div className="space-y-8 mt-8 border-t pt-6 border-slate-100">
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                  Live Report Preview
                </h3>
                <span className="text-slate-400 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <FaInfoCircle />
                  <span>Date Range: {startDate} to {endDate}</span>
                </span>
              </div>

              {/* 1. STOCK ISSUED TABLE PREVIEW */}
              {includeIssued && (
                <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Issued Stock Registry ({filteredIssued.length} entries)</span>
                    </h4>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Item Details</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Department</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Faculty</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Qty</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Issue Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredIssued.length > 0 ? (
                          filteredIssued.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 text-sm font-semibold text-slate-700">
                                {log.item} <span className="text-xs text-slate-400 font-normal">({log.type})</span>
                              </td>
                              <td className="p-3 text-sm text-slate-600">{log.category}</td>
                              <td className="p-3 text-sm text-slate-600">{log.department}</td>
                              <td className="p-3 text-sm text-slate-600">{log.faculty}</td>
                              <td className="p-3 text-sm font-bold text-slate-800">{log.quantity}</td>
                              <td className="p-3 text-sm text-slate-500">{log.date}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-sm text-slate-400 font-medium bg-white">
                              No stock issue records found matching these date/filter ranges.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. ITEMS ORDERED TABLE PREVIEW */}
              {includeOrdered && (
                <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>Ordered & Received Stock Registry ({filteredOrders.length} entries)</span>
                    </h4>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Item Name</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Supplier</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Qty</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Order Date</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 text-sm font-semibold text-slate-700">
                                {order.item} <span className="text-xs text-slate-400 font-normal">({order.type})</span>
                              </td>
                              <td className="p-3 text-sm text-slate-600">{order.supplier}</td>
                              <td className="p-3 text-sm text-slate-600">{order.category}</td>
                              <td className="p-3 text-sm font-bold text-slate-800">{order.quantity}</td>
                              <td className="p-3 text-sm text-slate-500">{order.orderDate}</td>
                              <td className="p-3 text-sm">
                                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                  order.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-sm text-slate-400 font-medium bg-white">
                              No purchase order records found matching these date/filter ranges.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          /* Empty / Instructions state */
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaDownload className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 mb-1">Select a Report Type Above</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Choose Department Report, Category Report, or Monthly Audit Report to compile spreadsheets and generate printable documents.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}