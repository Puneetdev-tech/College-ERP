import { useState, useEffect } from "react";
import { 
  FaArrowRight, 
  FaClipboardList, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaTimes,
  FaBoxes,
  FaHistory,
  FaBuilding,
  FaUserGraduate,
  FaCalendarAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaStar,
  FaLayerGroup
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";
import { playBeep } from "../components/useSpeech";

const getCurrentDateTimeString = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  try {
    const date = new Date(dateTimeStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return dateTimeStr;
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateTimeStr;
  }
};

const parseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  try {
    const parts = dateStr.split(/[\s,]+/);
    const dateParts = parts[0].split("/");
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      let hour = 0, minute = 0;
      if (parts[1]) {
        const timeParts = parts[1].split(":");
        hour = parseInt(timeParts[0], 10);
        minute = parseInt(timeParts[1], 10) || 0;
        const ampm = parts[2] ? parts[2].toLowerCase() : "";
        if (ampm.includes("pm") && hour < 12) hour += 12;
        if (ampm.includes("am") && hour === 12) hour = 0;
      }
      d = new Date(year, month, day, hour, minute);
      if (!isNaN(d.getTime())) return d;
    }
  } catch (e) {}
  return new Date(0);
};

// Shared page styles
const PAGE_STYLE = {
  background: "linear-gradient(135deg, #f0f7ff 0%, #fafbff 50%, #f5f0ff 100%)",
  minHeight: "100vh"
};

