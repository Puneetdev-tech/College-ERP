import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/Statcard";
import MonthlyChart from "../components/MonthlyChart";
import RecentActivities from "../components/RecentActivities";
import LowStock from "../components/LowStock";
import QuickActions from "../components/QuickActions";

export default function Dashboard() {
  return (
    <div className="bg-slate-100 min-h-screen">

      <Sidebar />

      <div className="ml-64 p-6">

        <Navbar />

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl p-8 mt-6 shadow-lg">
          <h1 className="text-3xl font-bold">
            Welcome Back 👋
          </h1>
          <p className="mt-2 text-blue-100">
            RJIT Inventory Management System
          </p>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <StatCard title="Total Assets" value="1250" />
          <StatCard title="Inventory Value" value="₹12.5L" />
          <StatCard title="Pending Orders" value="14" />
          <StatCard title="Low Stock" value="9" />
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