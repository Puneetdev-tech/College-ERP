import React, { useState } from "react";
import { FaPlus, FaSearch, FaFilePdf, FaClock, FaChevronDown, FaChevronRight, FaHistory, FaFilter, FaFileInvoice, FaEye, FaDownload } from "react-icons/fa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";

const formatDateTime = (dtStr) => {
  if (!dtStr) return "—";
  try {
    const d = new Date(dtStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return dtStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    }) + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dtStr;
  }
};

const CATEGORY_BADGES = {
  "Furniture": "bg-amber-50 text-amber-700 border-amber-150",
  "Electrical": "bg-yellow-50 text-yellow-700 border-yellow-150",
  "Electronics": "bg-cyan-50 text-cyan-700 border-cyan-150",
  "Sanitory": "bg-emerald-50 text-emerald-700 border-emerald-150",
  "Stationary": "bg-blue-50 text-blue-700 border-blue-150",
  "IT,CSE": "bg-indigo-50 text-indigo-700 border-indigo-150",
  "laboratory": "bg-indigo-50 text-indigo-700 border-indigo-150",
  "Sports": "bg-orange-50 text-orange-700 border-orange-150",
  "Miscellaneous": "bg-slate-50 text-slate-700 border-slate-200"
};

const getItemGroup = (name) => {
  const n = (name || "").toLowerCase();
  if (n.includes("pen") && !n.includes("open")) return "Pen";
  if (n.includes("register")) return "Register";
  if (n.includes("paint")) return "Paint";
  if (n.includes("cell")) return "Cell";
  if (n.includes("paper")) return "Paper";
  if (n.includes("envelope")) return "Envelope";
  if (n.includes("marker")) return "Marker";
  if (n.includes("soap") || n.includes("hand wash") || n.includes("handwash")) return "Soap / Hand Wash";
  if (n.includes("dustbin")) return "Dustbin";
  if (n.includes("pipe")) return "Pipe / Fitting";
  if (n.includes("tape")) return "Tape";
  if (n.includes("screw")) return "Screw / Hardware";
  if (n.includes("chair")) return "Chair";
  if (n.includes("desk") || n.includes("table")) return "Desk / Table";
  if (n.includes("computer") || n.includes("pc") || n.includes("desktop")) return "Computer";
  if (n.includes("printer")) return "Printer";
  if (n.includes("phenyl") || n.includes("harpic") || n.includes("cleaner") || n.includes("acid")) return "Cleaners & Disinfectants";
  if (n.includes("pocha") || n.includes("mop") || n.includes("wiper")) return "Mops & Wipers";
  if (n.includes("jharu") || n.includes("broom")) return "Jharu / Broom";
  
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length > 0) {
    const first = words[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return name || "Other";
};

export default function InventoryTable() {
  const { inventory, addInventoryItem, systemSettings, orders, getRegisterForCategory, ledgerHistory } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramCategory = searchParams.get("category");
  const paramDepartment = searchParams.get("department");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState({});
  const [invoiceModalUrl, setInvoiceModalUrl] = useState(null);
  const [invoiceModalName, setInvoiceModalName] = useState("");
  
  // History Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [expandedVariantsHistory, setExpandedVariantsHistory] = useState({});

  const toggleVariantHistory = (subitemId) => {
    setExpandedVariantsHistory(prev => ({ ...prev, [subitemId]: !prev[subitemId] }));
  };

  // Filtering & Sorting States
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Always show all 14 columns directly as requested

  const toggleItem = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Add Item Form states
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [itemType, setItemType] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveItem = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!itemName.trim() || !category.trim() || !subcategory.trim() || !quantity || !unitPrice) {
      setErrorMsg("All fields except Specification are required.");
      return;
    }

    const qty = parseInt(quantity, 10);
    const price = parseFloat(unitPrice);

    if (isNaN(qty) || qty <= 0) {
      setErrorMsg("Quantity must be a positive integer.");
      return;
    }

    if (isNaN(price) || price <= 0) {
      setErrorMsg("Unit Price must be a positive number.");
      return;
    }

    addInventoryItem({
      item: itemName.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      type: itemType.trim() || "Standard",
      stock: qty,
      price: price
    });

    // Show flash notification
    showFlash(
      "success",
      "Item Added to Inventory",
      `${itemName.trim()} (×${qty}) has been added to inventory successfully.`
    );

    setItemName("");
    setCategory("");
    setSubcategory("");
    setQuantity("");
    setUnitPrice("");
    setItemType("");
    setShowModal(false);
  };

  // Filter based on search query, category, and department params
  const filteredInventory = inventory.filter((item) => {
    if (paramCategory) {
      const normItemCat = (item.category || "").toLowerCase().trim();
      const normParamCat = paramCategory.toLowerCase().trim();
      const isStationeryMatch = (normItemCat === "stationary" || normItemCat === "stationery") && (normParamCat === "stationary" || normParamCat === "stationery");
      const isSanitaryMatch = (normItemCat === "sanitory" || normItemCat === "sanitary" || normItemCat === "cleaning") && (normParamCat === "sanitory" || normParamCat === "sanitary" || normParamCat === "cleaning");
      const isExactMatch = normItemCat === normParamCat;
      
      if (!isStationeryMatch && !isSanitaryMatch && !isExactMatch) {
        return false;
      }
    }
    if (paramDepartment) {
      if (getRegisterForCategory(item.category).toLowerCase() !== paramDepartment.toLowerCase()) {
        return false;
      }
    }
    
    // Status Filter
    const itemStatus = item.status || (item.stock <= 4 ? "Low" : item.stock <= 10 ? "Medium" : "Good");
    if (statusFilter !== "all" && itemStatus !== statusFilter) {
      return false;
    }

    // Date Filter
    if (dateFilter !== "all") {
      const itemDateStr = item.updatedAt || item.createdAt;
      if (!itemDateStr) return false;
      const itemDate = new Date(itemDateStr.replace(" ", "T"));
      if (isNaN(itemDate.getTime())) return false;
      
      const now = new Date();
      
      if (dateFilter === "today") {
        const todayStr = now.toDateString();
        if (itemDate.toDateString() !== todayStr) return false;
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        if (itemDate.toDateString() !== yesterdayStr) return false;
      } else if (dateFilter === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (itemDate < oneWeekAgo) return false;
      } else if (dateFilter === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
        if (itemDate < oneMonthAgo) return false;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }
    }

    return (
      (item.item || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.subcategory || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.type || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  // Group by parent item name (dynamically grouped)
  const groupedInventoryMap = {};
  filteredInventory.forEach(item => {
    const key = getItemGroup(item.item || item.subcategory);
    if (!groupedInventoryMap[key]) {
      groupedInventoryMap[key] = [];
    }
    groupedInventoryMap[key].push(item);
  });

  const groupedItems = Object.entries(groupedInventoryMap).map(([parentName, items]) => {
    const totalStock = items.reduce((sum, i) => sum + i.stock, 0);
    const totalValue = items.reduce((sum, i) => sum + (i.stock * i.price), 0);
    const averagePrice = items.length > 0 ? items.reduce((sum, i) => sum + i.price, 0) / items.length : 0;
    
    // Get most recent timestamp
    let mostRecentTime = 0;
    items.forEach(i => {
      const timeStr = i.updatedAt || i.createdAt;
      if (timeStr) {
        const t = new Date(timeStr.replace(" ", "T")).getTime();
        if (t > mostRecentTime) mostRecentTime = t;
      }
    });

    return {
      parentName,
      items,
      totalStock,
      totalValue,
      averagePrice,
      mostRecentTime,
      category: items[0]?.category || "Other"
    };
  });

  const sortedGroupedItems = [...groupedItems].sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.parentName.localeCompare(b.parentName);
    }
    if (sortBy === "name-desc") {
      return b.parentName.localeCompare(a.parentName);
    }
    if (sortBy === "stock-desc") {
      return b.totalStock - a.totalStock;
    }
    if (sortBy === "stock-asc") {
      return a.totalStock - b.totalStock;
    }
    if (sortBy === "value-desc") {
      return b.totalValue - a.totalValue;
    }
    if (sortBy === "value-asc") {
      return a.totalValue - b.totalValue;
    }
    return b.mostRecentTime - a.mostRecentTime;
  });

  // Query order history matching item category, subcategory and specification (type)
  const getOrderHistory = (item) => {
    if (!orders) return [];
    return orders.filter(
      (order) =>
        (order.category || "").toLowerCase() === (item.category || "").toLowerCase() &&
        (order.subcategory || "").toLowerCase() === (item.subcategory || "").toLowerCase() &&
        (order.type || "").toLowerCase() === (item.type || "").toLowerCase()
    );
  };

  // Get orders with invoice attached for an inventory item
  const getOrdersWithInvoice = (item) => {
    return getOrderHistory(item).filter(o => o.invoiceDataUrl);
  };


  // Dynamic metrics calculations based on filtered items
  const totalItems = filteredInventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = filteredInventory.reduce((sum, item) => sum + item.stock * item.price, 0);
  const lowStockCount = filteredInventory.filter((item) => item.stock <= 4).length;
  const categoriesCount = new Set(filteredInventory.map((item) => item.category)).size;

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />

      <div className="ml-64 p-6">

        {/* Print-only layout header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-300 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{systemSettings?.collegeInfo?.name || "RJ Institute of Technology"}</h1>
              <p className="text-xs text-slate-500">{systemSettings?.collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-700">Master Inventory Ledger</h2>
              <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 no-print">
          <h1 className="text-3xl font-bold text-slate-800">
            Inventory Items
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            >
              <FaPlus />
              Add Item
            </button>

            <button
              onClick={() => window.print()}
              className="bg-red-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            >
              <FaFilePdf />
              Export PDF
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 no-print">
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Total Items</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-700 mt-1">{totalItems}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Total Value</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-green-600 mt-1">₹{totalValue.toLocaleString("en-IN")}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Low Stock</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-red-600 mt-1">{lowStockCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium text-xs sm:text-sm">Categories</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-600 mt-1">{categoriesCount}</p>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 no-print">
          {(paramDepartment || paramCategory) && (
            <div className="mb-3 flex flex-wrap gap-2">
              {paramDepartment && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3.5 py-1.5 rounded-xl text-xs font-bold w-fit animate-fadeIn">
                  <span>Register: <strong>{paramDepartment}</strong></span>
                  <button
                    onClick={() => {
                      if (paramCategory) {
                        navigate(`/inventory/items?category=${paramCategory}`);
                      } else {
                        navigate("/inventory/items");
                      }
                    }}
                    className="hover:text-red-650 font-extrabold text-sm ml-2 transition cursor-pointer"
                    title="Clear Register Filter"
                  >
                    ×
                  </button>
                </div>
              )}
              {paramCategory && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-bold w-fit animate-fadeIn">
                  <span>Category: <strong>{paramCategory}</strong></span>
                  <button
                    onClick={() => {
                      if (paramDepartment) {
                        navigate(`/inventory/items?department=${paramDepartment}`);
                      } else {
                        navigate("/inventory/items");
                      }
                    }}
                    className="hover:text-red-600 font-extrabold text-sm ml-2 transition cursor-pointer"
                    title="Clear Category Filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 py-3.5 rounded-xl bg-slate-100 outline-none text-sm font-medium"
              />
            </div>

            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`px-5 py-3 border rounded-xl flex items-center gap-1.5 font-bold cursor-pointer shadow-sm transition text-xs select-none ${
                showFiltersPanel || statusFilter !== "all" || sortBy !== "default" || dateFilter !== "all"
                  ? "bg-blue-50 border-blue-300 text-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FaFilter className="text-xs" />
              <span>Filter</span>
            </button>
          </div>

          {/* Sliding Filters Panel */}
          {showFiltersPanel && (
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl mt-4 shadow-sm space-y-4 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Stock Status Filter
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-650 cursor-pointer font-semibold"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Good">🟢 Good (Stock &gt; 10)</option>
                    <option value="Medium">🟡 Medium (Stock 5 to 10)</option>
                    <option value="Low">🔴 Low (Stock &le; 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sort Categories By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-650 cursor-pointer font-semibold"
                  >
                    <option value="default">Default (Recent Activity)</option>
                    <option value="name-asc">🔤 Category Name: A to Z</option>
                    <option value="name-desc">🔤 Category Name: Z to A</option>
                    <option value="stock-desc">📦 Aggregate Stock: High to Low</option>
                    <option value="stock-asc">📦 Aggregate Stock: Low to High</option>
                    <option value="value-desc">💰 Valuation: High to Low</option>
                    <option value="value-asc">💰 Valuation: Low to High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Filter By Date
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-650 cursor-pointer font-semibold"
                  >
                    <option value="all">Any Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
              </div>

              {dateFilter === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-650 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-650 font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inventory List Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left text-xs uppercase tracking-wider w-16">S No</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Item Group</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Category / Register</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Subcategories</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Total Stock</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Average Price</th>
                <th className="p-4 text-left text-xs uppercase tracking-wider">Total Valuation</th>
                <th className="p-4 text-center text-xs uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedGroupedItems.map((group, index) => {
                const isGroupExpanded = !!expandedItems[group.parentName];
                const badgeClass = CATEGORY_BADGES[group.category] || "bg-slate-50 text-slate-700 border-slate-200";

                return (
                  <React.Fragment key={group.parentName}>
                    <tr
                      className="border-b border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none bg-white text-slate-800"
                      onClick={() => {
                        setExpandedItems(prev => ({ ...prev, [group.parentName]: !prev[group.parentName] }));
                      }}
                    >
                      {/* S No */}
                      <td className="p-4 text-xs font-semibold text-slate-500">
                        {index + 1}
                      </td>
                      {/* Parent Item Name */}
                      <td className="p-4 font-bold text-slate-800 text-sm">
                        <div className="flex items-center gap-2">
                          {isGroupExpanded ? <FaChevronDown className="text-slate-400 text-xs" /> : <FaChevronRight className="text-slate-400 text-xs" />}
                          <span>{group.parentName}</span>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="p-4 text-xs font-semibold">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xl border ${badgeClass}`}>
                          {getRegisterForCategory(group.category)}
                        </span>
                      </td>
                      {/* Subcategories count */}
                      <td className="p-4 text-xs font-semibold text-slate-600">
                        {group.items.length} variant{group.items.length > 1 ? "s" : ""}
                      </td>
                      {/* Total Stock */}
                      <td className="p-4 text-xs font-bold text-slate-700">
                        {group.totalStock}
                      </td>
                      {/* Average price */}
                      <td className="p-4 text-xs font-bold text-slate-700">
                        ₹{group.averagePrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      {/* Total valuation */}
                      <td className="p-4 text-xs font-extrabold text-slate-800">
                        ₹{group.totalValue.toLocaleString("en-IN")}
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          {isGroupExpanded ? "Collapse" : "View Variants"}
                        </button>
                      </td>
                    </tr>

                    {/* Subcategories (Variants) Expanded Section */}
                    {isGroupExpanded && (
                      <tr className="bg-slate-50/70 border-b border-slate-200">
                        <td colSpan={8} className="p-4 pl-12 pr-6">
                          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                <tr>
                                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Subcategory / Variant</th>
                                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Specification</th>
                                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Unit Rate</th>
                                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Current Stock</th>
                                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Status</th>
                                  <th className="p-3 text-xs font-bold uppercase tracking-wider">Valuation</th>
                                  <th className="p-3 text-center text-xs font-bold uppercase tracking-wider w-40">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {group.items.map((subitem) => {
                                  const valuation = subitem.stock * subitem.price;
                                  const variantHistory = [...(ledgerHistory || [])]
                                    .filter(
                                      (log) =>
                                        (log.subcategory || "").toLowerCase() === (subitem.subcategory || "").toLowerCase() &&
                                        (log.type || "").toLowerCase() === (subitem.type || "").toLowerCase()
                                    )
                                    .sort((a, b) => new Date(String(b.date || b.createdAt).replace(" ", "T")).getTime() - new Date(String(a.date || a.createdAt).replace(" ", "T")).getTime());

                                  return (
                                    <React.Fragment key={subitem.id}>
                                      <tr 
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer select-none"
                                        onClick={() => toggleVariantHistory(subitem.id)}
                                      >
                                        <td className="p-3 text-xs font-bold text-slate-800">
                                          <div className="flex items-center gap-1.5">
                                            {expandedVariantsHistory[subitem.id] ? <FaChevronDown className="text-[9px] text-slate-400" /> : <FaChevronRight className="text-[9px] text-slate-400" />}
                                            <span>{subitem.subcategory}</span>
                                          </div>
                                        </td>
                                        <td className="p-3 text-xs font-mono text-slate-500">
                                          {subitem.type || "—"}
                                        </td>
                                        <td className="p-3 text-xs font-semibold text-slate-700">
                                          ₹{subitem.price.toLocaleString("en-IN")}
                                        </td>
                                        <td className="p-3 text-xs font-bold text-slate-800">
                                          {subitem.stock}
                                        </td>
                                        <td className="p-3 text-xs">
                                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wide ${
                                            subitem.stock <= 4 ? "bg-red-500" : subitem.stock <= 10 ? "bg-yellow-500" : "bg-green-500"
                                          }`}>
                                            {subitem.stock <= 4 ? "Low" : subitem.stock <= 10 ? "Medium" : "Good"}
                                          </span>
                                        </td>
                                        <td className="p-3 text-xs font-bold text-slate-900">
                                          ₹{valuation.toLocaleString("en-IN")}
                                        </td>
                                        <td className="p-3 text-center flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedVariant(subitem);
                                              setShowHistoryModal(true);
                                            }}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                                          >
                                            <FaHistory className="text-[10px]" />
                                            <span>Ledger History</span>
                                          </button>
                                        </td>
                                      </tr>
                                      {expandedVariantsHistory[subitem.id] && (
                                        <tr>
                                          <td colSpan={7} className="p-3 bg-slate-50/30">
                                            <div className="pl-6 pr-4 py-3 bg-white rounded-xl border border-slate-150 shadow-sm space-y-2">
                                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transaction Activity History</p>
                                              {variantHistory.length > 0 ? (
                                                <div className="space-y-1.5">
                                                  {variantHistory.slice(0, 5).map((log, idx) => {
                                                    const isIssue = log.quantity < 0;
                                                    return (
                                                      <div key={idx} className="flex justify-between items-center text-xs font-medium py-1 border-b border-slate-100 last:border-b-0">
                                                        <span className="text-slate-500">{formatDateTime(log.date)}</span>
                                                        <span className="text-slate-700">
                                                          {isIssue ? `Issued to ${log.dealerName}` : `Received from ${log.dealerName}`}
                                                        </span>
                                                        <span className={`font-bold ${isIssue ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                          {isIssue ? `${log.quantity} units` : `+${log.quantity} units`}
                                                        </span>
                                                      </div>
                                                    );
                                                  })}
                                                  {variantHistory.length > 5 && (
                                                    <p className="text-[9px] text-indigo-600 font-bold italic pt-1">
                                                      * Showing latest 5 entries. Click 'Ledger History' button for full logs.
                                                    </p>
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-xs text-slate-400 italic">No transaction history found for this variant.</p>
                                              )}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sortedGroupedItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic font-semibold text-sm">
                    No items found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white w-[500px] rounded-3xl p-8 shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              Add Inventory Item
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Item Name</label>
                <input
                  placeholder="e.g. Laser Printer, A4 Sheets"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                  <input
                    placeholder="e.g. Electronics, Stationery"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subcategory</label>
                  <input
                    placeholder="e.g. Printer, Paper"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    placeholder="Price"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Specification / Type</label>
                <input
                  placeholder="e.g. LaserJet, 80GSM White, i5 16GB"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrorMsg("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-5 py-2.5 rounded-xl cursor-pointer transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Lightbox Modal */}
      {invoiceModalUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => { setInvoiceModalUrl(null); setInvoiceModalName(""); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <FaFileInvoice size={20} />
                <div>
                  <h3 className="font-bold text-sm">Invoice Viewer</h3>
                  <p className="text-indigo-200 text-xs">{invoiceModalName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={invoiceModalUrl}
                  download={invoiceModalName}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl text-xs font-bold cursor-pointer transition"
                  title="Download Invoice"
                >
                  <FaDownload size={10} /> Download
                </a>
                <button
                  onClick={() => { setInvoiceModalUrl(null); setInvoiceModalName(""); }}
                  className="p-2 bg-white/15 hover:bg-white/30 rounded-xl transition cursor-pointer border border-white/20 text-white font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="flex-1 overflow-auto p-4 bg-slate-50">
              {invoiceModalUrl.startsWith("data:image/") ? (
                <img
                  src={invoiceModalUrl}
                  alt="Invoice"
                  className="max-w-full mx-auto rounded-xl shadow-lg border border-slate-200"
                />
              ) : invoiceModalUrl.startsWith("data:application/pdf") ? (
                <iframe
                  src={invoiceModalUrl}
                  className="w-full h-[70vh] rounded-xl border border-slate-200"
                  title="Invoice PDF"
                />
              ) : (
                <div className="text-center py-12">
                  <FaFileInvoice size={48} className="mx-auto text-indigo-300 mb-4" />
                  <p className="text-slate-500 font-semibold mb-4">Preview not available for this file type.</p>
                  <a
                    href={invoiceModalUrl}
                    download={invoiceModalName}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition cursor-pointer"
                  >
                    <FaDownload /> Download Invoice
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 14-Column Ledger History Modal */}
      {showHistoryModal && selectedVariant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-[95vw] max-h-[90vh] flex flex-col border border-slate-100 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 bg-gradient-to-r from-blue-700 to-indigo-850 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                  <FaHistory size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Ledger Transaction History</h3>
                  <p className="text-blue-200 text-xs mt-0.5 font-semibold">
                    {selectedVariant.item} &raquo; <span className="text-white">{selectedVariant.subcategory}</span> ({selectedVariant.type || "Nos."})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 font-mono select-none uppercase tracking-wide"
                >
                  Print Ledger
                </button>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedVariant(null);
                  }}
                  className="p-2 bg-white/15 hover:bg-white/30 rounded-xl transition cursor-pointer border border-white/20 text-white font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6 bg-slate-50">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 text-left w-12">S No</th>
                      <th className="p-3 text-left w-28">Date</th>
                      <th className="p-3 text-left">Name of Item</th>
                      <th className="p-3 text-left w-24">Bill Number</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-left">Dealer Name</th>
                      <th className="p-3 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white">
                    {(() => {
                      const historyData = [...(ledgerHistory || [])]
                        .filter(
                          (log) =>
                            (log.subcategory || "").toLowerCase() === (selectedVariant.subcategory || "").toLowerCase() &&
                            (log.type || "").toLowerCase() === (selectedVariant.type || "").toLowerCase()
                        )
                        // Sort chronologically oldest-to-newest for registry books
                        .sort((a, b) => {
                          const dateA = new Date(String(a.date || a.createdAt).replace(" ", "T")).getTime();
                          const dateB = new Date(String(b.date || b.createdAt).replace(" ", "T")).getTime();
                          return dateA - dateB;
                        });

                      if (historyData.length === 0) {
                        return (
                          <tr>
                            <td colSpan={14} className="p-8 text-center text-slate-400 italic font-semibold">
                              No ledger transaction history found for this variant.
                            </td>
                          </tr>
                        );
                      }

                      return historyData.map((log, index) => {
                        const dateStr = log.date || log.createdAt || "—";
                        const formattedDate = formatDateTime(dateStr);
                        const quantity = log.quantity !== undefined ? log.quantity : log.stock;
                        const unitRate = log.price;
                        const amount = log.amount !== undefined ? log.amount : (quantity * unitRate);
                        const dealerName = log.dealerName || "—";
                        const remarks = log.remarks || "—";
                        const billNumber = log.billNumber || "—";

                        return (
                          <tr key={log.id || index} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-semibold text-slate-400 text-center">{index + 1}</td>
                            <td className="p-3 whitespace-nowrap font-medium text-slate-650">{formattedDate}</td>
                            <td className="p-3 font-bold text-slate-800">{log.subcategory}</td>
                            <td className="p-3 font-mono font-semibold text-slate-600">{billNumber}</td>
                            <td className="p-3 text-right font-semibold text-slate-700">{quantity}</td>
                            <td className="p-3 text-right font-semibold text-slate-700">₹{unitRate.toLocaleString("en-IN")}</td>
                            <td className="p-3 text-right font-bold text-slate-800">₹{amount.toLocaleString("en-IN")}</td>
                            <td className="p-3 text-slate-700 font-medium">{dealerName}</td>
                            <td className="p-3 italic text-slate-500 max-w-[200px] truncate" title={remarks}>{remarks}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="px-8 py-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedVariant(null);
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl transition cursor-pointer text-xs"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
