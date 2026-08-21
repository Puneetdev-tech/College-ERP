import { useState, useEffect } from "react";
import {
  FaSlidersH,
  FaSearch,
  FaTimes,
  FaExclamationTriangle,
  FaBoxes,
  FaEdit,
  FaCheck,
  FaHistory,
  FaArrowUp,
  FaArrowDown,
  FaMinus
} from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";

const PAGE_BG = {
  background: "linear-gradient(135deg, #f0fdf4 0%, #fafbff 50%, #eff6ff 100%)",
  minHeight: "100vh"
};

// Determine badge color from stock status string
function getStatusBadge(status) {
  if (!status) return "bg-slate-100 text-slate-600 border-slate-200";
  const s = status.toLowerCase();
  if (s.includes("good") || s.includes("adequate")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("low")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("critical") || s.includes("out")) return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function DiffBadge({ oldQty, newQty }) {
  const diff = newQty - oldQty;
  if (diff === 0) return <span className="text-slate-400 font-bold flex items-center gap-1"><FaMinus className="text-[10px]" />No change</span>;
  if (diff > 0) return <span className="text-emerald-600 font-bold flex items-center gap-1"><FaArrowUp className="text-[10px]" />+{diff}</span>;
  return <span className="text-rose-500 font-bold flex items-center gap-1"><FaArrowDown className="text-[10px]" />{diff}</span>;
}

export default function StockAdjustment() {
  const { inventory, currentUser, adjustStock } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();

  const [search, setSearch] = useState("");
  const [animateIn, setAnimateIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const filtered = inventory.filter(item => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (item.item || "").toLowerCase().includes(s) ||
      (item.category || "").toLowerCase().includes(s) ||
      (item.subcategory || "").toLowerCase().includes(s) ||
      (item.type || "").toLowerCase().includes(s)
    );
  });

  const openModal = (item) => {
    setSelectedItem(item);
    setNewQuantity(String(item.stock));
    setReason("");
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty < 0) {
      setFormError("New quantity must be a valid non-negative number.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Please provide a reason for the adjustment.");
      return;
    }

    setSubmitting(true);
    const res = await adjustStock({
      itemId: selectedItem.id,
      newQuantity: qty,
      reason: reason.trim(),
      adjustedBy: currentUser?.name || "Admin"
    });
    setSubmitting(false);

    if (res.success) {
      const diff = qty - selectedItem.stock;
      const direction = diff > 0 ? `increased by ${diff}` : diff < 0 ? `decreased by ${Math.abs(diff)}` : "unchanged";
      showFlash(
        "success",
        "Stock Adjusted",
        `"${selectedItem.item}" stock ${direction} → New stock: ${qty} units.`
      );
      closeModal();
    } else {
      setFormError(res.message || "Adjustment failed. Please try again.");
      showFlash("error", "Adjustment Failed", res.message || "Unexpected error. Please try again.");
    }
  };

  // Stats
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(i => (i.status || "").toLowerCase().includes("low")).length;
  const criticalItems = inventory.filter(i => (i.status || "").toLowerCase().includes("critical") || (i.status || "").toLowerCase().includes("out")).length;

  return (
    <div style={PAGE_BG} className="text-slate-800">
      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />

      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* ── HERO ─────────────────────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl mt-8 mb-8 p-8 shadow-xl transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a7f3d0 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #6ee7b7 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <FaSlidersH className="text-white text-lg" />
                </div>
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Admin Operations</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Stock Adjustment Center</h1>
              <p className="text-emerald-100 text-sm mt-1">Manually correct inventory quantities with a full audit trail for every change.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-2.5 rounded-2xl border border-white/25">
              <FaHistory />
              <span>All adjustments are permanently logged</span>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS ───────────────────────────────────────── */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {[
            { icon: <FaBoxes size={20} />, label: "Total Items", value: totalItems, grad: "linear-gradient(135deg, #059669 0%, #10b981 100%)", glow: "rgba(16,185,129,0.18)" },
            { icon: <FaExclamationTriangle size={20} />, label: "Low Stock Items", value: lowStockItems, grad: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", glow: "rgba(245,158,11,0.18)" },
            { icon: <FaTimes size={20} />, label: "Critical / Out of Stock", value: criticalItems, grad: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", glow: "rgba(239,68,68,0.18)" },
          ].map((card, i) => (
            <div key={i}
              className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
              style={{ background: card.grad, boxShadow: `0 8px 30px ${card.glow}` }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/70 uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-2xl font-black text-white mt-0.5">{card.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEARCH ───────────────────────────────────────────── */}
        <div className={`bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-6 flex items-center gap-4 transition-all duration-700 delay-150 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items to adjust..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none font-semibold text-sm transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-semibold">{filtered.length} item{filtered.length !== 1 ? "s" : ""} shown</p>
        </div>

        {/* ── INVENTORY TABLE ───────────────────────────────────── */}
        <div className={`bg-white rounded-3xl shadow-md overflow-hidden border border-slate-100 transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ boxShadow: "0 4px 30px rgba(16,185,129,0.07)" }}>
          <div className="p-6 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #fafafa 0%, #f0fdf4 100%)" }}>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaSlidersH className="text-emerald-500" /> Inventory Adjustment Console
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Click "Adjust" to manually correct stock quantities. All changes are permanently audited.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}>
                  <th className="p-4 text-left pl-8">Item</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">Subcategory</th>
                  <th className="p-4 text-left">Type / Spec</th>
                  <th className="p-4 text-right">Current Stock</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Unit Price</th>
                  <th className="p-4 text-center pr-8">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map(item => (
                    <tr key={item.id}
                      className="group hover:bg-emerald-50/40 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-emerald-500">
                      <td className="p-4 pl-8">
                        <div className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{item.item}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{item.category}</td>
                      <td className="p-4 text-sm text-slate-600">{item.subcategory}</td>
                      <td className="p-4 text-sm text-slate-500 italic">{item.type || "—"}</td>
                      <td className="p-4 text-right">
                        <span className={`text-xl font-black ${item.stock <= 5 ? "text-rose-600" : item.stock <= 15 ? "text-amber-600" : "text-slate-800"}`}>
                          {item.stock}
                        </span>
                        <span className="text-xs text-slate-400 ml-1 font-medium">units</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${getStatusBadge(item.status)}`}>
                          {item.status || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-700">
                        {item.price ? `₹${item.price.toLocaleString()}` : "—"}
                      </td>
                      <td className="p-4 text-center pr-8">
                        <button
                          onClick={() => openModal(item)}
                          className="group/btn relative overflow-hidden text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-1.5 mx-auto"
                          style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 3px 10px rgba(16,185,129,0.3)" }}
                        >
                          <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                            style={{ background: "linear-gradient(135deg, #047857, #059669)" }} />
                          <FaEdit className="relative z-10 text-[10px]" />
                          <span className="relative z-10">Adjust</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-16 text-center">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaBoxes className="text-xl" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-500 mb-1">No items found</h3>
                      <p className="text-slate-400 text-sm">Try adjusting your search query.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── ADJUSTMENT MODAL ──────────────────────────────────── */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{ boxShadow: "0 25px 60px rgba(5,150,105,0.25)" }}>
            {/* Modal header */}
            <div className="px-8 py-6 text-white relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}>
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold">Adjust Stock Quantity</h2>
                <p className="text-emerald-100 text-xs mt-0.5">Set the corrected quantity — this action is permanently logged.</p>
              </div>
            </div>

            <div className="bg-white p-8">
              {/* Item summary card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Selected Item</p>
                <p className="font-bold text-slate-800 text-lg leading-tight">{selectedItem.item}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedItem.category} › {selectedItem.subcategory} {selectedItem.type ? `› ${selectedItem.type}` : ""}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Current Stock</p>
                    <p className="text-2xl font-black text-slate-800">{selectedItem.stock}</p>
                  </div>
                  <div className="text-slate-300 text-2xl">→</div>
                  <div>
                    <p className="text-[10px] text-emerald-600 uppercase font-bold">New Stock</p>
                    <p className="text-2xl font-black text-emerald-700">{newQuantity !== "" ? newQuantity : "—"}</p>
                  </div>
                  <div className="ml-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Change</p>
                    {newQuantity !== "" && !isNaN(parseInt(newQuantity, 10)) && (
                      <DiffBadge oldQty={selectedItem.stock} newQty={parseInt(newQuantity, 10)} />
                    )}
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium">
                  <FaExclamationTriangle className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">
                    New Quantity (units) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newQuantity}
                    onChange={e => setNewQuantity(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 font-bold text-lg transition-all"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">
                    Reason for Adjustment <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="e.g. Physical count correction, Damaged stock written off, Audit reconciliation..."
                    rows={3}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 font-medium text-sm resize-none transition-all"
                    required
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-700">
                  <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                  <p><strong>This cannot be undone.</strong> The adjustment will be saved with your name, timestamp, old quantity, new quantity, and reason.</p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold cursor-pointer active:scale-95 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="relative overflow-hidden text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold cursor-pointer shadow-md active:scale-95 transition disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)", boxShadow: "0 6px 20px rgba(16,185,129,0.35)" }}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <FaCheck className="text-sm" />
                        Confirm Adjustment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
