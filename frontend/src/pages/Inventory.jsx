import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import * as FaIcons from "react-icons/fa";
import { motion } from "framer-motion";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Inventory() {
  const navigate = useNavigate();
  const { inventoryCategories, addInventoryCategory, deleteInventoryCategory } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
  });
  
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    icon: "FaBoxes",
    color: "from-blue-600 to-indigo-750"
  });

  const getIcon = (iconName) => {
    const IconComponent = FaIcons[iconName];
    return IconComponent ? <IconComponent /> : <FaIcons.FaBoxes />;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.desc) {
      alert("Please enter Name and Description.");
      return;
    }
    addInventoryCategory({
      name: formData.name,
      desc: formData.desc,
      icon: formData.icon,
      color: formData.color
    });
    setFormData({
      name: "",
      desc: "",
      icon: "FaBoxes",
      color: "from-blue-600 to-indigo-750"
    });
    setShowAddModal(false);
  };

  const handleDelete = (e, catId, catName) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Delete Department Category",
      message: `Are you sure you want to delete the "${catName}" category? All its subcategory configurations will also be removed.`,
      onConfirm: () => {
        deleteInventoryCategory(catId);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: "danger"
    });
  };

  const COLOR_OPTIONS = [
    { name: "Blue-Indigo", value: "from-blue-600 to-indigo-750" },
    { name: "Teal-Emerald", value: "from-teal-500 to-emerald-600" },
    { name: "Amber-Orange", value: "from-amber-500 to-orange-600" },
    { name: "Sky-Blue", value: "from-sky-500 to-blue-600" },
    { name: "Rose-Pink", value: "from-rose-500 to-pink-600" },
    { name: "Yellow-Amber", value: "from-yellow-600 to-amber-700" },
    { name: "Indigo-Purple", value: "from-indigo-500 to-purple-600" },
    { name: "Violet-Fuchsia", value: "from-violet-500 to-fuchsia-600" },
    { name: "Red-Rose", value: "from-red-500 to-rose-600" },
    { name: "Gray-Slate", value: "from-slate-500 to-slate-700" }
  ];

  const ICON_OPTIONS = [
    { name: "Pen / Writing", value: "FaPen" },
    { name: "Broom / Cleaning", value: "FaBroom" },
    { name: "Bolt / Electrical", value: "FaBolt" },
    { name: "Desktop / Computer", value: "FaDesktop" },
    { name: "Running / Sports", value: "FaRunning" },
    { name: "Chair / Furniture", value: "FaChair" },
    { name: "Flask / Laboratory", value: "FaFlask" },
    { name: "Boxes / Pack", value: "FaBoxes" },
    { name: "Tools / Repair", value: "FaTools" },
    { name: "Book / Library", value: "FaBook" },
    { name: "Briefcase / Office", value: "FaBriefcase" },
    { name: "Heartbeat / Medical", value: "FaHeartbeat" }
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
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
            >
              <FaIcons.FaPlus />
              <span>Add Department</span>
            </button>
            <button
              onClick={() => navigate("/inventory/items")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
            >
              <FaIcons.FaList />
              <span>Master Inventory Ledger</span>
            </button>
            <button
              onClick={() => navigate("/inventory/legacy")}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
            >
              <FaIcons.FaDatabase />
              <span>Legacy CSV Store</span>
            </button>
            <button
              onClick={() => navigate("/inventory/legacy-sanitary")}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
            >
              <FaIcons.FaSoap />
              <span>Legacy Sanitary CSV</span>
            </button>
            <button
              onClick={() => navigate("/inventory/legacy-electrical")}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-3 rounded-xl cursor-pointer transition shadow hover:shadow-lg active:scale-95 flex items-center gap-2 text-sm"
            >
              <FaIcons.FaBolt />
              <span>Electrical Register</span>
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {inventoryCategories.map((dept) => (
            <motion.div
              key={dept.id}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={() => navigate(`/inventory/${dept.name}`)}
              className={`cursor-pointer bg-gradient-to-br ${
                dept.color || "from-blue-600 to-indigo-700"
              } text-white rounded-2xl p-6 shadow-lg relative overflow-hidden transition-all flex flex-col justify-between min-h-[180px] border border-white/5 hover:border-white/10 group`}
            >
              {/* Delete Icon */}
              <button
                onClick={(e) => handleDelete(e, dept.id, dept.name)}
                className="absolute top-3 right-3 bg-white/20 hover:bg-rose-600 text-white p-2 rounded-xl border border-white/10 transition duration-200 z-10 cursor-pointer shadow-sm hover:shadow-md"
                title="Delete Department"
              >
                <FaIcons.FaTrash className="text-xs" />
              </button>

              <div>
                <div className="text-3xl bg-white/15 w-fit p-3 rounded-xl mb-4 border border-white/10 flex items-center justify-center">
                  {getIcon(dept.icon)}
                </div>
                <h2 className="text-lg font-bold tracking-tight">{dept.name}</h2>
                <p className="text-xs text-white/70 leading-relaxed mt-1 line-clamp-2">{dept.desc}</p>
              </div>

              <div className="mt-4">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-3 py-1.5 rounded-lg">
                  Open Registry
                </span>
              </div>
            </motion.div>
          ))}

          {/* Dotted Add New Department Card placeholder */}
          <div
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[180px] bg-slate-50/50 hover:bg-blue-50/20 transition-all duration-300 cursor-pointer text-slate-400 hover:text-blue-600 group"
          >
            <div className="p-4 bg-slate-100 group-hover:bg-blue-100 rounded-full text-xl transition-colors mb-2">
              <FaIcons.FaPlus />
            </div>
            <span className="font-bold text-sm">Add New Department</span>
          </div>
        </div>

        {/* Master Registry Promo - Fills Bottom Space */}
        <div className="mt-10 bg-white rounded-3xl p-8 border border-slate-200 shadow-md flex flex-col md:flex-row justify-between items-center gap-6 no-print">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FaIcons.FaList className="text-blue-600" />
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

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="bg-emerald-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FaIcons.FaPlus /> Add Department Category
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Medical Supplies, CCTV"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  name="desc"
                  placeholder="Describe the department catalog scope..."
                  rows="2"
                  value={formData.desc}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Theme Color
                  </label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {COLOR_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Display Icon
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    {ICON_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.name}</option>
                    ))}
                  </select>
                </div>
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
                  Create Department
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