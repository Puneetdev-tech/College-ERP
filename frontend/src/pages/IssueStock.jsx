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
  FaCalendarAlt
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

export default function IssueStock() {
  const { inventory, issuedStock, issueStockItem } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState(searchParamVal);

  // Sync state if URL query changes
  useEffect(() => {
    setSearch(searchParamVal);
  }, [searchParamVal]);

  // Form states
  const [category, setCategory] = useState("Electronics");
  const [subcategory, setSubcategory] = useState("Computer");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState("IT Department");
  const [faculty, setFaculty] = useState("");
  const [issueDate, setIssueDate] = useState(getCurrentDateTimeString());

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Unique categories in inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Subcategories based on selected category
  const subcategories = Array.from(
    new Set(
      inventory
        .filter((item) => (item.category || "").toLowerCase() === (category || "").toLowerCase())
        .map((item) => item.subcategory)
    )
  );

  // Types based on selected category & subcategory
  const availableTypes = Array.from(
    new Set(
      inventory
        .filter((item) => (item.category || "").toLowerCase() === (category || "").toLowerCase() && (item.subcategory || "").toLowerCase() === (subcategory || "").toLowerCase())
        .map((item) => item.type)
    )
  );

  // Find matching inventory item to show current stock
  const matchingItem = inventory.find(
    (item) =>
      (item.category || "").toLowerCase() === (category || "").toLowerCase() &&
      (item.subcategory || "").toLowerCase() === (subcategory || "").toLowerCase() &&
      (item.type || "").toLowerCase() === (type || "").trim().toLowerCase()
  );
  const availableStock = matchingItem ? matchingItem.stock : 0;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!subcategory) {
      setErrorMsg("Please select a subcategory.");
      return;
    }
    if (!type.trim()) {
      setErrorMsg("Please enter the specific item type.");
      return;
    }
    if (quantity <= 0) {
      setErrorMsg("Quantity must be at least 1.");
      return;
    }
    if (!faculty.trim()) {
      setErrorMsg("Please enter the faculty name.");
      return;
    }

    if (!matchingItem) {
      setErrorMsg("This specific item type does not exist in inventory for the selected category & subcategory.");
      return;
    }

    if (quantity > availableStock) {
      setErrorMsg(`Insufficient stock! Only ${availableStock} units available.`);
      return;
    }

    const formattedDate = formatDateTime(issueDate);

    // Trigger context action
    const res = await issueStockItem({
      category,
      subcategory,
      type: type.trim(),
      quantity: parseInt(quantity, 10),
      department,
      faculty,
      date: formattedDate
    });

    if (res.success) {
      setSuccessMsg("Stock disbursed successfully!");
      // Reset form fields
      setQuantity(1);
      setType("");
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
              if (categories.length > 0) {
                const defaultCat = categories[0];
                setCategory(defaultCat);
                const subcats = Array.from(
                  new Set(
                    inventory
                      .filter((item) => item.category === defaultCat)
                      .map((item) => item.subcategory)
                  )
                );
                const defaultSub = subcats.length > 0 ? subcats[0] : "";
                setSubcategory(defaultSub);
                if (defaultSub) {
                  const types = Array.from(
                    new Set(
                      inventory
                        .filter((item) => item.category === defaultCat && item.subcategory === defaultSub)
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
        </div>
        {/* Redesigned Cards Grid for checkout registry */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssued.length > 0 ? (
            filteredIssued.map((log) => {
              // Get category-specific gradient color box
              const getCategoryColorClass = (cat) => {
                const c = (cat || "").toLowerCase();
                if (c.includes("electronic")) {
                  return "bg-gradient-to-br from-blue-50 to-indigo-100/60 dark:from-blue-950/20 dark:to-indigo-900/35 border-blue-150 dark:border-blue-900/40 shadow-blue-500/5";
                }
                if (c.includes("furniture")) {
                  return "bg-gradient-to-br from-purple-50 to-pink-100/60 dark:from-purple-950/20 dark:to-pink-900/35 border-purple-150 dark:border-purple-900/40 shadow-purple-500/5";
                }
                if (c.includes("stationery")) {
                  return "bg-gradient-to-br from-amber-50 to-orange-100/60 dark:from-amber-950/20 dark:to-orange-900/35 border-amber-150 dark:border-amber-900/40 shadow-amber-500/5";
                }
                if (c.includes("sport")) {
                  return "bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-emerald-950/20 dark:to-teal-900/35 border-emerald-150 dark:border-emerald-900/40 shadow-emerald-500/5";
                }
                return "bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-900/20 dark:to-slate-800/35 border-slate-200/60 dark:border-slate-850 shadow-slate-500/5";
              };
              const colorClass = getCategoryColorClass(log.category);
              
              return (
                <div 
                  key={log.id} 
                  className={`card-3d border rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between min-h-[260px] ${colorClass}`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold font-mono text-indigo-600 dark:text-cyan-450 bg-white/70 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-indigo-100/30 dark:border-indigo-900/30">
                        #IS-{String(log.id).padStart(3, "0")}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 bg-white/70 dark:bg-slate-950/40 px-2.5 py-1 rounded-lg">
                        {log.category}
                      </span>
                    </div>

                    {/* Card Main Info */}
                    <h3 className="text-lg font-black text-slate-850 dark:text-white leading-tight">{log.item}</h3>
                    {log.type && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">Spec: {log.type}</p>
                    )}

                    {/* Quantity Display with background bubble */}
                    <div className="my-4 flex items-center gap-3">
                      <span className="text-3xl font-black text-slate-800 dark:text-white">{log.quantity}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Units Issued</span>
                    </div>
                  </div>

                  {/* Card Footer Details */}
                  <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4 mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-350">
                      <FaBuilding className="text-slate-500 dark:text-slate-400 text-sm flex-shrink-0" />
                      <span className="font-semibold">{log.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                        <FaUserGraduate className="text-slate-500 dark:text-slate-400 text-sm flex-shrink-0" />
                        <span>{log.faculty}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-450 text-[10px] font-semibold">
                        <FaCalendarAlt />
                        <span>{log.date ? log.date.split(" ")[0] : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white border border-slate-100 dark:border-slate-805 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClipboardList className="text-xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No transaction matches found</h3>
              <p className="text-slate-450 text-sm max-w-sm mx-auto">Try checking your search spelling or change query filters.</p>
            </div>
          )}
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
                  {/* Category Selection */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const newSubcats = Array.from(
                          new Set(
                            inventory
                              .filter((item) => item.category === newCat)
                              .map((item) => item.subcategory)
                          )
                        );
                        const nextSubcat = newSubcats.length > 0 ? newSubcats[0] : "";
                        setSubcategory(nextSubcat);
                        
                        const newTypes = Array.from(
                          new Set(
                            inventory
                              .filter((item) => item.category === newCat && item.subcategory === nextSubcat)
                              .map((item) => item.type)
                          )
                        );
                        setType(newTypes.length > 0 ? newTypes[0] : "");
                      }}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
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
                            inventory
                              .filter((item) => item.category === category && item.subcategory === newSub)
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
                  {/* Specific Type (Dynamic Dropdown) */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Type / Specification</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer text-slate-800"
                    >
                      <option value="">-- Select Type --</option>
                      {availableTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity to Issue */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
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
                  {/* Department */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
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