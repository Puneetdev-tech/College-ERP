import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import CategoryCard from "../components/CategoryCard";
import {
  FaChair,
  FaBolt,
  FaBroom,
  FaPen,
  FaTools,
  FaBoxOpen,
  FaArrowLeft,
  FaBed,
  FaRunning,
  FaFlask,
  FaDesktop,
  FaBook,
  FaBriefcase,
  FaWrench,
  FaHeartbeat
} from "react-icons/fa";

// Map department names to header details
const DEPT_ICONS = {
  "Stationary": <FaPen />,
  "Hostel": <FaBed />,
  "Sports": <FaRunning />,
  "Laboratory": <FaFlask />,
  "IT Department": <FaDesktop />,
  "Library": <FaBook />,
  "Office": <FaBriefcase />,
  "Medical": <FaHeartbeat />
};

const CATEGORY_STYLES = {
  "Furniture": { icon: <FaChair />, color: "bg-amber-50 text-amber-600 border-amber-100" },
  "Electrical": { icon: <FaBolt />, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  "Electronics": { icon: <FaDesktop />, color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  "Cleaning": { icon: <FaBroom />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  "Stationery": { icon: <FaPen />, color: "bg-blue-50 text-blue-600 border-blue-100" },
  "Equipment": { icon: <FaTools />, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  "Sports": { icon: <FaRunning />, color: "bg-orange-50 text-orange-600 border-orange-100" },
  "Miscellaneous": { icon: <FaBoxOpen />, color: "bg-slate-50 text-slate-600 border-slate-200" }
};

const DEPT_CATEGORIES = {
  "Stationary": ["Stationery"],
  "Hostel": ["Furniture", "Electronics", "Cleaning"],
  "Sports": ["Sports"],
  "Laboratory": ["Equipment", "Stationery"],
  "IT Department": ["Electronics"],
  "Library": ["Furniture", "Electronics", "Stationery"],
  "Office": ["Furniture", "Stationery", "Electronics"],
  "Medical": ["Equipment", "Cleaning"]
};

export default function DepartmentInventory() {
  const { department } = useParams();
  const navigate = useNavigate();

  const categories = DEPT_CATEGORIES[department] || [
    "Furniture",
    "Electronics",
    "Cleaning",
    "Stationery",
    "Equipment",
    "Miscellaneous"
  ];

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/inventory")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-bold text-sm mb-4 cursor-pointer no-print"
        >
          <FaArrowLeft />
          <span>Back to Departments</span>
        </button>

        {/* Dynamic Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="text-4xl bg-blue-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-center">
            {DEPT_ICONS[department] || <FaTools />}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {department} Department
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Explore catalog groupings for inventory stock inside {department}.</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, index) => {
            const style = CATEGORY_STYLES[cat] || { icon: <FaBoxOpen />, color: "bg-blue-50 text-blue-600 border-blue-100" };
            return (
              <CategoryCard
                key={index}
                name={cat}
                icon={style.icon}
                color={style.color}
              />
            );
          })}
        </div>

      </div>
    </div>
  );
}