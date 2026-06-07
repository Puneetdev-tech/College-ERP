import { useState } from "react";
import { FaPlus, FaSearch, FaFilePdf, FaClock } from "react-icons/fa";
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

export default function InventoryTable() {
  const { inventory, addInventoryItem, systemSettings } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paramCategory = searchParams.get("category");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

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

  // Filter based on search query and optional category param
  // Inventory is already sorted newest-first from context
  const filteredInventory = inventory.filter((item) => {
    if (paramCategory && (item.category || "").toLowerCase() !== paramCategory.toLowerCase()) {
      return false;
    }
    return (
      (item.item || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.subcategory || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.type || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  // Dynamic metrics calculations
  const totalItems = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.stock * item.price, 0);
  const lowStockCount = inventory.filter((item) => item.stock <= 4).length;
  const categoriesCount = new Set(inventory.map((item) => item.category)).size;

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
        <div className="grid grid-cols-4 gap-6 mb-6 no-print">
          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium">Total Items</h3>
            <p className="text-3xl font-extrabold text-blue-700 mt-1">{totalItems}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium">Total Value</h3>
            <p className="text-3xl font-extrabold text-green-600 mt-1">₹{totalValue.toLocaleString("en-IN")}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium">Low Stock</h3>
            <p className="text-3xl font-extrabold text-red-600 mt-1">{lowStockCount}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 font-medium">Categories</h3>
            <p className="text-3xl font-extrabold text-purple-600 mt-1">{categoriesCount}</p>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6 no-print">
          {paramCategory && (
            <div className="mb-3 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-bold w-fit animate-fadeIn">
              <span>Category: <strong>{paramCategory}</strong></span>
              <button
                onClick={() => navigate("/inventory/items")}
                className="hover:text-red-600 font-extrabold text-sm ml-2 transition cursor-pointer"
                title="Clear Filter"
              >
                ×
              </button>
            </div>
          )}
          <div className="relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 py-3 rounded-xl bg-slate-100 outline-none"
            />
          </div>
        </div>

        {/* Inventory List Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left">Item Details</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Unit Price</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date Added / Updated</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{item.item}</div>
                    <div className="text-xs text-slate-400">Spec: {item.subcategory} - {item.type}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{item.stock}</td>
                  <td className="p-4 text-slate-600">₹{item.price.toLocaleString("en-IN")}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white font-semibold text-xs
                      ${
                        item.status === "Good"
                          ? "bg-green-500"
                          : item.status === "Medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <FaClock className="text-slate-400 flex-shrink-0" />
                      <span>
                        {item.updatedAt
                          ? <><span className="text-blue-500 font-semibold">Updated: </span>{formatDateTime(item.updatedAt)}</>
                          : item.createdAt
                          ? formatDateTime(item.createdAt)
                          : "—"
                        }
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
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
