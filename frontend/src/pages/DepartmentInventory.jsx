import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import * as FaIcons from "react-icons/fa";
import ConfirmDialog from "../components/ConfirmDialog";

// Map department names to header details
const DEPT_ICONS = {
  "Stationary": <FaIcons.FaPen />,
  "Sanitory": <FaIcons.FaBroom />,
  "Electrical": <FaIcons.FaBolt />,
  "Electronics": <FaIcons.FaDesktop />,
  "Sports": <FaIcons.FaRunning />,
  "Furniture": <FaIcons.FaChair />,
  "IT,CSE": <FaIcons.FaDesktop />,
  "laboratory": <FaIcons.FaFlask />,
  "Hostel": <FaIcons.FaBed />,
  "Laboratory": <FaIcons.FaFlask />,
  "IT Department": <FaIcons.FaDesktop />,
  "Library": <FaIcons.FaBook />,
  "Office": <FaIcons.FaBriefcase />,
  "Medical": <FaIcons.FaHeartbeat />
};

const CATEGORY_STYLES = {
  "Furniture": { icon: <FaIcons.FaChair />, color: "bg-amber-50 text-amber-600 border-amber-100" },
  "Electrical": { icon: <FaIcons.FaBolt />, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  "Electronics": { icon: <FaIcons.FaDesktop />, color: "bg-cyan-50 text-cyan-600 border-cyan-100" },
  "Cleaning": { icon: <FaIcons.FaBroom />, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  "Stationery": { icon: <FaIcons.FaPen />, color: "bg-blue-50 text-blue-600 border-blue-100" },
  "Equipment": { icon: <FaIcons.FaTools />, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  "Sports": { icon: <FaIcons.FaRunning />, color: "bg-orange-50 text-orange-600 border-orange-100" },
  "Miscellaneous": { icon: <FaIcons.FaBoxOpen />, color: "bg-slate-50 text-slate-600 border-slate-200" }
};

const DEPT_CATEGORIES = {
  "Stationary": ["Stationery"],
  "Sanitory": ["Cleaning"],
  "Electrical": ["Electrical"],
  "Electronics": ["Electronics"],
  "Sports": ["Sports"],
  "Furniture": ["Furniture"],
  "IT,CSE": ["Electronics"],
  "laboratory": ["Equipment", "Stationery"],
  "Hostel": ["Furniture", "Electronics", "Cleaning"],
  "Laboratory": ["Equipment", "Stationery"],
  "IT Department": ["Electronics"],
  "Library": ["Furniture", "Electronics", "Stationery"],
  "Office": ["Furniture", "Stationery", "Electronics"],
  "Medical": ["Equipment", "Cleaning"]
};

export default function DepartmentInventory() {
  const { department } = useParams();
  const navigate = useNavigate();

  const {
    inventoryCategories,
    inventorySubcategories,
    addInventorySubcategory,
    deleteInventorySubcategory
  } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [subName, setSubName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
  });

  // Find category in dynamic context list
  const matchedCategory = inventoryCategories.find(
    c => c.name.toLowerCase() === department?.toLowerCase()
  );

  // Get active subcategories
  let subcategories = [];
  let isDynamic = false;
  if (matchedCategory) {
    isDynamic = true;
    subcategories = inventorySubcategories
      .filter(s => s.categoryId === matchedCategory.id)
      .map(s => s.name);
  } else {
    // Compatibility fallback
    subcategories = DEPT_CATEGORIES[department] || [
      "Furniture",
      "Electronics",
      "Cleaning",
      "Stationery",
      "Equipment",
      "Miscellaneous"
    ];
  }

  const handleNavigate = (catName) => {
    navigate(`/inventory/items?category=${catName}&department=${department}`);
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!subName.trim()) {
      alert("Please enter subcategory name.");
      return;
    }
    if (isDynamic && matchedCategory) {
      addInventorySubcategory(matchedCategory.id, subName.trim());
      setSubName("");
      setShowAddModal(false);
    }
  };

  const handleDeleteSubcategory = (e, catName) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Delete Subcategory",
      message: `Are you sure you want to delete the subcategory "${catName}"?`,
      onConfirm: () => {
        if (isDynamic && matchedCategory) {
          deleteInventorySubcategory(matchedCategory.id, catName);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: "danger"
    });
  };

  const getDeptIcon = () => {
    if (matchedCategory) {
      const IconComp = FaIcons[matchedCategory.icon];
      if (IconComp) return <IconComp />;
    }
    return DEPT_ICONS[department] || <FaIcons.FaTools />;
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/inventory")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-bold text-sm mb-4 cursor-pointer no-print"
        >
          <FaIcons.FaArrowLeft />
          <span>Back to Departments</span>
        </button>

        {/* Dynamic Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-4xl bg-blue-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-center">
              {getDeptIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {department} Department
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">Explore catalog groupings for inventory stock inside {department}.</p>
            </div>
          </div>
          {isDynamic && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition shadow flex items-center gap-2 text-sm"
            >
              <FaIcons.FaPlus />
              <span>Add Subcategory</span>
            </button>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subcategories.map((cat, index) => {
            const style = CATEGORY_STYLES[cat] || { icon: <FaIcons.FaBoxOpen />, color: "bg-blue-50 text-blue-600 border-blue-100" };
            return (
              <div
                key={index}
                onClick={() => handleNavigate(cat)}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex items-center gap-4 border border-slate-200/50 hover:border-blue-300 relative group"
              >
                {/* Trash delete button */}
                {isDynamic && (
                  <button
                    onClick={(e) => handleDeleteSubcategory(e, cat)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-lg transition-all duration-200 z-10 cursor-pointer"
                    title="Delete Subcategory"
                  >
                    <FaIcons.FaTrash className="text-xs" />
                  </button>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border shrink-0 ${style.color}`}>
                  {style.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-tight">{cat}</h2>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Explore assets</p>
                </div>
              </div>
            );
          })}

          {/* Dynamic Dotted Add Card Placeholder */}
          {isDynamic && (
            <div
              onClick={() => setShowAddModal(true)}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/20 transition-all duration-300 cursor-pointer text-slate-400 hover:text-blue-600 group"
            >
              <div className="p-3 bg-slate-100 group-hover:bg-blue-100 rounded-full text-base transition-colors mb-1.5">
                <FaIcons.FaPlus />
              </div>
              <span className="font-bold text-sm">Add Subcategory</span>
            </div>
          )}
        </div>

      </div>

      {/* Add Subcategory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="bg-emerald-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FaIcons.FaPlus /> Add Subcategory
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddSubcategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stationery, Equipment"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow hover:shadow-md transition cursor-pointer"
                >
                  Create Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />

    </div>
  );
}