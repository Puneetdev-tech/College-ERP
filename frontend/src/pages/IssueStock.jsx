import { useState } from "react";
import { FaArrowRight, FaClipboardList, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";

export default function IssueStock() {
  const { inventory, issuedStock, issueStockItem } = useStore();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [category, setCategory] = useState("Electronics");
  const [subcategory, setSubcategory] = useState("Computer");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [department, setDepartment] = useState("IT Department");
  const [faculty, setFaculty] = useState("");

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Unique categories in inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Subcategories based on selected category
  const subcategories = Array.from(
    new Set(
      inventory
        .filter((item) => item.category === category)
        .map((item) => item.subcategory)
    )
  );

  // Find matching inventory item to show current stock
  const matchingItem = inventory.find(
    (item) =>
      item.category.toLowerCase() === category.toLowerCase() &&
      item.subcategory.toLowerCase() === subcategory.toLowerCase() &&
      item.type.toLowerCase() === type.trim().toLowerCase()
  );
  const availableStock = matchingItem ? matchingItem.stock : 0;

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!subcategory) {
      setErrorMsg("Please select a subcategory.");
      return;
    }
    if (!type.trim()) {
      setErrorMsg("Please enter the specific item type.");
      return;
    }
    if (quantity <= 0) {
      setErrorMsg("Quantity must be at least 1.");
      return;
    }
    if (!faculty.trim()) {
      setErrorMsg("Please enter the faculty name.");
      return;
    }

    if (!matchingItem) {
      setErrorMsg("This specific item type does not exist in inventory for the selected category & subcategory.");
      return;
    }

    if (quantity > availableStock) {
      setErrorMsg(`Insufficient stock! Only ${availableStock} units available.`);
      return;
    }

    // Format current date & time automatically
    const now = new Date();
    const formattedDate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Trigger context action
    const res = issueStockItem({
      category,
      subcategory,
      type: type.trim(),
      quantity: parseInt(quantity, 10),
      department,
      faculty,
      date: formattedDate
    });

    if (res.success) {
      setSuccessMsg("Stock issued successfully!");
      // Reset form fields
      setQuantity(1);
      setType("");
      setFaculty("");
      setTimeout(() => {
        setSuccessMsg("");
        setShowModal(false);
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const departmentsList = [
    "Hostel",
    "Sports",
    "Laboratory",
    "IT Department",
    "Library",
    "Office",
    "Maintenance",
    "Medical"
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
              Issue Stock Center
            </h1>
            <p className="text-slate-500 mt-1">Disburse inventory items to departments and track faculty issues.</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl flex gap-2.5 items-center font-semibold cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all"
          >
            <FaClipboardList className="text-lg" />
            Issue Item
          </button>
        </div>

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <FaCheckCircle className="text-xl" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-700">Issued Stock Ledger</h2>
            <p className="text-slate-400 text-xs mt-0.5">Historical records of all disbursements.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Details</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Member</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Date & Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {issuedStock.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-slate-600">#IS-{String(log.id).padStart(3, "0")}</td>
                    <td className="p-4 text-sm font-bold text-slate-800">
                      <div>{log.item}</div>
                      {log.type && <span className="text-xs text-slate-400 font-normal">Spec: {log.type}</span>}
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700 font-medium">{log.department}</td>
                    <td className="p-4 text-sm text-slate-600">{log.faculty}</td>
                    <td className="p-4 text-sm text-slate-800 font-bold">{log.quantity}</td>
                    <td className="p-4 text-sm text-slate-500">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Item Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white w-[700px] rounded-3xl p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  Issue Inventory Item
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">Fill in the disbursement details. Available quantities are tracked automatically.</p>
              </div>

              {/* Error feedback in modal */}
              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-2.5 text-sm font-medium animate-fadeIn">
                  <FaExclamationTriangle className="text-base" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const newSubcats = Array.from(
                          new Set(
                            inventory
                              .filter((item) => item.category === newCat)
                              .map((item) => item.subcategory)
                          )
                        );
                        if (newSubcats.length > 0) {
                          setSubcategory(newSubcats[0]);
                        } else {
                          setSubcategory("");
                        }
                      }}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Selection */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Subcategory</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {subcategories.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Specific Type (Manual Text) */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Type / Specification</label>
                    <input
                      type="text"
                      placeholder="e.g. 100 Page, LaserJet, i5 16GB"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
                    />
                  </div>

                  {/* Quantity to Issue */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>

                </div>

                {/* Stock Level Informational Banner */}
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="text-sm" />
                    <span>Selected Item Stock Level:</span>
                  </div>
                  <span>{availableStock} units available</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Department */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Faculty Member */}
                  <div>
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Faculty Name</label>
                    <input
                      type="text"
                      placeholder="Enter faculty name"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
                    />
                  </div>

                </div>

                {/* Date and Time (Automatic read-only display) */}
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Issue Timestamp (Automatic)</label>
                  <input
                    type="text"
                    value={new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    disabled
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-semibold cursor-pointer active:scale-95 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 transition"
                  >
                    <FaArrowRight />
                    Confirm Issue
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