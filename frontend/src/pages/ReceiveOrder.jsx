import { useState } from "react";
import { FaTruck, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";

export default function ReceiveOrder() {
  const { orders, receiveOrderItem } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal form states
  const [remarks, setRemarks] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split("T")[0]);

  // Alert feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenReceive = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setErrorMsg("");
  };

  const handleConfirmReceive = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedOrder) return;

    const res = receiveOrderItem(selectedOrder.id);
    if (res.success) {
      setSuccessMsg(`Order ${selectedOrder.id} received successfully! Stock updated.`);
      setRemarks("");
      setInvoiceFile(null);
      setTimeout(() => {
        setSuccessMsg("");
        setShowModal(false);
        setSelectedOrder(null);
      }, 2000);
    } else {
      setErrorMsg(res.message || "Failed to receive order.");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <Sidebar />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Receive Orders
          </h1>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 animate-fadeIn font-semibold">
            <FaCheckCircle className="text-xl" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <table className="w-full border-collapse">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-4 text-left font-semibold text-sm">Order ID</th>
                <th className="p-4 text-left font-semibold text-sm">Supplier</th>
                <th className="p-4 text-left font-semibold text-sm">Item</th>
                <th className="p-4 text-left font-semibold text-sm">Spec / Type</th>
                <th className="p-4 text-left font-semibold text-sm">Quantity</th>
                <th className="p-4 text-left font-semibold text-sm">Status</th>
                <th className="p-4 text-left font-semibold text-sm">Action</th>
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
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        order.status === "Pending"
                          ? "bg-yellow-500"
                          : order.status === "Approved"
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {order.status === "Received" ? (
                      <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                        <FaCheckCircle /> Received
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenReceive(order)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer transition shadow-sm text-sm"
                      >
                        Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white w-[600px] rounded-3xl p-8 shadow-2xl border border-slate-100">
              <h2 className="text-2xl font-bold mb-2 text-slate-800">
                Receive Inventory
              </h2>
              <p className="text-slate-400 text-xs mb-6">Confirm details and upload invoice to receipt stock.</p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <FaExclamationTriangle />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleConfirmReceive} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Order ID</label>
                    <input
                      value={selectedOrder.id}
                      disabled
                      className="border p-3 rounded-xl w-full bg-slate-100 text-slate-500 cursor-not-allowed font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Supplier</label>
                    <input
                      value={selectedOrder.supplier}
                      disabled
                      className="border p-3 rounded-xl w-full bg-slate-100 text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Item Name</label>
                    <input
                      value={selectedOrder.item}
                      disabled
                      className="border p-3 rounded-xl w-full bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Quantity to Receive</label>
                    <input
                      value={selectedOrder.quantity}
                      disabled
                      className="border p-3 rounded-xl w-full bg-slate-100 text-slate-500 cursor-not-allowed font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Receive Date</label>
                    <input
                      type="date"
                      value={receiveDate}
                      onChange={(e) => setReceiveDate(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Upload Invoice / Slip</label>
                    <input
                      type="file"
                      onChange={(e) => setInvoiceFile(e.target.files[0])}
                      className="border p-2.5 rounded-xl w-full text-sm text-slate-500 bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Remarks / Note</label>
                  <textarea
                    placeholder="Enter condition notes or comments..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="border p-3 rounded-xl w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none"
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
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold flex items-center gap-2"
                  >
                    <FaTruck />
                    Confirm Receive
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