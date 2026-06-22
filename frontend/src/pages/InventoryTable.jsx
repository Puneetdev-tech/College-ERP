import React, { useState } from "react";
import { FaPlus, FaSearch, FaFilePdf, FaClock, FaChevronDown, FaChevronRight, FaHistory, FaFilter } from "react-icons/fa";
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

export default function InventoryTable() {
  const { inventory, addInventoryItem, systemSettings, orders, getRegisterForCategory } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramCategory = searchParams.get("category");
  const paramDepartment = searchParams.get("department");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  
  // Filtering & Sorting States
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

    return (
      (item.item || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.subcategory || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.type || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  // Grouping logic for items in filteredInventory
  // Group by item.subcategory (case-insensitive key normalization, e.g., "chair" or "desk")
  const groupedInventory = {};
  filteredInventory.forEach((item) => {
    const rawSubcategory = item.subcategory || "Other";
    const subcatKey = rawSubcategory.trim().toLowerCase();
    if (!groupedInventory[subcatKey]) {
      groupedInventory[subcatKey] = {
        key: subcatKey,
        subcategory: rawSubcategory,
        category: item.category,
        items: [],
        totalStock: 0,
        totalValue: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
        status: "Good",
        updatedAt: null,
        createdAt: null,
      };
    }

    const group = groupedInventory[subcatKey];
    group.items.push(item);
    group.totalStock += item.stock;
    group.totalValue += item.stock * item.price;
    if (item.price < group.minPrice) group.minPrice = item.price;
    if (item.price > group.maxPrice) group.maxPrice = item.price;

    // Date calculations
    if (item.updatedAt) {
      if (!group.updatedAt || new Date(item.updatedAt.replace(" ", "T")) > new Date(group.updatedAt.replace(" ", "T"))) {
        group.updatedAt = item.updatedAt;
      }
    }
    if (item.createdAt) {
      if (!group.createdAt || new Date(item.createdAt.replace(" ", "T")) > new Date(group.createdAt.replace(" ", "T"))) {
        group.createdAt = item.createdAt;
      }
    }
  });

  // Post-process statuses and prices for each group
  Object.values(groupedInventory).forEach((group) => {
    let hasLow = false;
    let hasMedium = false;
    group.items.forEach((it) => {
      if (it.status === "Low" || it.stock <= 4) {
        hasLow = true;
      } else if (it.status === "Medium" || it.stock <= 10) {
        hasMedium = true;
      }
    });
    group.status = hasLow ? "Low" : hasMedium ? "Medium" : "Good";
  });

  const groupsList = Object.values(groupedInventory);
  groupsList.sort((a, b) => {
    if (sortBy === "name-asc") {
      return a.subcategory.localeCompare(b.subcategory);
    }
    if (sortBy === "name-desc") {
      return b.subcategory.localeCompare(a.subcategory);
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

    const dateA = a.updatedAt || a.createdAt || "";
    const dateB = b.updatedAt || b.createdAt || "";
    if (dateA && dateB) {
      return new Date(dateB.replace(" ", "T")) - new Date(dateA.replace(" ", "T"));
    }
    if (dateA) return -1;
    if (dateB) return 1;
    return a.subcategory.localeCompare(b.subcategory);
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
                showFiltersPanel || statusFilter !== "all" || sortBy !== "default"
                  ? "bg-blue-50 border-blue-300 text-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-55"
              }`}
            >
              <FaFilter className="text-xs" />
              <span>Filter</span>
            </button>
          </div>

          {/* Sliding Filters Panel */}
          {showFiltersPanel && (
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl mt-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-down">
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
            </div>
          )}
        </div>

        {/* Inventory List Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left">Item Details</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Unit Price</th>
                <th className="p-4 text-left">Total Price</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date Added / Updated</th>
              </tr>
            </thead>

            <tbody>
              {groupsList.map((group) => {
                const isGroupExpanded = !!(expandedGroups[group.key] || search.trim().length > 0);
                const minP = group.minPrice;
                const maxP = group.maxPrice;
                const priceDisplay = minP === maxP 
                  ? `₹${minP.toLocaleString("en-IN")}` 
                  : `₹${minP.toLocaleString("en-IN")} - ₹${maxP.toLocaleString("en-IN")}`;

                // Sort items inside the group by activity date or name
                const sortedItems = [...group.items].sort((a, b) => {
                  const dateA = a.updatedAt || a.createdAt || "";
                  const dateB = b.updatedAt || b.createdAt || "";
                  if (dateA && dateB) {
                    return new Date(dateB.replace(" ", "T")) - new Date(dateA.replace(" ", "T"));
                  }
                  if (dateA) return -1;
                  if (dateB) return 1;
                  return a.item.localeCompare(b.item);
                });

                return (
                  <React.Fragment key={group.key}>
                    {/* Parent Row */}
                    <tr
                      className="border-b bg-slate-50/50 hover:bg-slate-100/50 transition duration-150 cursor-pointer"
                      onClick={() => toggleGroup(group.key)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          {isGroupExpanded ? (
                            <FaChevronDown className="text-blue-600 flex-shrink-0 text-sm" />
                          ) : (
                            <FaChevronRight className="text-slate-400 flex-shrink-0 text-sm" />
                          )}
                          <span className="capitalize">{group.subcategory}</span>
                          <span className="ml-2 text-[10px] font-bold text-slate-500 bg-slate-200/60 border border-slate-300/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {group.items.length} spec{group.items.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          CATEGORY_BADGES[group.category] || "bg-blue-50 text-blue-600 border-blue-150"
                        }`}>
                          {group.category}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-slate-700">{group.totalStock}</td>
                      <td className="p-4 text-slate-600 font-medium">{priceDisplay}</td>
                      <td className="p-4 font-extrabold text-slate-800">₹{group.totalValue.toLocaleString("en-IN")}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white font-semibold text-xs
                          ${
                            group.status === "Good"
                              ? "bg-green-500"
                              : group.status === "Medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        >
                          {group.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FaClock className="text-slate-400 flex-shrink-0" />
                          <span>
                            {group.updatedAt
                              ? <><span className="text-blue-500 font-semibold">Updated: </span>{formatDateTime(group.updatedAt)}</>
                              : group.createdAt
                              ? formatDateTime(group.createdAt)
                              : "—"
                            }
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Child Rows (Specifications) */}
                    {isGroupExpanded &&
                      sortedItems.map((item) => {
                        const isItemExpanded = !!expandedItems[item.id];
                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              className="border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer select-none bg-slate-50/20"
                              onClick={(e) => {
                                toggleItem(item.id);
                              }}
                            >
                              <td className="p-4 pl-10">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-1.5 h-6 bg-blue-300 rounded-full flex-shrink-0" />
                                  <div>
                                    <div className="font-bold text-slate-850 flex items-center gap-2">
                                      <span>{item.item}</span>
                                      <span className="text-xs text-slate-400 font-normal font-mono bg-slate-100 border px-1.5 py-0.5 rounded">
                                        Spec: {item.type}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium hover:text-indigo-650 transition flex items-center gap-1">
                                      <FaHistory className="text-slate-350" />
                                      <span>Click to view order history</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-xs text-slate-450 pl-6 font-medium">
                                {item.category}
                              </td>
                              <td className="p-4 font-bold text-slate-650">{item.stock}</td>
                              <td className="p-4 text-slate-600">₹{item.price.toLocaleString("en-IN")}</td>
                              <td className="p-4 font-bold text-slate-700">₹{(item.stock * item.price).toLocaleString("en-IN")}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-white font-semibold text-[10px]
                                  ${
                                    item.status === "Good"
                                      ? "bg-green-500/85"
                                      : item.status === "Medium"
                                      ? "bg-yellow-500/85"
                                      : "bg-red-500/85"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                  <FaClock className="text-slate-350 flex-shrink-0" />
                                  <span>
                                    {item.updatedAt
                                      ? <><span className="text-blue-400 font-semibold">Updated: </span>{formatDateTime(item.updatedAt)}</>
                                      : item.createdAt
                                      ? formatDateTime(item.createdAt)
                                      : "—"
                                    }
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {/* Nested Order History */}
                            {isItemExpanded && (
                              <tr className="bg-slate-100/30">
                                <td colSpan={7} className="p-4 pl-12 pr-6">
                                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                                      <FaHistory className="text-indigo-500 text-sm" />
                                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                                        Order history for <span className="text-indigo-600">{item.item}</span> — {item.type}
                                      </h4>
                                    </div>

                                    {getOrderHistory(item).length > 0 ? (
                                      <div className="relative border-l-2 border-indigo-100 pl-4 ml-2 space-y-4 py-1">
                                        {getOrderHistory(item).map((order) => (
                                          <div
                                            key={order.id}
                                            className="relative before:absolute before:-left-[21px] before:top-1.5 before:w-2.5 before:h-2.5 before:rounded-full before:bg-indigo-400 before:border-2 before:border-white animate-fadeIn"
                                          >
                                            <div className="flex flex-wrap justify-between items-start gap-2 text-xs">
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="font-bold text-slate-700">Order Ref: #{order.id}</span>
                                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${
                                                    order.status === "Received" ? "bg-green-50 border-green-200 text-green-700" :
                                                    order.status === "Partially Received" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                                    order.status === "Approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                                    order.status === "Rejected" ? "bg-rose-50 border-rose-250 text-rose-700" :
                                                    "bg-yellow-50 border-yellow-200 text-yellow-700"
                                                  }`}>
                                                    {order.status}
                                                  </span>
                                                </div>
                                                <p className="text-slate-500 mt-1">
                                                  Supplier: <strong className="text-slate-700">{order.supplier}</strong>
                                                </p>
                                                <p className="text-slate-400 text-[10px] mt-0.5">
                                                  Requested by {order.faculty || order.placedBy || "Store"} for {order.department}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-bold text-slate-700">
                                                  {order.quantity} unit{order.quantity > 1 ? "s" : ""} @ ₹{order.pricePerUnit?.toLocaleString("en-IN")}/unit
                                                </p>
                                                {(order.receivedQuantity !== undefined || order.status === "Partially Received") && (
                                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                                    Rec: <span className="text-emerald-600 font-bold">{order.receivedQuantity || 0}</span> | Pend: <span className="text-amber-600 font-bold">{order.pendingQuantity !== undefined ? order.pendingQuantity : (order.quantity - (order.receivedQuantity || 0))}</span>
                                                  </p>
                                                )}
                                                <p className="font-extrabold text-indigo-650 text-sm mt-0.5">
                                                  Total: ₹{(order.quantity * (order.pricePerUnit || 0)).toLocaleString("en-IN")}
                                                </p>
                                                <p className="text-slate-400 text-[10px] font-mono mt-1">
                                                  Date Placed: {formatDateTime(order.orderDate)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-xs font-semibold text-slate-400 italic">
                                        No purchase orders found for this specification.
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </React.Fragment>
                );
              })}
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
    </div>
  );
}
