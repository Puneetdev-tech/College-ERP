import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import {
  FaSearch,
  FaFileInvoice,
  FaFileExcel,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaSoap,
  FaBolt,
  FaMoneyBillWave,
  FaBoxes,
  FaLayerGroup,
  FaCoins
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function LegacyInventory() {
  const navigate = useNavigate();
  const {
    legacyInventory,
    sanitaryInventory,
    electricalInventory,
    fetchLegacyInventory,
    fetchSanitaryInventory,
    fetchElectricalInventory
  } = useStore();

  const [activeTab, setActiveTab] = useState("general"); // "general" | "sanitary" | "electrical"
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    fetchLegacyInventory();
    fetchSanitaryInventory();
    fetchElectricalInventory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
  }, [activeTab]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // ── Grand Totals (Across ALL 3 Legacy Registers) ─────────────────────────
  const genVal = (legacyInventory || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const sanVal = (sanitaryInventory || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const eleVal = (electricalInventory || []).reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const grandCombinedValuation = genVal + sanVal + eleVal;
  const grandCombinedCount = (legacyInventory || []).length + (sanitaryInventory || []).length + (electricalInventory || []).length;

  // ── Filtered Datasets ───────────────────────────────────────────────────
  const filteredGeneral = (legacyInventory || []).filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(s) ||
      (item.dealer_name || "").toLowerCase().includes(s) ||
      (item.bill_number || "").toLowerCase().includes(s) ||
      (item.remarks || "").toLowerCase().includes(s)
    );
  });

  const filteredSanitary = (sanitaryInventory || []).filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(s) ||
      (item.dealer_name || "").toLowerCase().includes(s) ||
      (item.bill_number || "").toLowerCase().includes(s) ||
      (item.remarks || "").toLowerCase().includes(s)
    );
  });

  const filteredElectrical = (electricalInventory || []).filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(s) ||
      (item.variant || "").toLowerCase().includes(s) ||
      (item.dealer_name || "").toLowerCase().includes(s) ||
      (item.bill_number || "").toLowerCase().includes(s) ||
      (item.remarks || "").toLowerCase().includes(s)
    );
  });

  // ── Active Dataset & Pagination ──────────────────────────────────────────
  const activeDataset =
    activeTab === "general"
      ? filteredGeneral
      : activeTab === "sanitary"
      ? filteredSanitary
      : filteredElectrical;

  const totalRecords = activeDataset.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeDataset.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  // Aggregate Metrics for Active Tab
  const totalValuation =
    activeTab === "general"
      ? filteredGeneral.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
      : activeTab === "sanitary"
      ? filteredSanitary.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
      : filteredElectrical.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  const totalQuantity =
    activeTab === "general"
      ? filteredGeneral.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
      : activeTab === "sanitary"
      ? filteredSanitary.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0)
      : filteredElectrical.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const exportToCSV = () => {
    let headers = [];
    let rows = [];
    let filename = "";

    if (activeTab === "general") {
      filename = "Stationery_Legacy_Register.csv";
      headers = ["S.No", "Item Description", "DOP", "Bill Number", "Quantity", "Unit Rate", "Amount", "Received Qty", "Opening Stock", "Issued", "Balance", "Dealer / Supplier", "Remarks"];
      rows = filteredGeneral.map(item => [
        item.s_no ?? "",
        `"${(item.item_name || "").replace(/"/g, '""')}"`,
        item.dop ? new Date(item.dop).toISOString().split("T")[0] : "",
        `"${item.bill_number || ""}"`,
        item.quantity ?? "",
        item.unit_rate ?? "",
        item.amount ?? "",
        item.received_quantity ?? "",
        item.opening_stock ?? "",
        item.issued ?? "",
        item.balance ?? "",
        `"${(item.dealer_name || "").replace(/"/g, '""')}"`,
        `"${(item.remarks || "").replace(/"/g, '""')}"`
      ]);
    } else if (activeTab === "sanitary") {
      filename = "Sanitary_Legacy_Register.csv";
      headers = ["S.No", "Sanitary Item", "DOP", "Bill Number", "Quantity", "Qty Unit", "Unit Rate", "Amount", "Received Qty", "Opening Stock", "Issued", "Balance", "Dealer / Supplier", "Remarks"];
      rows = filteredSanitary.map(item => [
        item.s_no ?? "",
        `"${(item.item_name || "").replace(/"/g, '""')}"`,
        item.dop ? new Date(item.dop).toISOString().split("T")[0] : "",
        `"${item.bill_number || ""}"`,
        item.quantity ?? "",
        `"${item.quantity_text || ""} ${item.quantity_unit || ""}"`,
        item.unit_rate ?? "",
        item.amount ?? "",
        item.received_quantity ?? "",
        item.opening_stock ?? "",
        item.issued ?? "",
        item.balance ?? "",
        `"${(item.dealer_name || "").replace(/"/g, '""')}"`,
        `"${(item.remarks || "").replace(/"/g, '""')}"`
      ]);
    } else {
      filename = "Electrical_Legacy_Register.csv";
      headers = ["S.No", "Electrical Item Name", "Variant", "DOP", "Bill Number", "Quantity", "Unit Rate", "Amount", "Issued", "Balance", "Dealer / Supplier", "Remarks"];
      rows = filteredElectrical.map(item => [
        item.s_no ?? "",
        `"${(item.item_name || "").replace(/"/g, '""')}"`,
        `"${(item.variant || "").replace(/"/g, '""')}"`,
        item.dop ? new Date(item.dop).toISOString().split("T")[0] : "",
        `"${item.bill_number || ""}"`,
        item.quantity ?? "",
        item.unit_rate ?? "",
        item.amount ?? "",
        item.issued ?? "",
        item.balance ?? "",
        `"${(item.dealer_name || "").replace(/"/g, '""')}"`,
        `"${(item.remarks || "").replace(/"/g, '""')}"`
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6 max-w-[1600px] mx-auto">
        {/* Header Block */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition mb-2 group cursor-pointer"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Departments</span>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <FaDatabase className="text-purple-600" />
              Legacy Registers Archive
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Consolidated historical store records: Stationery, Sanitary, and Electrical registers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportToCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
              title="Export current register to Excel (.csv)"
            >
              <FaFileExcel className="text-base" />
              <span>Export to Excel (CSV)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
            >
              <FaFileInvoice />
              <span>Print Register</span>
            </button>
          </div>
        </div>

        {/* ── SLEEK COMBINED VALUATION SUMMARY BAR ─────────────────────────── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center text-xl font-bold flex-shrink-0">
              <FaCoins />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Combined Legacy Archive Valuation</div>
              <div className="text-xl font-black text-slate-800 flex items-baseline gap-2.5 mt-0.5">
                <span className="text-emerald-600 font-extrabold">₹{grandCombinedValuation.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full">
                  ₹{(grandCombinedValuation / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-xs text-slate-400 font-medium">({grandCombinedCount} Records Total)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
            <div className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>Stationery: ₹{(genVal / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-purple-500 font-semibold">({legacyInventory.length})</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>Sanitary: ₹{(sanVal / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-teal-500 font-semibold">({sanitaryInventory.length})</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Electrical: ₹{(eleVal / 100000).toFixed(2)}L</span>
              <span className="text-[10px] text-amber-600 font-semibold">({electricalInventory.length})</span>
            </div>
          </div>
        </div>

        {/* ── REGISTER TABS SWITCHER ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm mb-6 flex gap-2 no-print">
          {[
            {
              id: "general",
              label: "Stationery Legacy Register",
              count: legacyInventory.length,
              icon: <FaDatabase />,
              activeBg: "bg-purple-600 text-white shadow-md",
              inactiveBg: "hover:bg-purple-50 text-slate-700"
            },
            {
              id: "sanitary",
              label: "Sanitary Legacy Register",
              count: sanitaryInventory.length,
              icon: <FaSoap />,
              activeBg: "bg-teal-600 text-white shadow-md",
              inactiveBg: "hover:bg-teal-50 text-slate-700"
            },
            {
              id: "electrical",
              label: "Electrical Legacy Register",
              count: electricalInventory.length,
              icon: <FaBolt />,
              activeBg: "bg-amber-600 text-white shadow-md",
              inactiveBg: "hover:bg-amber-50 text-slate-700"
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer ${
                activeTab === tab.id ? tab.activeBg : tab.inactiveBg
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 no-print">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Items / Records</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalRecords}</h3>
            </div>
            <div className="bg-purple-50 text-purple-600 p-4 rounded-xl">
              <FaLayerGroup className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Aggregate Stock Qty</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                {totalQuantity.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
              <FaBoxes className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Register Valuation</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                ₹{totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
              <FaMoneyBillWave className="text-xl" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
          <div className="relative w-full sm:max-w-md">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeTab === "general" ? "Stationery" : activeTab === "sanitary" ? "Sanitary" : "Electrical"} register...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-medium focus:border-purple-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none"
            >
              <option value={10}>10 rows</option>
              <option value={15}>15 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        {/* ── DATA TABLES CONTAINER ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* TAB 1: GENERAL LEGACY TABLE */}
          {activeTab === "general" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-purple-50 border-b border-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">S.No</th>
                    <th className="p-4 min-w-[200px]">Item Description</th>
                    <th className="p-4 w-28">DOP</th>
                    <th className="p-4 w-28">Bill Number</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4 text-right">Unit Rate</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Rec. Qty</th>
                    <th className="p-4 text-right">Opening</th>
                    <th className="p-4 text-right">Issued</th>
                    <th className="p-4 text-right">Balance</th>
                    <th className="p-4 min-w-[200px]">Dealer / Supplier</th>
                    <th className="p-4 min-w-[150px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-purple-50/30 transition">
                        <td className="p-4 text-center font-mono text-slate-500 font-semibold">{item.s_no ?? "—"}</td>
                        <td className="p-4 font-bold text-slate-800">{item.item_name ?? "—"}</td>
                        <td className="p-4 text-slate-600">{formatDate(item.dop)}</td>
                        <td className="p-4 font-mono text-xs text-slate-600">{item.bill_number || "—"}</td>
                        <td className="p-4 text-right font-semibold text-slate-700">{item.quantity != null ? Number(item.quantity).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-right text-slate-600">{item.unit_rate != null ? `₹${Number(item.unit_rate).toLocaleString("en-IN")}` : "—"}</td>
                        <td className="p-4 text-right font-bold text-slate-800">{item.amount != null ? `₹${Number(item.amount).toLocaleString("en-IN")}` : "—"}</td>
                        <td className="p-4 text-right text-slate-600">{item.received_quantity != null ? Number(item.received_quantity).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-right text-slate-500">{item.opening_stock != null ? Number(item.opening_stock).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-right text-rose-600 font-medium">{item.issued != null ? Number(item.issued).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-right font-bold text-purple-700">{item.balance != null ? Number(item.balance).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-slate-600 text-xs font-medium">{item.dealer_name ?? "—"}</td>
                        <td className="p-4 text-slate-500 text-xs italic">{item.remarks ?? "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={13} className="p-12 text-center text-slate-400 italic">No records match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: SANITARY LEGACY TABLE */}
          {activeTab === "sanitary" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1300px]">
                <thead>
                  <tr className="bg-teal-50 border-b border-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">S.No</th>
                    <th className="p-4 min-w-[200px]">Sanitary Item</th>
                    <th className="p-4 w-28">DOP</th>
                    <th className="p-4 w-28">Bill Number</th>
                    <th className="p-4 text-right">Qty</th>
                    <th className="p-4 text-left pl-4">Qty Unit</th>
                    <th className="p-4 text-right">Unit Rate</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Opening</th>
                    <th className="p-4 text-right">Issued</th>
                    <th className="p-4 text-right">Balance</th>
                    <th className="p-4 min-w-[200px]">Dealer / Supplier</th>
                    <th className="p-4 min-w-[150px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-teal-50/30 transition">
                        <td className="p-4 text-center font-mono text-slate-500 font-semibold">{item.s_no ?? "—"}</td>
                        <td className="p-4 font-bold text-slate-800">{item.item_name ?? "—"}</td>
                        <td className="p-4 text-slate-600">{formatDate(item.dop)}</td>
                        <td className="p-4 font-mono text-xs text-slate-600">{item.bill_number || "—"}</td>
                        <td className="p-4 text-right font-semibold text-slate-700">{item.quantity != null ? Number(item.quantity).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-left pl-4 text-xs font-medium text-slate-500">{item.quantity_text || "—"} {item.quantity_unit ? `(${item.quantity_unit})` : ""}</td>
                        <td className="p-4 text-right text-slate-600">{item.unit_rate != null ? `₹${Number(item.unit_rate).toLocaleString("en-IN")}` : "—"}</td>
                        <td className="p-4 text-right font-bold text-slate-800">{item.amount != null ? `₹${Number(item.amount).toLocaleString("en-IN")}` : "—"}</td>
                        <td className="p-4 text-right text-slate-500">{item.opening_stock != null ? Number(item.opening_stock).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-right text-rose-600 font-medium">{item.issued != null ? Number(item.issued).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-right font-bold text-teal-700">{item.balance != null ? Number(item.balance).toLocaleString("en-IN") : "—"}</td>
                        <td className="p-4 text-slate-600 text-xs font-medium">{item.dealer_name ?? "—"}</td>
                        <td className="p-4 text-slate-500 text-xs italic">{item.remarks ?? "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={13} className="p-12 text-center text-slate-400 italic">No sanitary records match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ELECTRICAL LEGACY TABLE */}
          {activeTab === "electrical" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">S.No</th>
                    <th className="p-4 min-w-[200px]">Electrical Item Name</th>
                    <th className="p-4 w-32 font-semibold">Variant</th>
                    <th className="p-4 w-28">DOP</th>
                    <th className="p-4 w-28">Bill Number</th>
                    <th className="p-4 text-right">Quantity</th>
                    <th className="p-4 text-right">Unit Rate</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Issued</th>
                    <th className="p-4 text-right">Balance</th>
                    <th className="p-4 min-w-[220px]">Dealer / Supplier</th>
                    <th className="p-4 min-w-[150px]">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/30 transition">
                        <td className="p-4 text-center font-mono text-slate-500 font-semibold">{item.s_no ?? "—"}</td>
                        <td className="p-4 font-bold text-slate-800">{item.item_name ?? "—"}</td>
                        <td className="p-4 text-slate-700 font-medium">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold">
                            {item.variant || "—"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{formatDate(item.dop)}</td>
                        <td className="p-4 font-mono text-xs text-slate-600">{item.bill_number || "—"}</td>
                        <td className="p-4 text-right font-semibold text-slate-700">{item.quantity ?? "—"}</td>
                        <td className="p-4 text-right text-slate-600">{item.unit_rate != null ? `₹${Number(item.unit_rate).toLocaleString("en-IN")}` : "—"}</td>
                        <td className="p-4 text-right font-bold text-slate-800">{item.amount != null ? `₹${Number(item.amount).toLocaleString("en-IN")}` : "—"}</td>
                        <td className="p-4 text-right text-rose-600 font-medium">{item.issued ?? "—"}</td>
                        <td className="p-4 text-right font-bold text-amber-700">{item.balance ?? "—"}</td>
                        <td className="p-4 text-slate-600 text-xs font-medium">{item.dealer_name ?? "—"}</td>
                        <td className="p-4 text-slate-500 text-xs italic">{item.remarks ?? "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={12} className="p-12 text-center text-slate-400 italic">No electrical inventory items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong>{indexOfFirstItem + 1}</strong> to <strong>{Math.min(indexOfLastItem, totalRecords)}</strong> of <strong>{totalRecords}</strong> records
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <FaChevronLeft />
                </button>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
