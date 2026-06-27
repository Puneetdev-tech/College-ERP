import { useState } from "react";
import { FaUserPlus, FaTrash, FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import { useStore, ROLE_DEFAULT_PERMISSIONS } from "../context/StoreContext";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";
import ConfirmDialog from "../components/ConfirmDialog";

const ALL_PERMISSIONS = [
  "Dashboard",
  "Inventory",
  "Place Order",
  "Receive Order",
  "Issue Stock",
  "Analytics",
  "Reports",
  "Notifications",
  "Users",
  "Settings",
  "Maintenance",
  "Backup"
];

export default function UserManagement() {
  const { usersList, addUser, updateUser, deleteUser, approvalSequence, updateApprovalSequence } = useStore();
  const { flashes, showFlash, dismissFlash } = useFlash();
  const [showModal, setShowModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
  });

  // Form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedPermissions, setSelectedPermissions] = useState(ROLE_DEFAULT_PERMISSIONS["Admin"]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Approver config controls tab state and forms
  const [approverTab, setApproverTab] = useState("existing");
  const [newApprName, setNewApprName] = useState("");
  const [newApprEmail, setNewApprEmail] = useState("");
  const [newApprPassword, setNewApprPassword] = useState("");
  const [newApprRole, setNewApprRole] = useState("Account Office");
  const [isNewApprCustomRole, setIsNewApprCustomRole] = useState(false);
  const [newApprCustomRole, setNewApprCustomRole] = useState("");
  const [newApprError, setNewApprError] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("Admin");
    setIsCustomRole(false);
    setCustomRole("");
    setStatus("Active");
    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS["Admin"]);
    setIsEditMode(false);
    setEditingUserId(null);
    setErrorMsg("");
    setShowPassword(false);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === "Other") {
      setIsCustomRole(true);
      setSelectedPermissions([]);
    } else {
      setIsCustomRole(false);
      setCustomRole("");
      setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || []);
    }
  };

  const handleEditClick = (user) => {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password || ""); // Prefill password so admin can view/change it
    const isStandard = ["Admin", "Store Manager", "Purchase Officer", "Principal", "Account Office"].includes(user.role);
    if (isStandard) {
      setRole(user.role);
      setIsCustomRole(false);
      setCustomRole("");
    } else {
      setRole("Other");
      setIsCustomRole(true);
      setCustomRole(user.role);
    }
    setStatus(user.status);
    setSelectedPermissions(user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role] || []);
    setIsEditMode(true);
    setEditingUserId(user.id);
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Name and email are required!");
      return;
    }

    if (!isEditMode && !password.trim()) {
      setErrorMsg("Password is required for new users!");
      return;
    }

    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address!");
      return;
    }

    const finalRole = isCustomRole ? customRole.trim() : role;
    if (isCustomRole && !customRole.trim()) {
      setErrorMsg("Please specify a custom role name!");
      return;
    }

    const userData = {
      name: name.trim(),
      email: email.trim(),
      role: finalRole,
      status,
      permissions: selectedPermissions
    };

    if (!isEditMode) {
      userData.password = password.trim();
      const res = addUser(userData);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
      showFlash(
        "success",
        "User Created ✓",
        `New user "${userData.name}" has been created successfully.`
      );
    } else {
      if (password.trim()) {
        userData.password = password.trim();
      }
      updateUser(editingUserId, userData);
      showFlash(
        "success",
        "User Access Saved ✓",
        `Changes to user "${userData.name}" have been saved successfully.`
      );
    }

    resetForm();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    const user = usersList.find((u) => u.id === id);
    const userName = user ? user.name : "User";
    setConfirmDialog({
      isOpen: true,
      title: "Delete User",
      message: `Are you sure you want to delete the user "${userName}"? This will move them to the backup logs.`,
      type: "danger",
      onConfirm: () => {
        deleteUser(id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showFlash(
          "info",
          "User Deleted",
          `User "${userName}" has been deleted.`
        );
      }
    });
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800">
      <Sidebar />
      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure staff details and module permissions</p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-md font-semibold"
          >
            <FaUserPlus />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold text-sm">Name</th>
                  <th className="p-4 text-left font-semibold text-sm">Email</th>
                  <th className="p-4 text-left font-semibold text-sm">Role</th>
                  <th className="p-4 text-left font-semibold text-sm">Access Permissions</th>
                  <th className="p-4 text-left font-semibold text-sm">AI Chatbot</th>
                  <th className="p-4 text-left font-semibold text-sm">Status</th>
                  <th className="p-4 text-left font-semibold text-sm">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {usersList.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                    <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                    <td className="p-4 text-slate-700 text-sm font-medium">{user.role}</td>
                    <td className="p-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {user.permissions?.map((perm) => (
                          <span key={perm} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100">
                            {perm}
                          </span>
                        )) || <span className="text-slate-400 text-xs italic">No access</span>}
                      </div>
                    </td>
                    {/* AI Chatbot Access Toggle */}
                    <td className="p-4">
                      {user.role === "Admin" ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
                          🤖 Always On
                        </span>
                      ) : (
                        <button
                          onClick={() => updateUser(user.id, { chatbotAccess: !user.chatbotAccess })}
                          title={user.chatbotAccess ? "Revoke chatbot access" : "Grant chatbot access"}
                          className={`relative inline-flex items-center h-6 rounded-full w-12 transition-colors duration-300 cursor-pointer shadow-inner focus:outline-none ${
                            user.chatbotAccess
                              ? "bg-violet-600 shadow-violet-500/30"
                              : "bg-slate-300"
                          }`}
                        >
                          <span className={`inline-block w-4 h-4 transform bg-white rounded-full shadow-md transition-transform duration-300 ${
                            user.chatbotAccess ? "translate-x-7" : "translate-x-1"
                          }`} />
                          {user.chatbotAccess && (
                            <span className="absolute inset-0 rounded-full animate-pulse bg-violet-400/20" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          user.status === "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded cursor-pointer transition shadow-sm"
                          title="Edit Access"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded cursor-pointer transition shadow-sm"
                          title="Delete User"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Approval Chain Configuration Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mt-8">
          <div>
            <h2 className="text-xl font-bold text-slate-850">
              Procurement Approval Workflow Configuration
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Configure the sequential chain of authorities required to approve purchase requests. Requests will proceed strictly step-by-step.
            </p>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-6">
            
            {/* Visual Flow Diagram */}
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Current Approval Flow Sequence
              </h3>
              
              <div className="flex flex-col gap-4">
                {approvalSequence && approvalSequence.length > 0 ? (
                  approvalSequence.map((userId, idx) => {
                    const stepUser = usersList.find((u) => u.id === userId);
                    return (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-white border border-slate-200 p-3.5 rounded-xl flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-bold text-sm text-slate-800">
                              {stepUser ? stepUser.name : "Unknown Approver"}
                            </p>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                              {stepUser ? stepUser.role : "Approver"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (idx === 0) return;
                                const newSeq = [...approvalSequence];
                                const temp = newSeq[idx];
                                newSeq[idx] = newSeq[idx - 1];
                                newSeq[idx - 1] = temp;
                                updateApprovalSequence(newSeq);
                              }}
                              disabled={idx === 0}
                              className="text-slate-400 hover:text-slate-700 text-xs font-bold disabled:opacity-30 p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer transition"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => {
                                if (idx === approvalSequence.length - 1) return;
                                const newSeq = [...approvalSequence];
                                const temp = newSeq[idx];
                                newSeq[idx] = newSeq[idx + 1];
                                newSeq[idx + 1] = temp;
                                updateApprovalSequence(newSeq);
                              }}
                              disabled={idx === approvalSequence.length - 1}
                              className="text-slate-400 hover:text-slate-700 text-xs font-bold disabled:opacity-30 p-1 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer transition"
                              title="Move Down"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => {
                                const newSeq = approvalSequence.filter((_, i) => i !== idx);
                                updateApprovalSequence(newSeq);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded cursor-pointer transition"
                              title="Remove Step"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-6 bg-white border border-dashed border-slate-300 text-slate-450 text-sm font-semibold rounded-xl">
                    No steps in approval chain. Purchase orders will be auto-approved or Principal approved by default.
                  </div>
                )}
              </div>
            </div>

            {/* Config Controls */}
            <div className="w-full md:w-80 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Add Workflow Authority Step
                </h3>
                
                {/* Tab selector */}
                <div className="flex border-b border-slate-200 mb-4 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setApproverTab("existing")}
                    className={`flex-1 pb-2 border-b-2 transition ${approverTab === "existing" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproverTab("new")}
                    className={`flex-1 pb-2 border-b-2 transition ${approverTab === "new" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"}`}
                  >
                    Register New
                  </button>
                </div>

                {approverTab === "existing" ? (
                  <div>
                    <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1.5 tracking-wider">
                      Select User (Approver)
                    </label>
                    <select
                      id="approverSelect"
                      className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer text-slate-800"
                    >
                      <option value="">-- Choose Approver --</option>
                      {usersList
                        .filter((u) => u.status === "Active" && u.role !== "Admin")
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </option>
                        ))}
                    </select>
                    <p className="text-[10px] text-slate-450 mt-1.5">
                      Select any staff member with active authorization to add to the approval process.
                    </p>
                    
                    <button
                      onClick={() => {
                        const selectEl = document.getElementById("approverSelect");
                        const selectedIdStr = selectEl?.value;
                        if (!selectedIdStr) return;
                        const selectedId = parseInt(selectedIdStr, 10);
                        if (approvalSequence.includes(selectedId)) {
                          alert("This user is already in the approval chain sequence!");
                          return;
                        }
                        updateApprovalSequence([...approvalSequence, selectedId]);
                        selectEl.value = "";
                      }}
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition cursor-pointer active:scale-95 text-center text-xs"
                    >
                      Add Step to Workflow
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newApprError && (
                      <p className="text-[10px] text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 font-bold">
                        {newApprError}
                      </p>
                    )}
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-wider">Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Sanjay Mehta"
                        value={newApprName}
                        onChange={(e) => setNewApprName(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-wider">Email</label>
                      <input
                        type="email"
                        placeholder="e.g. accounts@rjit.ac.in"
                        value={newApprEmail}
                        onChange={(e) => setNewApprEmail(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-wider">Password</label>
                      <input
                        type="password"
                        placeholder="Password"
                        value={newApprPassword}
                        onChange={(e) => setNewApprPassword(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[10px] uppercase mb-1 tracking-wider">Role / Designation</label>
                      {!isNewApprCustomRole ? (
                        <select
                          value={newApprRole}
                          onChange={(e) => {
                            if (e.target.value === "Other") {
                              setIsNewApprCustomRole(true);
                              setNewApprRole("Other");
                            } else {
                              setNewApprRole(e.target.value);
                            }
                          }}
                          className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-800"
                        >
                          <option value="Account Office">Account Office</option>
                          <option value="Principal">Principal</option>
                          <option value="Store Manager">Store Manager</option>
                          <option value="Purchase Officer">Purchase Officer</option>
                          <option value="Other">Other (Type manually)</option>
                        </select>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Accounts Clerk"
                            value={newApprCustomRole}
                            onChange={(e) => setNewApprCustomRole(e.target.value)}
                            className="w-full border border-slate-200 p-2.5 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewApprCustomRole(false);
                              setNewApprCustomRole("");
                              setNewApprRole("Account Office");
                            }}
                            className="border border-slate-300 text-slate-655 px-3 rounded-xl hover:bg-slate-105 text-[10px] font-bold whitespace-nowrap cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setNewApprError("");
                        if (!newApprName.trim() || !newApprEmail.trim() || !newApprPassword.trim()) {
                          setNewApprError("All fields are required!");
                          return;
                        }
                        if (!newApprEmail.includes("@")) {
                          setNewApprError("Please enter a valid email address!");
                          return;
                        }

                        const finalRole = isNewApprCustomRole ? newApprCustomRole.trim() : newApprRole;
                        if (isNewApprCustomRole && !newApprCustomRole.trim()) {
                          setNewApprError("Please specify a custom role!");
                          return;
                        }
                        
                        const generatedId = Date.now();
                        const newUserObj = {
                          id: generatedId,
                          name: newApprName.trim(),
                          email: newApprEmail.trim(),
                          password: newApprPassword.trim(),
                          role: finalRole,
                          status: "Active",
                          permissions: ROLE_DEFAULT_PERMISSIONS[finalRole] || []
                        };
                        
                        const res = addUser(newUserObj);
                        if (!res.success) {
                          setNewApprError(res.message);
                          return;
                        }
                        
                        updateApprovalSequence([...approvalSequence, generatedId]);
                        
                        setNewApprName("");
                        setNewApprEmail("");
                        setNewApprPassword("");
                        setNewApprRole("Account Office");
                        setIsNewApprCustomRole(false);
                        setNewApprCustomRole("");
                        setApproverTab("existing");
                      }}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition cursor-pointer active:scale-95 text-center text-xs"
                    >
                      Create & Add Approver
                    </button>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white w-[520px] rounded-3xl p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {isEditMode ? "Edit User Access" : "Add User"}
              </h2>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-550/10 text-red-650 border border-red-200 rounded-xl text-sm font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border p-3 pr-10 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                      required={!isEditMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition duration-150 cursor-pointer"
                    >
                      {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Role</label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200 cursor-pointer font-medium"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Store Manager">Store Manager</option>
                      <option value="Purchase Officer">Purchase Officer</option>
                      <option value="Principal">Principal</option>
                      <option value="Account Office">Account Office</option>
                      <option value="Other">Other (Type manually)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200 cursor-pointer font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {isCustomRole && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Custom Role Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Accounts Assistant"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200 font-semibold"
                      required
                    />
                  </div>
                )}

                {/* Permissions Checkbox Grid */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
                    What this user can access
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label 
                        key={perm}
                        className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-200/50 rounded-lg transition text-xs font-medium text-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
                            }
                          }}
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                        <span>{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="bg-slate-250 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition font-semibold"
                  >
                    {isEditMode ? "Save Changes" : "Create User"}
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
    </div>
  );
}