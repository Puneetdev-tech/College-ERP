import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import {
  FaSearch,
  FaCalendarAlt,
  FaFileInvoice,
  FaBuilding,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaSoap,
  FaMoneyBillWave,
  FaBoxes,
  FaTruckLoading
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function LegacySanitaryInventory() {
  const navigate = useNavigate();
  const { sanitaryInventory, fetchSanitaryInventory } = useStore();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    fetchSanitaryInventory();
  }, []);

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

  // Filter based on search query
  const filteredItems = (sanitaryInventory || []).filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(searchLower) ||
      (item.dealer_name || "").toLowerCase().includes(searchLower) ||
      (item.bill_number || "").toLowerCase().includes(searchLower) ||
      (item.remarks || "").toLowerCase().includes(searchLower)
    );
  });

  // Calculate Metrics
  const totalRecords = filteredItems.length;
  const totalQuantity = filteredItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const totalValuation = filteredItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const uniqueDealers = new Set(
    filteredItems.map((item) => item.dealer_name).filter(Boolean)
  ).size;

  // Pagination Logic
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6">
        
        {/* Header Block */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div>
            <button
              onClick={() => navigate("/inventory")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-550 hover:text-teal-600 transition mb-2 group cursor-pointer"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Registry</span>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <FaSoap className="text-teal-600" />
              Legacy Sanitary CSV Records
            </h1>
            <p className="text-slate-550 text-sm mt-1">
              Historical ledger items imported directly from the store's primary Sanitary CSV archive.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
          >
            <FaFileInvoice />
            <span>Print Ledger</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 no-print">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">Total Records</p>
              <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{totalRecords}</h3>
            </div>
            <div className="bg-teal-50 text-teal-600 p-4 rounded-xl">
              <FaSoap className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">Aggregate Stock</p>
              <h3 className="text-2xl font-extrabold text-blue-650 mt-1">
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
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">Total Valuation</p>
              <h3 className="text-2xl font-extrabold text-emerald-650 mt-1">
                ₹{totalValuation.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl">
              <FaMoneyBillWave className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">Active Suppliers</p>
              <h3 className="text-2xl font-extrabold text-amber-650 mt-1">{uniqueDealers}</h3>
            </div>
            <div className="bg-amber-50 text-amber-600 p-4 rounded-xl">
              <FaBuilding className="text-xl" />
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
          <div className="relative w-full sm:max-w-md">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sanitary items, dealer, bill, or remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-medium focus:border-teal-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-slate-500">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-650 font-bold focus:outline-none"
            >
              <option value={10}>10 rows</option>
              <option value={15}>15 rows</option>
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        {/* Table Registry Container */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto min-w-[1400px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 w-16 text-center">S.No</th>
                  <th className="p-4 min-w-[220px]">Sanitary Item</th>
                  <th className="p-4 w-28"><div className="flex items-center gap-1.5"><FaCalendarAlt className="text-slate-400" /> DOP</div></th>
                  <th className="p-4 w-28">Bill Number</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4 text-left pl-6">Qty text/unit</th>
                  <th className="p-4 text-right">Unit Rate</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-right">Rec. Qty</th>
                  <th className="p-4 text-right">Opening</th>
                  <th className="p-4 text-right">Issued</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-right">Avl Total</th>
                  <th className="p-4 min-w-[250px]"><div className="flex items-center gap-1.5"><FaBuilding className="text-slate-400" /> Dealer / Supplier</div></th>
                  <th className="p-4 min-w-[150px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 text-center font-semibold text-slate-500 font-mono">
                        {item.s_no ?? "—"}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {item.item_name ?? "—"}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {formatDate(item.dop)}
                      </td>
                      <td className="p-4 text-slate-600 font-medium font-mono text-xs">
                        {item.bill_number ? item.bill_number : <span className="text-slate-350 italic">None</span>}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-700">
                        {item.quantity != null ? Number(item.quantity).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="p-4 text-left pl-6 font-medium text-slate-550 text-xs">
                        {item.quantity_text || "—"} {item.quantity_unit ? `(${item.quantity_unit})` : ""}
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        {item.unit_rate != null ? `₹${Number(item.unit_rate).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="p-4 text-right font-extrabold text-slate-800">
                        {item.amount != null ? `₹${Number(item.amount).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="p-4 text-right text-slate-600">
                        {item.received_quantity != null ? Number(item.received_quantity).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="p-4 text-right text-slate-550">
                        {item.opening_stock != null ? Number(item.opening_stock).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="p-4 text-right text-rose-600 font-medium">
                        {item.issued != null ? Number(item.issued).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="p-4 text-right text-teal-600 font-bold">
                        {item.balance != null ? Number(item.balance).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-750">
                        {item.avl_stock_total != null ? Number(item.avl_stock_total).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="p-4 text-slate-600 leading-normal text-xs font-medium">
                        {item.dealer_name ?? "—"}
                      </td>
                      <td className="p-4 text-slate-550 text-xs leading-relaxed italic">
                        {item.remarks ?? <span className="text-slate-300 not-italic">—</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="p-12 text-center text-slate-400 font-semibold italic">
                      No legacy sanitary items matched your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-slate-50/70 border-t border-slate-100 p-4 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-700">{indexOfFirstItem + 1}</strong> to{" "}
                <strong className="text-slate-700">
                  {Math.min(indexOfLastItem, totalRecords)}
                </strong>{" "}
                of <strong className="text-slate-700">{totalRecords}</strong> entries
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  <FaChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  if (
                    pNum === 1 ||
                    pNum === totalPages ||
                    Math.abs(pNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pNum}
                        onClick={() => setCurrentPage(pNum)}
                        className={`w-8 h-8 rounded-lg border text-center transition cursor-pointer ${
                          currentPage === pNum
                            ? "bg-teal-650 border-teal-650 text-white"
                            : "border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {pNum}
                      </button>
                    );
                  } else if (
                    pNum === 2 ||
                    pNum === totalPages - 1
                  ) {
                    return <span key={pNum} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
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
