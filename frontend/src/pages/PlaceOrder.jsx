import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  FaPlus, 
  FaShoppingBag, 
  FaClock, 
  FaCheckDouble, 
  FaWarehouse,
  FaSearch,
  FaTimes,
  FaArrowRight,
  FaExclamationTriangle
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";



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

export default function PlaceOrder() {
  const { inventory, orders, placeOrderItem, systemSettings, inventoryCategories } = useStore();
  const departmentsList = inventoryCategories.map(c => c.name);
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";

  const [showModal, setShowModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);

  const handleOpenTracking = (order) => {
    setSelectedTrackingOrder(order);
    setShowTrackingModal(true);
  };
  const [search, setSearch] = useState(searchParamVal);

  // Sync state if URL query changes
  useEffect(() => {
    setSearch(searchParamVal);
  }, [searchParamVal]);

  // Form state
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("Electronics");

  // Subcategory list based on selected category
  const subcategories = Array.from(
    new Set(
      inventory
        .filter((i) => (i.category || "").toLowerCase() === (category || "").toLowerCase())
        .map((i) => i.subcategory)
    )
  );

  const [subcategory, setSubcategory] = useState(subcategories[0] || "");
  const [isCustomSubcat, setIsCustomSubcat] = useState(subcategories.length === 0);
  const [customSubcat, setCustomSubcat] = useState("");

  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [orderDate, setOrderDate] = useState(getCurrentDateTimeString());
  const [department, setDepartment] = useState("IT,CSE");
  const [faculty, setFaculty] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const newSubcats = Array.from(
      new Set(
        inventory
          .filter((i) => (i.category || "").toLowerCase() === (newCat || "").toLowerCase())
          .map((i) => i.subcategory)
      )
    );
    if (newSubcats.length > 0) {
      setSubcategory(newSubcats[0]);
      setIsCustomSubcat(false);
    } else {
      setSubcategory("");
      setIsCustomSubcat(true);
    }
    setCustomSubcat("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const finalSubcat = isCustomSubcat ? customSubcat.trim() : subcategory.trim();

    if (
      !supplier.trim() ||
      !item.trim() ||
      !category.trim() ||
      !finalSubcat ||
      !quantity ||
      !pricePerUnit ||
      !orderDate ||
      !department.trim() ||
      !faculty.trim()
    ) {
      setErrorMsg("All fields are required.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg("Quantity must be a positive integer.");
      return;
    }

    const unitPrice = parseFloat(pricePerUnit);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      setErrorMsg("Price per unit must be a positive number.");
      return;
    }

    const res = await placeOrderItem({
      supplier: supplier.trim(),
      item: item.trim(),
      category: category.trim(),
      subcategory: finalSubcat,
      type: type.trim() || "Standard",
      quantity: qty,
      pricePerUnit: unitPrice,
      orderDate: orderDate.replace("T", " "),
      department: department.trim(),
      faculty: faculty.trim()
    });

    if (res.success) {
      // Flash message
      showFlash(
        "success",
        "Purchase Order Placed",
        `Order for ${qty} × ${item.trim()} placed successfully and sent for approval.`
      );
    } else {
      setErrorMsg(res.message || "Failed to place order");
      return;
    }

    setSupplier("");
    setItem("");
    setCategory("Electronics");
    // Reset to electronics subcategories
    const defaultSubcats = Array.from(
      new Set(
        inventory
          .filter((i) => (i.category || "").toLowerCase() === "electronics")
          .map((i) => i.subcategory)
      )
    );
    if (defaultSubcats.length > 0) {
      setSubcategory(defaultSubcats[0]);
      setIsCustomSubcat(false);
    } else {
      setSubcategory("");
      setIsCustomSubcat(true);
    }
    setCustomSubcat("");
    setType("");
    setQuantity("");
    setPricePerUnit("");
    setOrderDate(getCurrentDateTimeString());
    setDepartment("IT Department");
    setFaculty("");
    setShowModal(false);
  };

  // Metrics
  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const approvedCount = orders.filter((o) => o.status === "Approved").length;
  const completedCount = orders.filter((o) => o.status === "Received").length;
  const uniqueSuppliers = new Set(orders.map((o) => o.supplier)).size;

  // Filter orders matching search
  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const s = (search || "").toLowerCase();
    return (
      (o.id || "").toLowerCase().includes(s) ||
      (o.supplier || "").toLowerCase().includes(s) ||
      (o.item || "").toLowerCase().includes(s) ||
      (o.category || "").toLowerCase().includes(s) ||
      (o.subcategory || "").toLowerCase().includes(s) ||
      (o.status || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Purchase Order Hub
            </h1>
            <p className="text-slate-500 mt-1 dark:text-slate-400">
              Draft procurement requests, manage vendor agreements, and track order approvals.
            </p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setOrderDate(getCurrentDateTimeString());
            }}
            className="group bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold px-6 py-3.5 rounded-2xl flex gap-2.5 items-center cursor-pointer shadow-lg shadow-blue-500/10 dark:shadow-cyan-500/10 active:scale-95 transition-all"
          >
            <FaPlus className="text-sm transition-transform duration-300 group-hover:rotate-90" />
            Create Purchase Order
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="group card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 dark:bg-blue-500" />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <FaShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalOrders}</h3>
            </div>
          </div>

          <div className="group card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500 dark:bg-yellow-400 animate-pulse" />
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-450 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <FaClock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{pendingCount}</h3>
            </div>
          </div>

          <div className="group card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 dark:bg-emerald-400" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <FaCheckDouble size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Orders</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{approvedCount}</h3>
            </div>
          </div>

          <div className="group card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 dark:bg-indigo-500" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <FaWarehouse size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Suppliers</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{uniqueSuppliers}</h3>
            </div>
          </div>

        </div>

        {/* Dynamic Search & Filter Controls */}
        <div className="bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter order logs..."
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

        {/* Orders Table Container */}
        <div className="bg-white rounded-3xl border border-slate-100 dark:border-slate-850 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Issued Purchase Orders Registry</h2>
            <p className="text-slate-400 text-xs mt-0.5">Real-time status updates and order approval states.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="interactive-thead border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Supplier</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Item Details</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Department</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Faculty Member</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Specification</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Per Unit Cost</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Total Cost</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Order Date</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider no-print">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="interactive-table-row hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors duration-150"
                    >
                      <td className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-400">#{order.id}</td>
                      <td className="p-4 text-sm font-medium text-slate-800 dark:text-slate-100">{order.supplier}</td>
                      <td className="p-4 text-sm">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{order.item}</div>
                        <div className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5">{order.category} &gt; {order.subcategory}</div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{order.department || "N/A"}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{order.faculty || "N/A"}</td>
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{order.type || "Standard"}</td>
                      <td className="p-4 text-sm font-bold text-slate-800 dark:text-slate-100">{order.quantity}</td>
                      <td className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-100">₹{order.pricePerUnit?.toLocaleString()}</td>
                      <td className="p-4 text-sm font-bold text-slate-850 dark:text-slate-100">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">{formatDateTime(order.orderDate)}</td>
                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                            order.status === "Pending"
                              ? "bg-yellow-50/80 border-yellow-250 text-yellow-600 dark:bg-yellow-950/20 dark:border-yellow-900 dark:text-yellow-400"
                              : order.status === "Approved"
                              ? "bg-emerald-50/80 border-emerald-250 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-450"
                              : order.status === "Rejected"
                              ? "bg-rose-50/80 border-rose-250 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-455"
                              : "bg-blue-50/80 border-blue-250 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-center no-print">
                        <button
                          onClick={() => handleOpenTracking(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow hover:scale-105 active:scale-95 whitespace-nowrap duration-200"
                        >
                          Track & Print
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="p-10 text-center text-sm font-semibold text-slate-400">
                      No purchase orders found matching this search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Purchase Order Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-[650px] rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-850 dark:text-white">
                  Draft Purchase Request
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Please fill out details to draft an official order. It will route to the Principal dashboard for authorization.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
                  <FaExclamationTriangle className="text-base" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Supplier Name</label>
                    <input
                      placeholder="e.g. HP Technologies"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Item Name</label>
                    <input
                      placeholder="e.g. Desktop Computer"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium cursor-pointer"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Sports">Sports</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Subcategory</label>
                    {!isCustomSubcat && subcategories.length > 0 ? (
                      <div className="relative">
                        <select
                          value={subcategory}
                          onChange={(e) => {
                            if (e.target.value === "Other") {
                              setIsCustomSubcat(true);
                              setSubcategory("");
                            } else {
                              setSubcategory(e.target.value);
                            }
                          }}
                          className="border border-slate-200 p-3.5 pr-10 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 appearance-none font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          {subcategories.map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                          <option value="Other">Other (Add Custom)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          placeholder="e.g. Computer, Printer, Chair"
                          value={isCustomSubcat ? customSubcat : subcategory}
                          onChange={(e) => {
                            if (isCustomSubcat) {
                              setCustomSubcat(e.target.value);
                              setSubcategory(e.target.value);
                            } else {
                              setSubcategory(e.target.value);
                            }
                          }}
                          className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                          required
                        />
                        {subcategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomSubcat(false);
                              setSubcategory(subcategories[0]);
                            }}
                            className="border border-slate-300 text-slate-600 dark:text-slate-400 px-3.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold whitespace-nowrap cursor-pointer"
                          >
                            Select Existing
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Specification / Type</label>
                    <input
                      placeholder="e.g. i5 16GB, Laser"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 15"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Per Unit Cost (₹)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      placeholder="e.g. 45000"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Target Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium cursor-pointer"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Requesting Faculty</label>
                    <input
                      placeholder="e.g. Mr. Sharma"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Draft Date & Time</label>
                  <input
                    type="datetime-local"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setErrorMsg("");
                    }}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 px-6 py-3 rounded-2xl cursor-pointer transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white px-6 py-3 rounded-2xl cursor-pointer transition font-bold flex items-center gap-2"
                  >
                    <FaArrowRight />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tracking & Print Modal */}
        {showTrackingModal && selectedTrackingOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn no-print">
            <div className="bg-white dark:bg-slate-900 w-[650px] rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-850 dark:text-white">
                    Approval Route Tracking
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Order Ref: #{selectedTrackingOrder.id} | Supplier: {selectedTrackingOrder.supplier}
                  </p>
                  <div className="mt-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="text-slate-700 dark:text-slate-350"><strong>Item:</strong> {selectedTrackingOrder.item} ({selectedTrackingOrder.category} &gt; {selectedTrackingOrder.subcategory} | {selectedTrackingOrder.type || "Standard"})</p>
                    <p className="text-slate-750 dark:text-slate-300"><strong>Quantity:</strong> {selectedTrackingOrder.quantity} units | <strong>Per Unit Cost:</strong> ₹{selectedTrackingOrder.pricePerUnit?.toLocaleString()}</p>
                    <p className="text-slate-800 dark:text-slate-150 text-sm font-bold mt-1"><strong>Total Cost:</strong> ₹{(selectedTrackingOrder.pricePerUnit * selectedTrackingOrder.quantity)?.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowTrackingModal(false);
                    setSelectedTrackingOrder(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition"
                >
                  ×
                </button>
              </div>

              {/* Progress Stepper Visualizer */}
              <div className="space-y-6 mb-8 relative before:absolute before:bottom-2 before:top-2 before:left-4.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {selectedTrackingOrder.approvalChain && selectedTrackingOrder.approvalChain.length > 0 ? (
                  selectedTrackingOrder.approvalChain.map((step, idx) => {
                    const isApproved = step.status === "Approved";
                    const isRejected = step.status === "Rejected";
                    const isPending = step.status === "Pending";
                    
                    let statusColor = "bg-slate-200 border-slate-350 text-slate-500";
                    let indicatorBadge = "○";
                    if (isApproved) {
                      statusColor = "bg-green-100 border-green-300 text-green-700";
                      indicatorBadge = "✓";
                    } else if (isRejected) {
                      statusColor = "bg-red-100 border-red-300 text-red-700";
                      indicatorBadge = "✗";
                    } else if (isPending) {
                      statusColor = "bg-amber-100 border-amber-300 text-amber-700 animate-pulse";
                      indicatorBadge = "●";
                    }

                    return (
                      <div key={idx} className="flex gap-4 items-start relative z-10">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm ${statusColor}`}>
                          {indicatorBadge}
                        </div>
                        <div className="flex-1 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-155 dark:border-slate-850">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100">
                                {step.name}
                              </h4>
                              <p className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                                {step.role}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isApproved ? "bg-green-50 border-green-150 text-green-600" :
                              isRejected ? "bg-red-50 border-red-150 text-red-600" :
                              "bg-amber-50 border-amber-150 text-amber-600"
                            }`}>
                              {step.status}
                            </span>
                          </div>
                          {step.approvedAt && (
                            <p className="text-[10px] text-slate-400 mt-2 font-mono">
                              Signed: {formatDateTime(step.approvedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400 italic">No approval steps have been defined for this order.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrackingModal(false);
                    setSelectedTrackingOrder(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-md text-xs active:scale-95"
                >
                  Print Approval Proof
                </button>
              </div>

            </div>
          </div>
        )}

        {/* hidden printable report layout */}
        {selectedTrackingOrder && createPortal(
          <div className="hidden print-report-layout p-8 bg-white text-black font-sans min-h-screen">
            <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6">
              {systemSettings?.collegeInfo?.logo ? (
                <img src={systemSettings.collegeInfo.logo} alt="Logo" className="w-20 h-20 object-contain animate-fadeIn" />
              ) : (
                <div className="w-20 h-20 border border-slate-300 flex items-center justify-center font-black text-2xl bg-blue-900 text-white rounded">
                  RJIT
                </div>
              )}
              <div className="text-right">
                <h1 className="text-2xl font-bold">{systemSettings?.collegeInfo?.name || "RJ Institute of Technology"}</h1>
                <p className="text-xs text-slate-555">{systemSettings?.collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
                <p className="text-xs text-slate-500">Phone: {systemSettings?.collegeInfo?.phone || "+91 11 2690 7400"} | Email: {systemSettings?.collegeInfo?.email || "info@rjit.edu.in"}</p>
                <p className="text-xs text-slate-500">Website: {systemSettings?.collegeInfo?.website || "www.rjit.edu.in"}</p>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800">Purchase Order Verification Report</h2>
              <p className="text-sm text-slate-400 mt-1">Official Document | Reference: #{selectedTrackingOrder.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 border border-slate-200 p-6 rounded-2xl bg-slate-50/50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Item</p>
                <p className="text-sm font-bold text-slate-800">{selectedTrackingOrder.item}</p>
                <p className="text-xs text-slate-500">{selectedTrackingOrder.category} &gt; {selectedTrackingOrder.subcategory} ({selectedTrackingOrder.type})</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procurement Qty</p>
                <p className="text-sm font-bold text-slate-850">{selectedTrackingOrder.quantity} units</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per Unit Cost</p>
                <p className="text-sm font-bold text-slate-800">₹{selectedTrackingOrder.pricePerUnit?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</p>
                <p className="text-sm font-black text-slate-850">₹{(selectedTrackingOrder.pricePerUnit * selectedTrackingOrder.quantity)?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vendor / Supplier</p>
                <p className="text-sm font-bold text-slate-800">{selectedTrackingOrder.supplier}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Initiation Date</p>
                <p className="text-sm font-semibold text-slate-700">{formatDateTime(selectedTrackingOrder.orderDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Initiated By</p>
                <p className="text-sm font-bold text-slate-800">{selectedTrackingOrder.faculty} ({selectedTrackingOrder.department})</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Final Order Status</p>
                <span className="text-xs font-black uppercase text-slate-800 bg-slate-200 px-3 py-1 rounded-full">{selectedTrackingOrder.status}</span>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-3">Institutional Approvals Audit Trail</h3>
            <table className="w-full border-collapse border border-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-750 text-xs font-bold border-b border-slate-250">
                  <th className="p-3 text-left border border-slate-200">Index</th>
                  <th className="p-3 text-left border border-slate-200">Approver Person</th>
                  <th className="p-3 text-left border border-slate-200">Administrative Office</th>
                  <th className="p-3 text-left border border-slate-200">Decision</th>
                  <th className="p-3 text-left border border-slate-200">Verification Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {selectedTrackingOrder.approvalChain && selectedTrackingOrder.approvalChain.map((step, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="p-3 border border-slate-200 font-bold">{idx + 1}</td>
                    <td className="p-3 border border-slate-200 font-semibold">{step.name}</td>
                    <td className="p-3 border border-slate-200">{step.role}</td>
                    <td className="p-3 border border-slate-200 font-black">
                      <span className={step.status === "Approved" ? "text-green-600" : step.status === "Rejected" ? "text-red-650" : "text-amber-650"}>
                        {step.status}
                      </span>
                    </td>
                    <td className="p-3 border border-slate-200 text-xs font-mono">{step.approvedAt ? formatDateTime(step.approvedAt) : "Awaiting Action"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-24 border-t border-slate-200 pt-8">
              <div className="text-center w-40">
                <div className="h-12 flex items-center justify-center font-serif italic text-slate-500 text-sm">
                  {selectedTrackingOrder.faculty}
                </div>
                <div className="border-t border-slate-300 pt-2 text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Requestor
                </div>
              </div>
              <div className="text-center w-40">
                <div className="h-12 flex items-center justify-center text-xs text-slate-350">
                  [Institutional Seal]
                </div>
                <div className="border-t border-slate-300 pt-2 text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Verification Seal
                </div>
              </div>
              <div className="text-center w-40">
                <div className="h-12 flex items-center justify-center font-mono text-xs text-slate-350">
                  {selectedTrackingOrder.status === "Approved" ? "Digitally Signed" : ""}
                </div>
                <div className="border-t border-slate-300 pt-2 text-xs font-bold text-slate-450 uppercase tracking-wider">
                  Principal Signature
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
}