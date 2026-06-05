import { useState, useEffect } from "react";
import { 
  FaTruck, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSearch, 
  FaTimes, 
  FaClipboardCheck, 
  FaHourglassHalf, 
  FaFileInvoice,
  FaUpload,
  FaArrowRight
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

export default function ReceiveOrder() {
  const { orders, receiveOrderItem } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState(searchParamVal);

  // Modal form states
  const [remarks, setRemarks] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [receiveDate, setReceiveDate] = useState(getCurrentDateTimeString());

  // Alert feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state if URL query changes
  useEffect(() => {
    setSearch(searchParamVal);
  }, [searchParamVal]);

  const handleOpenReceive = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setReceiveDate(getCurrentDateTimeString());
    setErrorMsg("");
  };

  const handleConfirmReceive = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedOrder) return;

    const res = receiveOrderItem(selectedOrder.id, receiveDate.replace("T", " "));
    if (res.success) {
      setSuccessMsg(`Order #${selectedOrder.id} received successfully! Stock levels updated.`);
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

  // Metrics
  const readyToReceiveCount = orders.filter((o) => o.status === "Approved").length;
  const totalReceivedCount = orders.filter((o) => o.status === "Received").length;
  const pendingApprovalCount = orders.filter((o) => o.status === "Pending").length;

  // Filter based on search query
  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const s = (search || "").toLowerCase();
    return (
      (o.id || "").toLowerCase().includes(s) ||
      (o.supplier || "").toLowerCase().includes(s) ||
      (o.item || "").toLowerCase().includes(s) ||
      (o.category || "").toLowerCase().includes(s) ||
      (o.status || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* Title Section */}
        <div className="mt-8 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Receive Inventory Center
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Accept authorized shipments from suppliers, upload invoices, and automatically register items.
          </p>
        </div>

        {/* Success Feedback Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-450 rounded-2xl flex items-center gap-3 animate-fadeIn font-semibold">
            <FaCheckCircle className="text-xl text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 dark:bg-amber-400" />
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FaClipboardCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready to Receive</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{readyToReceiveCount}</h3>
            </div>
          </div>

          <div className="card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-green-650 dark:bg-green-500" />
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <FaTruck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Received / Completed</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalReceivedCount}</h3>
            </div>
          </div>

          <div className="card-3d bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500 dark:bg-yellow-400" />
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-450 flex items-center justify-center">
              <FaHourglassHalf size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Approval</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{pendingApprovalCount}</h3>
            </div>
          </div>

        </div>

        {/* Search & Filtering Controls */}
        <div className="bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search incoming orders..."
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

        {/* Incoming Shipments Ledger */}
        <div className="bg-white rounded-3xl border border-slate-100 dark:border-slate-850 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Supplier Shipments Registry</h2>
            <p className="text-slate-400 text-xs mt-0.5">Click "Receive" to verify details, upload receipt invoice slip, and stock items.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">              <thead className="interactive-thead border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Supplier</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Item Details</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Department</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Per Unit</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Total Cost</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Status Tracking</th>
                  <th className="p-4 text-left text-xs font-bold uppercase tracking-wider">Dates</th>
                  <th className="p-4 text-center text-xs font-bold uppercase tracking-wider">Action</th>
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
                      <td className="p-4 text-sm font-bold text-slate-800 dark:text-slate-100">{order.supplier}</td>
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                        <div className="font-bold">{order.item}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{order.category} &gt; {order.subcategory} ({order.type})</div>
                      </td>
                      <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                        <div className="font-semibold">{order.department || "N/A"}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{order.faculty || "N/A"}</div>
                      </td>
                      <td className="p-4 text-sm font-black text-slate-800 dark:text-slate-100">{order.quantity}</td>
                      <td className="p-4 text-sm font-semibold text-slate-800 dark:text-slate-100">₹{order.pricePerUnit?.toLocaleString()}</td>
                      <td className="p-4 text-sm font-black text-slate-800 dark:text-slate-100">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                      
                      {/* Premium Interactive Progress Tracker */}
                      <td className="p-4 min-w-[200px]">
                        <div className="flex items-center w-full">
                          <div className="flex flex-col items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold" title="Order Placed">1</div>
                            <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold mt-1">Placed</span>
                          </div>
                          
                          <div className={`flex-1 h-0.5 mx-1.5 ${
                            order.status === "Approved" || order.status === "Received" ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-800"
                          }`} />
                          
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${
                              order.status === "Approved" || order.status === "Received" ? "bg-amber-500" : "bg-slate-350"
                            }`} title="Approved by Principal">2</div>
                            <span className="text-[9px] text-slate-450 dark:text-slate-500 font-bold mt-1">Approved</span>
                          </div>

                          <div className={`flex-1 h-0.5 mx-1.5 ${
                            order.status === "Received" ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                          }`} />

                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${
                              order.status === "Received" ? "bg-emerald-500" : "bg-slate-350"
                            }`} title="Received in Store">3</div>
                            <span className="text-[9px] text-slate-455 dark:text-slate-500 font-bold mt-1 font-semibold">Received</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <div><strong className="text-slate-400">Ordered:</strong> {formatDateTime(order.orderDate)}</div>
                        {order.status === "Received" && (
                          <div><strong className="text-emerald-500">Received:</strong> {formatDateTime(order.receiveDate)}</div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {order.status === "Received" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-150 dark:border-emerald-900/50">
                            <FaCheckCircle /> Completed
                          </span>
                        ) : order.status === "Pending" ? (
                          <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs inline-flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-950/20 px-3 py-1.5 rounded-full border border-yellow-150 dark:border-yellow-900/50">
                            <FaHourglassHalf className="animate-spin duration-[4000ms]" /> Awaiting Appr.
                          </span>
                        ) : (
                          /* Approved: Pulsing animation button */
                          <button
                            onClick={() => handleOpenReceive(order)}
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold cursor-pointer transition shadow-md shadow-emerald-500/10 hover:shadow-lg active:scale-95 animate-pulse hover:animate-none flex items-center gap-1 text-xs"
                          >
                            Receive Order
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-10 text-center text-sm font-semibold text-slate-400">
                      No incoming shipments found matching filter values..
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receive Inventory Item Form Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-[600px] rounded-3xl p-8 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[95vh] overflow-y-auto">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Confirm Shipments Receipt
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Please check all specifications and details below, and upload the signed delivery note/invoice slip.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
                  <FaExclamationTriangle />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleConfirmReceive} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Order ID</label>
                    <input
                      value={selectedOrder.id}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Supplier</label>
                    <input
                      value={selectedOrder.supplier}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Item Details</label>
                    <input
                      value={`${selectedOrder.item} (${selectedOrder.type})`}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-semibold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Quantity to Stock</label>
                    <input
                      value={selectedOrder.quantity}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Target Department</label>
                    <input
                      value={selectedOrder.department || "N/A"}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Recipient Faculty</label>
                    <input
                      value={selectedOrder.faculty || "N/A"}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Per Unit Cost</label>
                    <input
                      value={`₹${selectedOrder.pricePerUnit?.toLocaleString()}`}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-semibold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Total Amount</label>
                    <input
                      value={`₹${(selectedOrder.pricePerUnit * selectedOrder.quantity)?.toLocaleString()}`}
                      disabled
                      className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed font-black text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Receive Date & Time</label>
                    <input
                      type="datetime-local"
                      value={receiveDate}
                      onChange={(e) => setReceiveDate(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Upload Delivery Slip</label>
                    <label className="flex items-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 p-2.5 rounded-2xl w-full text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer justify-center transition font-semibold">
                      <FaUpload /> 
                      <span>{invoiceFile ? invoiceFile.name : "Select Invoice File"}</span>
                      <input
                        type="file"
                        onChange={(e) => setInvoiceFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {invoiceFile && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-700 dark:text-indigo-400 font-semibold animate-fadeIn">
                    <FaFileInvoice className="text-sm" />
                    <span>Selected Slip: {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Remarks / Remarks Logs</label>
                  <textarea
                    placeholder="Enter item conditions, delivery delays, or damage statements..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="border border-slate-200 p-3.5 rounded-2xl w-full h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none font-medium text-sm"
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
                    className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl cursor-pointer transition font-bold flex items-center gap-2 shadow-md shadow-emerald-500/10"
                  >
                    <FaArrowRight />
                    Confirm Stock Receipt
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