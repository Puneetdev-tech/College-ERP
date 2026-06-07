import { useState } from "react";
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

export default function Dashboard() {
  const { currentUser, orders, inventory, systemSettings, approveOrder, rejectOrder } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();

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

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">

      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />

      <div className="ml-64 p-6">

        <Navbar />

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-8 mt-6 shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome Back, {currentUser?.name || "User"} 👋
          </h1>
          <p className="mt-2 text-blue-100">
            RJIT Inventory Management System
          </p>
        </div>

        {/* Pending Approvals Section */}
        {pendingOrdersCount > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mt-8 shadow-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-850 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Order Approvals
                </h2>
                <p className="text-slate-400 text-xs mt-1">Review purchase requests from officers and grant approvals.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                {pendingOrdersCount} pending
              </span>
            </div>

            <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-xs font-bold uppercase border-b border-slate-200/60">
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
                  <tbody className="divide-y divide-slate-150">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-100/40 transition">
                        <td className="p-3.5 font-semibold text-sm text-slate-850">{order.id}</td>
                        <td className="p-3.5 text-sm text-slate-700 font-medium">
                          {order.item} <span className="text-xs text-slate-400 font-normal">({order.type})</span>
                        </td>
                        <td className="p-3.5 text-sm text-slate-650">{order.supplier}</td>
                        <td className="p-3.5 text-sm font-bold text-slate-850">{order.quantity}</td>
                        <td className="p-3.5 text-sm font-semibold text-slate-800">₹{order.pricePerUnit?.toLocaleString()}</td>
                        <td className="p-3.5 text-sm font-black text-slate-800">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                        <td className="p-3.5 text-sm text-slate-600">
                          {order.department} <span className="text-xs text-slate-450 font-normal">({order.faculty})</span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-400">{order.orderDate}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                approveOrder(order.id);
                                showFlash(
                                  "success",
                                  "Order Approved ✓",
                                  `Order ${order.id} — ${order.quantity} × ${order.item} has been approved successfully.`
                                );
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                rejectOrder(order.id);
                                showFlash(
                                  "error",
                                  "Order Rejected",
                                  `Order ${order.id} — ${order.item} has been rejected.`
                                );
                              }}
                              className="bg-red-500 hover:bg-red-650 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition shadow active:scale-95"
                            >
                              Reject
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



        {/* Stat Cards Grid */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <StatCard title="Total Assets" value={totalAssets.toString()} />
          <StatCard title="Inventory Value" value={inventoryValue} />
          <StatCard title="Pending Orders" value={pendingOrdersCount.toString()} />
          <StatCard title="Low Stock" value={lowStockCount.toString()} />
        </div>

        {/* Monthly Analytics & Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          
          <div className="col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              Monthly Inventory Activity
            </h2>
            <MonthlyChart />
          </div>

          <QuickActions />

        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <RecentActivities />
          <LowStock />
        </div>

      </div>

    </div>
  );
}