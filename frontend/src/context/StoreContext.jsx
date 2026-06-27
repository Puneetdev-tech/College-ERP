import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const StoreContext = createContext();

export const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings", "Maintenance", "Backup"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications", "Maintenance"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports", "Maintenance"],
  "Account Office": ["Dashboard", "Reports", "Notifications"]
};

const DEFAULT_USERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@rjit.ac.in",
    password: "admin@RJIT2026",
    role: "Admin",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Admin"],
    chatbotAccess: true,
    photo: ""
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@rjit.ac.in",
    password: "manager@RJIT2026",
    role: "Store Manager",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Store Manager"],
    chatbotAccess: false,
    photo: ""
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@rjit.ac.in",
    password: "officer@RJIT2026",
    role: "Purchase Officer",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Purchase Officer"],
    chatbotAccess: false,
    photo: ""
  },
  {
    id: 4,
    name: "Dr. Roy",
    email: "principal@rjit.ac.in",
    password: "principal@RJIT2026",
    role: "Principal",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Principal"],
    chatbotAccess: false,
    photo: ""
  },
  {
    id: 5,
    name: "Sanjay Mehta",
    email: "accounts@rjit.ac.in",
    password: "accounts@RJIT2026",
    role: "Account Office",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Account Office"],
    chatbotAccess: false,
    photo: ""
  }
];

