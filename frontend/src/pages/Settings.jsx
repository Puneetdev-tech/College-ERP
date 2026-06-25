import { useState, useEffect } from "react";
import { FaUser, FaSlidersH, FaBuilding, FaLock, FaImage, FaCheckCircle, FaSave, FaHistory, FaTrash, FaTimes, FaUnlock, FaSearch, FaFilter, FaCheckSquare, FaSquare, FaDatabase, FaShieldAlt, FaClock, FaBell, FaCalendarAlt, FaPlay, FaToggleOn, FaToggleOff } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import { useStore } from "../context/StoreContext";
import ConfirmDialog from "../components/ConfirmDialog";
import FlashMessage from "../components/FlashMessage";
import useFlash from "../components/useFlash";

export default function Settings() {
  const { 
    currentUser, 
    updateUser, 
    systemSettings, 
    updateSystemSettings,
    backup,
    restoreBackupItem,
    restoreAllBackup,
    permanentlyDeleteBackupItem,
    permanentlyDeleteAllBackup
  } = useStore();

  const { flashes, showFlash, dismissFlash } = useFlash();

  const [activeTab, setActiveTab] = useState("profile");
  const [successMsg, setSuccessMsg] = useState("");

  // Profile Form States
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.photo || "");

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // System Settings States
  const [lowStockThreshold, setLowStockThreshold] = useState(systemSettings?.lowStockThreshold || 10);
  const [theme, setTheme] = useState(systemSettings?.theme || "light");

  // College Info States
  const [collegeName, setCollegeName] = useState(systemSettings?.collegeInfo?.name || "");
  const [collegeLogo, setCollegeLogo] = useState(systemSettings?.collegeInfo?.logo || "");
  const [collegeAddress, setCollegeAddress] = useState(systemSettings?.collegeInfo?.address || "");
  const [collegePhone, setCollegePhone] = useState(systemSettings?.collegeInfo?.phone || "");
  const [collegeEmail, setCollegeEmail] = useState(systemSettings?.collegeInfo?.email || "");
  const [collegeWebsite, setCollegeWebsite] = useState(systemSettings?.collegeInfo?.website || "");

  // Hidden Backup States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [backupPassword, setBackupPassword] = useState("");
  const [backupPasswordError, setBackupPasswordError] = useState("");
  const [showBackupManager, setShowBackupManager] = useState(false);
  
  // Backup manager layout states
  const [backupSearch, setBackupSearch] = useState("");
  const [backupTypeFilter, setBackupTypeFilter] = useState("all");
  const [selectedBackupIds, setSelectedBackupIds] = useState([]);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: () => {},
    type: "danger"
  });

  // Schedule Backup States
  const [scheduleEnabled, setScheduleEnabled] = useState(() => {
    const saved = localStorage.getItem("rjit_scheduleBackup");
    return saved ? JSON.parse(saved).enabled : false;
  });
  const [scheduleInterval, setScheduleInterval] = useState(() => {
    const saved = localStorage.getItem("rjit_scheduleBackup");
    return saved ? JSON.parse(saved).interval : "daily";
  });
  const [scheduleTime, setScheduleTime] = useState(() => {
    const saved = localStorage.getItem("rjit_scheduleBackup");
    return saved ? JSON.parse(saved).time : "02:00";
  });
  const [scheduleLastRun, setScheduleLastRun] = useState(() => {
    const saved = localStorage.getItem("rjit_scheduleBackup");
    return saved ? JSON.parse(saved).lastRun : null;
  });
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);

  // Handle local state when currentUser/systemSettings change on mount or load
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfileEmail(currentUser.email || "");
      setProfilePhone(currentUser.phone || "+91 98765 43210");
      setProfilePhoto(currentUser.photo || "");
    }
  }, [currentUser]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "profile") {
          setProfilePhoto(reader.result);
        } else if (type === "logo") {
          setCollegeLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (currentUser) {
      updateUser(currentUser.id, {
        name: profileName,
        email: profileEmail,
        phone: profilePhone,
        photo: profilePhoto
      });
      triggerSuccess("Profile updated successfully!");
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required!");
      return;
    }

    if (currentPassword !== currentUser.password) {
      setPasswordError("Current password incorrect!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match!");
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters long!");
      return;
    }

    updateUser(currentUser.id, { password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerSuccess("Password changed successfully!");
  };

  const handleSaveSystemSettings = (e) => {
    if (e) e.preventDefault();
    
    // Apply theme changes to document body instantly
    const applyTheme = (targetTheme) => {
      const isDark = targetTheme === "dark" || (targetTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      if (isDark) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    };
    applyTheme(theme);

    updateSystemSettings({
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      theme,
      collegeInfo: {
        name: collegeName,
        logo: collegeLogo,
        address: collegeAddress,
        phone: collegePhone,
        email: collegeEmail,
        website: collegeWebsite
      }
    });

    triggerSuccess("Settings and configurations saved!");
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDoubleClickEmptySpace = (e) => {
    const tagName = e.target.tagName.toLowerCase();
    if (["input", "textarea", "button", "select", "option", "img", "label", "svg", "path"].includes(tagName)) {
      return;
    }
    if (currentUser?.permissions?.includes("Backup")) {
      setShowPasswordModal(true);
      setBackupPassword("");
      setBackupPasswordError("");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (backupPassword === "backup123") {
      setShowPasswordModal(false);
      setShowBackupManager(true);
      setSelectedBackupIds([]);
      showFlash("success", "Access Granted ✓", "Backup logs unlocked successfully.");
    } else {
      setBackupPasswordError("Incorrect backup credentials. Please try again.");
    }
  };

  const formatBackupItemDetails = (item) => {
    const { type, data } = item;
    switch (type) {
      case "user":
        return `User: ${data.name} (${data.email}) - Role: ${data.role}`;
      case "inventoryCategory":
        return `Inventory Register: ${data.category?.name || "N/A"} (${data.subcategories?.length || 0} subcategories)`;
      case "inventorySubcategory":
        return `Inventory Subcategory: ${data.name} under Register ID: ${data.categoryId}`;
      case "maintenanceCategory":
        return `Maintenance Category: ${data.category?.name || "N/A"} (${data.logs?.length || 0} units)`;
      case "maintenanceSubcategory":
        return `Asset Unit: ${data.name} (${data.location}) - Category: ${data.category}`;
      case "maintenanceLog":
        return `Maintenance Log: ${data.log?.partRepaired || "Repair"} on Unit ID: ${data.roId} (Cost: ₹${data.log?.totalAmount || 0})`;
      default:
        return "Unknown Deleted Item";
    }
  };

  const getBackupTypeLabel = (type) => {
    switch (type) {
      case "user": return "User";
      case "inventoryCategory": return "Inventory Register";
      case "inventorySubcategory": return "Inventory Subcategory";
      case "maintenanceCategory": return "Maintenance Category";
      case "maintenanceSubcategory": return "Asset Unit";
      case "maintenanceLog": return "Maintenance Log";
      default: return "Other";
    }
  };

  const getBackupTypeBadgeClass = (type) => {
    switch (type) {
      case "user": return "bg-purple-50 text-purple-750 border-purple-150 dark:bg-purple-950/20";
      case "inventoryCategory": return "bg-blue-50 text-blue-750 border-blue-150 dark:bg-blue-950/20";
      case "inventorySubcategory": return "bg-sky-50 text-sky-755 border-sky-150 dark:bg-sky-955/20";
      case "maintenanceCategory": return "bg-amber-50 text-amber-750 border-amber-150 dark:bg-amber-950/20";
      case "maintenanceSubcategory": return "bg-emerald-50 text-emerald-750 border-emerald-150 dark:bg-emerald-950/20";
      case "maintenanceLog": return "bg-rose-50 text-rose-750 border-rose-150 dark:bg-rose-950/20";
      default: return "bg-slate-50 text-slate-750 border-slate-200 dark:bg-slate-950/20";
    }
  };

  const handleSaveSchedule = () => {
    const config = { enabled: scheduleEnabled, interval: scheduleInterval, time: scheduleTime, lastRun: scheduleLastRun };
    localStorage.setItem("rjit_scheduleBackup", JSON.stringify(config));
    showFlash("success", "Schedule Saved ✓", scheduleEnabled ? `Auto-backup scheduled ${scheduleInterval} at ${scheduleTime}.` : "Auto-backup schedule has been disabled.");
    setShowSchedulePanel(false);
  };

  const handleRunBackupNow = () => {
    const now = new Date().toISOString();
    setScheduleLastRun(now);
    const config = { enabled: scheduleEnabled, interval: scheduleInterval, time: scheduleTime, lastRun: now };
    localStorage.setItem("rjit_scheduleBackup", JSON.stringify(config));
    showFlash("success", "Backup Triggered ✓", "Manual backup snapshot captured successfully.");
  };

  const handleRestoreItem = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: "Restore Deleted Item",
      message: `Are you sure you want to restore this ${getBackupTypeLabel(item.type)}?`,
      type: "info",
      confirmText: "Restore",
      onConfirm: () => {
        const res = restoreBackupItem(item.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        if (res.success) {
          showFlash("success", "Item Restored ✓", "The item has been recovered successfully.");
          setSelectedBackupIds(prev => prev.filter(id => id !== item.id));
        } else {
          showFlash("error", "Restore Failed ✗", res.message || "Could not restore item.");
        }
      }
    });
  };

  const handlePermanentDeleteItem = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: "Permanently Delete",
      message: `Are you sure you want to permanently delete this item? This action is irreversible.`,
      type: "danger",
      onConfirm: () => {
        permanentlyDeleteBackupItem(item.id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showFlash("info", "Purged Permanently", "The backup log entry was permanently destroyed.");
        setSelectedBackupIds(prev => prev.filter(id => id !== item.id));
      }
    });
  };

  const handleRestoreSelected = () => {
    if (selectedBackupIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: "Restore Selected",
      message: `Are you sure you want to restore the ${selectedBackupIds.length} selected items?`,
      type: "info",
      confirmText: "Restore",
      onConfirm: () => {
        let successCount = 0;
        let errors = [];
        
        const order = {
          "user": 1,
          "inventoryCategory": 1,
          "maintenanceCategory": 1,
          "inventorySubcategory": 2,
          "maintenanceSubcategory": 2,
          "maintenanceLog": 3
        };
        const selectedItems = backup
          .filter(b => selectedBackupIds.includes(b.id))
          .sort((a, b) => (order[a.type] || 99) - (order[b.type] || 99));

        selectedItems.forEach(item => {
          const res = restoreBackupItem(item.id);
          if (res.success) {
            successCount++;
          } else {
            errors.push(res.message);
          }
        });

        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSelectedBackupIds([]);
        
        if (successCount > 0) {
          showFlash("success", "Restored Selected ✓", `Recovered ${successCount} items successfully.`);
        }
        if (errors.length > 0) {
          showFlash("error", "Some Restores Failed", errors[0]);
        }
      }
    });
  };

  const handlePermanentDeleteSelected = () => {
    if (selectedBackupIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: "Permanently Delete Selected",
      message: `Are you sure you want to permanently delete the ${selectedBackupIds.length} selected items? This cannot be undone.`,
      type: "danger",
      onConfirm: () => {
        selectedBackupIds.forEach(id => {
          permanentlyDeleteBackupItem(id);
        });
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSelectedBackupIds([]);
        showFlash("info", "Selected Purged", "The selected items were permanently deleted.");
      }
    });
  };

  const handleRestoreAll = () => {
    if (backup.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: "Restore All Backups",
      message: "Are you sure you want to restore all deleted items? Dependents of missing parents will be skipped.",
      type: "info",
      confirmText: "Restore All",
      onConfirm: () => {
        const res = restoreAllBackup();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSelectedBackupIds([]);
        if (res.success) {
          showFlash("success", "All Restored ✓", `Successfully restored ${res.count} items.`);
        }
      }
    });
  };

  const handlePermanentDeleteAll = () => {
    if (backup.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: "Permanently Delete All",
      message: "Are you sure you want to delete all backup entries permanently? This will clear the entire backup log.",
      type: "danger",
      onConfirm: () => {
        permanentlyDeleteAllBackup();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSelectedBackupIds([]);
        showFlash("info", "Backup Purged", "The backup database has been fully cleared.");
      }
    });
  };

  const toggleSelectBackupItem = (id) => {
    setSelectedBackupIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = (visibleIds) => {
    const allSelected = visibleIds.every(id => selectedBackupIds.includes(id));
    if (allSelected) {
      setSelectedBackupIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedBackupIds(prev => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  const getDaysRemaining = (deletedAt) => {
    const deletedTime = new Date(deletedAt).getTime();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - deletedTime;
    const remaining = thirtyDays - elapsed;
    if (remaining <= 0) return "0 days left";
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    return `${days} days left`;
  };

  const filteredBackup = (backup || []).filter(item => {
    const detailText = formatBackupItemDetails(item).toLowerCase();
    const searchMatch = detailText.includes(backupSearch.toLowerCase());
    const typeMatch = backupTypeFilter === "all" || item.type === backupTypeFilter;
    return searchMatch && typeMatch;
  });

  const tabs = [
    { id: "profile", name: "Profile Settings", icon: <FaUser /> },
    { id: "password", name: "Change Password", icon: <FaLock /> },
    { id: "system", name: "Inventory Settings", icon: <FaSlidersH /> },
    { id: "college", name: "College Information", icon: <FaBuilding /> },
  ];

  return (
    <div onDoubleClick={handleDoubleClickEmptySpace} className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
            <p className="text-slate-500 text-sm mt-1">Configure profile settings and system configurations</p>
          </div>
          
          {successMsg && (
            <div className="bg-green-100 text-green-800 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold animate-fadeIn shadow-md">
              <FaCheckCircle className="text-green-600" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Tab Layout Grid */}
        <div className="grid grid-cols-4 gap-6 max-w-5xl">
          
          {/* Side Tabs Navigation */}
          <div className="col-span-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 border border-slate-200/50 shadow-sm"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Settings Tab Content */}
          <div className="col-span-3 bg-white border border-slate-200 rounded-3xl p-8 shadow-lg min-h-[420px]">
            
            {/* 1. Profile Settings Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-5 border-slate-150">Profile Settings</h2>
                
                <div className="flex items-center gap-6 pb-2">
                  <div className="relative group">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-2xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center border border-slate-200">
                        <FaUser size={36} />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/55 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-semibold">
                      <FaImage className="mr-1 text-sm" /> Upload
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "profile")} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-base">Profile Picture</h3>
                    <p className="text-slate-450 text-xs mt-1">Upload a JPG, PNG or WebP image file.</p>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto("")}
                        className="text-red-500 hover:text-red-650 text-xs font-bold mt-2 cursor-pointer block"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Role / Designation</label>
                    <input
                      type="text"
                      value={currentUser?.role || ""}
                      disabled
                      className="w-full border p-3 rounded-xl bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
                  >
                    <FaSave /> Update Profile
                  </button>
                </div>
              </form>
            )}

            {/* 2. Change Password Tab */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-5 border-slate-150">Change Password</h2>

                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-650 border border-red-200 rounded-xl text-sm font-semibold">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
                  >
                    <FaSave /> Update Password
                  </button>
                </div>
              </form>
            )}

            {/* 3. Inventory Settings Tab */}
            {activeTab === "system" && (
              <form onSubmit={handleSaveSystemSettings} className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-5 border-slate-150">Inventory Settings</h2>

                <div className="max-w-md">
                  {/* Low Stock Threshold */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Low Stock Alert Threshold</label>
                    <input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-850"
                      min="1"
                      required
                    />
                    <p className="text-slate-400 text-[10px] mt-1.5">Items with stock count at or below this value will trigger Low Stock alerts.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
                  >
                    <FaSave /> Save Configuration
                  </button>
                </div>
              </form>
            )}

            {/* 4. College Information Tab */}
            {activeTab === "college" && (
              <form onSubmit={handleSaveSystemSettings} className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mb-5 border-slate-150">College Details</h2>

                <div className="flex items-center gap-6 pb-2">
                  <div className="relative group">
                    {collegeLogo ? (
                      <img src={collegeLogo} alt="College Logo" className="w-24 h-24 rounded-2xl object-contain border border-slate-200 bg-slate-50 p-1" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-slate-200">
                        <FaBuilding size={36} />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/55 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-semibold">
                      <FaImage className="mr-1 text-sm" /> Logo
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-700 text-base">College Logo</h3>
                    <p className="text-slate-450 text-xs mt-1">Upload a JPG, PNG, or SVG logo. This will print on official reports.</p>
                    {collegeLogo && (
                      <button
                        type="button"
                        onClick={() => setCollegeLogo("")}
                        className="text-red-500 hover:text-red-650 text-xs font-bold mt-2 cursor-pointer block"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">College Name</label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Website Domain</label>
                    <input
                      type="text"
                      value={collegeWebsite}
                      onChange={(e) => setCollegeWebsite(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Office Phone Number</label>
                    <input
                      type="text"
                      value={collegePhone}
                      onChange={(e) => setCollegePhone(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Official Email</label>
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">College Address</label>
                  <textarea
                    value={collegeAddress}
                    onChange={(e) => setCollegeAddress(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 border-slate-200"
                    rows="2"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition"
                  >
                    <FaSave /> Save Details
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText || (confirmDialog.type === "danger" ? "Delete" : "Confirm")}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />

      <FlashMessage flashes={flashes} onDismiss={dismissFlash} />

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-indigo-500/35 text-white rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.25)] w-full max-w-md overflow-hidden relative p-8 flex flex-col items-center animate-glow">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full blur-sm" />
            
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer transition text-lg bg-slate-900/40 hover:bg-slate-800/60 p-1.5 rounded-lg border border-slate-800"
            >
              <FaTimes />
            </button>

            <div className="bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 p-5 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse-neon mb-4 mt-4">
              <FaShieldAlt size={32} />
            </div>

            <h3 className="font-extrabold text-2xl tracking-tight text-center bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">Security Access Required</h3>
            <p className="text-slate-400 text-xs text-center mt-1.5 px-6 leading-relaxed">
              You have triggered a restricted diagnostic zone. Enter authorization credentials to view backup logs.
            </p>

            <form onSubmit={handlePasswordSubmit} className="w-full mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Backup Gateway Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-3.5 text-slate-550" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full bg-slate-955 border border-slate-800/80 focus:border-indigo-400/80 focus:shadow-[0_0_15px_rgba(99,102,241,0.25)] focus:ring-1 focus:ring-indigo-400/30 rounded-xl pl-10 pr-3.5 py-3 text-sm focus:outline-none font-semibold tracking-wider text-center text-white placeholder-slate-800 transition duration-300"
                  />
                </div>
                {backupPasswordError && (
                  <p className="text-red-500 text-[10px] font-bold mt-2 text-center animate-bounce">{backupPasswordError}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-650 via-purple-650 to-indigo-650 bg-[length:200%_auto] hover:bg-right text-white font-bold py-3 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.4)] cursor-pointer active:scale-95 transition-all duration-500 flex items-center justify-center gap-2 text-sm"
                >
                  <FaUnlock size={14} />
                  <span>Authenticate Gateway</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backup Manager Modal */}
      {showBackupManager && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-200/60 rounded-3xl shadow-[0_20px_60px_-10px_rgba(109,40,217,0.25)] w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden relative">
            
            {/* Decorative top gradient bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 rounded-t-3xl z-10" />

            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white p-5 flex justify-between items-center shrink-0 pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/15 border border-white/25 text-white p-2.5 rounded-2xl shadow-lg">
                  <FaDatabase size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight text-white drop-shadow-sm">System Backup & Recovery Console</h3>
                  <p className="text-indigo-200 text-xs mt-0.5 font-medium">Deleted entities preserved for 30 days • Auto-purge enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSchedulePanel(!showSchedulePanel)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                    showSchedulePanel
                      ? "bg-white text-violet-700 border-white shadow-md"
                      : "bg-white/15 text-white border-white/25 hover:bg-white/25"
                  }`}
                  title="Schedule Backup"
                >
                  <FaClock size={12} />
                  <span>Schedule</span>
                  {scheduleEnabled && (
                    <span className="bg-green-400 text-green-900 text-[8px] font-extrabold px-1 rounded-full">ON</span>
                  )}
                </button>
                <button 
                  onClick={() => setShowBackupManager(false)} 
                  className="bg-white/15 hover:bg-white/30 border border-white/25 text-white p-2.5 rounded-xl transition cursor-pointer"
                  title="Close Console"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* Schedule Backup Panel */}
            {showSchedulePanel && (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-indigo-200/60 p-5 shrink-0">
                <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setScheduleEnabled(prev => !prev)}
                      className={`text-3xl transition-colors duration-300 cursor-pointer ${scheduleEnabled ? "text-violet-600" : "text-slate-400"}`}
                      title={scheduleEnabled ? "Disable auto-backup" : "Enable auto-backup"}
                    >
                      {scheduleEnabled ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Auto Backup {scheduleEnabled ? "Enabled" : "Disabled"}</p>
                      <p className="text-[10px] text-slate-500">Automatically capture backup snapshots at your set interval</p>
                    </div>
                  </div>

                  {/* Interval & Time */}
                  <div className="flex gap-3 flex-1">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Frequency</label>
                      <select
                        value={scheduleInterval}
                        onChange={(e) => setScheduleInterval(e.target.value)}
                        disabled={!scheduleEnabled}
                        className="w-full bg-white border border-violet-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 cursor-pointer"
                      >
                        <option value="daily">Every Day</option>
                        <option value="weekly">Every Week</option>
                        <option value="biweekly">Every 2 Weeks</option>
                        <option value="monthly">Every Month</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Backup Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        disabled={!scheduleEnabled}
                        className="w-full bg-white border border-violet-200 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handleRunBackupNow}
                      className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-teal-500/25"
                    >
                      <FaPlay size={10} /> Run Now
                    </button>
                    <button
                      onClick={handleSaveSchedule}
                      className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md shadow-violet-500/25"
                    >
                      <FaSave size={10} /> Save
                    </button>
                  </div>
                </div>
                {scheduleLastRun && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-indigo-600 font-semibold">
                    <FaBell size={9} />
                    <span>Last backup run: {new Date(scheduleLastRun).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                )}
              </div>
            )}

            {/* Top Toolbar / Filters */}
            <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3 bg-white/70 shrink-0">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search deleted records by detail..."
                  value={backupSearch}
                  onChange={(e) => setBackupSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-slate-700 placeholder-slate-400 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all duration-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap"><FaFilter className="inline mr-1 text-violet-500" /> Filter</span>
                <select
                  value={backupTypeFilter}
                  onChange={(e) => setBackupTypeFilter(e.target.value)}
                  className="bg-white border border-slate-200 focus:border-violet-400 text-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="user">Users</option>
                  <option value="inventoryCategory">Inventory Registers</option>
                  <option value="inventorySubcategory">Inventory Subcategories</option>
                  <option value="maintenanceCategory">Maintenance Categories</option>
                  <option value="maintenanceSubcategory">Asset Units</option>
                  <option value="maintenanceLog">Maintenance Logs</option>
                </select>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-violet-50/30 to-white">
              {filteredBackup.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-violet-200">
                  <div className="bg-violet-100 text-violet-400 p-5 rounded-full mb-3">
                    <FaDatabase size={36} />
                  </div>
                  <h4 className="font-bold text-slate-600 text-base">No Backup Records Found</h4>
                  <p className="text-slate-400 text-xs mt-1 px-12 leading-relaxed">
                    {backupSearch || backupTypeFilter !== "all" 
                      ? "Try tweaking search parameters or filter options." 
                      : "Awesome! There are no deleted entities in the database."}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-violet-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3.5 w-12 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectAllVisible(filteredBackup.map(i => i.id))}
                            className="text-white/60 hover:text-white transition cursor-pointer"
                          >
                            {filteredBackup.every(i => selectedBackupIds.includes(i.id)) ? (
                              <FaCheckSquare className="text-white text-base" />
                            ) : (
                              <FaSquare className="text-base opacity-60" />
                            )}
                          </button>
                        </th>
                        <th className="p-3.5 text-white">Type</th>
                        <th className="p-3.5 text-white">Record Details</th>
                        <th className="p-3.5 text-white">Deleted At</th>
                        <th className="p-3.5 text-white">Auto-Purge</th>
                        <th className="p-3.5 text-center text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-50 text-slate-700 text-xs">
                      {filteredBackup.map((item) => {
                        const isSelected = selectedBackupIds.includes(item.id);
                        return (
                          <tr 
                            key={item.id}
                            className={`hover:bg-violet-50/70 transition-all duration-200 border-l-4 ${
                              isSelected ? "bg-indigo-50/80 border-l-indigo-500" : "border-l-transparent hover:border-l-violet-400"
                            }`}
                          >
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => toggleSelectBackupItem(item.id)}
                                className="text-slate-400 hover:text-violet-600 transition cursor-pointer"
                              >
                                {isSelected ? (
                                  <FaCheckSquare className="text-indigo-500 text-base" />
                                ) : (
                                  <FaSquare className="text-base" />
                                )}
                              </button>
                            </td>
                            <td className="p-3.5 font-bold">
                              <span className={`px-2.5 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${getBackupTypeBadgeClass(item.type)}`}>
                                {getBackupTypeLabel(item.type)}
                              </span>
                            </td>
                            <td className="p-3.5 font-medium text-slate-600 max-w-xs break-words">
                              {formatBackupItemDetails(item)}
                            </td>
                            <td className="p-3.5 font-semibold text-slate-500 whitespace-nowrap">
                              {new Date(item.deletedAt).toLocaleString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </td>
                            <td className="p-3.5 font-bold text-rose-500 whitespace-nowrap">
                              {getDaysRemaining(item.deletedAt)}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleRestoreItem(item)}
                                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white px-3 py-1.5 rounded-xl border border-emerald-200 hover:border-transparent transition-all duration-200 font-bold text-[10px] cursor-pointer shadow-sm hover:shadow-emerald-400/25 hover:scale-105 active:scale-95"
                                  title="Restore Item"
                                >
                                  <FaHistory /> Restore
                                </button>
                                <button
                                  onClick={() => handlePermanentDeleteItem(item)}
                                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white px-3 py-1.5 rounded-xl border border-rose-200 hover:border-transparent transition-all duration-200 font-bold text-[10px] cursor-pointer shadow-sm hover:shadow-rose-400/25 hover:scale-105 active:scale-95"
                                  title="Permanently Delete"
                                >
                                  <FaTrash /> Purge
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 border-t border-violet-200/60 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
              <div className="text-xs font-semibold text-indigo-100">
                {selectedBackupIds.length > 0 ? (
                  <span>Selected: <strong className="text-white text-sm">{selectedBackupIds.length}</strong> items</span>
                ) : (
                  <span>Total backup logs: <strong className="text-white text-sm">{backup.length}</strong> items</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {selectedBackupIds.length > 0 && (
                  <>
                    <button
                      onClick={handleRestoreSelected}
                      className="bg-white hover:bg-emerald-50 text-indigo-700 hover:text-emerald-700 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                      <FaHistory size={10} /> Restore Selected
                    </button>
                    <button
                      onClick={handlePermanentDeleteSelected}
                      className="bg-white/15 hover:bg-rose-600 text-white border border-white/30 hover:border-transparent px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                      <FaTrash size={10} /> Delete Selected
                    </button>
                  </>
                )}
                {backup.length > 0 && (
                  <>
                    <button
                      onClick={handleRestoreAll}
                      className="bg-white/10 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95"
                    >
                      Restore All
                    </button>
                    <button
                      onClick={handlePermanentDeleteAll}
                      className="bg-white/10 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/30 hover:border-transparent px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95"
                    >
                      Purge All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
