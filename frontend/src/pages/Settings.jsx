import { useState, useEffect } from "react";
import { FaUser, FaSlidersH, FaBuilding, FaLock, FaImage, FaCheckCircle, FaSave, FaHistory, FaTrash, FaTimes, FaUnlock, FaSearch, FaFilter, FaCheckSquare, FaSquare, FaDatabase, FaShieldAlt, FaClock, FaBell, FaCalendarAlt, FaPlay, FaToggleOn, FaToggleOff, FaVolumeUp } from "react-icons/fa";
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
  const [scheduleCustomDays, setScheduleCustomDays] = useState(() => {
    const saved = localStorage.getItem("rjit_scheduleBackup");
    return saved ? (JSON.parse(saved).customDays || 3) : 3;
  });

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required!");
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

    const res = await updateUser(currentUser.id, { password: newPassword, currentPassword });
    if (res && !res.success) {
      setPasswordError(res.message || "Failed to change password!");
      return;
    }

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
    const config = { enabled: scheduleEnabled, interval: scheduleInterval, time: scheduleTime, lastRun: scheduleLastRun, customDays: scheduleCustomDays };
    localStorage.setItem("rjit_scheduleBackup", JSON.stringify(config));
    const intervalLabel = scheduleInterval === "custom" ? `every ${scheduleCustomDays} day(s)` : scheduleInterval;
    showFlash("success", "Schedule Saved ✓", scheduleEnabled ? `Auto-backup scheduled ${intervalLabel} at ${scheduleTime}.` : "Auto-backup schedule has been disabled.");
    setShowSchedulePanel(false);
  };

  const handleRunBackupNow = () => {
    const now = new Date().toISOString();
    setScheduleLastRun(now);
    const config = { enabled: scheduleEnabled, interval: scheduleInterval, time: scheduleTime, lastRun: now, customDays: scheduleCustomDays };
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

      {/* Password Modal – Neon 3D Backlit Redesign */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "radial-gradient(ellipse at center, rgba(6,0,30,0.95) 0%, rgba(2,0,15,0.98) 100%)", backdropFilter: "blur(20px)" }}
        >
          {/* Neon 3D Modal Card */}
          <div
            className="animate-neon-modal relative w-full max-w-md overflow-hidden rounded-3xl p-px"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,255,0.4) 0%, rgba(99,102,241,0.5) 25%, rgba(168,85,247,0.5) 50%, rgba(0,180,255,0.4) 75%, rgba(0,255,255,0.4) 100%)",
            }}
          >
            {/* Inner card */}
            <div
              className="relative rounded-3xl p-8 flex flex-col items-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #030318 0%, #0a0a2e 30%, #060620 60%, #030315 100%)",
              }}
            >
              {/* Scan line effect */}
              <div
                className="animate-scan-line absolute left-0 right-0 h-px pointer-events-none z-0"
                style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.4) 50%, transparent 100%)" }}
              />

              {/* Corner accent glows */}
              <div className="absolute top-0 left-0 w-20 h-20 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,255,255,0.15) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)" }} />
              <div className="absolute top-1/2 right-0 w-16 h-32 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

              {/* Floating particles */}
              <div className="particle-1 absolute top-6 left-8 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(0,255,255,0.8)", boxShadow: "0 0 6px rgba(0,255,255,0.9)" }} />
              <div className="particle-2 absolute top-12 right-10 w-1 h-1 rounded-full" style={{ background: "rgba(168,85,247,0.9)", boxShadow: "0 0 8px rgba(168,85,247,0.9)" }} />
              <div className="particle-3 absolute bottom-16 left-12 w-1.5 h-1.5 rounded-full" style={{ background: "rgba(99,102,241,0.8)", boxShadow: "0 0 6px rgba(99,102,241,0.9)" }} />
              <div className="particle-4 absolute bottom-8 right-16 w-1 h-1 rounded-full" style={{ background: "rgba(0,200,255,0.9)", boxShadow: "0 0 8px rgba(0,200,255,0.9)" }} />
              <div className="particle-5 absolute top-1/3 left-4 w-0.5 h-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.9)" }} />
              <div className="particle-6 absolute top-2/3 right-4 w-0.5 h-0.5 rounded-full" style={{ background: "rgba(0,255,200,0.9)" }} />

              {/* Close button */}
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 z-10 text-cyan-400/60 hover:text-cyan-300 cursor-pointer transition-all duration-200 hover:rotate-90"
                style={{ filter: "drop-shadow(0 0 4px rgba(0,255,255,0.4))" }}
              >
                <FaTimes size={16} />
              </button>

              {/* Top neon bar */}
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.8) 30%, rgba(168,85,247,0.9) 50%, rgba(0,255,255,0.8) 70%, transparent 100%)" }} />

              {/* Shield Icon – Neon */}
              <div
                className="animate-neon-shield relative mt-2 mb-5 w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(0,255,255,0.12) 0%, rgba(99,102,241,0.15) 50%, rgba(168,85,247,0.12) 100%)",
                  border: "1px solid rgba(0,255,255,0.3)"
                }}
              >
                {/* Orbit ring */}
                <div
                  className="absolute inset-[-8px] rounded-full border border-dashed"
                  style={{
                    borderColor: "rgba(0,255,255,0.25)",
                    animation: "orbitRing 8s linear infinite"
                  }}
                />
                <FaShieldAlt size={34} style={{ color: "#00ffff", filter: "drop-shadow(0 0 8px rgba(0,255,255,0.9))" }} />
              </div>

              {/* Title */}
              <h3
                className="animate-neon-text font-extrabold text-2xl tracking-tight text-center mb-1"
                style={{ color: "#00ffff", fontFamily: "Inter, sans-serif", letterSpacing: "0.03em" }}
              >
                Security Gateway
              </h3>
              <p className="text-center text-xs px-6 leading-relaxed mb-6" style={{ color: "rgba(148,163,184,0.85)" }}>
                Restricted diagnostic zone detected. Enter authorization credentials to access backup logs.
              </p>

              {/* Holographic divider */}
              <div className="animate-holographic w-full h-px mb-6 rounded-full" />

              <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(0,255,255,0.6)" }}>
                    Backup Gateway Password
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-3.5" style={{ color: "rgba(0,255,255,0.5)" }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={backupPassword}
                      onChange={(e) => setBackupPassword(e.target.value)}
                      required
                      autoFocus
                      className="w-full rounded-xl pl-10 pr-3.5 py-3 text-sm font-semibold tracking-wider text-center transition-all duration-300 focus:outline-none"
                      style={{
                        background: "rgba(0,20,40,0.6)",
                        border: "1px solid rgba(0,255,255,0.25)",
                        color: "#00ffff",
                        caretColor: "#00ffff",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "rgba(0,255,255,0.7)"; e.target.style.boxShadow = "0 0 20px rgba(0,255,255,0.25), inset 0 0 10px rgba(0,255,255,0.05)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "rgba(0,255,255,0.25)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                  {backupPasswordError && (
                    <p className="text-[10px] font-bold mt-2 text-center animate-bounce" style={{ color: "#ff4d6d", textShadow: "0 0 8px rgba(255,77,109,0.6)" }}>
                      ⚠ {backupPasswordError}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="relative w-full font-bold py-3 rounded-xl cursor-pointer active:scale-95 transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 text-sm"
                    style={{
                      background: "linear-gradient(135deg, rgba(0,100,120,0.8) 0%, rgba(50,20,120,0.9) 50%, rgba(0,100,120,0.8) 100%)",
                      border: "1px solid rgba(0,255,255,0.4)",
                      color: "#00ffff",
                      boxShadow: "0 4px 20px rgba(0,255,255,0.2)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,255,255,0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,255,255,0.2)"; }}
                  >
                    {/* Button shimmer overlay */}
                    <div className="animate-holographic absolute inset-0 opacity-30 pointer-events-none" />
                    <FaUnlock size={14} style={{ filter: "drop-shadow(0 0 4px rgba(0,255,255,0.8))" }} />
                    <span style={{ textShadow: "0 0 8px rgba(0,255,255,0.6)" }}>Authenticate Gateway</span>
                  </button>
                </div>
              </form>

              {/* Bottom neon bar */}
              <div className="absolute bottom-0 inset-x-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.6) 50%, transparent 100%)" }} />
            </div>
          </div>
        </div>
      )}

      {/* Backup Manager Modal */}
      {showBackupManager && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden relative rounded-3xl shadow-2xl"
            style={{ background: "linear-gradient(160deg, #0a0a1a 0%, #0f0f2e 40%, #0a1628 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>

            {/* ── 3D Backlit Header ─────────────────────────────────────────── */}
            <div className="relative overflow-hidden shrink-0 px-6 py-5"
              style={{ background: "linear-gradient(135deg, #0d0d2b 0%, #1a0a3e 40%, #0a1828 100%)", borderBottom: "1px solid rgba(139,92,246,0.25)" }}>

              {/* Particle grid background */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.6) 1px, transparent 1px)",
                backgroundSize: "28px 28px"
              }} />

              {/* Scan-line animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-full h-[2px] opacity-30"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(0,255,200,0.5), transparent)", animation: "scanLine 3s linear infinite", top: 0 }} />
              </div>

              {/* Top glow bar */}
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,1), rgba(0,255,200,0.8), rgba(139,92,246,1), transparent)" }} />

              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  {/* 3D Backlit Database Icon */}
                  <div className="relative">
                    {/* Outer halo rings */}
                    <div className="absolute inset-[-12px] rounded-full animate-ping opacity-20" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)" }} />
                    <div className="absolute inset-[-6px] rounded-full animate-pulse" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)" }} />
                    {/* Icon container */}
                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(0,200,150,0.15))",
                        border: "1px solid rgba(139,92,246,0.5)",
                        boxShadow: "0 0 30px rgba(139,92,246,0.6), 0 0 60px rgba(139,92,246,0.2), inset 0 0 15px rgba(139,92,246,0.15)"
                      }}>
                      <FaDatabase size={26} style={{ color: "#a78bfa", filter: "drop-shadow(0 0 12px rgba(167,139,250,1))" }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg tracking-tight"
                      style={{ color: "#a78bfa", textShadow: "0 0 20px rgba(167,139,250,0.8), 0 0 40px rgba(167,139,250,0.4)" }}>
                      System Backup & Recovery Console
                    </h3>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: "rgba(148,163,184,0.7)" }}>
                      Deleted entities preserved for 30 days • Auto-purge enabled
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
                      <span className="text-[10px] font-bold" style={{ color: "rgba(52,211,153,0.9)" }}>SYSTEM ONLINE — {backup?.length || 0} RECORDS</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSchedulePanel(!showSchedulePanel)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border ${
                      showSchedulePanel
                        ? "text-violet-200 border-violet-400"
                        : "border-violet-500/40 hover:border-violet-400/70"
                    }`}
                    style={{
                      background: showSchedulePanel ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.12)",
                      color: "#c4b5fd",
                      boxShadow: showSchedulePanel ? "0 0 15px rgba(139,92,246,0.3)" : "none"
                    }}
                    title="Schedule Backup"
                  >
                    <FaClock size={12} />
                    <span>Schedule</span>
                    {scheduleEnabled && (
                      <span className="bg-emerald-400 text-emerald-900 text-[8px] font-extrabold px-1 rounded-full">ON</span>
                    )}
                  </button>
                  <button
                    onClick={() => setShowBackupManager(false)}
                    className="p-2.5 rounded-xl transition cursor-pointer border"
                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.25)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(239,68,68,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                    title="Close Console"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              {/* Bottom border glow */}
              <div className="absolute bottom-0 inset-x-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(0,200,150,0.4), transparent)" }} />
            </div>

            {/* Schedule Backup Panel */}
            {showSchedulePanel && (
              <div className="border-b p-5 shrink-0" style={{ background: "rgba(15,10,40,0.9)", borderColor: "rgba(139,92,246,0.2)" }}>
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
                  <div className="flex gap-3 flex-1 flex-wrap">
                     <div className="flex flex-col flex-1 min-w-[320px]">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Backup Frequency</label>
                       <div className="flex gap-2 flex-wrap">
                         <button
                           type="button"
                           onClick={() => {
                             setScheduleInterval("daily");
                             setScheduleEnabled(true);
                           }}
                           className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 border ${
                             scheduleInterval === "daily"
                               ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                               : "bg-white text-slate-650 border-violet-200 hover:bg-slate-50"
                           }`}
                         >
                           🗓️ Daily
                         </button>
                         <button
                           type="button"
                           onClick={() => {
                             setScheduleInterval("weekly");
                             setScheduleEnabled(true);
                           }}
                           className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 border ${
                             scheduleInterval === "weekly"
                               ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                               : "bg-white text-slate-650 border-violet-200 hover:bg-slate-50"
                           }`}
                         >
                           📆 Weekly
                         </button>
                         <button
                           type="button"
                           onClick={() => {
                             setScheduleInterval("monthly");
                             setScheduleEnabled(true);
                           }}
                           className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 border ${
                             scheduleInterval === "monthly"
                               ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                               : "bg-white text-slate-655 border-violet-200 hover:bg-slate-50"
                           }`}
                         >
                           📅 Monthly
                         </button>
                         <button
                           type="button"
                           onClick={() => {
                             setScheduleInterval("custom");
                             setScheduleEnabled(true);
                           }}
                           className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 border ${
                             scheduleInterval === "custom"
                               ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                               : "bg-white text-slate-655 border-violet-200 hover:bg-slate-50"
                           }`}
                         >
                           ⚙️ Custom Days
                         </button>
                       </div>
                     </div>
                     {scheduleInterval === "custom" && (
                       <div className="min-w-[110px]">
                         <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Every N Days</label>
                         <input
                           type="number"
                           min="1"
                           max="365"
                           value={scheduleCustomDays}
                           onChange={(e) => {
                             setScheduleCustomDays(parseInt(e.target.value) || 1);
                             setScheduleEnabled(true);
                           }}
                           className="w-full bg-white border border-violet-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-violet-400"
                         />
                       </div>
                     )}
                     <div className="flex-1 min-w-[120px]">
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Backup Time</label>
                       <input
                         type="time"
                         value={scheduleTime}
                         onChange={(e) => {
                           setScheduleTime(e.target.value);
                           setScheduleEnabled(true);
                         }}
                         className="w-full bg-white border border-violet-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-400"
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
            <div className="p-4 border-b flex flex-col sm:flex-row gap-3 shrink-0" style={{ background: "rgba(10,8,28,0.9)", borderColor: "rgba(139,92,246,0.2)" }}>
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-3" style={{ color: "rgba(139,92,246,0.7)" }} />
                <input
                  type="text"
                  placeholder="Search deleted records by detail..."
                  value={backupSearch}
                  onChange={(e) => setBackupSearch(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold focus:outline-none transition-all duration-300"
                  style={{ background: "rgba(20,15,50,0.8)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", caretColor: "#a78bfa" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 15px rgba(139,92,246,0.2)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(139,92,246,0.3)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase whitespace-nowrap" style={{ color: "rgba(139,92,246,0.8)" }}><FaFilter className="inline mr-1" style={{ color: "rgba(139,92,246,0.8)" }} />Filter</span>
                <select
                  value={backupTypeFilter}
                  onChange={(e) => setBackupTypeFilter(e.target.value)}
                  className="rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer"
                  style={{ background: "rgba(20,15,50,0.8)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}
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
            <div className="flex-1 overflow-y-auto p-5" style={{ background: "linear-gradient(180deg, rgba(8,6,25,0.95) 0%, rgba(10,8,30,0.98) 100%)" }}>
              {filteredBackup.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed" style={{ borderColor: "rgba(139,92,246,0.25)", background: "rgba(20,15,50,0.4)" }}>
                  <div className="p-5 rounded-full mb-3" style={{ background: "rgba(139,92,246,0.15)", boxShadow: "0 0 30px rgba(139,92,246,0.2)" }}>
                    <FaDatabase size={36} style={{ color: "#a78bfa", filter: "drop-shadow(0 0 10px rgba(167,139,250,0.6))" }} />
                  </div>
                  <h4 className="font-bold text-base" style={{ color: "#c4b5fd" }}>No Backup Records Found</h4>
                  <p className="text-xs mt-1 px-12 leading-relaxed" style={{ color: "rgba(148,163,184,0.6)" }}>
                    {backupSearch || backupTypeFilter !== "all" 
                      ? "Try tweaking search parameters or filter options." 
                      : "Awesome! There are no deleted entities in the database."}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.2)", background: "rgba(15,10,40,0.6)" }}>
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
                    <tbody className="divide-y text-xs" style={{ borderColor: "rgba(139,92,246,0.1)" }}>
                      {filteredBackup.map((item) => {
                        const isSelected = selectedBackupIds.includes(item.id);
                        return (
                          <tr 
                            key={item.id}
                            className="transition-all duration-200 border-l-4"
                            style={{
                              borderLeftColor: isSelected ? "#7c3aed" : "transparent",
                              background: isSelected ? "rgba(109,40,217,0.15)" : "transparent"
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderLeftColor = "#7c3aed"; }}
                            onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; } }}
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
                            <td className="p-3.5 font-medium max-w-xs break-words" style={{ color: "rgba(203,213,225,0.85)" }}>
                              {formatBackupItemDetails(item)}
                            </td>
                            <td className="p-3.5 font-semibold whitespace-nowrap" style={{ color: "rgba(148,163,184,0.7)" }}>
                              {new Date(item.deletedAt).toLocaleString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </td>
                            <td className="p-3.5 font-bold whitespace-nowrap" style={{ color: "#f87171" }}>
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
            <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center gap-4 shrink-0" style={{ background: "rgba(10,5,30,0.98)", borderColor: "rgba(139,92,246,0.3)" }}>
              <div className="text-xs font-semibold" style={{ color: "rgba(196,181,253,0.8)" }}>
                {selectedBackupIds.length > 0 ? (
                  <span>Selected: <strong className="text-violet-300 text-sm">{selectedBackupIds.length}</strong> items</span>
                ) : (
                  <span>Total backup logs: <strong className="text-violet-300 text-sm">{backup.length}</strong> items</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {selectedBackupIds.length > 0 && (
                  <>
                    <button
                      onClick={handleRestoreSelected}
                      className="px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 font-bold text-xs"
                      style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,211,153,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(52,211,153,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(52,211,153,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <FaHistory size={10} /> Restore Selected
                    </button>
                    <button
                      onClick={handlePermanentDeleteSelected}
                      className="px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-105 active:scale-95 font-bold text-xs"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(239,68,68,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <FaTrash size={10} /> Delete Selected
                    </button>
                  </>
                )}
                {backup.length > 0 && (
                  <>
                    <button
                      onClick={handleRestoreAll}
                      className="px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(139,92,246,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      Restore All
                    </button>
                    <button
                      onClick={handlePermanentDeleteAll}
                      className="px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold hover:scale-105 active:scale-95"
                      style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(239,68,68,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
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