export default function IssueStock() {
  const { 
    inventory, 
    issuedStock, 
    issueStockItem, 
    inventoryCategories, 
    inventorySubcategories,
    getRegisterForCategory
  } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";

  const { flashes, showFlash, dismissFlash } = useFlash();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState(searchParamVal);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setSearch(searchParamVal);
  }, [searchParamVal]);

  // Form states
  const [category, setCategory] = useState("Electronics");
  const [subcategory, setSubcategory] = useState("Computer");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [issueDate, setIssueDate] = useState(getCurrentDateTimeString());
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  const registersList = (inventoryCategories || []).map(c => c.name);
  const registerItems = inventory.filter(item => 
    getRegisterForCategory(item.category).toLowerCase() === category.toLowerCase()
  );
  const subcategories = Array.from(new Set(registerItems.map(item => item.subcategory)));
  const availableTypes = Array.from(
    new Set(
      registerItems
        .filter(item => (item.subcategory || "").toLowerCase() === (subcategory || "").toLowerCase())
        .map(item => item.type)
    )
  );

  const matchingItem = inventory.find(item => 
    getRegisterForCategory(item.category).toLowerCase() === category.toLowerCase() &&
    (item.subcategory || "").toLowerCase() === (subcategory || "").toLowerCase() &&
    (item.type || "").toLowerCase() === (type || "").trim().toLowerCase()
  );
  const availableStock = matchingItem ? matchingItem.stock : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!subcategory) { setErrorMsg("Please select a subcategory."); return; }
    if (!type.trim()) { setErrorMsg("Please enter the specific item type/specification."); return; }
    if (quantity <= 0) { setErrorMsg("Quantity must be at least 1."); return; }
    if (!department.trim()) { setErrorMsg("Please enter the issuing destination."); return; }
    if (!faculty.trim()) { setErrorMsg("Please enter the faculty name."); return; }
    if (!matchingItem) { setErrorMsg("This specific item type does not exist in inventory."); return; }
    if (quantity > availableStock) { setErrorMsg(`Insufficient stock! Only ${availableStock} units available.`); return; }

    const formattedDate = new Date(issueDate).toISOString();
    const res = await issueStockItem({
      category: matchingItem.category,
      subcategory,
      type: matchingItem.type,
      quantity: parseInt(quantity, 10),
      unitCost: matchingItem.price,
      department: department.trim(),
      faculty: faculty.trim(),
      date: formattedDate
    });

    if (res.success) {
      playBeep("issue-success");
      showFlash("success", "Stock Issued", `${parseInt(quantity, 10)} unit(s) of ${subcategory} disbursed to ${department.trim()} successfully.`);
      setQuantity(1); setType(""); setDepartment(""); setFaculty(""); setIssueDate(getCurrentDateTimeString());
      setTimeout(() => { setShowModal(false); }, 800);
    } else {
      setErrorMsg(res.message || "Failed to issue stock.");
      playBeep("error");
      showFlash("error", "Issue Failed", res.message || "Failed to issue stock.");
    }
  };

  const totalDisbursedQty = issuedStock.reduce((acc, log) => acc + log.quantity, 0);
  const totalTransactions = issuedStock.length;
  const uniqueDepartments = new Set(issuedStock.map(log => log.department)).size;

  const filteredIssued = issuedStock.filter(log => {
    if (!search.trim()) return true;
    const s = (search || "").toLowerCase();
    const formattedId = `#is-${String(log.id).padStart(3, "0")}`.toLowerCase();
    return (
      formattedId.includes(s) || String(log.id).includes(s) ||
      (log.item || "").toLowerCase().includes(s) ||
      (log.category || "").toLowerCase().includes(s) ||
      (log.department || "").toLowerCase().includes(s) ||
      (log.faculty || "").toLowerCase().includes(s)
    );
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-slate-300 text-xs ml-1 flex-shrink-0" />;
    return sortDirection === "asc"
      ? <FaSortUp className="text-white text-xs ml-1 flex-shrink-0" />
      : <FaSortDown className="text-white text-xs ml-1 flex-shrink-0" />;
  };

  const sortedIssued = [...filteredIssued].sort((a, b) => {
    let valA = a[sortField], valB = b[sortField];
    if (sortField === "date") {
      const dateA = parseDate(valA), dateB = parseDate(valB);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    if (typeof valA === "string") {
      valA = valA.toLowerCase(); valB = (valB || "").toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    } else {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }
  });

  const statCards = [
    {
      icon: <FaBoxes size={22} />,
      label: "Total Disbursed",
      value: `${totalDisbursedQty} units`,
      gradient: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
      glow: "rgba(99,102,241,0.18)"
    },
    {
      icon: <FaHistory size={22} />,
      label: "Total Transactions",
      value: `${totalTransactions} logs`,
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
      glow: "rgba(139,92,246,0.18)"
    },
    {
      icon: <FaBuilding size={22} />,
      label: "Active Departments",
      value: `${uniqueDepartments} sectors`,
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)",
      glow: "rgba(6,182,212,0.18)"
    },
  ];

  return (
    <div style={PAGE_STYLE} className="text-slate-800 transition-colors duration-300">
      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl mt-8 mb-8 p-8 shadow-lg transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)" }}>
          {/* Floating shape decorations */}
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }} />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 31px)" }} />

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <FaClipboardList className="text-white text-lg" />
                </div>
                <span className="text-xs font-bold text-purple-200 uppercase tracking-widest">Stock Disbursement</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Issue Stock Registry</h1>
              <p className="text-purple-200 text-sm mt-1">Disburse department assets, log faculty checkouts, verify remaining stock.</p>
            </div>

            <button
              onClick={() => {
                setShowModal(true);
                setIssueDate(getCurrentDateTimeString());
                setErrorMsg("");
                setDepartment("");
                setFaculty("");
                const regs = (inventoryCategories || []).map(c => c.name);
                if (regs.length > 0) {
                  const defaultReg = regs[0];
                  setCategory(defaultReg);
                  const regItems = inventory.filter(item =>
                    getRegisterForCategory(item.category).toLowerCase() === defaultReg.toLowerCase()
                  );
                  const subcats = Array.from(new Set(regItems.map(item => item.subcategory)));
                  const defaultSub = subcats.length > 0 ? subcats[0] : "";
                  setSubcategory(defaultSub);
                  if (defaultSub) {
                    const types = Array.from(new Set(regItems.filter(item =>
                      (item.subcategory || "").toLowerCase() === defaultSub.toLowerCase()
                    ).map(item => item.type)));
                    setType(types.length > 0 ? types[0] : "");
                  } else setType("");
                }
              }}
              className="group relative overflow-hidden bg-white text-purple-700 font-bold px-6 py-3.5 rounded-2xl flex gap-2.5 items-center cursor-pointer shadow-lg active:scale-95 transition-all hover:shadow-xl"
              style={{ boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
            >
              <span className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <FaClipboardList className="text-sm relative z-10" />
              <span className="relative z-10">Issue Stock Item</span>
            </button>
          </div>
        </div>

        {/* ── METRIC CARDS ─────────────────────────────────────────── */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {statCards.map((card, i) => (
            <div key={i}
              className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-md cursor-default transition-all duration-400 hover:scale-[1.03] hover:shadow-xl"
              style={{
                background: card.gradient,
                boxShadow: `0 8px 30px ${card.glow}`
              }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 left-0 w-full h-0.5 opacity-30"
                style={{ background: "linear-gradient(90deg, transparent, white, transparent)" }} />

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white/70 uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-2xl font-black text-white mt-0.5">{card.value}</h3>
                </div>
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)", animation: "shimmer 1s ease-in-out" }} />
            </div>
          ))}
        </div>

        {/* ── SEARCH BAR ───────────────────────────────────────────── */}
        <div className={`bg-white rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-100 transition-all duration-700 delay-150 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search checkout transactions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSearchParams({ search: e.target.value }); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none font-semibold text-sm transition-all"
            />
            {search && (
              <button onClick={() => { setSearch(""); setSearchParams({}); }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            )}
          </div>
          {search && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn">
              <span>Filter: <strong>"{search}"</strong></span>
              <button onClick={() => { setSearch(""); setSearchParams({}); }}
                className="hover:text-red-500 font-extrabold text-sm ml-2.5 transition cursor-pointer">×</button>
            </div>
          )}
        </div>

        {/* ── TRANSACTION TABLE ────────────────────────────────────── */}
        <div className={`bg-white rounded-3xl shadow-md overflow-hidden border border-slate-100 transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ boxShadow: "0 4px 30px rgba(79,70,229,0.07)" }}>
          <div className="p-6 border-b border-slate-100"
            style={{ background: "linear-gradient(135deg, #fafaff 0%, #f5f0ff 100%)" }}>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaLayerGroup className="text-indigo-500" />
              Stock Disbursement Registry
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">All stock issues and disbursement transactions.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider select-none text-white"
                  style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                  {[
                    { label: "ID", field: "id", extraClass: "pl-8" },
                    { label: "Item Details", field: "item" },
                    { label: "Category / Register", field: "category" },
                    { label: "Qty Issued", field: "quantity", extraClass: "text-right" },
                    { label: "Issuing To", field: "department" },
                    { label: "Issued To", field: "faculty" },
                    { label: "Issue Date", field: "date", extraClass: "pr-8" },
                  ].map(({ label, field, extraClass }) => (
                    <th key={field}
                      className={`p-5 cursor-pointer hover:bg-white/10 transition-all duration-150 ${extraClass || ""}`}
                      onClick={() => handleSort(field)}>
                      <div className={`flex items-center gap-1 ${extraClass?.includes("text-right") ? "justify-end pr-4" : ""}`}>
                        <span>{label}</span>
                        {renderSortIcon(field)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedIssued.length > 0 ? (
                  sortedIssued.map((log) => {
                    const getCatBadge = (cat) => {
                      const c = (cat || "").toLowerCase();
                      if (c.includes("electronic")) return "bg-blue-50 text-blue-700 border-blue-200";
                      if (c.includes("furniture")) return "bg-purple-50 text-purple-700 border-purple-200";
                      if (c.includes("stationery") || c.includes("stationary")) return "bg-amber-50 text-amber-700 border-amber-200";
                      if (c.includes("sport") || c.includes("cleaning")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
                      return "bg-slate-50 text-slate-700 border-slate-200";
                    };

                    return (
                      <tr key={log.id}
                        className="group hover:bg-indigo-50/40 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-indigo-500">
                        <td className="p-5 pl-8">
                          <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all duration-200 shadow-sm">
                            #IS-{String(log.id).padStart(3, "0")}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="font-bold text-slate-800 leading-tight group-hover:text-indigo-700 transition-colors">{log.item}</div>
                          {log.type && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Spec: {log.type}</div>
                          )}
                        </td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${getCatBadge(log.category)}`}>
                            {getRegisterForCategory(log.category)}
                          </span>
                        </td>
                        <td className="p-5 text-right font-black text-slate-800 text-base pr-12">
                          {log.quantity}
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <FaBuilding className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 text-sm" />
                            <span>{log.department}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <FaUserGraduate className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 text-sm" />
                            <span>{log.faculty}</span>
                          </div>
                        </td>
                        <td className="p-5 pr-8">
                          <div className="flex items-center gap-2 text-xs text-slate-800 font-bold">
                            <FaCalendarAlt className="text-indigo-400 flex-shrink-0 text-sm group-hover:scale-110 transition-transform duration-200" />
                            <span>{log.date}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-16 text-center">
                      <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaClipboardList className="text-xl" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-600 mb-1">No transactions found</h3>
                      <p className="text-slate-400 text-sm">Try adjusting your search or issue some stock to see it here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ISSUE ITEM MODAL ─────────────────────────────────────── */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 25px 60px rgba(79,70,229,0.3)" }}>
              {/* Modal gradient header */}
              <div className="px-8 py-6 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                <h2 className="text-2xl font-bold relative z-10">Issue Inventory Assets</h2>
                <p className="text-purple-200 text-xs mt-0.5 relative z-10">Disburse items from existing stock to departments.</p>
              </div>

              <div className="bg-white p-8 max-h-[75vh] overflow-y-auto">
                {errorMsg && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
                    <FaExclamationTriangle className="text-base flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Register / Department</label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const newReg = e.target.value;
                          setCategory(newReg);
                          const regItems2 = inventory.filter(item =>
                            getRegisterForCategory(item.category).toLowerCase() === newReg.toLowerCase()
                          );
                          const newSubcats = Array.from(new Set(regItems2.map(item => item.subcategory)));
                          const nextSubcat = newSubcats.length > 0 ? newSubcats[0] : "";
                          setSubcategory(nextSubcat);
                          if (nextSubcat) {
                            const newTypes = Array.from(new Set(regItems2
                              .filter(item => (item.subcategory || "").toLowerCase() === nextSubcat.toLowerCase())
                              .map(item => item.type)));
                            setType(newTypes.length > 0 ? newTypes[0] : "");
                          } else setType("");
                        }}
                        className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-medium cursor-pointer transition-all"
                      >
                        {registersList.map(reg => <option key={reg} value={reg}>{reg}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Subcategory</label>
                      <select
                        value={subcategory}
                        onChange={(e) => {
                          const newSub = e.target.value;
                          setSubcategory(newSub);
                          const newTypes = Array.from(new Set(registerItems
                            .filter(item => (item.subcategory || "").toLowerCase() === newSub.toLowerCase())
                            .map(item => item.type)));
                          setType(newTypes.length > 0 ? newTypes[0] : "");
                        }}
                        className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-medium cursor-pointer transition-all"
                      >
                        {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Type / Specification</label>
                      <input
                        type="text"
                        placeholder="Enter or select specification"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-medium text-slate-800 transition-all"
                      />
                      {showSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                          {availableTypes.filter(t => (t || "").toLowerCase().includes(type.toLowerCase())).length > 0 ? (
                            availableTypes.filter(t => (t || "").toLowerCase().includes(type.toLowerCase())).map((t, idx) => (
                              <div key={idx} onMouseDown={() => { setType(t); setShowSuggestions(false); }}
                                className="p-3 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer text-sm text-slate-800 font-medium transition">
                                {t}
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-sm text-slate-400 italic">No matching specifications (type custom)</div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Quantity</label>
                      <input
                        type="number" min="1" value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") setQuantity("");
                          else { const parsed = parseInt(val, 10); setQuantity(isNaN(parsed) ? "" : parsed); }
                        }}
                        className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-bold transition-all"
                      />
                    </div>
                  </div>

                  {/* Stock Level Banner */}
                  <div className="p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold"
                    style={{ background: availableStock < 5 ? "linear-gradient(135deg, #fff7ed, #fef3c7)" : "linear-gradient(135deg, #eff6ff, #eef2ff)", border: `1px solid ${availableStock < 5 ? "#fed7aa" : "#c7d2fe"}`, color: availableStock < 5 ? "#c2410c" : "#4338ca" }}>
                    <div className="flex items-center gap-2">
                      <FaInfoCircle />
                      <span>Current Inventory Stock Level:</span>
                    </div>
                    <span className="text-base font-black">{availableStock} units available</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Issuing To</label>
                      <input type="text" placeholder="Enter destination / recipient" value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-medium placeholder-slate-400 transition-all" required />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Faculty Name</label>
                      <input type="text" placeholder="Enter faculty member name" value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-medium placeholder-slate-400 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Issue Date & Time</label>
                    <input type="datetime-local" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 font-medium text-slate-700 transition-all" required />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setShowModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-semibold cursor-pointer active:scale-95 transition">
                      Cancel
                    </button>
                    <button type="submit"
                      className="relative overflow-hidden text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold cursor-pointer shadow-md active:scale-95 transition group"
                      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", boxShadow: "0 6px 20px rgba(79,70,229,0.35)" }}>
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }} />
                      <FaArrowRight className="relative z-10" />
                      <span className="relative z-10">Confirm Asset Disbursement</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}