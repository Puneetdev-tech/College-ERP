import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";

export default function PlaceOrder() {
  const { orders, placeOrderItem } = useStore();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [subcategory, setSubcategory] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!supplier.trim() || !item.trim() || !category.trim() || !subcategory.trim() || !quantity || !orderDate) {
      setErrorMsg("All fields except Specification are required.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg("Quantity must be a positive integer.");
      return;
    }

    placeOrderItem({
      supplier: supplier.trim(),
      item: item.trim(),
      category: category.trim(),
      subcategory: subcategory.trim(),
      type: type.trim() || "Standard",
      quantity: qty,
      orderDate: orderDate
    });

    setSupplier("");
    setItem("");
    setCategory("Electronics");
    setSubcategory("");
    setType("");
    setQuantity("");
    setOrderDate("");
    setShowModal(false);
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <Sidebar />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Purchase Orders
          </h1>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex gap-2 items-center cursor-pointer transition shadow-md"
          >
            <FaPlus />
            Create Order
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <table className="w-full border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="p-4 text-left font-semibold text-sm">Order ID</th>
                <th className="p-4 text-left font-semibold text-sm">Supplier</th>
                <th className="p-4 text-left font-semibold text-sm">Item</th>
                <th className="p-4 text-left font-semibold text-sm">Spec / Type</th>
                <th className="p-4 text-left font-semibold text-sm">Quantity</th>
                <th className="p-4 text-left font-semibold text-sm">Order Date</th>
                <th className="p-4 text-left font-semibold text-sm">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="p-4 font-semibold text-slate-600">{order.id}</td>
                  <td className="p-4 font-medium text-slate-800">{order.supplier}</td>
                  <td className="p-4 text-slate-700">{order.item}</td>
                  <td className="p-4 text-slate-500 text-sm">{order.type || "Standard"}</td>
                  <td className="p-4 font-bold text-slate-800">{order.quantity}</td>
                  <td className="p-4 text-slate-500 text-sm">{order.orderDate}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        order.status === "Pending"
                          ? "bg-yellow-500"
                          : order.status === "Approved"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white w-[550px] rounded-3xl p-8 shadow-2xl border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                Create Purchase Order
              </h2>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Supplier Name</label>
                    <input
                      placeholder="e.g. HP Technologies"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Item Name</label>
                    <input
                      placeholder="e.g. Desktop Computer"
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
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
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subcategory</label>
                    <input
                      placeholder="e.g. Computer, Printer, Chair"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Specification / Type</label>
                    <input
                      placeholder="e.g. i5 16GB, Laser"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Order Date</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    required
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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold"
                  >
                    Save Order
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