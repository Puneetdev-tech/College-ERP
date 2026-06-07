import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import DepartmentCard from "../components/DepartmentCard";
import {
  FaBed,
  FaRunning,
  FaFlask,
  FaDesktop,
  FaBook,
  FaBriefcase,
  FaWrench,
  FaHeartbeat,
  FaList
} from "react-icons/fa";

export default function Inventory() {
  const navigate = useNavigate();

  const departments = [
    { name: "Hostel", icon: <FaBed />, desc: "Hostel rooms furniture, bedding, and lounge appliances.", color: "from-amber-500 to-orange-600" },
    { name: "Sports", icon: <FaRunning />, desc: "Sports kits, athletics gear, fitness assets, and court equipment.", color: "from-emerald-500 to-teal-600" },
    { name: "Laboratory", icon: <FaFlask />, desc: "Chemicals, glassware, microscopes, and scientific machinery.", color: "from-sky-500 to-blue-600" },
    { name: "IT Department", icon: <FaDesktop />, desc: "Desktop systems, router gateways, monitors, and peripherals.", color: "from-indigo-500 to-purple-600" },
    { name: "Library", icon: <FaBook />, desc: "Reference books, reading desks, catalogs, and study chairs.", color: "from-violet-500 to-fuchsia-600" },
    { name: "Office", icon: <FaBriefcase />, desc: "Admin stationery, files, storage cabinets, and desks.", color: "from-rose-500 to-pink-600" },
    { name: "Maintenance", icon: <FaWrench />, desc: "Plumbing machinery, electrical toolkit sets, and cleaners.", color: "from-slate-600 to-slate-800" },
    { name: "Medical", icon: <FaHeartbeat />, desc: "First-aid boxes, checkup devices, and sanitization kits.", color: "from-red-500 to-rose-600" }
  ];

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6">

        {/* Intro Header */}
        <div className="mb-6 flex justify-between items-center no-print">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Inventory Departments
            </h1>
            <p className="text-slate-500 text-sm mt-1">Select a department workspace to view subcategories and stock logs.</p>
          </div>
          <button
            onClick={() => navigate("/inventory/items")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
          >
            <FaList />
            <span>Master Inventory Ledger</span>
          </button>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {departments.map((dept, index) => (
            <DepartmentCard
              key={index}
              name={dept.name}
              icon={dept.icon}
              desc={dept.desc}
              color={dept.color}
            />
          ))}
        </div>

        {/* Master Registry Promo - Fills Bottom Space */}
        <div className="mt-10 bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 no-print">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaList className="text-blue-600" />
              Master Asset & Stock Database
            </h3>
            <p className="text-slate-500 text-xs">
              Open the complete ledger sheet showing all categorized asset types, values, prices, and quantities across RJIT Campus.
            </p>
          </div>
          <button
            onClick={() => navigate("/inventory/items")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3.5 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 text-sm whitespace-nowrap"
          >
            View Master Ledger Table
          </button>
        </div>

      </div>
    </div>
  );
}