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
  FaArrowRight,
  FaTimesCircle,
  FaEye
} from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";
import { playBeep } from "../components/useSpeech";

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
  const { orders, receiveOrderItem, getRegisterForCategory } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamVal = searchParams.get("search") || "";

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState(searchParamVal);
  const [animateIn, setAnimateIn] = useState(false);

  // Modal form states
  const [remarks, setRemarks] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [receiveDate, setReceiveDate] = useState(getCurrentDateTimeString());
  const [receiveQty, setReceiveQty] = useState(1);

  // Alert feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state if URL query changes
  useEffect(() => {
    setSearch(searchParamVal);
  }, [searchParamVal]);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleOpenReceive = (order) => {
    setSelectedOrder(order);
    const pending = order.pendingQuantity !== undefined ? order.pendingQuantity : (order.quantity - (order.receivedQuantity || 0));
    setReceiveQty(pending);
    setShowModal(true);
    setReceiveDate(getCurrentDateTimeString());
    setErrorMsg("");
  };

  const handleConfirmReceive = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedOrder) return;

    // Convert invoice file to base64 data URL for persistence
    let invoiceDataUrl = null;
    if (invoiceFile) {
      try {
        invoiceDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(invoiceFile);
        });
      } catch (err) {
        console.warn("Could not convert invoice to base64", err);
      }
    }

    const res = await receiveOrderItem(selectedOrder.id, receiveQty, receiveDate.replace("T", " "), invoiceDataUrl);
    if (res.success) {
      const msg = `Order #${selectedOrder.id} received — ${receiveQty} × ${selectedOrder.item} stocked successfully.`;
      setSuccessMsg(`Order #${selectedOrder.id} received successfully! Stock levels updated.`);
      showFlash("success", "Order Received & Stocked", msg);
      playBeep("order-received");
      setRemarks("");
      setInvoiceFile(null);
      setTimeout(() => {
        setSuccessMsg("");
        setShowModal(false);
        setSelectedOrder(null);
      }, 2000);
    } else {
      setErrorMsg(res.message || "Failed to receive order.");
      playBeep("error");
    }
  };

  // Metrics
  const readyToReceiveCount = orders.filter((o) => o.status === "Approved" || o.status === "Partially Received").length;
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
  });  return (
    <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #faf8ff 45%, #f0f2fe 100%)", minHeight: "100vh" }}
      className="text-slate-800 transition-colors duration-300">
      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />
      <div className="ml-64 p-6 max-w-7xl mx-auto">
        <Navbar />

        {/* ── HERO HEADER ─────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl mt-6 p-8 mb-8 text-white shadow-xl transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{
            background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)",
            boxShadow: "0 10px 30px rgba(124,58,237,0.25)"
          }}
        >
          {/* Decorative floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #ddd6fe 0%, transparent 70%)", animation: "float 6s ease-in-out infinite" }} />
            <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #c7d2fe 0%, transparent 70%)", animation: "float 8s ease-in-out infinite 2s" }} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>

          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <FaTruck className="text-white text-lg animate-bounce" />
                </div>
                <span className="text-xs font-bold text-purple-100 uppercase tracking-widest">Inventory Center</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Receive Shipments Hub</h1>
              <p className="text-purple-100 text-sm mt-1">Accept authorized supplier shipments, upload delivery invoices, and update inventory stock counts.</p>
            </div>
          </div>
        </div>

        {/* Success Feedback Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl flex items-center gap-3 animate-fadeIn font-semibold"
            style={{ boxShadow: "0 4px 15px rgba(124,58,237,0.1)" }}>
            <FaCheckCircle className="text-xl text-purple-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── METRICS ROW ─────────────────────────────── */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          <div className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-md cursor-default transition-all duration-400 hover:scale-[1.03] hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 8px 25px rgba(245,158,11,0.18)" }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <FaClipboardCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Ready to Receive</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{readyToReceiveCount}</h3>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-md cursor-default transition-all duration-400 hover:scale-[1.03] hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", boxShadow: "0 8px 25px rgba(139,92,246,0.18)" }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:translate-x-2">
                <FaTruck size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Received / Completed</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{totalReceivedCount}</h3>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-md cursor-default transition-all duration-400 hover:scale-[1.03] hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", boxShadow: "0 8px 25px rgba(37,99,235,0.18)" }}>
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform duration-[800ms] group-hover:scale-110 group-hover:rotate-180">
                <FaHourglassHalf size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Awaiting Approval</p>
                <h3 className="text-2xl font-black text-white mt-0.5">{pendingApprovalCount}</h3>
              </div>
            </div>
          </div>

        </div>

        {/* ── SEARCH BAR ─────────────────────────────── */}
        <div className={`bg-white border border-slate-100 rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between transition-all duration-700 delay-150 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
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
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 border border-transparent focus:border-purple-500/20 outline-none font-semibold text-sm transition-all focus:bg-white focus:ring-2 focus:ring-purple-500/10"
            />
            {search && (
              <button 
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                }} 
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {search && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-150 text-purple-700 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn">
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

        {/* ── INCOMING SHIPMENTS LEDGER ──────────────── */}
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ boxShadow: "0 4px 30px rgba(124,58,237,0.07)" }}>
          <div className="p-6 border-b border-slate-100" style={{ background: "linear-gradient(135deg, #fafaff 0%, #f5f3ff 100%)" }}>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaClipboardCheck className="text-purple-600" /> Supplier Shipments Registry</h2>
            <p className="text-slate-400 text-xs mt-0.5">Verify pending shipments, upload invoice delivery details, and automatically update stock registers.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)" }}>
                <tr className="text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="p-4 text-left">Order ID</th>
                  <th className="p-4 text-left">Supplier</th>
                  <th className="p-4 text-left">Item Details</th>
                  <th className="p-4 text-left">Category / Register</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Per Unit</th>
                  <th className="p-4 text-left">Total Cost</th>
                  <th className="p-4 text-left">Status Tracking</th>
                  <th className="p-4 text-left">Dates</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group border-l-4 border-l-transparent hover:border-l-purple-500 hover:bg-purple-50/40 transition-all duration-200"
                    >
                      <td className="p-4 text-sm font-semibold text-slate-500">#{order.id}</td>
                      <td className="p-4 text-sm font-bold text-slate-800">{order.supplier}</td>
                      <td className="p-4 text-sm text-slate-700">
                        <div className="font-bold text-slate-800">{order.item}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{order.category} &gt; {order.subcategory} ({order.type})</div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">
                        <div className="font-semibold text-slate-750">{getRegisterForCategory(order.category)}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{order.faculty || "N/A"}</div>
                      </td>
                      <td className="p-4 text-sm font-black text-slate-800">
                        <div>{order.quantity}</div>
                        {(order.receivedQuantity !== undefined || order.status === "Partially Received") && (
                          <div className="text-[10px] text-slate-455 font-bold mt-0.5 whitespace-nowrap">
                            Rec: <span className="text-purple-605 font-bold">{order.receivedQuantity || 0}</span> | Pend: <span className="text-amber-600">{order.pendingQuantity !== undefined ? order.pendingQuantity : (order.quantity - (order.receivedQuantity || 0))}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-800">₹{order.pricePerUnit?.toLocaleString()}</td>
                      <td className="p-4 text-sm font-black text-slate-800">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                      
                      {/* Premium Progress Tracker */}
                      <td className="p-4 min-w-[200px]">
                        <div className="flex items-center w-full">
                          <div className="flex flex-col items-center">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold transition-transform duration-300 hover:scale-125 cursor-help" title="Order Placed">1</div>
                            <span className="text-[9px] text-slate-400 font-bold mt-1">Placed</span>
                          </div>
                          
                          <div className={`flex-1 h-0.5 mx-1.5 ${
                            order.status === "Approved" || order.status === "Received" || order.status === "Partially Received"
                              ? "bg-amber-500" 
                              : order.status === "Rejected"
                              ? "bg-red-500"
                              : "bg-slate-200"
                          }`} />
                          
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold transition-transform duration-300 hover:scale-125 cursor-help ${
                              order.status === "Approved" || order.status === "Received" || order.status === "Partially Received"
                                ? "bg-amber-500" 
                                : order.status === "Rejected"
                                ? "bg-red-500"
                                : "bg-slate-300"
                            }`} title={order.status === "Rejected" ? "Rejected" : "Approved by Principal"}>2</div>
                            <span className={`text-[9px] font-bold mt-1 ${
                              order.status === "Rejected" 
                                ? "text-red-655" 
                                : "text-slate-400"
                            }`}>
                              {order.status === "Rejected" ? "Rejected" : "Approved"}
                            </span>
                          </div>

                          <div className={`flex-1 h-0.5 mx-1.5 ${
                            order.status === "Received" 
                              ? "bg-purple-500" 
                              : order.status === "Partially Received"
                              ? "bg-blue-500"
                              : "bg-slate-200"
                          }`} />

                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold transition-transform duration-300 hover:scale-125 cursor-help ${
                              order.status === "Received" 
                                ? "bg-purple-500" 
                                : order.status === "Partially Received"
                                ? "bg-blue-500 animate-pulse"
                                : "bg-slate-300"
                            }`} title={order.status === "Partially Received" ? "Partially Received" : "Received in Store"}>3</div>
                            <span className="text-[9px] text-slate-400 font-bold mt-1">
                              {order.status === "Partially Received" ? "Partial" : "Received"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs text-slate-500 space-y-1">
                        <div><strong className="text-slate-400">Ordered:</strong> {formatDateTime(order.orderDate)}</div>
                        {(order.status === "Received" || order.status === "Partially Received") && order.receiveDate && (
<div><strong className="text-purple-600 font-bold">Received:</strong> {formatDateTime(order.receiveDate)}</div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {order.status === "Received" ? (
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-purple-600 font-bold text-xs inline-flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-150 shadow-sm shadow-purple-500/5">
                              <FaCheckCircle /> Completed
                            </span>
                            {order.deliverySlip && (
                              <button
                                onClick={() => {
                                  const win = window.open();
                                  if (order.deliverySlip.startsWith("data:image")) {
                                    win.document.write(`<img src="${order.deliverySlip}" style="max-width:100%; margin: 20px auto; display:block;" />`);
                                  } else {
                                    win.document.write(`<iframe src="${order.deliverySlip}" style="border:0; width:100%; height:100vh;"></iframe>`);
                                  }
                                }}
                                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm"
                                title="View uploaded invoice / delivery slip"
                              >
                                <FaFileInvoice className="text-xs" /> View Slip
                              </button>
                            )}
                          </div>
                        ) : order.status === "Pending" ? (
                          <span className="text-amber-600 font-bold text-xs inline-flex items-center gap-1.5 bg-amber-55/40 px-3.5 py-2 rounded-full border border-amber-200">
                            <FaHourglassHalf className="animate-spin" /> Awaiting Appr.
                          </span>
                        ) : order.status === "Rejected" ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-rose-600 font-bold text-xs inline-flex items-center gap-1.5 bg-rose-50 px-3.5 py-2 rounded-full border border-rose-150">
                              <FaTimesCircle /> Rejected
                            </span>
                            <button
                              disabled
                              className="bg-slate-100 text-slate-400 px-4 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center gap-1 text-xs"
                            >
                              Receive Order
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenReceive(order)}
                            className="text-white px-4 py-2.5 rounded-xl font-bold cursor-pointer transition shadow-md active:scale-95 flex items-center gap-1 text-xs hover:scale-105 duration-200"
                            style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}
                          >
                            {order.status === "Partially Received" ? "Receive Pending" : "Receive Order"}
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

        {/* ── RECEIVE INVENTORY ITEM FORM MODAL ───────── */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn p-4">
            <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-scaleUp"
              style={{ boxShadow: "0 25px 60px rgba(124,58,237,0.3)" }}>
              
              <div className="px-8 py-6 text-white relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%)" }}>
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
                  style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                <h2 className="text-2xl font-bold relative z-10 flex items-center gap-2">
                  <FaTruck className="text-purple-100" /> Confirm Shipment Receipt
                </h2>
                <p className="text-purple-100 text-xs mt-0.5 relative z-10">Check all specifications and details below, and upload the signed delivery note/invoice slip.</p>
              </div>

              <div className="bg-white p-8 max-h-[75vh] overflow-y-auto">
                {errorMsg && (
                  <div className="mb-4 p-3.5 bg-rose-50 border border-rose-150 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
                    <FaExclamationTriangle />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmReceive} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Order ID</label>
                      <input
                        value={selectedOrder.id}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Supplier</label>
                      <input
                        value={selectedOrder.supplier}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Item Details</label>
                      <input
                        value={`${selectedOrder.item} (${selectedOrder.type})`}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-semibold text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider font-semibold text-slate-700">Quantity to Receive</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedOrder.pendingQuantity !== undefined ? selectedOrder.pendingQuantity : (selectedOrder.quantity - (selectedOrder.receivedQuantity || 0))}
                        value={receiveQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const maxVal = selectedOrder.pendingQuantity !== undefined ? selectedOrder.pendingQuantity : (selectedOrder.quantity - (selectedOrder.receivedQuantity || 0));
                          if (isNaN(val)) {
                            setReceiveQty("");
                          } else {
                            setReceiveQty(Math.min(Math.max(1, val), maxVal));
                          }
                        }}
                        className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-black"
                        required
                      />
                      <div className="text-[10px] font-bold text-slate-400 mt-1 pl-1">
                        Ordered: {selectedOrder.quantity} | Rec: {selectedOrder.receivedQuantity || 0} | Pend: {selectedOrder.pendingQuantity !== undefined ? selectedOrder.pendingQuantity : (selectedOrder.quantity - (selectedOrder.receivedQuantity || 0))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Category / Register</label>
                      <input
                        value={getRegisterForCategory(selectedOrder.category)}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Recipient Faculty</label>
                      <input
                        value={selectedOrder.faculty || "N/A"}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Per Unit Cost</label>
                      <input
                        value={`₹${selectedOrder.pricePerUnit?.toLocaleString()}`}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-semibold text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-xs mb-1.5 uppercase tracking-wider">Total Amount (This Batch)</label>
                      <input
                        value={`₹${(selectedOrder.pricePerUnit * (receiveQty || 0))?.toLocaleString()}`}
                        disabled
                        className="border border-slate-200 p-3.5 rounded-2xl w-full bg-slate-50 text-slate-500 cursor-not-allowed font-black text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 font-bold text-xs mb-1.5 uppercase tracking-wider">Receive Date & Time</label>
                      <input
                        type="datetime-local"
                        value={receiveDate}
                        onChange={(e) => setReceiveDate(e.target.value)}
                        className="border border-slate-200 p-3.5 rounded-2xl w-full focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium text-slate-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-655 font-bold text-xs mb-1.5 uppercase tracking-wider">Upload Delivery Slip</label>
                      <label className="flex items-center gap-2 border border-dashed border-slate-350 p-2.5 rounded-2xl w-full text-xs text-slate-500 bg-white hover:bg-slate-50 cursor-pointer justify-center transition font-semibold">
                        <FaUpload className="text-purple-600 text-sm" /> 
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
                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-2.5 text-xs text-purple-700 font-semibold animate-fadeIn">
                      <FaFileInvoice className="text-sm text-purple-600" />
                      <span>Selected Slip: {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-bold text-xs mb-1.5 uppercase tracking-wider">Remarks / Remarks Logs</label>
                    <textarea
                      placeholder="Enter item conditions, delivery delays, or damage statements..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="border border-slate-200 p-3.5 rounded-2xl w-full h-20 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white resize-none font-medium text-sm text-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setErrorMsg("");
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl cursor-pointer transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-white px-6 py-3 rounded-2xl cursor-pointer transition font-bold flex items-center gap-2 shadow-md hover:scale-105 duration-200"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}
                    >
                      <FaArrowRight />
                      Confirm Stock Receipt
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}