export function StoreProvider({ children }) {
  // One-time database reset to remove demo data
  const resetKey = "rjit_database_reset_v4_clean";
  if (typeof window !== "undefined" && !localStorage.getItem(resetKey)) {
    localStorage.setItem("rjit_inventory", JSON.stringify([]));
    localStorage.setItem("rjit_orders", JSON.stringify([]));
    localStorage.setItem("rjit_issuedStock", JSON.stringify([]));
    localStorage.setItem("rjit_maintenanceLogs", JSON.stringify([]));
    localStorage.setItem("rjit_notifications", JSON.stringify([]));
    localStorage.setItem(resetKey, "true");
  }

  // Backup State
  const [backup, setBackup] = useState(() => {
    try {
      const saved = localStorage.getItem("rjit_backup");
      let initialBackup = saved ? JSON.parse(saved) : [];
      
      // Auto-delete backup entries after 30 days
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      const filtered = (initialBackup || []).filter(item => {
        if (!item || !item.deletedAt) return false;
        const deletedTime = new Date(item.deletedAt).getTime();
        return (now - deletedTime) < thirtyDays;
      });
      
      if (filtered.length !== initialBackup.length) {
        localStorage.setItem("rjit_backup", JSON.stringify(filtered));
      }
      return filtered;
    } catch (e) {
      return [];
    }
  });

  const addBackupItem = (type, data) => {
    const newItem = {
      id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      deletedAt: new Date().toISOString(),
      data
    };
    setBackup(prev => {
      const updated = [newItem, ...prev];
      localStorage.setItem("rjit_backup", JSON.stringify(updated));
      return updated;
    });
  };

  // User management states
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem("rjit_users");
      let users = saved ? JSON.parse(saved) : DEFAULT_USERS;
      let migrated = false;
      users = (users || []).map(u => {
        if (!u) return u;
        if (u.password === "admin") { u.password = "admin@RJIT2026"; migrated = true; }
        else if (u.password === "manager") { u.password = "manager@RJIT2026"; migrated = true; }
        else if (u.password === "officer") { u.password = "officer@RJIT2026"; migrated = true; }
        else if (u.password === "principal") { u.password = "principal@RJIT2026"; migrated = true; }
        else if (u.password === "accounts") { u.password = "accounts@RJIT2026"; migrated = true; }
        
        if (u.email && u.email.toLowerCase().endsWith("@rjit.edu.in")) {
          u.email = u.email.replace(/@rjit\.edu\.in$/i, "@rjit.ac.in");
          migrated = true;
        }
        const defaultPerms = ROLE_DEFAULT_PERMISSIONS[u.role] || [];
        let updatedPerms = [...(u.permissions || [])];
        let migratedUser = false;
        defaultPerms.forEach(p => {
          if (!updatedPerms.includes(p)) {
            updatedPerms.push(p);
            migratedUser = true;
          }
        });
        if (migratedUser) {
          migrated = true;
          u = { ...u, permissions: updatedPerms };
        }
        return u;
      }).filter(Boolean);
      if (migrated) {
        localStorage.setItem("rjit_users", JSON.stringify(users));
      }
      return users;
    } catch (e) {
      return DEFAULT_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("rjit_currentUser");
      if (saved && saved !== "undefined") {
        const user = JSON.parse(saved);
        if (user) {
          let migrated = false;
          if (user.password === "admin") { user.password = "admin@RJIT2026"; migrated = true; }
          else if (user.password === "manager") { user.password = "manager@RJIT2026"; migrated = true; }
          else if (user.password === "officer") { user.password = "officer@RJIT2026"; migrated = true; }
          else if (user.password === "principal") { user.password = "principal@RJIT2026"; migrated = true; }
          else if (user.password === "accounts") { user.password = "accounts@RJIT2026"; migrated = true; }
          
          if (user.email && user.email.toLowerCase().endsWith("@rjit.edu.in")) {
            user.email = user.email.replace(/@rjit\.edu\.in$/i, "@rjit.ac.in");
            migrated = true;
          }
          const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
          let updatedPerms = [...(user.permissions || [])];
          let needUpdate = false;
          defaultPerms.forEach(p => {
            if (!updatedPerms.includes(p)) {
              updatedPerms.push(p);
              needUpdate = true;
            }
          });
          if (needUpdate || migrated) {
            const updatedUser = { ...user, password: user.password, permissions: updatedPerms };
            localStorage.setItem("rjit_currentUser", JSON.stringify(updatedUser));
            return updatedUser;
          }
          return user;
        }
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem("rjit_settings");
    const defaultSettings = {
      lowStockThreshold: 10,
      theme: "light",
      collegeInfo: {
        name: "RJ Institute of Technology",
        logo: "/rjit_logo.png",
        address: "123 Campus Lane, Okhla, New Delhi",
        phone: "+91 11 2690 7400",
        email: "info@rjit.ac.in",
        website: "www.rjit.ac.in"
      }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.collegeInfo) parsed.collegeInfo = defaultSettings.collegeInfo;
        if (!parsed.collegeInfo.logo) parsed.collegeInfo.logo = "/rjit_logo.png";
        let migrated = false;
        if (parsed.collegeInfo.email === "info@rjit.edu.in") {
          parsed.collegeInfo.email = "info@rjit.ac.in";
          migrated = true;
        }
        if (parsed.collegeInfo.website === "www.rjit.edu.in") {
          parsed.collegeInfo.website = "www.rjit.ac.in";
          migrated = true;
        }
        if (migrated) {
          localStorage.setItem("rjit_settings", JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const updateSystemSettings = (newSettings) => {
    // Force light theme
    const forcedSettings = { ...newSettings, theme: "light" };
    setSystemSettings(forcedSettings);
    localStorage.setItem("rjit_settings", JSON.stringify(forcedSettings));
  };

  useEffect(() => {
    // Force light theme always
    document.body.classList.remove("dark");
  }, []);

  const login = (email, password) => {
    const user = usersList.find(
      (u) => (u.email || "").toLowerCase() === (email || "").toLowerCase() && u.password === password
    );
    if (!user) {
      // Find if user exists with this email
      const userByEmail = usersList.find(
        (u) => (u.email || "").toLowerCase() === (email || "").toLowerCase()
      );
      if (userByEmail && userByEmail.passwordHistory) {
        // Check if the password matches any old password changed by someone else
        const matchRecord = userByEmail.passwordHistory.find(
          (h) => h.oldPassword === password
        );
        if (matchRecord) {
          return {
            success: false,
            message: `Your password was changed by ${matchRecord.changedBy} on ${matchRecord.changedAt}. Please contact admin.`
          };
        }
      }
      return { success: false, message: "Invalid email or password!" };
    }
    if (user.status !== "Active") {
      return { success: false, message: "Your account is inactive. Contact Admin!" };
    }
    setCurrentUser(user);
    localStorage.setItem("rjit_currentUser", JSON.stringify(user));
    localStorage.setItem("userRole", user.role); // compatibility with old sidebar
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("rjit_currentUser");
    localStorage.removeItem("userRole");
  };

  const addUser = (newUser) => {
    const exists = usersList.some(u => (u.email || "").toLowerCase() === (newUser.email || "").toLowerCase());
    if (exists) {
      return { success: false, message: "Email is already registered!" };
    }
    const userWithId = {
      ...newUser,
      id: newUser.id || Date.now(),
    };
    const updated = [...usersList, userWithId];
    setUsersList(updated);
    localStorage.setItem("rjit_users", JSON.stringify(updated));
    return { success: true, user: userWithId };
  };

  const updateUser = (id, updatedFields) => {
    const updated = usersList.map((u) => {
      if (u.id === id) {
        const updatedUser = { ...u, ...updatedFields };
        
        // Track password changes made by administrators (someone other than the user themselves)
        if (updatedFields.password && u.password !== updatedFields.password) {
          if (currentUser && currentUser.id !== id) {
            const changeRecord = {
              oldPassword: u.password,
              changedBy: currentUser.name,
              changedAt: getNowString()
            };
            updatedUser.passwordHistory = u.passwordHistory
              ? [...u.passwordHistory, changeRecord]
              : [changeRecord];
          }
        }

        if (currentUser && currentUser.id === id) {
          setCurrentUser(updatedUser);
          localStorage.setItem("rjit_currentUser", JSON.stringify(updatedUser));
          localStorage.setItem("userRole", updatedUser.role);
        }
        return updatedUser;
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem("rjit_users", JSON.stringify(updated));
    return { success: true };
  };

  const deleteUser = (id) => {
    const userObj = usersList.find(u => u.id === id);
    if (userObj) {
      addBackupItem("user", userObj);
    }
    const updated = usersList.filter((u) => u.id !== id);
    setUsersList(updated);
    localStorage.setItem("rjit_users", JSON.stringify(updated));
    if (currentUser && currentUser.id === id) {
      logout();
    }
    return { success: true };
  };

  // Helper: get current local datetime string
  const getNowString = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 19).replace("T", " ");
  };

  // Initial inventory items (sorted newest first)
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("rjit_inventory");
    
    // Define the new default stationery items
    let newStationeryItems = [
      { id: 101, item: "A4 size paper Rim", category: "Stationery", subcategory: "A4 size paper Rim", type: "Rim", stock: 250, price: 320, status: "Good", createdAt: "2026-06-01 09:25:00" },
      { id: 102, item: "Add Gel pen", category: "Stationery", subcategory: "Add Gel pen", type: "Blue/Black", stock: 120, price: 15, status: "Good", createdAt: "2026-06-01 09:26:00" },
      { id: 103, item: "Add gel refill", category: "Stationery", subcategory: "Add gel refill", type: "0.5mm", stock: 200, price: 5, status: "Good", createdAt: "2026-06-01 09:27:00" },
      { id: 104, item: "Cell AAA", category: "Stationery", subcategory: "Cell AAA", type: "Alkaline", stock: 80, price: 15, status: "Good", createdAt: "2026-06-01 09:28:00" },
      { id: 105, item: "Cell AA", category: "Stationery", subcategory: "Cell AA", type: "Alkaline", stock: 90, price: 15, status: "Good", createdAt: "2026-06-01 09:29:00" },
      { id: 106, item: "Envelope small brown", category: "Stationery", subcategory: "Envelope small brown", type: "Brown paper", stock: 350, price: 3, status: "Good", createdAt: "2026-06-01 09:30:00" },
      { id: 107, item: "File flag", category: "Stationery", subcategory: "File flag", type: "Sticky", stock: 500, price: 2, status: "Good", createdAt: "2026-06-01 09:31:00" },
      { id: 108, item: "Highlighter", category: "Stationery", subcategory: "Highlighter", type: "Neon Pack", stock: 110, price: 25, status: "Good", createdAt: "2026-06-01 09:32:00" },
      { id: 109, item: "Liquid gum", category: "Stationery", subcategory: "Liquid gum", type: "50ml", stock: 75, price: 18, status: "Good", createdAt: "2026-06-01 09:33:00" },
      { id: 110, item: "Notice board pin", category: "Stationery", subcategory: "Notice board pin", type: "Push pin", stock: 400, price: 1, status: "Good", createdAt: "2026-06-01 09:34:00" },
      { id: 111, item: "Register", category: "Stationery", subcategory: "Register", type: "Standard", stock: 125, price: 80, status: "Good", createdAt: "2026-06-01 09:35:00" },
      { id: 112, item: "Staff attendance register", category: "Stationery", subcategory: "Staff attendance register", type: "Ledger", stock: 20, price: 150, status: "Good", createdAt: "2026-06-01 09:36:00" },
      { id: 113, item: "Student attendance register", category: "Stationery", subcategory: "Student attendance register", type: "Ledger", stock: 45, price: 150, status: "Good", createdAt: "2026-06-01 09:37:00" },
      { id: 114, item: "Use and throw pen", category: "Stationery", subcategory: "Use and throw pen", type: "Blue", stock: 1000, price: 5, status: "Good", createdAt: "2026-06-01 09:38:00" },
      { id: 115, item: "White board marker", category: "Stationery", subcategory: "White board marker", type: "Black/Blue", stock: 150, price: 35, status: "Good", createdAt: "2026-06-01 09:39:00" },
      { id: 116, item: "Whitener pen", category: "Stationery", subcategory: "Whitener pen", type: "Correction Pen", stock: 65, price: 30, status: "Good", createdAt: "2026-06-01 09:40:00" },
    ].map(item => ({ ...item, category: "Stationary" }));

    // Define new default Sanitary items
    let newSanitoryItems = [
      { id: 201, item: "Nariyal Jharu", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 50, price: 40, status: "Good", createdAt: "2026-06-01 10:20:00" },
      { id: 202, item: "Phenyl", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 30, price: 80, status: "Good", createdAt: "2026-06-01 10:21:00" },
      { id: 203, item: "Acid", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 20, price: 60, status: "Good", createdAt: "2026-06-01 10:22:00" },
      { id: 204, item: "Naphthalene Ball", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 100, price: 50, status: "Good", createdAt: "2026-06-01 10:23:00" },
      { id: 205, item: "Washing Powder / Surf", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 120, status: "Good", createdAt: "2026-06-01 10:24:00" },
      { id: 206, item: "Odonil", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 60, price: 45, status: "Good", createdAt: "2026-06-01 10:25:00" },
      { id: 207, item: "Pocha Pad Without Frame", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 30, price: 90, status: "Good", createdAt: "2026-06-01 10:26:00" },
      { id: 208, item: "Lifebuoy Soap / Hand Wash", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 80, price: 35, status: "Good", createdAt: "2026-06-01 10:27:00" },
      { id: 209, item: "Phool Jharu", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 60, status: "Good", createdAt: "2026-06-01 10:28:00" },
      { id: 210, item: "Harpic Blue", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 50, price: 95, status: "Good", createdAt: "2026-06-01 10:29:00" },
      { id: 211, item: "Complete Pocha Pad with Iron Rod", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 250, status: "Good", createdAt: "2026-06-01 10:30:00" },
      { id: 212, item: "Dettol Soap", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 100, price: 40, status: "Good", createdAt: "2026-06-01 10:31:00" },
      { id: 213, item: "Room Freshener", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 25, price: 150, status: "Good", createdAt: "2026-06-01 10:32:00" },
      { id: 214, item: "Colour Naphthalene Ball", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 80, price: 60, status: "Good", createdAt: "2026-06-01 10:33:00" },
      { id: 215, item: "Colin", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 30, price: 110, status: "Good", createdAt: "2026-06-01 10:34:00" },
      { id: 216, item: "Dusting Cloth", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 150, price: 20, status: "Good", createdAt: "2026-06-01 10:35:00" },
      { id: 217, item: "Pocha Pad Cloth / Hand Pocha", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 100, price: 30, status: "Good", createdAt: "2026-06-01 10:36:00" },
      { id: 218, item: "Wiper", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 35, price: 85, status: "Good", createdAt: "2026-06-01 10:37:00" },
      { id: 219, item: "Toilet Brush", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 45, status: "Good", createdAt: "2026-06-01 10:38:00" },
      { id: 220, item: "Bamboo Stick", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 50, price: 35, status: "Good", createdAt: "2026-06-01 10:39:00" },
      { id: 221, item: "Colour Harpic (Toilet Flush)", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 45, price: 105, status: "Good", createdAt: "2026-06-01 10:40:00" },
      { id: 222, item: "Dustbin Capacity 660 Ltr", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 5, price: 4500, status: "Good", createdAt: "2026-06-01 10:41:00" },
      { id: 223, item: "Dustbin Capacity 120 Ltr", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 10, price: 1500, status: "Good", createdAt: "2026-06-01 10:42:00" },
      { id: 224, item: "White Phenyl", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 90, status: "Good", createdAt: "2026-06-01 10:43:00" },
      { id: 225, item: "Hydrochloride", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 180, status: "Good", createdAt: "2026-06-01 10:44:00" },
      { id: 226, item: "Sanitizer", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 60, price: 120, status: "Good", createdAt: "2026-06-01 10:45:00" },
      { id: 227, item: "Mask NGS", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 200, price: 15, status: "Good", createdAt: "2026-06-01 10:46:00" },
      { id: 228, item: "Disposable Mask", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 500, price: 4, status: "Good", createdAt: "2026-06-01 10:47:00" },
      { id: 229, item: "Disposable Gloves", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 300, price: 6, status: "Good", createdAt: "2026-06-01 10:48:00" },
      { id: 230, item: "Sanitizer Bottle 500 ml", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 80, price: 150, status: "Good", createdAt: "2026-06-01 10:49:00" },
      { id: 231, item: "Sintex Tank 500 Ltr with Stand", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 2, price: 6500, status: "Good", createdAt: "2026-06-01 10:50:00" },
      { id: 232, item: "Fitted Foot Iron Box with Green Mat", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 5, price: 1200, status: "Good", createdAt: "2026-06-01 10:51:00" },
      { id: 233, item: "Sanitizer Stand", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 8, price: 850, status: "Good", createdAt: "2026-06-01 10:52:00" },
      { id: 234, item: "Urinal Pipe", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 25, price: 75, status: "Good", createdAt: "2026-06-01 10:53:00" },
      { id: 235, item: "Net Patti", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 60, price: 40, status: "Good", createdAt: "2026-06-01 10:54:00" },
      { id: 236, item: "Jala Cleaner Buchhi Tor Pot", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 180, status: "Good", createdAt: "2026-06-01 10:55:00" },
      { id: 237, item: "Dustpan Plastic", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 65, status: "Good", createdAt: "2026-06-01 10:56:00" },
      { id: 238, item: "PVC Pipe 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 50, price: 120, status: "Good", createdAt: "2026-06-01 10:57:00" },
      { id: 239, item: "PVC Socket 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 100, price: 15, status: "Good", createdAt: "2026-06-01 10:58:00" },
      { id: 240, item: "Solution for Fixing PVC Pipe 100 ml", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 30, price: 55, status: "Good", createdAt: "2026-06-01 10:59:00" },
      { id: 241, item: "PVC T 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 60, price: 25, status: "Good", createdAt: "2026-06-01 11:00:00" },
      { id: 242, item: "Valve 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 35, price: 180, status: "Good", createdAt: "2026-06-01 11:01:00" },
      { id: 243, item: "Nozzle 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 45, status: "Good", createdAt: "2026-06-01 11:02:00" },
      { id: 244, item: "FTA 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 80, price: 20, status: "Good", createdAt: "2026-06-01 11:03:00" },
      { id: 245, item: "MTA 1 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 80, price: 20, status: "Good", createdAt: "2026-06-01 11:04:00" },
      { id: 246, item: "Reducer 1.5 x 0.5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 45, price: 35, status: "Good", createdAt: "2026-06-01 11:05:00" },
      { id: 247, item: "MTA 1.5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 50, price: 30, status: "Good", createdAt: "2026-06-01 11:06:00" },
      { id: 248, item: "PVC Pipe 1.5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 180, status: "Good", createdAt: "2026-06-01 11:07:00" },
      { id: 249, item: "Union 1.5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 30, price: 65, status: "Good", createdAt: "2026-06-01 11:08:00" },
      { id: 250, item: "Angle Cock Steel", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 25, price: 220, status: "Good", createdAt: "2026-06-01 11:09:00" },
      { id: 251, item: "Teflon Tape No. 1", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 150, price: 15, status: "Good", createdAt: "2026-06-01 11:10:00" },
      { id: 252, item: "Teflon Tape No. 2", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 150, price: 25, status: "Good", createdAt: "2026-06-01 11:11:00" },
      { id: 253, item: "Plug 0.5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 100, price: 12, status: "Good", createdAt: "2026-06-01 11:12:00" },
      { id: 254, item: "Steel Tape", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 150, status: "Good", createdAt: "2026-06-01 11:13:00" },
      { id: 255, item: "PVC Tape", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 80, price: 18, status: "Good", createdAt: "2026-06-01 11:14:00" },
      { id: 256, item: "Kabje (Hinges) 5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 60, price: 45, status: "Good", createdAt: "2026-06-01 11:15:00" },
      { id: 257, item: "Wooden Screw 1.5 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 400, price: 2, status: "Good", createdAt: "2026-06-01 11:16:00" },
      { id: 258, item: "Wooden Screw 2 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 400, price: 3, status: "Good", createdAt: "2026-06-01 11:17:00" },
      { id: 259, item: "Daksar Foot Valve Complete", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 8, price: 350, status: "Good", createdAt: "2026-06-01 11:18:00" },
      { id: 260, item: "Section Pipe (Foot Valve Pipe) 2 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 280, status: "Good", createdAt: "2026-06-01 11:19:00" },
      { id: 261, item: "Foam Pipe for Garden 1.25 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 20, price: 350, status: "Good", createdAt: "2026-06-01 11:20:00" },
      { id: 262, item: "HDPE PVC Pipe 1.25 Inch", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 25, price: 450, status: "Good", createdAt: "2026-06-01 11:21:00" },
      { id: 263, item: "Frame", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 12, price: 180, status: "Good", createdAt: "2026-06-01 11:22:00" },
      { id: 264, item: "Dettol Spray", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 40, price: 160, status: "Good", createdAt: "2026-06-01 11:23:00" },
      { id: 265, item: "Hit Spray", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 35, price: 140, status: "Good", createdAt: "2026-06-01 11:24:00" },
      { id: 266, item: "Lizol 180 ml", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 70, price: 55, status: "Good", createdAt: "2026-06-01 11:25:00" },
      { id: 267, item: "Lifebuoy Soap", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 120, price: 35, status: "Good", createdAt: "2026-06-01 11:26:00" },
      { id: 268, item: "Caustic Soda Powder", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 50, price: 45, status: "Good", createdAt: "2026-06-01 11:27:00" },
      { id: 269, item: "Hand Wash", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 90, price: 90, status: "Good", createdAt: "2026-06-01 11:28:00" },
      { id: 270, item: "Fevicol", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 30, price: 85, status: "Good", createdAt: "2026-06-01 11:29:00" },
      { id: 271, item: "Chappa Kundi Aluminium", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 20, price: 120, status: "Good", createdAt: "2026-06-01 11:30:00" },
      { id: 272, item: "PVC Gitti", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 500, price: 1, status: "Good", createdAt: "2026-06-01 11:31:00" },
      { id: 273, item: "Aluminium Washer for Wash Basin", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 150, price: 5, status: "Good", createdAt: "2026-06-01 11:32:00" },
      { id: 274, item: "M.S. Socket for Wash Basin", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 45, price: 45, status: "Good", createdAt: "2026-06-01 11:33:00" },
      { id: 275, item: "Chuna", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 100, price: 10, status: "Good", createdAt: "2026-06-01 11:34:00" },
      { id: 276, item: "Paint (Black)", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 250, status: "Good", createdAt: "2026-06-01 11:35:00" },
      { id: 277, item: "Paint (White)", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 15, price: 250, status: "Good", createdAt: "2026-06-01 11:36:00" },
      { id: 278, item: "Termite Medicine", category: "Cleaning", subcategory: "Cleaning", type: "Standard", stock: 20, price: 380, status: "Good", createdAt: "2026-06-01 11:37:00" },
    ].map(item => ({ ...item, category: "Sanitory" }));

    // Dynamically apply correct category/subcategory/specification schema on default lists
    const mapItemSchema = (item) => {
      let name = item.item || "";
      let sub = item.subcategory || "";
      let type = item.type || "Standard";
      const n = name.toLowerCase();

      if (item.category === "Sanitory") {
        if (n.includes("paint")) {
          sub = "Paint";
          type = name;
        } else if (n.includes("jharu") || n.includes("broom")) {
          sub = "Jharu";
          type = name;
        } else if (n.includes("phenyl") || n.includes("harpic") || n.includes("cleaner") || n.includes("acid") || n.includes("spray") || n.includes("lizol") || n.includes("powder")) {
          sub = "Cleaners & Disinfectants";
          type = name;
        } else if (n.includes("soap") || n.includes("hand wash") || n.includes("handwash")) {
          sub = "Soap / Hand Wash";
          type = name;
        } else if (n.includes("dustbin")) {
          sub = "Dustbin";
          type = name;
        } else if (n.includes("pipe") || n.includes("socket") || n.includes("valve") || n.includes("nozzle") || n.includes("fta") || n.includes("mta") || n.includes("reducer") || n.includes("union") || n.includes("cock") || n.includes("gitti") || n.includes("washer")) {
          sub = "Pipe / Fitting";
          type = name;
        } else if (n.includes("tape")) {
          sub = "Tape";
          type = name;
        } else if (n.includes("screw")) {
          sub = "Screw / Hardware";
          type = name;
        } else if (n.includes("pocha") || n.includes("mop") || n.includes("wiper")) {
          sub = "Mops & Wipers";
          type = name;
        } else {
          sub = name;
          type = "Standard";
        }
      } else if (item.category === "Stationary") {
        if (n.includes("register")) {
          sub = "Register";
          type = name;
        } else if (n.includes("pen") && !n.includes("open")) {
          sub = "Pen";
          type = name;
        } else if (n.includes("paper")) {
          sub = "Paper";
          type = name;
        } else if (n.includes("envelope")) {
          sub = "Envelope";
          type = name;
        } else if (n.includes("cell")) {
          sub = "Cell";
          type = name;
        } else if (n.includes("marker")) {
          sub = "Marker";
          type = name;
        }
      }
      return { ...item, subcategory: sub, type: type };
    };

    newStationeryItems = newStationeryItems.map(mapItemSchema);
    newSanitoryItems = newSanitoryItems.map(mapItemSchema);

    const defaultList = [];

    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        let needSave = false;
        
        // Category Normalization Migration
        parsed = (parsed || []).map(item => {
          if (!item) return item;
          let cat = item.category || "";
          let updatedCat = cat;
          if (cat === "Stationery") updatedCat = "Stationary";
          else if (cat === "Cleaning") updatedCat = "Sanitory";
          else if (cat === "Sanitary") updatedCat = "Sanitory";
          else if (cat === "Equipment") updatedCat = "laboratory";
          
          if (updatedCat !== cat) {
            needSave = true;
            return { ...item, category: updatedCat };
          }
          return item;
        }).filter(Boolean);

        // One-time schema migration for existing items
        const migrationKey = "rjit_migrated_v3_unique_subcats";
        const alreadyMigrated = localStorage.getItem(migrationKey);

        if (!alreadyMigrated) {
          parsed = parsed.map(mapItemSchema);
          needSave = true;
          localStorage.setItem(migrationKey, "true");
        }

        if (needSave) {
          localStorage.setItem("rjit_inventory", JSON.stringify(parsed));
        }

        return [...parsed].sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
          return b.id - a.id;
        });
      } catch (e) {
        // ignore
      }
    }

    return defaultList;
  });

  // Initial issued stock log
  const [issuedStock, setIssuedStock] = useState(() => {
    const defaultIssued = [];

    try {
      const saved = localStorage.getItem("rjit_issuedStock");
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let needSave = false;
          const migrated = parsed.map(log => {
            if (!log) return log;
            let cat = log.category || "";
            let updatedCat = cat;
            if (cat === "Stationery") updatedCat = "Stationary";
            else if (cat === "Cleaning") updatedCat = "Sanitory";
            else if (cat === "Sanitary") updatedCat = "Sanitory";
            else if (cat === "Equipment") updatedCat = "laboratory";

            let dept = log.department || "";
            let updatedDept = dept;
            if (dept === "IT Department" || dept === "IT,CSE") updatedDept = "Electronics";
            else if (dept === "Laboratory") updatedDept = "laboratory";
            else if (dept === "Hostel" || dept === "Office" || dept === "Library") updatedDept = "Furniture";
            else if (dept === "Medical") updatedDept = "Sanitory";
            else if (dept === "Stationery") updatedDept = "Stationary";
            else if (dept === "Cleaning") updatedDept = "Sanitory";

            let sub = log.subcategory || "";
            let type = log.type || "Standard";
            let name = log.item || sub;
            const n = name.toLowerCase();

            if (updatedCat === "Sanitory") {
              if (n.includes("paint")) {
                sub = "Paint";
                type = name;
              } else if (n.includes("jharu") || n.includes("broom")) {
                sub = "Jharu";
                type = name;
              } else if (n.includes("phenyl") || n.includes("harpic") || n.includes("cleaner") || n.includes("acid") || n.includes("spray") || n.includes("lizol") || n.includes("powder")) {
                sub = "Cleaners & Disinfectants";
                type = name;
              } else if (n.includes("soap") || n.includes("hand wash") || n.includes("handwash")) {
                sub = "Soap / Hand Wash";
                type = name;
              } else if (n.includes("dustbin")) {
                sub = "Dustbin";
                type = name;
              } else if (n.includes("pipe") || n.includes("socket") || n.includes("valve") || n.includes("nozzle") || n.includes("fta") || n.includes("mta") || n.includes("reducer") || n.includes("union") || n.includes("cock") || n.includes("gitti") || n.includes("washer")) {
                sub = "Pipe / Fitting";
                type = name;
              } else if (n.includes("tape")) {
                sub = "Tape";
                type = name;
              } else if (n.includes("screw")) {
                sub = "Screw / Hardware";
                type = name;
              } else if (n.includes("pocha") || n.includes("mop") || n.includes("wiper")) {
                sub = "Mops & Wipers";
                type = name;
              } else {
                if (sub === "Cleaning" || !sub) {
                  sub = name;
                  type = "Standard";
                }
              }
            } else if (updatedCat === "Stationary") {
              if (n.includes("register")) {
                sub = "Register";
                type = name;
              } else if (n.includes("pen") && !n.includes("open")) {
                sub = "Pen";
                type = name;
              } else if (n.includes("paper")) {
                sub = "Paper";
                type = name;
              } else if (n.includes("envelope")) {
                sub = "Envelope";
                type = name;
              } else if (n.includes("cell")) {
                sub = "Cell";
                type = name;
              } else if (n.includes("marker")) {
                sub = "Marker";
                type = name;
              }
            }

            if (updatedCat !== cat || updatedDept !== dept || sub !== log.subcategory || type !== log.type) {
              needSave = true;
              return { ...log, category: updatedCat, department: updatedDept, subcategory: sub, type: type };
            }
            return log;
          }).filter(Boolean);
          if (needSave) {
            localStorage.setItem("rjit_issuedStock", JSON.stringify(migrated));
          }
          return migrated;
        }
      }
    } catch (e) {
      // ignore
    }

    return defaultIssued;
  });

  // Approval sequence (list of user IDs in sequence)
  const [approvalSequence, setApprovalSequence] = useState(() => {
    try {
      const saved = localStorage.getItem("rjit_approvalSequence");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [5, 4]; // Accounts Office then Principal by default
  });

  const updateApprovalSequence = (newSeq) => {
    setApprovalSequence(newSeq);
    localStorage.setItem("rjit_approvalSequence", JSON.stringify(newSeq));
  };

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const defaultNotifs = [];

    try {
      const saved = localStorage.getItem("rjit_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }

    return defaultNotifs;
  });



  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("rjit_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem("rjit_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem("rjit_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback((status = "all") => {
    setNotifications(prev => {
      let updated;
      if (status === "read") {
        updated = prev.filter(n => !n.read);
      } else if (status === "unread") {
        updated = prev.filter(n => n.read);
      } else {
        updated = [];
      }
      localStorage.setItem("rjit_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addNotification = useCallback((type, message, iconType, color) => {
    const newNotif = {
      id: Date.now(),
      type,
      message,
      time: "Just now",
      read: false,
      color: color || "bg-blue-100 text-blue-800",
      iconType: iconType || "info"
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem("rjit_notifications", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Initial placed & received orders log
  const [orders, setOrders] = useState(() => {
    const defaultOrders = [];

    const saved = localStorage.getItem("rjit_orders");
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let needSave = false;
          const migrated = parsed.map(o => {
            if (!o) return o;
            let cat = o.category || "";
            let updatedCat = cat;
            if (cat === "Stationery") updatedCat = "Stationary";
            else if (cat === "Cleaning") updatedCat = "Sanitory";
            else if (cat === "Sanitary") updatedCat = "Sanitory";
            else if (cat === "Equipment") updatedCat = "laboratory";

            let dept = o.department || "";
            let updatedDept = dept;
            if (dept === "IT Department" || dept === "IT,CSE") updatedDept = "Electronics";
            else if (dept === "Laboratory") updatedDept = "laboratory";
            else if (dept === "Hostel" || dept === "Office" || dept === "Library") updatedDept = "Furniture";
            else if (dept === "Medical") updatedDept = "Sanitory";
            else if (dept === "Stationery") updatedDept = "Stationary";
            else if (dept === "Cleaning") updatedDept = "Sanitory";

            let sub = o.subcategory || "";
            let type = o.type || "Standard";
            let name = o.item || sub;
            const n = name.toLowerCase();

            if (updatedCat === "Sanitory") {
              if (n.includes("paint")) {
                sub = "Paint";
                type = name;
              } else if (n.includes("jharu") || n.includes("broom")) {
                sub = "Jharu";
                type = name;
              } else if (n.includes("phenyl") || n.includes("harpic") || n.includes("cleaner") || n.includes("acid") || n.includes("spray") || n.includes("lizol") || n.includes("powder")) {
                sub = "Cleaners & Disinfectants";
                type = name;
              } else if (n.includes("soap") || n.includes("hand wash") || n.includes("handwash")) {
                sub = "Soap / Hand Wash";
                type = name;
              } else if (n.includes("dustbin")) {
                sub = "Dustbin";
                type = name;
              } else if (n.includes("pipe") || n.includes("socket") || n.includes("valve") || n.includes("nozzle") || n.includes("fta") || n.includes("mta") || n.includes("reducer") || n.includes("union") || n.includes("cock") || n.includes("gitti") || n.includes("washer")) {
                sub = "Pipe / Fitting";
                type = name;
              } else if (n.includes("tape")) {
                sub = "Tape";
                type = name;
              } else if (n.includes("screw")) {
                sub = "Screw / Hardware";
                type = name;
              } else if (n.includes("pocha") || n.includes("mop") || n.includes("wiper")) {
                sub = "Mops & Wipers";
                type = name;
              } else {
                if (sub === "Cleaning" || !sub) {
                  sub = name;
                  type = "Standard";
                }
              }
            } else if (updatedCat === "Stationary") {
              if (n.includes("register")) {
                sub = "Register";
                type = name;
              } else if (n.includes("pen") && !n.includes("open")) {
                sub = "Pen";
                type = name;
              } else if (n.includes("paper")) {
                sub = "Paper";
                type = name;
              } else if (n.includes("envelope")) {
                sub = "Envelope";
                type = name;
              } else if (n.includes("cell")) {
                sub = "Cell";
                type = name;
              } else if (n.includes("marker")) {
                sub = "Marker";
                type = name;
              }
            }

            if (updatedCat !== cat || updatedDept !== dept || sub !== o.subcategory || type !== o.type) {
              needSave = true;
              return { ...o, category: updatedCat, department: updatedDept, subcategory: sub, type: type };
            }
            return o;
          }).filter(Boolean);
          if (needSave) {
            localStorage.setItem("rjit_orders", JSON.stringify(migrated));
          }
          return migrated;
        }
      } catch (e) {
        // ignore errors
      }
    }

    return defaultOrders;
  });

  // Helper action: Issue Stock
  const issueStockItem = (details) => {
    // 1. Look up matching item in inventory (case-insensitive check for type)
    const matchingItemIndex = inventory.findIndex(
      (item) =>
        (item.category || "").toLowerCase() === (details.category || "").toLowerCase() &&
        (item.subcategory || "").toLowerCase() === (details.subcategory || "").toLowerCase() &&
        (item.type || "").toLowerCase() === (details.type || "").toLowerCase()
    );

    if (matchingItemIndex === -1) {
      return { success: false, message: "Item type not found in inventory stock!" };
    }

    const item = inventory[matchingItemIndex];
    if (item.stock < details.quantity) {
      return { success: false, message: `Insufficient stock! Only ${item.stock} units available.` };
    }

    // 2. Update stock count
    const updatedInventory = [...inventory];
    const updatedStock = item.stock - details.quantity;
    updatedInventory[matchingItemIndex] = {
      ...item,
      stock: updatedStock,
      status: updatedStock <= (systemSettings.lowStockThreshold || 10) ? "Low" : updatedStock <= 15 ? "Medium" : "Good"
    };

    setInventory(updatedInventory);
    localStorage.setItem("rjit_inventory", JSON.stringify(updatedInventory));

    // Low stock trigger notification
    if (updatedStock <= (systemSettings.lowStockThreshold || 10)) {
      addNotification(
        "Low Stock Alert",
        `${item.item} (${item.type}) stock is below threshold! Remaining: ${updatedStock}`,
        "low-stock",
        "bg-red-100 text-red-800"
      );
    }

    // 3. Log issue event
    const newIssue = {
      id: issuedStock.length + 1,
      item: `${details.subcategory} - ${details.type}`,
      category: details.category,
      subcategory: details.subcategory,
      type: details.type,
      department: details.department,
      faculty: details.faculty,
      quantity: details.quantity,
      date: details.date // Formatted date string
    };

    const updatedIssued = [newIssue, ...issuedStock];
    setIssuedStock(updatedIssued);
    localStorage.setItem("rjit_issuedStock", JSON.stringify(updatedIssued));

    addNotification(
      "Stock Issued",
      `${details.quantity} ${details.subcategory} (${details.type}) issued to ${details.department}`,
      "issued",
      "bg-blue-100 text-blue-800"
    );

    return { success: true };
  };

  // Helper action: Place Purchase Order
  const placeOrderItem = (details) => {
    // Generate approval chain based on the current configuration
    const activeSeq = approvalSequence.length > 0 ? approvalSequence : [5, 4];
    const chain = activeSeq.map((userId) => {
      const user = usersList.find((u) => u.id === userId);
      return {
        userId: userId,
        name: user ? user.name : "System Approver",
        role: user ? user.role : "Approver",
        status: "Pending",
        approvedAt: null
      };
    });

    const newOrder = {
      id: `PO00${orders.length + 1}`,
      supplier: details.supplier,
      item: details.item,
      category: details.category,
      subcategory: details.subcategory,
      type: details.type,
      quantity: details.quantity,
      pricePerUnit: details.pricePerUnit || 1000,
      status: "Pending",
      orderDate: details.orderDate,
      department: details.department,
      faculty: details.faculty,
      placedBy: currentUser ? currentUser.name : details.faculty,
      approvalChain: chain
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem("rjit_orders", JSON.stringify(updated));

    addNotification(
      "Purchase Order",
      `New Purchase Order ${newOrder.id} created by ${newOrder.placedBy} for ${newOrder.quantity} ${newOrder.item} - Total: ₹${(newOrder.quantity * newOrder.pricePerUnit).toLocaleString()} (₹${newOrder.pricePerUnit.toLocaleString()}/unit)`,
      "order",
      "bg-yellow-100 text-yellow-800"
    );

    return { success: true };
  };

  // Helper action: Receive Order (Update status & increase stock count)
  const receiveOrderItem = (orderId, firstArg, secondArg, invoiceDataUrl) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: "Order not found!" };

    const order = orders[orderIndex];
    
    // Support either receiveOrderItem(orderId, receiveDate) or receiveOrderItem(orderId, qtyReceived, receiveDate)
    let qtyToReceive;
    let receiveDate;
    
    const currentReceived = order.receivedQuantity || 0;
    const remainingToReceive = order.pendingQuantity !== undefined ? order.pendingQuantity : (order.quantity - currentReceived);

    if (secondArg !== undefined) {
      qtyToReceive = parseInt(firstArg, 10);
      receiveDate = secondArg;
    } else {
      qtyToReceive = remainingToReceive;
      receiveDate = firstArg;
    }

    if (isNaN(qtyToReceive) || qtyToReceive <= 0) {
      return { success: false, message: "Invalid quantity received!" };
    }

    if (qtyToReceive > remainingToReceive) {
      return { success: false, message: `Cannot receive more than pending quantity (${remainingToReceive})!` };
    }

    if (order.status === "Approved" || order.status === "Pending" || order.status === "Received" || order.status === "Partially Received") {
      const newReceived = currentReceived + qtyToReceive;
      const newPending = order.quantity - newReceived;
      const newStatus = newPending === 0 ? "Received" : "Partially Received";

      // 1. Mark order status and quantities
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = {
        ...order,
        status: newStatus,
        receivedQuantity: newReceived,
        pendingQuantity: newPending,
        receiveDate: receiveDate,
        // Persist invoice - only set if provided (keep existing if already stored)
        ...(invoiceDataUrl ? { invoiceDataUrl } : {})
      };
      setOrders(updatedOrders);
      localStorage.setItem("rjit_orders", JSON.stringify(updatedOrders));

      // Normalize Category name
      let cat = order.category || "";
      if (cat.trim().toLowerCase() === "stationery") cat = "Stationary";
      else if (cat.trim().toLowerCase() === "cleaning") cat = "Sanitory";
      else if (cat.trim().toLowerCase() === "sanitary") cat = "Sanitory";
      else if (cat.trim().toLowerCase() === "equipment") cat = "laboratory";
      else if (cat.trim().toLowerCase() === "laboratory") cat = "laboratory";
      else if (cat.trim().toLowerCase() === "it" || cat.trim().toLowerCase() === "cse" || cat.trim().toLowerCase() === "it,cse") cat = "IT,CSE";

      const finalSubcat = (order.subcategory || "").trim().replace(/\s+/g, " ");
      const finalType = (order.type || "Standard").trim().replace(/\s+/g, " ");
      const finalItem = (order.item || finalSubcat).trim().replace(/\s+/g, " ");

      // 2. Increase inventory stock
      const itemIndex = inventory.findIndex(
        (item) =>
          (item.category || "").toLowerCase() === cat.toLowerCase() &&
          (item.subcategory || "").toLowerCase() === finalSubcat.toLowerCase() &&
          (item.type || "").toLowerCase() === finalType.toLowerCase()
      );

      let updatedInventory;
      const nowStr = getNowString();
      if (itemIndex !== -1) {
        updatedInventory = [...inventory];
        const updatedStock = updatedInventory[itemIndex].stock + qtyToReceive;
        updatedInventory[itemIndex] = {
          ...updatedInventory[itemIndex],
          stock: updatedStock,
          price: order.pricePerUnit || updatedInventory[itemIndex].price,
          status: updatedStock <= (systemSettings.lowStockThreshold || 10) ? "Low" : updatedStock <= 15 ? "Medium" : "Good",
          updatedAt: nowStr
        };
        // Move updated item to front (most recent first)
        const updatedItem = updatedInventory.splice(itemIndex, 1)[0];
        updatedInventory = [updatedItem, ...updatedInventory];
      } else {
        // Create new item in inventory if not present
        const newItem = {
          id: Date.now(),
          item: finalItem,
          category: cat,
          subcategory: finalSubcat,
          type: finalType,
          stock: qtyToReceive,
          price: order.pricePerUnit || 1000,
          status: "Good",
          createdAt: nowStr
        };
        updatedInventory = [newItem, ...inventory];
      }
      setInventory(updatedInventory);
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInventory));

      addNotification(
        "Stock Received",
        `${qtyToReceive} units of ${order.item} (${order.type}) received for ${order.department} - Total Value: ₹${(qtyToReceive * (order.pricePerUnit || 1000)).toLocaleString()}${newPending > 0 ? ` (${newPending} still pending)` : ""}`,
        "received",
        "bg-green-100 text-green-800"
      );

      return { success: true };
    }
    return { success: false, message: "Order cannot be received!" };
  };

  const approveOrder = (orderId) => {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;

      const chain = o.approvalChain || [];
      const nextStepIndex = chain.findIndex((step) => step.status === "Pending");
      if (nextStepIndex === -1) return o;

      const updatedChain = [...chain];
      const approverName = currentUser ? currentUser.name : updatedChain[nextStepIndex].name;
      const approverRole = currentUser ? currentUser.role : updatedChain[nextStepIndex].role;
      
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const formattedDate = new Date(Date.now() - tzOffset).toISOString().slice(0, 19).replace("T", " ");

      updatedChain[nextStepIndex] = {
        ...updatedChain[nextStepIndex],
        name: approverName,
        role: approverRole,
        status: "Approved",
        approvedAt: formattedDate
      };

      // Check if there are any remaining steps in the chain
      const nextPendingIndex = updatedChain.findIndex((step) => step.status === "Pending");
      const isCompleted = nextPendingIndex === -1;

      addNotification(
        "Order Approved",
        `Order ${orderId} (${o.quantity} ${o.item}, Total: ₹${(o.quantity * o.pricePerUnit).toLocaleString()}) approved by ${approverName} (${approverRole})`,
        "order",
        "bg-green-100 text-green-800"
      );

      if (isCompleted) {
        addNotification(
          "Order Completed",
          `Order ${orderId} (${o.quantity} ${o.item}, Total: ₹${(o.quantity * o.pricePerUnit).toLocaleString()}) is fully approved and ready for stock receipt!`,
          "received",
          "bg-emerald-100 text-emerald-800"
        );
      }

      return {
        ...o,
        status: isCompleted ? "Approved" : "Pending",
        approvalChain: updatedChain
      };
    });

    setOrders(updated);
    localStorage.setItem("rjit_orders", JSON.stringify(updated));
    return { success: true };
  };

  const rejectOrder = (orderId) => {
    const updated = orders.map((o) => {
      if (o.id !== orderId) return o;

      const chain = o.approvalChain || [];
      const nextStepIndex = chain.findIndex((step) => step.status === "Pending");
      if (nextStepIndex === -1) return o;

      const updatedChain = [...chain];
      const approverName = currentUser ? currentUser.name : updatedChain[nextStepIndex].name;
      const approverRole = currentUser ? currentUser.role : updatedChain[nextStepIndex].role;

      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const formattedDate = new Date(Date.now() - tzOffset).toISOString().slice(0, 19).replace("T", " ");

      updatedChain[nextStepIndex] = {
        ...updatedChain[nextStepIndex],
        name: approverName,
        role: approverRole,
        status: "Rejected",
        approvedAt: formattedDate
      };

      addNotification(
        "Order Rejected",
        `Order ${orderId} (${o.quantity} ${o.item}, Total: ₹${(o.quantity * o.pricePerUnit).toLocaleString()}) was rejected by ${approverName} (${approverRole})`,
        "low-stock",
        "bg-red-100 text-red-800"
      );

      return {
        ...o,
        status: "Rejected",
        approvalChain: updatedChain
      };
    });

    setOrders(updated);
    localStorage.setItem("rjit_orders", JSON.stringify(updated));
    return { success: true };
  };

  // Helper action: Add Inventory Item
  const addInventoryItem = (itemDetails) => {
    let cat = itemDetails.category || "";
    if (cat.trim().toLowerCase() === "stationery") cat = "Stationary";
    else if (cat.trim().toLowerCase() === "cleaning") cat = "Sanitory";
    else if (cat.trim().toLowerCase() === "sanitary") cat = "Sanitory";
    else if (cat.trim().toLowerCase() === "equipment") cat = "laboratory";
    else if (cat.trim().toLowerCase() === "laboratory") cat = "laboratory";
    else if (cat.trim().toLowerCase() === "it" || cat.trim().toLowerCase() === "cse" || cat.trim().toLowerCase() === "it,cse") cat = "IT,CSE";

    const finalSubcat = (itemDetails.subcategory || "").trim().replace(/\s+/g, " ");
    const finalType = (itemDetails.type || "Standard").trim().replace(/\s+/g, " ");
    const finalItem = (itemDetails.item || finalSubcat).trim().replace(/\s+/g, " ");

    const existingIndex = inventory.findIndex(
      (item) =>
        (item.category || "").toLowerCase() === cat.toLowerCase() &&
        (item.subcategory || "").toLowerCase() === finalSubcat.toLowerCase() &&
        (item.type || "").toLowerCase() === finalType.toLowerCase()
    );

    const nowStr = getNowString();
    let updatedInventory;
    if (existingIndex !== -1) {
      updatedInventory = [...inventory];
      const existingItem = updatedInventory[existingIndex];
      const newStock = existingItem.stock + itemDetails.stock;
      updatedInventory[existingIndex] = {
        ...existingItem,
        stock: newStock,
        price: itemDetails.price || existingItem.price,
        status: newStock <= (systemSettings.lowStockThreshold || 10) ? "Low" : newStock <= 15 ? "Medium" : "Good",
        updatedAt: nowStr
      };
      // Move updated item to front (most recent first)
      const updatedItem = updatedInventory.splice(existingIndex, 1)[0];
      updatedInventory = [updatedItem, ...updatedInventory];
    } else {
      const newItem = {
        id: Date.now(),
        item: finalItem,
        category: cat,
        subcategory: finalSubcat,
        type: finalType,
        stock: itemDetails.stock,
        price: itemDetails.price,
        status: itemDetails.stock <= (systemSettings.lowStockThreshold || 10) ? "Low" : itemDetails.stock <= 15 ? "Medium" : "Good",
        createdAt: nowStr
      };
      updatedInventory = [newItem, ...inventory];
    }
    setInventory(updatedInventory);
    localStorage.setItem("rjit_inventory", JSON.stringify(updatedInventory));
    return { success: true };
  };

  // Maintenance logs state
  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("rjit_maintenanceLogs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    
    return [];
  });

  const addMaintenanceLog = (roId, log) => {
    setMaintenanceLogs(prev => {
      const updated = prev.map(ro => {
        if (ro.id === roId) {
          const totalAmount = parseInt(log.quantity || 1) * parseFloat(log.pricePerQty || 0);
          const newLog = {
            id: `h-${roId.replace("ro-", "")}-${Date.now()}`,
            partRepaired: log.partRepaired,
            quantity: parseInt(log.quantity || 1),
            pricePerQty: parseFloat(log.pricePerQty || 0),
            totalAmount: totalAmount,
            date: log.date || new Date().toISOString().split("T")[0],
            technician: log.technician || "General Technician",
            notes: log.notes || ""
          };
          return {
            ...ro,
            history: [newLog, ...ro.history]
          };
        }
        return ro;
      });
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });
  };

  // Dynamic Inventory Categories/Departments
  const [inventoryCategories, setInventoryCategories] = useState(() => {
    const defaultCategories = [
      { id: "stationary", name: "Stationary", icon: "FaPen", desc: "Admin stationery, files, registers, folders, writing assets and stock registers.", color: "from-blue-600 to-indigo-750" },
      { id: "sanitory", name: "Sanitory", icon: "FaBroom", desc: "Sanitation items, cleaning supplies, soaps, brushes, and hygiene products.", color: "from-teal-500 to-emerald-600" },
      { id: "electrical", name: "Electrical", icon: "FaBolt", desc: "Electrical bulbs, tube lights, wires, sockets, and switchboards.", color: "from-amber-500 to-orange-600" },
      { id: "electronics", name: "Electronics", icon: "FaDesktop", desc: "Desktop computers, monitors, printers, scanners, and UPS units.", color: "from-sky-500 to-blue-600" },
      { id: "sports", name: "Sports", icon: "FaRunning", desc: "Sports kits, athletics gear, fitness assets, and court equipment.", color: "from-rose-500 to-pink-600" },
      { id: "furniture", name: "Furniture", icon: "FaChair", desc: "Beds, wardrobes, tables, office chairs, desks, and cupboards.", color: "from-yellow-600 to-amber-700" },
      { id: "it_cse", name: "IT,CSE", icon: "FaDesktop", desc: "Servers, routers, access points, coding lab components and systems.", color: "from-indigo-500 to-purple-650" },
      { id: "laboratory", name: "laboratory", icon: "FaFlask", desc: "Glassware, scientific machinery, chemicals and compound microscopes.", color: "from-violet-500 to-fuchsia-600" }
    ];

    try {
      const saved = localStorage.getItem("rjit_inventoryCategories");
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasSanitory = (parsed || []).some(c => c && c.id === "sanitory");
        if (!hasSanitory) {
          const updated = [...parsed, defaultCategories.find(c => c.id === "sanitory")].filter(Boolean);
          localStorage.setItem("rjit_inventoryCategories", JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return defaultCategories;
  });

  const [inventorySubcategories, setInventorySubcategories] = useState(() => {
    const defaultSubcategories = [
      { categoryId: "stationary", name: "Stationery" },
      { categoryId: "sanitory", name: "Cleaning" },
      { categoryId: "electrical", name: "Electrical" },
      { categoryId: "electronics", name: "Electronics" },
      { categoryId: "sports", name: "Sports" },
      { categoryId: "furniture", name: "Furniture" },
      { categoryId: "it_cse", name: "Electronics" },
      { categoryId: "laboratory", name: "Equipment" },
      { categoryId: "laboratory", name: "Stationery" }
    ];

    try {
      const saved = localStorage.getItem("rjit_inventorySubcategories");
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasSanitorySub = (parsed || []).some(s => s && s.categoryId === "sanitory" && s.name === "Cleaning");
        if (!hasSanitorySub) {
          const updated = [...parsed, { categoryId: "sanitory", name: "Cleaning" }];
          localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(updated));
          return updated;
        }
        return parsed;
      }
    } catch (e) {
      // ignore
    }
    return defaultSubcategories;
  });

  const addInventoryCategory = (category) => {
    setInventoryCategories(prev => {
      const id = category.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const exists = prev.some(c => c.id === id);
      if (exists) return prev;
      const updated = [...prev, {
        id,
        name: category.name,
        icon: category.icon || "FaBoxes",
        desc: category.desc || "Dynamic category",
        color: category.color || "from-blue-500 to-indigo-600"
      }];
      localStorage.setItem("rjit_inventoryCategories", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteInventoryCategory = (categoryId) => {
    const catObj = inventoryCategories.find(c => c.id === categoryId);
    if (catObj) {
      const subcategories = inventorySubcategories.filter(s => s.categoryId === categoryId);
      addBackupItem("inventoryCategory", { category: catObj, subcategories });
    }
    setInventoryCategories(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      localStorage.setItem("rjit_inventoryCategories", JSON.stringify(updated));
      return updated;
    });
    // Also cleanup subcategories
    setInventorySubcategories(prev => {
      const updated = prev.filter(s => s.categoryId !== categoryId);
      localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(updated));
      return updated;
    });

    // Mirror deletion to maintenanceCategories (case-insensitive check)
    const targetMaintId = categoryId.toUpperCase();
    setMaintenanceCategories(prev => {
      const updated = prev.filter(c => c.id.toUpperCase() !== targetMaintId);
      localStorage.setItem("rjit_maintenanceCategories", JSON.stringify(updated));
      return updated;
    });

    // Mirror cleanup to maintenanceLogs
    setMaintenanceLogs(prev => {
      const updated = prev.filter(ro => ro.category.toUpperCase() !== targetMaintId);
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });

    // Clean up items inside that category from inventory ledger list
    setInventory(prevInv => {
      const catName = catObj ? catObj.name : "";
      const updatedInv = prevInv.filter(i => {
        const matchCat = (i.category || "").toLowerCase() === catName.toLowerCase() || (i.category || "").toLowerCase() === categoryId.toLowerCase();
        return !matchCat;
      });
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const addInventorySubcategory = (categoryId, name) => {
    setInventorySubcategories(prev => {
      const exists = prev.some(s => s.categoryId === categoryId && s.name.toLowerCase() === name.toLowerCase());
      if (exists) return prev;
      const updated = [...prev, { categoryId, name }];
      localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteInventorySubcategory = (categoryId, name) => {
    addBackupItem("inventorySubcategory", { categoryId, name });
    setInventorySubcategories(prev => {
      const updated = prev.filter(s => !(s.categoryId === categoryId && s.name === name));
      localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(updated));
      return updated;
    });

    // Also clean up items inside that subcategory from inventory ledger list
    setInventory(prevInv => {
      const catObj = inventoryCategories.find(c => c.id === categoryId);
      const catName = catObj ? catObj.name : "";
      const updatedInv = prevInv.filter(i => {
        const matchCat = (i.category || "").toLowerCase() === catName.toLowerCase() || (i.category || "").toLowerCase() === categoryId.toLowerCase();
        const matchSub = (i.subcategory || "").toLowerCase() === name.toLowerCase();
        return !(matchCat && matchSub);
      });
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  // Dynamic Maintenance Categories
  const [maintenanceCategories, setMaintenanceCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("rjit_maintenanceCategories");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      { id: "RO", name: "RO (Water Purifiers)", icon: "FaTint" },
      { id: "AC", name: "Air Conditioners", icon: "FaWrench" },
      { id: "DG", name: "Diesel Generators", icon: "FaTools" }
    ];
  });

  const addMaintenanceCategory = (name, icon) => {
    setMaintenanceCategories(prev => {
      const id = name.toUpperCase().replace(/[^A-Z0-9]/g, "_");
      const exists = prev.some(c => c.id === id);
      if (exists) return prev;
      const updated = [...prev, { id, name, icon: icon || "FaTools" }];
      localStorage.setItem("rjit_maintenanceCategories", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMaintenanceCategory = (id) => {
    const catObj = maintenanceCategories.find(c => c.id === id);
    if (catObj) {
      const logs = maintenanceLogs.filter(ro => ro.category === id);
      addBackupItem("maintenanceCategory", { category: catObj, logs });
    }
    setMaintenanceCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem("rjit_maintenanceCategories", JSON.stringify(updated));
      return updated;
    });
    // Also cleanup associated units/logs in maintenanceLogs
    setMaintenanceLogs(prev => {
      const updated = prev.filter(ro => ro.category !== id);
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });

    // Also clean up from inventoryCategories (case-insensitive ID check)
    setInventoryCategories(prev => {
      const updated = prev.filter(c => c.id !== id.toLowerCase());
      localStorage.setItem("rjit_inventoryCategories", JSON.stringify(updated));
      return updated;
    });

    // Also clean up items from inventory
    setInventory(prevInv => {
      const updatedInv = prevInv.filter(i => (i.category || "").toLowerCase() !== id.toLowerCase());
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const addMaintenanceSubcategory = (category, name, location, initialPrice, installDate) => {
    const id = `maint-${category.toLowerCase()}-${Date.now()}`;
    setMaintenanceLogs(prev => {
      const newRo = {
        id,
        name,
        category,
        location: location || "Campus",
        initialPrice: parseFloat(initialPrice || 0),
        installDate: installDate || new Date().toISOString().split("T")[0],
        status: "Active",
        history: []
      };
      const updated = [...prev, newRo];
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });

    setInventory(prevInv => {
      const exists = prevInv.some(i => i.id === id);
      if (exists) return prevInv;
      const updatedInv = [{
        id,
        item: name,
        category: category,
        subcategory: category,
        type: location || "Campus",
        stock: 1,
        price: parseFloat(initialPrice || 0),
        status: "Good",
        createdAt: installDate ? `${installDate} 00:00:00` : getNowString(),
        isMaintenanceAsset: true
      }, ...prevInv];
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const deleteMaintenanceSubcategory = (itemId) => {
    const unitObj = maintenanceLogs.find(ro => ro.id === itemId);
    if (unitObj) {
      addBackupItem("maintenanceSubcategory", unitObj);
    }
    setMaintenanceLogs(prev => {
      const updated = prev.filter(ro => ro.id !== itemId);
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });

    setInventory(prevInv => {
      const updatedInv = prevInv.filter(i => i.id !== itemId);
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const updateMaintenanceLog = (roId, logId, updatedLog) => {
    setMaintenanceLogs(prev => {
      const updated = prev.map(ro => {
        if (ro.id === roId) {
          const updatedHistory = (ro.history || []).map(h => {
            if (h.id === logId) {
              const qty = parseInt(updatedLog.quantity || 1);
              const price = parseFloat(updatedLog.pricePerQty || 0);
              return {
                ...h,
                ...updatedLog,
                quantity: qty,
                pricePerQty: price,
                totalAmount: qty * price
              };
            }
            return h;
          });
          return { ...ro, history: updatedHistory };
        }
        return ro;
      });
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMaintenanceLog = (roId, logId) => {
    const unit = maintenanceLogs.find(ro => ro.id === roId);
    const logObj = unit?.history?.find(h => h.id === logId);
    if (logObj) {
      addBackupItem("maintenanceLog", { roId, log: logObj });
    }
    setMaintenanceLogs(prev => {
      const updated = prev.map(ro => {
        if (ro.id === roId) {
          return {
            ...ro,
            history: (ro.history || []).filter(h => h.id !== logId)
          };
        }
        return ro;
      });
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });
  };

  const updateMaintenanceUnitStatus = (roId, status) => {
    setMaintenanceLogs(prev => {
      const updated = prev.map(ro => {
        if (ro.id === roId) {
          return { ...ro, status };
        }
        return ro;
      });
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });

    setInventory(prevInv => {
      const updatedInv = prevInv.map(i => {
        if (i.id === roId) {
          return {
            ...i,
            status: status === "Active" ? "Good" : "Low"
          };
        }
        return i;
      });
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const updateMaintenanceUnitDetails = (roId, details) => {
    setMaintenanceLogs(prev => {
      const updated = prev.map(ro => {
        if (ro.id === roId) {
          return {
            ...ro,
            name: details.name,
            location: details.location,
            initialPrice: parseFloat(details.initialPrice || 0),
            installDate: details.installDate
          };
        }
        return ro;
      });
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
      return updated;
    });

    setInventory(prevInv => {
      const updatedInv = prevInv.map(i => {
        if (i.id === roId) {
          return {
            ...i,
            item: details.name,
            type: details.location || "Campus",
            price: parseFloat(details.initialPrice || 0),
            createdAt: details.installDate ? `${details.installDate} 00:00:00` : i.createdAt
          };
        }
        return i;
      });
      localStorage.setItem("rjit_inventory", JSON.stringify(updatedInv));
      return updatedInv;
    });
  };

  const restoreBackupItem = (backupId) => {
    const backupItem = backup.find(b => b.id === backupId);
    if (!backupItem) return { success: false, message: "Backup item not found!" };

    const { type, data } = backupItem;

    if (type === "user") {
      const exists = usersList.some(u => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        return { success: false, message: `A user with email ${data.email} already exists!` };
      }
      setUsersList(prev => {
        const updated = [...prev, data];
        localStorage.setItem("rjit_users", JSON.stringify(updated));
        return updated;
      });
    } 
    else if (type === "inventoryCategory") {
      const exists = inventoryCategories.some(c => c.id === data.category.id);
      if (!exists) {
        setInventoryCategories(prev => {
          const updated = [...prev, data.category];
          localStorage.setItem("rjit_inventoryCategories", JSON.stringify(updated));
          return updated;
        });
      }
      if (data.subcategories && data.subcategories.length > 0) {
        setInventorySubcategories(prev => {
          const nonDup = data.subcategories.filter(s => 
            !prev.some(p => p.categoryId === s.categoryId && p.name.toLowerCase() === s.name.toLowerCase())
          );
          const updated = [...prev, ...nonDup];
          localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(updated));
          return updated;
        });
      }
    } 
    else if (type === "inventorySubcategory") {
      const exists = inventorySubcategories.some(s => s.categoryId === data.categoryId && s.name.toLowerCase() === data.name.toLowerCase());
      if (!exists) {
        setInventorySubcategories(prev => {
          const updated = [...prev, data];
          localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(updated));
          return updated;
        });
      }
    } 
    else if (type === "maintenanceCategory") {
      const exists = maintenanceCategories.some(c => c.id === data.category.id);
      if (!exists) {
        setMaintenanceCategories(prev => {
          const updated = [...prev, data.category];
          localStorage.setItem("rjit_maintenanceCategories", JSON.stringify(updated));
          return updated;
        });
      }
      if (data.logs && data.logs.length > 0) {
        setMaintenanceLogs(prev => {
          const nonDup = data.logs.filter(l => !prev.some(p => p.id === l.id));
          const updated = [...prev, ...nonDup];
          localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
          return updated;
        });
      }
    } 
    else if (type === "maintenanceSubcategory") {
      const exists = maintenanceLogs.some(ro => ro.id === data.id);
      if (!exists) {
        setMaintenanceLogs(prev => {
          const updated = [...prev, data];
          localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
          return updated;
        });
      }
    } 
    else if (type === "maintenanceLog") {
      const unitExists = maintenanceLogs.some(ro => ro.id === data.roId);
      if (!unitExists) {
        return { success: false, message: "Associated asset unit does not exist. Please restore the unit first." };
      }
      setMaintenanceLogs(prev => {
        const updated = prev.map(ro => {
          if (ro.id === data.roId) {
            const logExists = (ro.history || []).some(h => h.id === data.log.id);
            if (logExists) return ro;
            return {
              ...ro,
              history: [data.log, ...(ro.history || [])]
            };
          }
          return ro;
        });
        localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(updated));
        return updated;
      });
    }

    setBackup(prev => {
      const updated = prev.filter(b => b.id !== backupId);
      localStorage.setItem("rjit_backup", JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  const permanentlyDeleteBackupItem = (backupId) => {
    setBackup(prev => {
      const updated = prev.filter(b => b.id !== backupId);
      localStorage.setItem("rjit_backup", JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  const restoreAllBackup = () => {
    if (backup.length === 0) return { success: true, count: 0 };
    
    let tempUsers = [...usersList];
    let tempInvCats = [...inventoryCategories];
    let tempInvSubcats = [...inventorySubcategories];
    let tempMaintCats = [...maintenanceCategories];
    let tempMaintLogs = [...maintenanceLogs];
    
    const order = {
      "user": 1,
      "inventoryCategory": 1,
      "maintenanceCategory": 1,
      "inventorySubcategory": 2,
      "maintenanceSubcategory": 2,
      "maintenanceLog": 3
    };
    
    const sorted = [...backup].sort((a, b) => (order[a.type] || 99) - (order[b.type] || 99));
    const restoredIds = [];
    let count = 0;

    sorted.forEach(item => {
      const { type, data } = item;
      if (type === "user") {
        if (!tempUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
          tempUsers.push(data);
          restoredIds.push(item.id);
          count++;
        }
      } else if (type === "inventoryCategory") {
        if (!tempInvCats.some(c => c.id === data.category.id)) {
          tempInvCats.push(data.category);
          restoredIds.push(item.id);
          count++;
        }
        if (data.subcategories && data.subcategories.length > 0) {
          data.subcategories.forEach(s => {
            if (!tempInvSubcats.some(p => p.categoryId === s.categoryId && p.name.toLowerCase() === s.name.toLowerCase())) {
              tempInvSubcats.push(s);
            }
          });
        }
      } else if (type === "inventorySubcategory") {
        if (!tempInvSubcats.some(s => s.categoryId === data.categoryId && s.name.toLowerCase() === data.name.toLowerCase())) {
          tempInvSubcats.push(data);
          restoredIds.push(item.id);
          count++;
        }
      } else if (type === "maintenanceCategory") {
        if (!tempMaintCats.some(c => c.id === data.category.id)) {
          tempMaintCats.push(data.category);
          restoredIds.push(item.id);
          count++;
        }
        if (data.logs && data.logs.length > 0) {
          data.logs.forEach(l => {
            if (!tempMaintLogs.some(p => p.id === l.id)) {
              tempMaintLogs.push(l);
            }
          });
        }
      } else if (type === "maintenanceSubcategory") {
        if (!tempMaintLogs.some(ro => ro.id === data.id)) {
          tempMaintLogs.push(data);
          restoredIds.push(item.id);
          count++;
        }
      } else if (type === "maintenanceLog") {
        const parentIndex = tempMaintLogs.findIndex(ro => ro.id === data.roId);
        if (parentIndex !== -1) {
          const parent = tempMaintLogs[parentIndex];
          const logExists = (parent.history || []).some(h => h.id === data.log.id);
          if (!logExists) {
            tempMaintLogs[parentIndex] = {
              ...parent,
              history: [data.log, ...(parent.history || [])]
            };
            restoredIds.push(item.id);
            count++;
          }
        }
      }
    });

    if (count > 0) {
      setUsersList(tempUsers);
      localStorage.setItem("rjit_users", JSON.stringify(tempUsers));
      
      setInventoryCategories(tempInvCats);
      localStorage.setItem("rjit_inventoryCategories", JSON.stringify(tempInvCats));
      
      setInventorySubcategories(tempInvSubcats);
      localStorage.setItem("rjit_inventorySubcategories", JSON.stringify(tempInvSubcats));
      
      setMaintenanceCategories(tempMaintCats);
      localStorage.setItem("rjit_maintenanceCategories", JSON.stringify(tempMaintCats));
      
      setMaintenanceLogs(tempMaintLogs);
      localStorage.setItem("rjit_maintenanceLogs", JSON.stringify(tempMaintLogs));

      setBackup(prev => {
        const updated = prev.filter(b => !restoredIds.includes(b.id));
        localStorage.setItem("rjit_backup", JSON.stringify(updated));
        return updated;
      });
    }

    return { success: true, count };
  };

  const permanentlyDeleteAllBackup = () => {
    setBackup([]);
    localStorage.setItem("rjit_backup", JSON.stringify([]));
    return { success: true };
  };

  const getCategoriesForRegister = useCallback((registerName) => {
    if (!registerName) return [];
    const reg = (inventoryCategories || []).find(
      c => c.name.toLowerCase() === registerName.toLowerCase()
    );
    if (!reg) return [registerName];
    const subcats = (inventorySubcategories || [])
      .filter(s => s.categoryId === reg.id)
      .map(s => s.name);
    if (subcats.length === 0) return [reg.name];
    return subcats;
  }, [inventoryCategories, inventorySubcategories]);

  const getRegisterForCategory = useCallback((categoryName) => {
    if (!categoryName) return "";
    const reg = (inventoryCategories || []).find(c => {
      const allowed = getCategoriesForRegister(c.name);
      return allowed.some(a => a.toLowerCase() === categoryName.toLowerCase());
    });
    return reg ? reg.name : categoryName;
  }, [inventoryCategories, getCategoriesForRegister]);

  // Dynamic categories and maintenance assets mirroring effect
  useEffect(() => {
    // 1. Sync maintenance logs to inventory
    setInventory(prev => {
      let changed = false;
      const invList = [...prev];
      (maintenanceLogs || []).forEach(ro => {
        if (ro.status !== "Decommissioned") {
          const exists = invList.some(item => item.id === ro.id);
          if (!exists) {
            invList.push({
              id: ro.id,
              item: ro.name,
              category: ro.category,
              subcategory: ro.category,
              type: ro.location || "Campus",
              stock: 1,
              price: ro.initialPrice || 0,
              status: ro.status === "Active" ? "Good" : "Low",
              createdAt: ro.installDate ? `${ro.installDate} 00:00:00` : "2026-06-01 00:00:00",
              isMaintenanceAsset: true
            });
            changed = true;
          }
        }
      });
      if (changed) {
        localStorage.setItem("rjit_inventory", JSON.stringify(invList));
        return invList;
      }
      return prev;
    });
  }, [maintenanceLogs]);

  useEffect(() => {
    // 2. Auto-sync maintenance categories into inventoryCategories
    setInventoryCategories(prev => {
      let changed = false;
      const currentCats = [...prev];
      (maintenanceCategories || []).forEach(mc => {
        const exists = currentCats.some(ic => 
          (ic.name && mc.name && ic.name.toLowerCase() === mc.name.toLowerCase()) || 
          (ic.id && mc.id && ic.id.toLowerCase() === mc.id.toLowerCase())
        );
        if (!exists) {
          currentCats.push({
            id: mc.id ? mc.id.toLowerCase() : "maint_cat",
            name: mc.name,
            icon: mc.icon || "FaTools",
            desc: `Maintenance Assets: ${mc.name}`,
            color: "from-blue-600 to-indigo-750"
          });
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("rjit_inventoryCategories", JSON.stringify(currentCats));
        return currentCats;
      }
      return prev;
    });
  }, [maintenanceCategories]);

  const ledgerHistory = useMemo(() => {
    const list = [];
    
    // Add all received orders
    orders.forEach(o => {
      if (o.status === "Received" || o.status === "Partially Received") {
        list.push({
          id: `rec-${o.id}-${o.receiveDate || o.orderDate}`,
          date: o.receiveDate || o.orderDate,
          item: o.item,
          category: o.category,
          subcategory: o.subcategory,
          type: o.type,
          billNumber: o.id,
          quantity: o.receivedQuantity || o.quantity,
          price: o.pricePerUnit || 0,
          amount: (o.receivedQuantity || o.quantity) * (o.pricePerUnit || 0),
          dealerName: o.supplier || "Unknown Supplier",
          remarks: o.remarks || "Stock Received",
          typeOfTx: "Receive"
        });
      }
    });

    // Add all issued stock
    issuedStock.forEach(i => {
      const matchingInv = inventory.find(
        inv =>
          (inv.category || "").toLowerCase() === (i.category || "").toLowerCase() &&
          (inv.subcategory || "").toLowerCase() === (i.subcategory || "").toLowerCase() &&
          (inv.type || "").toLowerCase() === (i.type || "").toLowerCase()
      );
      const price = matchingInv ? matchingInv.price : (i.price || 0);

      list.push({
        id: `issue-${i.id}`,
        date: i.date,
        item: i.item,
        category: i.category,
        subcategory: i.subcategory,
        type: i.type,
        billNumber: "—",
        quantity: -i.quantity,
        price: price,
        amount: i.quantity * price,
        dealerName: i.department || "Internal Issue",
        remarks: i.remarks || `Issued to ${i.department} (Faculty: ${i.faculty || 'N/A'})`,
        typeOfTx: "Issue"
      });
    });

    return list;
  }, [orders, issuedStock, inventory]);

  return (
    <StoreContext.Provider
      value={{
        inventory,
        issuedStock,
        orders,
        issueStockItem,
        placeOrderItem,
        receiveOrderItem,
        addInventoryItem,
        usersList,
        currentUser,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        systemSettings,
        updateSystemSettings,
        approveOrder,
        rejectOrder,
        approvalSequence,
        updateApprovalSequence,
        notifications,
        markAllRead,
        markAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        maintenanceLogs,
        addMaintenanceLog,
        inventoryCategories,
        inventorySubcategories,
        addInventoryCategory,
        deleteInventoryCategory,
        addInventorySubcategory,
        deleteInventorySubcategory,
        maintenanceCategories,
        addMaintenanceCategory,
        deleteMaintenanceCategory,
        addMaintenanceSubcategory,
        deleteMaintenanceSubcategory,
        updateMaintenanceLog,
        deleteMaintenanceLog,
        updateMaintenanceUnitStatus,
        updateMaintenanceUnitDetails,
        getCategoriesForRegister,
        getRegisterForCategory,
        backup,
        restoreBackupItem,
        restoreAllBackup,
        permanentlyDeleteBackupItem,
        permanentlyDeleteAllBackup,
        ledgerHistory
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
