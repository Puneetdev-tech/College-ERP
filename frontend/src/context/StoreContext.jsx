import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports"],
  "Account Office": ["Dashboard", "Reports", "Notifications"]
};

const API_URL = "http://localhost:5000/api";

export function StoreProvider({ children }) {
  const [usersList, setUsersList] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("rjit_currentUser");
    return saved ? JSON.parse(saved) : null;
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

  // Inventory Operations
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

  // Issue Operations
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
      // Just load settings for logo/name
      apiFetch("/settings").then((res) => {
        if (res && res.success && res.settings) {
          setSystemSettings(res.settings);
        }
      });
    }
  }, []);

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
        addNotification,
        refreshAllData // Expose refresh helper
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
