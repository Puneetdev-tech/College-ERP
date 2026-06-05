import { useState, useEffect } from "react";
import { FaUser, FaSlidersH, FaBuilding, FaLock, FaImage, FaCheckCircle, FaSave } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import { useStore } from "../context/StoreContext";

export default function Settings() {
  const { currentUser, updateUser, systemSettings, updateSystemSettings } = useStore();

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

  const tabs = [
    { id: "profile", name: "Profile Settings", icon: <FaUser /> },
    { id: "password", name: "Change Password", icon: <FaLock /> },
    { id: "system", name: "Inventory Settings", icon: <FaSlidersH /> },
    { id: "college", name: "College Information", icon: <FaBuilding /> },
  ];

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 transition-colors duration-300">
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
    </div>
  );
}
