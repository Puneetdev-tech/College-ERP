import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/Statcard";
import MonthlyChart from "../components/MonthlyChart";
import RecentActivities from "../components/RecentActivities";
import LowStock from "../components/LowStock";
import QuickActions from "../components/QuickActions";
import { useStore } from "../context/StoreContext";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";
import { speak, playBeep } from "../components/useSpeech";
import InventoryChatbot from "../components/InventoryChatbot";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaBolt,
  FaChartLine,
  FaShoppingCart,
  FaBoxes,
  FaRocket,
  FaStar,
  FaArrowRight
} from "react-icons/fa";

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

// Animated greeting based on time of day
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Dashboard() {
  const { currentUser, orders, inventory, issuedStock, systemSettings, approveOrder, rejectOrder } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [animateIn, setAnimateIn] = useState(false);
  const [highlightedOrder, setHighlightedOrder] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  const totalAssets = inventory.reduce((acc, item) => acc + item.stock, 0);
  const inventoryValueVal = inventory.reduce((acc, item) => acc + (item.stock * item.price), 0);
  const inventoryValue = `₹${(inventoryValueVal / 100000).toFixed(1)}L`;

  const pendingOrders = orders.filter((o) => {
    if (o.status !== "Pending") return false;
    const nextStep = o.approvalChain?.find((step) => step.status === "Pending");
    return nextStep && nextStep.userId === currentUser?.id;
  });
  const pendingOrdersCount = pendingOrders.length;

  const lowStockThreshold = systemSettings?.lowStockThreshold || 10;
  const lowStockCount = inventory.filter((item) => item.stock <= lowStockThreshold).length;

  // Live KPIs
  const totalIssued = issuedStock.reduce((s, l) => s + l.quantity, 0);
  const receivedOrders = orders.filter(o => o.status === "Received").length;

  return (
    <div style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafbff 40%, #f0fdf4 100%)", minHeight: "100vh" }}
      className="text-slate-800 transition-colors duration-300">

      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />

      <div className="ml-64 p-6">
        <Navbar />

        {/* ── HERO WELCOME BANNER ─────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl mt-6 shadow-xl transition-all duration-700 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 40%, #4f46e5 70%, #6d28d9 100%)",
          }}
        >
          {/* Floating orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)", animation: "float 6s ease-in-out infinite" }} />
            <div className="absolute bottom-0 left-20 w-40 h-40 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", animation: "float 8s ease-in-out infinite 2s" }} />
            <div className="absolute top-4 left-1/2 w-32 h-32 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)", animation: "float 7s ease-in-out infinite 1s" }} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
          </div>

          <div className="relative p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                  {getGreeting()} 👋
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {currentUser?.name || "User"}
              </h1>
              <p className="mt-1.5 text-blue-200 font-medium">
                RJIT Inventory Management System — Command Center
              </p>
            </div>

            {/* Live pulse indicators */}
            <div className="flex flex-col gap-2 text-xs font-semibold text-white/80">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {receivedOrders} orders fulfilled this session
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/10">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                {totalIssued} units disbursed to departments
              </div>
            </div>
          </div>
        </div>

        {/* ── PENDING APPROVALS ──────────────────────────────────── */}
        {pendingOrdersCount > 0 && (
          <div className={`bg-white rounded-2xl border border-amber-100 p-6 mt-8 shadow-lg transition-all duration-500 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ borderLeft: "4px solid #f59e0b", boxShadow: "0 4px 20px rgba(245,158,11,0.12)" }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-amber-400 shadow-sm" />
                  Pending Order Approvals
                </h2>
                <p className="text-slate-400 text-xs mt-1">Review purchase requests and authorize them below.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-200 flex items-center gap-1">
                <FaBolt size={10} /> {pendingOrdersCount} pending
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-xs font-bold uppercase tracking-wider text-white"
                      style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
                      <th className="p-3.5 text-left">Order ID</th>
                      <th className="p-3.5 text-left">Item Name</th>
                      <th className="p-3.5 text-left">Supplier</th>
                      <th className="p-3.5 text-left">Qty</th>
                      <th className="p-3.5 text-left">Per Unit</th>
                      <th className="p-3.5 text-left">Total Cost</th>
                      <th className="p-3.5 text-left">Dept / Faculty</th>
                      <th className="p-3.5 text-left">Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingOrders.map((order) => (
                      <tr key={order.id}
                        className={`transition-all duration-200 cursor-pointer ${highlightedOrder === order.id ? "bg-amber-50" : "hover:bg-slate-50/80"}`}
                        onMouseEnter={() => setHighlightedOrder(order.id)}
                        onMouseLeave={() => setHighlightedOrder(null)}>
                        <td className="p-3.5 font-bold text-sm text-amber-700">{order.id}</td>
                        <td className="p-3.5 text-sm text-slate-800 font-semibold">
                          {order.item}
                          <span className="text-xs text-slate-400 font-normal ml-1">({order.type})</span>
                        </td>
                        <td className="p-3.5 text-sm text-slate-600">{order.supplier}</td>
                        <td className="p-3.5 text-sm font-black text-slate-800">{order.quantity}</td>
                        <td className="p-3.5 text-sm font-semibold text-slate-800">₹{order.pricePerUnit?.toLocaleString()}</td>
                        <td className="p-3.5 text-sm font-black text-slate-800">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                        <td className="p-3.5 text-sm text-slate-600">
                          {order.department}
                          <span className="text-xs text-slate-400 font-normal ml-1">({order.faculty})</span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-400">{order.orderDate}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                approveOrder(order.id);
                                playBeep("order-approved");
                                speak(`Order ${order.id} for ${order.item} has been approved successfully.`);
                                showFlash("success", "Order Approved ✓", `Order ${order.id} — ${order.quantity} × ${order.item} approved.`);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl cursor-pointer transition shadow-sm shadow-emerald-200 active:scale-95 flex items-center gap-1.5"
                            >
                              <FaCheckCircle size={10} /> Approve
                            </button>
                            <button
                              onClick={() => {
                                rejectOrder(order.id);
                                playBeep("order-rejected");
                                speak(`Order ${order.id} for ${order.item} has been rejected.`);
                                showFlash("error", "Order Rejected", `Order ${order.id} — ${order.item} has been rejected.`);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                            >
                              <FaTimesCircle size={10} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── STAT CARDS ──────────────────────────────────────────── */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8 transition-all duration-700 delay-100 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <StatCard title="Total Assets" value={totalAssets.toString()} />
          <StatCard title="Inventory Value" value={inventoryValue} />
          <StatCard title="Pending Orders" value={pendingOrdersCount.toString()} />
          <StatCard title="Low Stock" value={lowStockCount.toString()} />
        </div>

        {/* ── KPI RIBBON ──────────────────────────────────────────── */}
        <div className={`grid grid-cols-3 gap-5 mt-5 transition-all duration-700 delay-150 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {[
            { label: "Units Issued Today", value: issuedStock.filter(l => {
              const d = new Date(l.date);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).reduce((s, l) => s + l.quantity, 0), color: "from-violet-500 to-purple-600", icon: <FaArrowRight /> },
            { label: "Orders This Month", value: orders.filter(o => {
              const d = new Date(o.orderDate);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length, color: "from-blue-500 to-indigo-600", icon: <FaShoppingCart /> },
            { label: "Stock Categories", value: [...new Set(inventory.map(i => i.category))].length, color: "from-emerald-500 to-teal-600", icon: <FaBoxes /> },
          ].map((kpi, i) => (
            <div key={i}
              className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default`}
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`, backgroundImage: `linear-gradient(135deg, ${kpi.color.includes("violet") ? "#7c3aed, #9333ea" : kpi.color.includes("blue") ? "#3b82f6, #4f46e5" : "#10b981, #0d9488"})` }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white/70 uppercase tracking-wider">{kpi.label}</p>
                  <h3 className="text-3xl font-black text-white mt-1">{kpi.value}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CHART + QUICK ACTIONS ────────────────────────────────── */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5 transition-all duration-700 delay-200 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
            style={{ boxShadow: "0 4px 20px rgba(79,70,229,0.06)" }}>
            <h2 className="text-lg font-bold mb-1 text-slate-800 flex items-center gap-2">
              <FaChartLine className="text-indigo-500" />
              Monthly Inventory Activity
            </h2>
            <p className="text-xs text-slate-400 mb-4">Orders placed vs stock issued by month</p>
            <MonthlyChart />
          </div>

          <QuickActions />
        </div>

        {/* ── BOTTOM WIDGETS ───────────────────────────────────────── */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 mb-8 transition-all duration-700 delay-300 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <RecentActivities />
          <LowStock />
        </div>

      </div>

      {/* Floating CSS for orb animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
      `}</style>

      {/* AI Inventory Chatbot */}
      <InventoryChatbot />
    </div>
  );
}