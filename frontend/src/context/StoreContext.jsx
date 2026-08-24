import { createContext, useContext, useState, useEffect, useCallback } from "react";

const StoreContext = createContext();

export const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Stock Adjustment", "Analytics", "Reports", "Notifications", "Users", "Settings", "Maintenance", "Backup"],
  "Dean Student Welfare": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications", "Maintenance"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports", "Maintenance"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Stock Adjustment", "Reports", "Notifications", "Maintenance"]
};


const API_URL = "/api";

export function StoreProvider({ children }) {
  // Backup State (handled locally in localStorage)
  const [backup, setBackup] = useState(() => {
    const saved = localStorage.getItem("rjit_backup");
    let initialBackup = saved ? JSON.parse(saved) : [];
    
    // Auto-delete backup entries after 30 days
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const filtered = initialBackup.filter(item => {
      const deletedTime = new Date(item.deletedAt).getTime();
      return (now - deletedTime) < thirtyDays;
    });
    
    if (filtered.length !== initialBackup.length) {
      localStorage.setItem("rjit_backup", JSON.stringify(filtered));
    }
    return filtered;
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
  const [usersList, setUsersList] = useState([]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("rjit_currentUser");
    if (saved) {
      const user = JSON.parse(saved);
      const defaultPerms = ROLE_DEFAULT_PERMISSIONS[user.role] || [];
      if (defaultPerms.includes("Maintenance") && !user.permissions?.includes("Maintenance")) {
        const updatedUser = { ...user, permissions: [...(user.permissions || []), "Maintenance"] };
        localStorage.setItem("rjit_currentUser", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return user;
    }
    return null;
  });

  const [systemSettings, setSystemSettings] = useState({
    lowStockThreshold: 10,
    theme: "light",
    collegeInfo: {
      name: "Rustamji Institute of Technology",
      logo: "/rjit_logo.png",
      address: "123 Campus Lane, Okhla, New Delhi",
      phone: "+91 11 2690 7400",
      email: "info@rjit.edu.in",
      website: "www.rjit.edu.in"
    }
  });

  const [inventory, setInventory] = useState([]);
  const [issuedStock, setIssuedStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [approvalSequence, setApprovalSequence] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [inventorySubcategories, setInventorySubcategories] = useState([]);
  const [maintenanceCategories, setMaintenanceCategories] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);

  // Legacy CSV Records States
  const [legacyInventory, setLegacyInventory] = useState([]);
  const [sanitaryInventory, setSanitaryInventory] = useState([]);
  const [electricalInventory, setElectricalInventory] = useState([]);

  // Helper: get current local datetime string
  const getNowString = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 19).replace("T", " ");
  };

  // Common API Fetch Helper
  const apiFetch = async (path, options = {}) => {
    const token = localStorage.getItem("rjit_token");
    const headers = {
      ...options.headers
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
      });

      if (response.status === 401 && path !== "/auth/login") {
        // Auto-logout
        logout();
        return { success: false, message: "Session expired. Please login again!" };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error on ${path}:`, error);
      return { success: false, message: error.message || "Network error" };
    }
  };

  // Fetch individual resources
  const fetchSettings = async () => {
    const res = await apiFetch("/settings");
    if (res && res.success && res.settings) {
      const updatedSettings = { ...res.settings, theme: "light" };
      setSystemSettings(updatedSettings);
    }
  };

  const fetchUsers = async () => {
    const res = await apiFetch("/users");
    if (res && res.success && res.users) {
      setUsersList(res.users);
    }
  };

  const fetchInventory = async () => {
    const res = await apiFetch("/inventory");
    if (res && res.success && res.items) {
      setInventory(res.items);
    }
  };

  const fetchIssues = async () => {
    const res = await apiFetch("/issues");
    if (res && res.success && res.issues) {
      setIssuedStock(res.issues);
    }
  };

  const fetchOrders = async () => {
    const res = await apiFetch("/orders");
    if (res && res.success && res.orders) {
      setOrders(res.orders);
    }
  };

  const fetchApprovalSequence = async () => {
    const res = await apiFetch("/users/approval-sequence");
    if (res && res.success && res.sequence) {
      const ids = res.sequence.map(item => item.userId);
      setApprovalSequence(ids);
    }
  };

  const fetchNotifications = async () => {
    const res = await apiFetch("/notifications");
    if (res && res.success && res.notifications) {
      setNotifications(res.notifications);
    }
  };

  const fetchCategories = async () => {
    const res = await apiFetch("/categories");
    if (res && res.success && res.categories) {
      setInventoryCategories(res.categories);
      const subcategories = res.categories.reduce((acc, cat) => {
        const subs = (cat.subcategories || []).map(sub => ({
          categoryId: cat.id,
          name: sub.name
        }));
        return [...acc, ...subs];
      }, []);
      setInventorySubcategories(subcategories);
    }
  };

  const fetchMaintenance = async () => {
    const res = await apiFetch("/maintenance");
    if (res && res.success) {
      if (res.categories) setMaintenanceCategories(res.categories);
      if (res.units) setMaintenanceLogs(res.units);
    }
  };

  const fetchLegacyInventory = async () => {
    const res = await apiFetch("/inventory/legacy");
    if (res && res.success && res.items) {
      setLegacyInventory(res.items);
    }
  };

  const fetchSanitaryInventory = async () => {
    const res = await apiFetch("/inventory/legacy-sanitary");
    if (res && res.success && res.items) {
      setSanitaryInventory(res.items);
    }
  };

  const fetchElectricalInventory = async () => {
    const res = await apiFetch("/inventory/legacy-electrical");
    if (res && res.success && res.items) {
      setElectricalInventory(res.items);
    }
  };

  const refreshAllData = async () => {
    if (!localStorage.getItem("rjit_token")) return;
    await Promise.all([
      fetchSettings(),
      fetchUsers(),
      fetchInventory(),
      fetchIssues(),
      fetchOrders(),
      fetchApprovalSequence(),
      fetchNotifications(),
      fetchCategories(),
      fetchMaintenance()
    ]);
  };

  // Poll for notifications and updates every 10 seconds on LAN
  useEffect(() => {
    if (currentUser) {
      refreshAllData();
      const interval = setInterval(() => {
        refreshAllData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Load initial data on mount
  useEffect(() => {
    const token = localStorage.getItem("rjit_token");
    if (token) {
      refreshAllData();
    }
    document.body.classList.remove("dark");
  }, []);

  // Auth Operations
  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (res && res.success) {
      localStorage.setItem("rjit_token", res.token);
      localStorage.setItem("rjit_currentUser", JSON.stringify(res.user));
      localStorage.setItem("userRole", res.user.role);
      setCurrentUser(res.user);
      return { success: true };
    }

    return { success: false, message: res ? res.message : "Login failed!" };
  };

  const logout = () => {
    localStorage.removeItem("rjit_token");
    localStorage.removeItem("rjit_currentUser");
    localStorage.removeItem("userRole");
    setCurrentUser(null);
  };

  // User Management Operations
  const addUser = async (newUser) => {
    const res = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(newUser)
    });

    if (res && res.success) {
      await fetchUsers();
      return { success: true, user: res.user };
    }
    return { success: false, message: res ? res.message : "Failed to add user" };
  };

  const updateUser = async (id, updatedFields) => {
    const res = await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedFields)
    });

    if (res && res.success) {
      await fetchUsers();
      if (currentUser && currentUser.id === id) {
        const updatedUser = { ...currentUser, ...res.user };
        delete updatedUser.password;
        localStorage.setItem("rjit_currentUser", JSON.stringify(updatedUser));
        if (updatedFields.role) {
          localStorage.setItem("userRole", updatedFields.role);
        }
        setCurrentUser(updatedUser);
      }
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update user" };
  };

  const deleteUser = async (id) => {
    const userObj = usersList.find(u => u.id === id);
    const res = await apiFetch(`/users/${id}`, {
      method: "DELETE"
    });

    if (res && res.success) {
      if (userObj) {
        addBackupItem("user", userObj);
      }
      await fetchUsers();
      if (currentUser && currentUser.id === id) {
        logout();
      }
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete user" };
  };

  // Order Operations
  const placeOrderItem = async (details) => {
    const res = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify(details)
    });

    if (res && res.success) {
      await Promise.all([fetchOrders(), fetchNotifications()]);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to place purchase order" };
  };

  const receiveOrderItem = async (orderId, firstArg, secondArg, thirdArg) => {
    let receiveDate = firstArg;
    let deliverySlip = thirdArg;
    if (typeof firstArg === "number" || !isNaN(Number(firstArg))) {
      receiveDate = secondArg;
      deliverySlip = thirdArg;
    } else if (typeof secondArg === "string" && (secondArg.startsWith("data:") || secondArg.startsWith("http"))) {
      deliverySlip = secondArg;
    }

    const res = await apiFetch(`/orders/${orderId}/receive`, {
      method: "POST",
      body: JSON.stringify({ receiveDate, deliverySlip })
    });

    if (res && res.success) {
      await Promise.all([fetchOrders(), fetchInventory(), fetchNotifications()]);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to receive order" };
  };

  const updateOrderDeliverySlip = async (orderId, deliverySlip) => {
    const res = await apiFetch(`/orders/${orderId}/delivery-slip`, {
      method: "PATCH",
      body: JSON.stringify({ deliverySlip })
    });

    if (res && res.success) {
      await fetchOrders();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update delivery slip" };
  };

  const approveOrder = async (orderId) => {
    const res = await apiFetch(`/orders/${orderId}/approve`, {
      method: "POST"
    });

    if (res && res.success) {
      await Promise.all([fetchOrders(), fetchNotifications()]);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to approve order" };
  };

  const rejectOrder = async (orderId) => {
    const res = await apiFetch(`/orders/${orderId}/reject`, {
      method: "POST"
    });

    if (res && res.success) {
      await Promise.all([fetchOrders(), fetchNotifications()]);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to reject order" };
  };

  // Settings & Sequence Configuration
  const updateSystemSettings = async (newSettings) => {
    const forcedSettings = { ...newSettings, theme: "light" };
    const res = await apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(forcedSettings)
    });

    if (res && res.success) {
      setSystemSettings(res.settings);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update settings" };
  };

  const updateApprovalSequence = async (newSeq) => {
    const res = await apiFetch("/users/approval-sequence", {
      method: "PUT",
      body: JSON.stringify({ userIds: newSeq })
    });

    if (res && res.success) {
      await fetchApprovalSequence();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update approval sequence" };
  };

  // Notifications Operations
  const markAllRead = async () => {
    const res = await apiFetch("/notifications/read-all", {
      method: "PUT"
    });
    if (res && res.success) {
      await fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    const res = await apiFetch(`/notifications/${id}/read`, {
      method: "PUT"
    });
    if (res && res.success) {
      await fetchNotifications();
    }
  };

  const deleteNotification = async (id) => {
    const res = await apiFetch(`/notifications/${id}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      await fetchNotifications();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete notification" };
  };

  const clearAllNotifications = async (status = "all") => {
    const res = await apiFetch(`/notifications?status=${status}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      await fetchNotifications();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to clear notifications" };
  };

  const addNotification = async (type, message, iconType, color) => {
    const res = await apiFetch("/notifications", {
      method: "POST",
      body: JSON.stringify({ type, message, iconType, color })
    });
    if (res && res.success) {
      await fetchNotifications();
    }
  };

  // Issue stock via API
  const issueStockItem = async (details) => {
    const res = await apiFetch("/issues", {
      method: "POST",
      body: JSON.stringify(details)
    });
    if (res && res.success) {
      await Promise.all([fetchInventory(), fetchIssues(), fetchNotifications()]);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to issue stock" };
  };

  // Manual Stock Adjustment via API (Admin / Store Manager only)
  const adjustStock = async (payload) => {
    const res = await apiFetch("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (res && res.success) {
      await Promise.all([fetchInventory(), fetchNotifications()]);
      return { success: true, item: res.item, adjustment: res.adjustment, message: res.message };
    }
    return { success: false, message: res ? res.message : "Failed to adjust stock" };
  };

  // Add inventory item via API
  const addInventoryItem = async (itemDetails) => {
    const res = await apiFetch("/inventory", {
      method: "POST",
      body: JSON.stringify(itemDetails)
    });
    if (res && res.success) {
      await fetchInventory();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to add inventory item" };
  };

  const addInventoryCategory = async (category) => {
    const res = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify(category)
    });
    if (res && res.success) {
      await fetchCategories();
      return { success: true, category: res.category };
    }
    return { success: false, message: res ? res.message : "Failed to add category" };
  };

  const deleteInventoryCategory = async (categoryId) => {
    const catObj = inventoryCategories.find(c => c.id === categoryId);
    const res = await apiFetch(`/categories/${categoryId}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      if (catObj) {
        const subcategories = inventorySubcategories.filter(s => s.categoryId === categoryId);
        addBackupItem("inventoryCategory", { category: catObj, subcategories });
      }
      await fetchCategories();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete category" };
  };

  const addInventorySubcategory = async (categoryId, name) => {
    const res = await apiFetch(`/categories/${categoryId}/subcategories`, {
      method: "POST",
      body: JSON.stringify({ name })
    });
    if (res && res.success) {
      await fetchCategories();
      return { success: true, subcategory: res.subcategory };
    }
    return { success: false, message: res ? res.message : "Failed to add subcategory" };
  };

  const deleteInventorySubcategory = async (categoryId, name) => {
    const res = await apiFetch(`/categories/${categoryId}/subcategories/${name}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      addBackupItem("inventorySubcategory", { categoryId, name });
      await fetchCategories();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete subcategory" };
  };

  const addMaintenanceCategory = async (name, icon) => {
    const res = await apiFetch("/maintenance/categories", {
      method: "POST",
      body: JSON.stringify({ name, icon })
    });
    if (res && res.success) {
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to add maintenance category" };
  };

  const deleteMaintenanceCategory = async (id) => {
    const catObj = maintenanceCategories.find(c => c.id === id);
    const res = await apiFetch(`/maintenance/categories/${id}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      if (catObj) {
        const logs = maintenanceLogs.filter(ro => ro.category === id);
        addBackupItem("maintenanceCategory", { category: catObj, logs });
      }
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete maintenance category" };
  };

  const addMaintenanceSubcategory = async (category, name, location, initialPrice, installDate) => {
    const res = await apiFetch("/maintenance/units", {
      method: "POST",
      body: JSON.stringify({ category, name, location, initialPrice, installDate })
    });
    if (res && res.success) {
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to add maintenance unit" };
  };

  const deleteMaintenanceSubcategory = async (itemId) => {
    const unitObj = maintenanceLogs.find(ro => ro.id === itemId);
    const res = await apiFetch(`/maintenance/units/${itemId}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      if (unitObj) {
        addBackupItem("maintenanceSubcategory", unitObj);
      }
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete maintenance unit" };
  };

  const addMaintenanceLog = async (roId, log) => {
    const res = await apiFetch(`/maintenance/units/${roId}/logs`, {
      method: "POST",
      body: JSON.stringify(log)
    });
    if (res && res.success) {
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to add maintenance log" };
  };

  const updateMaintenanceLog = async (roId, logId, updatedLog) => {
    const res = await apiFetch(`/maintenance/units/${roId}/logs/${logId}`, {
      method: "PUT",
      body: JSON.stringify(updatedLog)
    });
    if (res && res.success) {
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update maintenance log" };
  };

  const deleteMaintenanceLog = async (roId, logId) => {
    const unit = maintenanceLogs.find(ro => ro.id === roId);
    const logObj = unit?.history?.find(h => h.id === logId);
    const res = await apiFetch(`/maintenance/units/${roId}/logs/${logId}`, {
      method: "DELETE"
    });
    if (res && res.success) {
      if (logObj) {
        addBackupItem("maintenanceLog", { roId, log: logObj });
      }
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete maintenance log" };
  };

  const updateMaintenanceUnitStatus = async (roId, status) => {
    const res = await apiFetch(`/maintenance/units/${roId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    if (res && res.success) {
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update status" };
  };

  const updateMaintenanceUnitDetails = async (roId, details) => {
    const res = await apiFetch(`/maintenance/units/${roId}`, {
      method: "PUT",
      body: JSON.stringify(details)
    });
    if (res && res.success) {
      await fetchMaintenance();
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to update unit details" };
  };

  // Backup & Restore Operations
  const restoreBackupItem = async (backupId) => {
    const backupItem = backup.find(b => b.id === backupId);
    if (!backupItem) return { success: false, message: "Backup item not found!" };

    const { type, data } = backupItem;

    try {
      if (type === "user") {
        const exists = usersList.some(u => u.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
          return { success: false, message: `A user with email ${data.email} already exists!` };
        }
        const payload = {
          name: data.name,
          email: data.email,
          password: data.password || "admin",
          role: data.role,
          status: data.status || "Active",
          permissions: data.permissions || [],
          phone: data.phone || "",
          photo: data.photo || ""
        };
        const res = await addUser(payload);
        if (!res.success) return { success: false, message: res.message || "Failed to restore user" };
      } 
      else if (type === "inventoryCategory") {
        const exists = inventoryCategories.some(c => c.name.toLowerCase() === data.category.name.toLowerCase());
        let cat = null;
        if (!exists) {
          const res = await addInventoryCategory({
            name: data.category.name,
            icon: data.category.icon,
            desc: data.category.desc,
            color: data.category.color
          });
          if (!res.success) return { success: false, message: res.message || "Failed to restore category" };
          cat = res.category;
        } else {
          cat = inventoryCategories.find(c => c.name.toLowerCase() === data.category.name.toLowerCase());
        }
        
        if (cat && data.subcategories && data.subcategories.length > 0) {
          for (const sub of data.subcategories) {
            const subExists = inventorySubcategories.some(s => s.categoryId === cat.id && s.name.toLowerCase() === sub.name.toLowerCase());
            if (!subExists) {
              await addInventorySubcategory(cat.id, sub.name);
            }
          }
        }
      } 
      else if (type === "inventorySubcategory") {
        const res = await addInventorySubcategory(data.categoryId, data.name);
        if (!res.success) return { success: false, message: res.message || "Failed to restore subcategory" };
      } 
      else if (type === "maintenanceCategory") {
        const exists = maintenanceCategories.some(c => c.name.toLowerCase() === data.category.name.toLowerCase());
        let cat = null;
        if (!exists) {
          const res = await addMaintenanceCategory(data.category.name, data.category.icon);
          if (!res.success) return { success: false, message: res.message || "Failed to restore category" };
          const updatedCategoriesRes = await apiFetch("/maintenance");
          if (updatedCategoriesRes && updatedCategoriesRes.success && updatedCategoriesRes.categories) {
            cat = updatedCategoriesRes.categories.find(c => c.name.toLowerCase() === data.category.name.toLowerCase());
          }
        } else {
          cat = maintenanceCategories.find(c => c.name.toLowerCase() === data.category.name.toLowerCase());
        }

        if (cat && data.logs && data.logs.length > 0) {
          for (const log of data.logs) {
            const logExists = maintenanceLogs.some(p => p.name.toLowerCase() === log.name.toLowerCase() && p.category === cat.id);
            if (!logExists) {
              await addMaintenanceSubcategory(cat.id, log.name, log.location, log.initialPrice, log.installDate);
            }
          }
        }
      } 
      else if (type === "maintenanceSubcategory") {
        const exists = maintenanceLogs.some(ro => ro.name.toLowerCase() === data.name.toLowerCase() && ro.category === data.category);
        if (!exists) {
          const res = await addMaintenanceSubcategory(data.category, data.name, data.location, data.initialPrice, data.installDate);
          if (!res.success) return { success: false, message: res.message || "Failed to restore unit" };
        }
      } 
      else if (type === "maintenanceLog") {
        const parentUnit = maintenanceLogs.find(ro => ro.id === data.roId);
        if (!parentUnit) {
          return { success: false, message: "Associated asset unit does not exist. Please restore the unit first." };
        }
        const res = await addMaintenanceLog(parentUnit.id, {
          partRepaired: data.log.partRepaired,
          quantity: data.log.quantity,
          pricePerQty: data.log.pricePerQty,
          date: data.log.date,
          technician: data.log.technician,
          notes: data.log.notes
        });
        if (!res.success) return { success: false, message: res.message || "Failed to restore maintenance log" };
      }

      setBackup(prev => {
        const updated = prev.filter(b => b.id !== backupId);
        localStorage.setItem("rjit_backup", JSON.stringify(updated));
        return updated;
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false, message: e.message || "An error occurred during restoration" };
    }
  };

  const permanentlyDeleteBackupItem = (backupId) => {
    setBackup(prev => {
      const updated = prev.filter(b => b.id !== backupId);
      localStorage.setItem("rjit_backup", JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  const restoreAllBackup = async () => {
    if (backup.length === 0) return { success: true, count: 0 };
    
    const order = {
      "user": 1,
      "inventoryCategory": 1,
      "maintenanceCategory": 1,
      "inventorySubcategory": 2,
      "maintenanceSubcategory": 2,
      "maintenanceLog": 3
    };
    
    const sorted = [...backup].sort((a, b) => (order[a.type] || 99) - (order[b.type] || 99));
    let count = 0;

    for (const item of sorted) {
      const res = await restoreBackupItem(item.id);
      if (res && res.success) {
        count++;
      }
    }

    return { success: true, count };
  };

  const permanentlyDeleteAllBackup = () => {
    setBackup([]);
    localStorage.setItem("rjit_backup", JSON.stringify([]));
    return { success: true };
  };

  // Spelling & register category helpers
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
    let normalized = categoryName.toLowerCase().trim();
    if (normalized === "sanitary") normalized = "sanitory";
    if (normalized === "stationery") normalized = "stationary";
    if (normalized === "equipment") normalized = "laboratory";

    const reg = (inventoryCategories || []).find(c => {
      if (c.name.toLowerCase() === normalized) return true;
      const allowed = getCategoriesForRegister(c.name);
      return allowed.some(a => a.toLowerCase() === normalized);
    });
    return reg ? reg.name : (normalized === "sanitory" ? "Sanitory" : normalized === "stationary" ? "Stationary" : categoryName);
  }, [inventoryCategories, getCategoriesForRegister]);

  return (
    <StoreContext.Provider
      value={{
        inventory,
        issuedStock,
        orders,
        issueStockItem,
        placeOrderItem,
        receiveOrderItem,
        updateOrderDeliverySlip,
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
        legacyInventory,
        sanitaryInventory,
        electricalInventory,
        fetchLegacyInventory,
        fetchSanitaryInventory,
        fetchElectricalInventory,
        adjustStock
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
