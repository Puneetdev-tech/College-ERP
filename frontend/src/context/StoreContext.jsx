import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings", "Maintenance"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications", "Maintenance"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports", "Maintenance"],
  "Account Office": ["Dashboard", "Reports", "Notifications"]
};

const API_URL = "http://localhost:5000/api";

export function StoreProvider({ children }) {
  // User management states
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem("rjit_users");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

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
      name: "RJ Institute of Technology",
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

      if (response.status === 401) {
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
      setSystemSettings(res.settings);
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
      // Store just the array of userIds for state compatibility if needed,
      // but let's keep it as is. In the frontend, approvalSequence is stored as:
      // array of user IDs: e.g. [5, 4]
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

  const refreshAllData = async () => {
    if (!localStorage.getItem("rjit_token")) return;
    await Promise.all([
      fetchSettings(),
      fetchUsers(),
      fetchInventory(),
      fetchIssues(),
      fetchOrders(),
      fetchApprovalSequence(),
      fetchNotifications()
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
      // If updating self, sync current user state
      if (currentUser && currentUser.id === id) {
        const updatedUser = { ...currentUser, ...updatedFields };
        // Delete password from stored user details
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
    const res = await apiFetch(`/users/${id}`, {
      method: "DELETE"
    });

    if (res && res.success) {
      await fetchUsers();
      if (currentUser && currentUser.id === id) {
        logout();
      }
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to delete user" };
  };

  // Initial inventory items (sorted newest first)
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("rjit_inventory");
    
    // Define the new default stationery items
    const newStationeryItems = [
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
      { id: 117, item: "File cover J-280", category: "Stationery", subcategory: "File cover J-280", type: "Plastic J-280", stock: 250, price: 22, status: "Good", createdAt: "2026-06-01 09:41:00" }
    ];

    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate if user has old stationery list (check by checking one unique new item)
      const hasNewItem = parsed.some(item => item.item === "File cover J-280");
      if (!hasNewItem) {
        const filtered = parsed.filter(item => item.category !== "Stationery");
        const migrated = [...filtered, ...newStationeryItems];
        localStorage.setItem("rjit_inventory", JSON.stringify(migrated));
        return migrated.sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
          return b.id - a.id;
        });
      }
      return [...parsed].sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
        return b.id - a.id;
      });
    }

    return [
      { id: 1, item: "Desktop Computer", category: "Electronics", subcategory: "Computer", type: "i5 16GB", stock: 25, price: 45000, status: "Good", createdAt: "2026-06-01 09:00:00" },
      { id: 2, item: "Laser Printer", category: "Electronics", subcategory: "Printer", type: "LaserJet", stock: 4, price: 12000, status: "Low", createdAt: "2026-06-01 09:05:00" },
      { id: 3, item: "Office Chair", category: "Furniture", subcategory: "Chair", type: "Ergonomic Mesh", stock: 18, price: 3500, status: "Good", createdAt: "2026-06-01 09:10:00" },
      { id: 4, item: "Football", category: "Sports", subcategory: "Balls", type: "Leather size 5", stock: 10, price: 800, status: "Good", createdAt: "2026-06-01 09:15:00" },
      { id: 5, item: "Microscope", category: "Equipment", subcategory: "Lab Equipment", type: "Compound 1000x", stock: 15, price: 10000, status: "Good", createdAt: "2026-06-01 09:20:00" },
      ...newStationeryItems,
      { id: 10, item: "Study Desk", category: "Furniture", subcategory: "Desk", type: "Study Desk", stock: 30, price: 5000, status: "Good", createdAt: "2026-06-01 09:45:00" },
      { id: 11, item: "Bed (Iron Frame)", category: "Furniture", subcategory: "Bed", type: "Iron Frame Bed", stock: 50, price: 5000, status: "Good", createdAt: "2026-06-01 09:50:00" },
      { id: 12, item: "Reading Chair", category: "Furniture", subcategory: "Chair", type: "Reading Chair", stock: 80, price: 1500, status: "Good", createdAt: "2026-06-01 09:55:00" },
      { id: 13, item: "Executive Desk", category: "Furniture", subcategory: "Desk", type: "Executive Desk", stock: 15, price: 7000, status: "Good", createdAt: "2026-06-01 10:00:00" },
      { id: 14, item: "Wi-Fi Router", category: "Electronics", subcategory: "Router", type: "Dual Band Wi-Fi", stock: 5, price: 3000, status: "Good", createdAt: "2026-06-01 10:05:00" },
      { id: 15, item: "Barcode Scanner", category: "Electronics", subcategory: "Barcode Scanner", type: "Laser Scanner", stock: 3, price: 3000, status: "Good", createdAt: "2026-06-01 10:10:00" }
    ];
  });

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

  const receiveOrderItem = async (orderId, receiveDate) => {
    const res = await apiFetch(`/orders/${orderId}/receive`, {
      method: "POST",
      body: JSON.stringify({ receiveDate })
    });

    if (res && res.success) {
      await Promise.all([fetchOrders(), fetchInventory(), fetchNotifications()]);
      return { success: true };
    }
    return { success: false, message: res ? res.message : "Failed to receive order" };
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
    const res = await apiFetch("/settings", {
      method: "PUT",
      body: JSON.stringify(newSettings)
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

  const addNotification = async (type, message, iconType, color) => {
    const res = await apiFetch("/notifications", {
      method: "POST",
      body: JSON.stringify({ type, message, iconType, color })
    });
    if (res && res.success) {
      await fetchNotifications();
    }
  };

  // Load initial settings on mount (even if not authenticated, e.g. for college logo/name on login page)
  useEffect(() => {
    // Check if token exists, if so do initial load
    const token = localStorage.getItem("rjit_token");
    if (token) {
      refreshAllData();
    } else {
      const newItem = {
        id: Date.now(),
        item: itemDetails.item,
        category: itemDetails.category,
        subcategory: itemDetails.subcategory,
        type: itemDetails.type || "Standard",
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
        addNotification
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
