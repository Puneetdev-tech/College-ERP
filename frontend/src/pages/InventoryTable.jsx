import { useState } from "react";
import { FaPlus, FaSearch, FaFilePdf } from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";

export default function InventoryTable() {
  const { inventory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  // Filter based on search query
  const filteredInventory = inventory.filter(
    (item) =>
      item.item.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
  );

  // Dynamic metrics calculations
  const totalItems = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.stock * item.price, 0);
  const lowStockCount = inventory.filter((item) => item.stock <= 4).length;
  const categoriesCount = new Set(inventory.map((item) => item.category)).size;

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
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

            <button className="bg-red-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:scale-105 transition">
              <FaFilePdf />
              Export PDF
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
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

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Add Inventory Item
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Item Name"
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Category"
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Sub Category"
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Quantity"
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Unit Price"
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Supplier"
                className="border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-5 py-2 rounded-xl cursor-pointer hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-5 py-2 rounded-xl cursor-pointer hover:bg-green-700 transition-colors"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
