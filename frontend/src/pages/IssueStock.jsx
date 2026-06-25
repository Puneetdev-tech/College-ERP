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
  FaSortDown
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

const getCurrentDateTimeString = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000; // in ms
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
      
      let hour = 0;
      let minute = 0;
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
  } catch (e) {
    // Ignore error
  }
  return new Date(0);
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

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState(searchParamVal);

  // Sync state if URL query changes
  useEffect(() => {
    setSearch(searchParamVal);
  }, [searchParamVal]);

  // Form states
  const [category, setCategory] = useState("Electronics"); // category state is used to store the selected Register name
  const [subcategory, setSubcategory] = useState("Computer");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState(""); // department state stores the "Issuing To" manual text input
  const [faculty, setFaculty] = useState("");
  const [issueDate, setIssueDate] = useState(getCurrentDateTimeString());
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sort states
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");

  // Get registers list
  const registersList = (inventoryCategories || []).map(c => c.name);

  // Filter items that belong to the selected register
  const registerItems = inventory.filter(item => {
    return getRegisterForCategory(item.category).toLowerCase() === category.toLowerCase();
  });

  // Subcategories based on selected register
  const subcategories = Array.from(
    new Set(
      registerItems.map((item) => item.subcategory)
    )
  );

  // Types based on selected register & subcategory
  const availableTypes = Array.from(
    new Set(
      registerItems
        .filter((item) => (item.subcategory || "").toLowerCase() === (subcategory || "").toLowerCase())
        .map((item) => item.type)
    )
  );

  // Find matching inventory item to show current stock
  const matchingItem = inventory.find(
    (item) => {
      return (
        getRegisterForCategory(item.category).toLowerCase() === category.toLowerCase() &&
        (item.subcategory || "").toLowerCase() === (subcategory || "").toLowerCase() &&
        (item.type || "").toLowerCase() === (type || "").trim().toLowerCase()
      );
    }
  );
  const availableStock = matchingItem ? matchingItem.stock : 0;

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!subcategory) {
      setErrorMsg("Please select a subcategory.");
      return;
    }
    if (!type.trim()) {
      setErrorMsg("Please enter the specific item type/specification.");
      return;
    }
    if (quantity <= 0) {
      setErrorMsg("Quantity must be at least 1.");
      return;
    }
    if (!department.trim()) {
      setErrorMsg("Please enter the issuing destination.");
      return;
    }
    if (!faculty.trim()) {
      setErrorMsg("Please enter the faculty name.");
      return;
    }

    if (!matchingItem) {
      setErrorMsg("This specific item type does not exist in inventory for the selected register & subcategory.");
      return;
    }

    if (quantity > availableStock) {
      setErrorMsg(`Insufficient stock! Only ${availableStock} units available.`);
      return;
    }

    const formattedDate = formatDateTime(issueDate);

    // Trigger context action
    const res = issueStockItem({
      category: matchingItem.category,
      subcategory,
      type: matchingItem.type, // Use canonical case from inventory
      quantity: parseInt(quantity, 10),
      department: department.trim(),
      faculty: faculty.trim(),
      date: formattedDate
    });

    if (res.success) {
      setSuccessMsg("Stock disbursed successfully!");
      // Reset form fields
      setQuantity(1);
      setType("");
      setDepartment("");
      setFaculty("");
      setIssueDate(getCurrentDateTimeString());
      setTimeout(() => {
        setSuccessMsg("");
        setShowModal(false);
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Metrics
  const totalDisbursedQty = issuedStock.reduce((acc, log) => acc + log.quantity, 0);
  const totalTransactions = issuedStock.length;
  const uniqueDepartments = new Set(issuedStock.map((log) => log.department)).size;

  // Filter logs matching search query
  const filteredIssued = issuedStock.filter((log) => {
    if (!search.trim()) return true;
    const s = (search || "").toLowerCase();
    const formattedId = `#is-${String(log.id).padStart(3, "0")}`.toLowerCase();
    return (
      formattedId.includes(s) ||
      String(log.id).includes(s) ||
      (log.item || "").toLowerCase().includes(s) ||
      (log.category || "").toLowerCase().includes(s) ||
      (log.department || "").toLowerCase().includes(s) ||
      (log.faculty || "").toLowerCase().includes(s)
    );
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="text-white/40 dark:text-slate-500 text-xs ml-1 flex-shrink-0" />;
    }
    return sortDirection === "asc" 
      ? <FaSortUp className="text-white dark:text-cyan-400 text-xs ml-1 flex-shrink-0" />
      : <FaSortDown className="text-white dark:text-cyan-400 text-xs ml-1 flex-shrink-0" />;
  };

  const sortedIssued = [...filteredIssued].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "date") {
      const dateA = parseDate(valA);
      const dateB = parseDate(valB);
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = (valB || "").toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    } else {
      return sortDirection === "asc" ? valA - valB : valB - valA;
    }
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Issue Stock Registry
            </h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400">
              Disburse department assets, log faculty checkouts, and verify remaining stock.
            </p>
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
                const subcats = Array.from(new Set(regItems.map((item) => item.subcategory)));
                const defaultSub = subcats.length > 0 ? subcats[0] : "";
                setSubcategory(defaultSub);
                
                if (defaultSub) {
                  const types = Array.from(
                    new Set(
                      regItems
                        .filter((item) => (item.subcategory || "").toLowerCase() === defaultSub.toLowerCase())
                        .map((item) => item.type)
                    )
                  );
                  setType(types.length > 0 ? types[0] : "");
                } else {
                  setType("");
                }
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold px-6 py-3.5 rounded-2xl flex gap-2.5 items-center cursor-pointer shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/10 active:scale-95 transition-all"
          >
            <FaClipboardList className="text-sm" />
            Issue Stock Item
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-450 rounded-2xl flex items-center gap-3 animate-fadeIn font-semibold">
            <FaCheckCircle className="text-xl text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 dark:bg-blue-500" />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FaBoxes size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Disbursed Qty</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalDisbursedQty} units</h3>
            </div>
          </div>

          <div className="card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 dark:bg-indigo-500" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FaHistory size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Checkouts</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalTransactions} logs</h3>
            </div>
          </div>

          <div className="card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-purple-655 dark:bg-purple-500" />
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FaBuilding size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Departments</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{uniqueDepartments} sectors</h3>
            </div>
          </div>

        </div>

        {/* Search & Filter box */}
        <div className="bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search checkout transactions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchParams({ search: e.target.value });
              }}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-transparent focus:border-indigo-500/20 outline-none font-semibold text-sm"
            />
            {search && (
              <button 
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                }} 
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {search && (
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/35 border border-indigo-150 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn">
              <span>Filter: <strong>"{search}"</strong></span>
              <button
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                }}
                className="hover:text-red-500 font-extrabold text-sm ml-2.5 transition cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>        {/* Interactive Table for checkout registry */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead className="interactive-thead border-b border-slate-200 dark:border-slate-800">
                <tr className="text-[11px] font-bold uppercase tracking-wider select-none">
                  <th 
                    className="p-5 pl-8 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th 
                    className="p-5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150"
                    onClick={() => handleSort("item")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Item Details</span>
                      {renderSortIcon("item")}
                    </div>
                  </th>
                  <th 
                    className="p-5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Category / Register</span>
                      {renderSortIcon("category")}
                    </div>
                  </th>
                  <th 
                    className="p-5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150 text-right"
                    onClick={() => handleSort("quantity")}
                  >
                    <div className="flex items-center gap-1 justify-end pr-4">
                      <span>Qty Issued</span>
                      {renderSortIcon("quantity")}
                    </div>
                  </th>
                  <th 
                    className="p-5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150"
                    onClick={() => handleSort("department")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Issuing To</span>
                      {renderSortIcon("department")}
                    </div>
                  </th>
                  <th 
                    className="p-5 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150"
                    onClick={() => handleSort("faculty")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Issued To</span>
                      {renderSortIcon("faculty")}
                    </div>
                  </th>
                  <th 
                    className="p-5 pr-8 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-150"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Issue Date</span>
                      {renderSortIcon("date")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedIssued.length > 0 ? (
                  sortedIssued.map((log) => {
                    const getCategoryBadgeClass = (cat) => {
                      const c = (cat || "").toLowerCase();
                      if (c.includes("electronic")) {
                        return "bg-blue-50 text-blue-750 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/40";
                      }
                      if (c.includes("furniture")) {
                        return "bg-purple-50 text-purple-755 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/40";
                      }
                      if (c.includes("stationery") || c.includes("stationary")) {
                        return "bg-amber-50 text-amber-755 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40";
                      }
                      if (c.includes("sport") || c.includes("cleaning") || c.includes("sanitory")) {
                        return "bg-emerald-50 text-emerald-755 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40";
                      }
                      return "bg-slate-50 text-slate-700 border-slate-200/60 dark:bg-slate-800/35 dark:text-slate-350 dark:border-slate-700";
                    };
                    const badgeClass = getCategoryBadgeClass(log.category);
                    
                    return (
                      <tr 
                        key={log.id} 
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/25 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-600 dark:hover:border-l-cyan-500"
                      >
                        {/* ID */}
                        <td className="p-5 pl-8">
                          <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-cyan-950/35 px-2.5 py-1.5 rounded-xl border border-blue-150/40 dark:border-cyan-900/30 transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-slate-950 group-hover:border-transparent shadow-sm">
                            #IS-{String(log.id).padStart(3, "0")}
                          </span>
                        </td>

                        {/* Item Details */}
                        <td className="p-5">
                          <div className="font-bold text-slate-800 dark:text-white leading-tight group-hover:translate-x-0.5 transition-transform duration-200">
                            {log.item}
                          </div>
                          {log.type && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                              Spec: {log.type}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="p-5">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${badgeClass}`}>
                            {getRegisterForCategory(log.category)}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="p-5 text-right font-black text-slate-800 dark:text-white text-base pr-12">
                          {log.quantity}
                        </td>

                        {/* Issuing To */}
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <FaBuilding className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-500 transition-colors flex-shrink-0 text-sm" />
                            <span>{log.department}</span>
                          </div>
                        </td>

                        {/* Faculty */}
                        <td className="p-5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <FaUserGraduate className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-500 transition-colors flex-shrink-0 text-sm" />
                            <span>{log.faculty}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-5 pr-8">
                          <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 font-bold">
                            <FaCalendarAlt className="text-blue-500 dark:text-cyan-400 flex-shrink-0 text-sm group-hover:scale-110 transition-transform duration-200" />
                            <span>{log.date}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaClipboardList className="text-xl" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350 mb-1">No transaction matches found</h3>
                      <p className="text-slate-450 text-sm max-w-sm mx-auto">Try checking your search spelling or change query filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Item Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-[700px] rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Issue Inventory Assets
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Disburse items from existing stock to departments. System will automatically decrease stock numbers.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
                  <FaExclamationTriangle className="text-base" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Register Selection */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Register / Department</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newReg = e.target.value;
                        setCategory(newReg);
                        
                        const allowedCats = getRegisterCategories(newReg);
                        const regItems = inventory.filter(item => allowedCats.includes((item.category || "").toLowerCase()));
                        const newSubcats = Array.from(new Set(regItems.map((item) => item.subcategory)));
                        const nextSubcat = newSubcats.length > 0 ? newSubcats[0] : "";
                        setSubcategory(nextSubcat);
                        
                        if (nextSubcat) {
                          const newTypes = Array.from(
                            new Set(
                              regItems
                                .filter((item) => (item.subcategory || "").toLowerCase() === nextSubcat.toLowerCase())
                                .map((item) => item.type)
                            )
                          );
                          setType(newTypes.length > 0 ? newTypes[0] : "");
                        } else {
                          setType("");
                        }
                      }}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {registersList.map((reg) => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Selection */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        setSubcategory(newSub);
                        const newTypes = Array.from(
                          new Set(
                            registerItems
                              .filter((item) => (item.subcategory || "").toLowerCase() === newSub.toLowerCase())
                              .map((item) => item.type)
                          )
                        );
                        setType(newTypes.length > 0 ? newTypes[0] : "");
                      }}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {subcategories.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Specific Type (Manual / Autocomplete Suggestion) */}
                  <div className="relative">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Type / Specification</label>
                    <input
                      type="text"
                      placeholder="Enter or select specification"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    />
                    {showSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                        {availableTypes.filter(t => (t || "").toLowerCase().includes(type.toLowerCase())).length > 0 ? (
                          availableTypes
                            .filter(t => (t || "").toLowerCase().includes(type.toLowerCase()))
                            .map((t, idx) => (
                              <div
                                key={idx}
                                onMouseDown={() => {
                                  setType(t);
                                  setShowSuggestions(false);
                                }}
                                className="p-3 hover:bg-slate-100 cursor-pointer text-sm text-slate-800 font-medium transition"
                              >
                                {t}
                              </div>
                            ))
                        ) : (
                          <div className="p-3 text-sm text-slate-400 italic">
                            No matching specifications (type custom)
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity to Issue */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setQuantity("");
                        } else {
                          const parsed = parseInt(val, 10);
                          setQuantity(isNaN(parsed) ? "" : parsed);
                        }
                      }}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                  </div>
                </div>

                {/* Stock Level Informational Banner */}
                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 font-bold">
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="text-sm" />
                    <span>Current Inventory Stock Level:</span>
                  </div>
                  <span>{availableStock} units available</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Issuing To */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Issuing To</label>
                    <input
                      type="text"
                      placeholder="Enter destination / recipient"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
                      required
                    />
                  </div>

                  {/* Faculty Member */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Faculty Name</label>
                    <input
                      type="text"
                      placeholder="Enter faculty member name"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Date and Time (Manual selection) */}
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Issue Date & Time</label>
                  <input
                    type="datetime-local"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 px-6 py-3 rounded-2xl font-semibold cursor-pointer active:scale-95 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-95 transition"
                  >
                    <FaArrowRight />
                    Confirm Asset Disbursement
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}