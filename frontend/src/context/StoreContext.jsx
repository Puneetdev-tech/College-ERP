import { createContext, useContext, useState, useEffect } from "react";

const StoreContext = createContext();

export const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports"],
  "Account Office": ["Dashboard", "Reports", "Notifications"]
};

const DEFAULT_USERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@rjit.edu.in",
    password: "admin",
    role: "Admin",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Admin"],
    photo: ""
  },
  {
    id: 2,
    name: "Priya Singh",
    email: "priya@rjit.edu.in",
    password: "manager",
    role: "Store Manager",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Store Manager"],
    photo: ""
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@rjit.edu.in",
    password: "officer",
    role: "Purchase Officer",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Purchase Officer"],
    photo: ""
  },
  {
    id: 4,
    name: "Dr. Roy",
    email: "principal@rjit.edu.in",
    password: "principal",
    role: "Principal",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Principal"],
    photo: ""
  },
  {
    id: 5,
    name: "Sanjay Mehta",
    email: "accounts@rjit.edu.in",
    password: "accounts",
    role: "Account Office",
    status: "Active",
    permissions: ROLE_DEFAULT_PERMISSIONS["Account Office"],
    photo: ""
  }
];

export function StoreProvider({ children }) {
  // User management states
  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem("rjit_users");
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("rjit_currentUser");
    return saved ? JSON.parse(saved) : null;
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
        email: "info@rjit.edu.in",
        website: "www.rjit.edu.in"
      }
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.collegeInfo) parsed.collegeInfo = defaultSettings.collegeInfo;
        if (!parsed.collegeInfo.logo) parsed.collegeInfo.logo = "/rjit_logo.png";
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
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sort newest first (by createdAt if available, else by id desc)
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
      { id: 6, item: "A4 Sheets", category: "Stationery", subcategory: "Paper", type: "80GSM White", stock: 350, price: 200, status: "Good", createdAt: "2026-06-01 09:25:00" },
      { id: 7, item: "Markers", category: "Stationery", subcategory: "Writing", type: "Whiteboard Blue", stock: 120, price: 50, status: "Good", createdAt: "2026-06-01 09:30:00" },
      { id: 8, item: "100 Page Register", category: "Stationery", subcategory: "Register", type: "100 Page", stock: 85, price: 60, status: "Good", createdAt: "2026-06-01 09:35:00" },
      { id: 9, item: "200 Page Register", category: "Stationery", subcategory: "Register", type: "200 Page", stock: 40, price: 100, status: "Good", createdAt: "2026-06-01 09:40:00" },
      { id: 10, item: "Study Desk", category: "Furniture", subcategory: "Desk", type: "Study Desk", stock: 30, price: 5000, status: "Good", createdAt: "2026-06-01 09:45:00" },
      { id: 11, item: "Bed (Iron Frame)", category: "Furniture", subcategory: "Bed", type: "Iron Frame Bed", stock: 50, price: 5000, status: "Good", createdAt: "2026-06-01 09:50:00" },
      { id: 12, item: "Reading Chair", category: "Furniture", subcategory: "Chair", type: "Reading Chair", stock: 80, price: 1500, status: "Good", createdAt: "2026-06-01 09:55:00" },
      { id: 13, item: "Executive Desk", category: "Furniture", subcategory: "Desk", type: "Executive Desk", stock: 15, price: 7000, status: "Good", createdAt: "2026-06-01 10:00:00" },
      { id: 14, item: "Wi-Fi Router", category: "Electronics", subcategory: "Router", type: "Dual Band Wi-Fi", stock: 5, price: 3000, status: "Good", createdAt: "2026-06-01 10:05:00" },
      { id: 15, item: "Barcode Scanner", category: "Electronics", subcategory: "Barcode Scanner", type: "Laser Scanner", stock: 3, price: 3000, status: "Good", createdAt: "2026-06-01 10:10:00" }
    ];
  });

  // Initial issued stock log
  const [issuedStock, setIssuedStock] = useState(() => {
    const saved = localStorage.getItem("rjit_issuedStock");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        item: "Desktop Computer",
        category: "Electronics",
        subcategory: "Computer",
        type: "i5 16GB",
        department: "IT Department",
        faculty: "Mr. Sharma",
        quantity: 5,
        date: "2026-06-01 10:30 AM"
      },
      {
        id: 2,
        item: "Projector",
        category: "Electronics",
        subcategory: "Projector",
        type: "Full HD 4K",
        department: "Laboratory",
        faculty: "Dr. Singh",
        quantity: 2,
        date: "2026-06-03 02:15 PM"
      }
    ];
  });

  // Approval sequence (list of user IDs in sequence)
  const [approvalSequence, setApprovalSequence] = useState(() => {
    const saved = localStorage.getItem("rjit_approvalSequence");
    return saved ? JSON.parse(saved) : [5, 4]; // Accounts Office then Principal by default
  });

  const updateApprovalSequence = (newSeq) => {
    setApprovalSequence(newSeq);
    localStorage.setItem("rjit_approvalSequence", JSON.stringify(newSeq));
  };

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("rjit_notifications");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        type: "Low Stock",
        message: "A4 Sheets stock below minimum level",
        time: "10 minutes ago",
        read: false,
        color: "bg-red-100 text-red-800",
        iconType: "low-stock"
      },
      {
        id: 2,
        type: "Stock Received",
        message: "20 Desktop Computers received",
        time: "1 hour ago",
        read: false,
        color: "bg-green-100 text-green-800",
        iconType: "received"
      },
      {
        id: 3,
        type: "Stock Issued",
        message: "5 Projectors issued to Laboratory",
        time: "3 hours ago",
        read: false,
        color: "bg-blue-100 text-blue-800",
        iconType: "issued"
      },
      {
        id: 4,
        type: "Purchase Order",
        message: "New Purchase Order PO001 created",
        time: "Yesterday",
        read: false,
        color: "bg-yellow-100 text-yellow-800",
        iconType: "order"
      }
    ];
  });

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("rjit_notifications", JSON.stringify(updated));
  };

  const addNotification = (type, message, iconType, color) => {
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
  };

  // Initial placed & received orders log
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("rjit_orders");
    if (saved) return JSON.parse(saved);

    // Initial default orders matching the default sequence [5, 4]
    return [
      {
        id: "PO001",
        supplier: "HP Technologies",
        item: "Desktop Computer",
        category: "Electronics",
        subcategory: "Computer",
        type: "i5 16GB",
        quantity: 20,
        pricePerUnit: 45000,
        status: "Pending",
        orderDate: "2026-06-02 10:00 AM",
        department: "IT Department",
        faculty: "Mr. Sharma",
        placedBy: "Mr. Sharma",
        approvalChain: [
          { userId: 5, name: "Sanjay Mehta", role: "Account Office", status: "Pending", approvedAt: null },
          { userId: 4, name: "Dr. Roy", role: "Principal", status: "Pending", approvedAt: null }
        ]
      },
      {
        id: "PO002",
        supplier: "Dell India",
        item: "Laser Printer",
        category: "Electronics",
        subcategory: "Printer",
        type: "LaserJet",
        quantity: 10,
        pricePerUnit: 12000,
        status: "Approved",
        orderDate: "2026-06-03 02:30 PM",
        department: "Laboratory",
        faculty: "Dr. Singh",
        placedBy: "Dr. Singh",
        approvalChain: [
          { userId: 5, name: "Sanjay Mehta", role: "Account Office", status: "Approved", approvedAt: "2026-06-03 03:00 PM" },
          { userId: 4, name: "Dr. Roy", role: "Principal", status: "Approved", approvedAt: "2026-06-03 04:30 PM" }
        ]
      }
    ];
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
  const receiveOrderItem = (orderId, receiveDate) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: "Order not found!" };

    const order = orders[orderIndex];
    if (order.status === "Approved" || order.status === "Pending" || order.status === "Received") {
      // 1. Mark order as Received
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = { ...order, status: "Received", receiveDate: receiveDate };
      setOrders(updatedOrders);
      localStorage.setItem("rjit_orders", JSON.stringify(updatedOrders));

      // 2. Increase inventory stock
      const itemIndex = inventory.findIndex(
        (item) =>
          (item.category || "").toLowerCase() === (order.category || "").toLowerCase() &&
          (item.subcategory || "").toLowerCase() === (order.subcategory || "").toLowerCase() &&
          (item.type || "").toLowerCase() === (order.type || "").toLowerCase()
      );

      let updatedInventory;
      const nowStr = getNowString();
      if (itemIndex !== -1) {
        updatedInventory = [...inventory];
        const updatedStock = updatedInventory[itemIndex].stock + order.quantity;
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
          item: order.item,
          category: order.category,
          subcategory: order.subcategory,
          type: order.type,
          stock: order.quantity,
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
        `${order.quantity} units of ${order.item} (${order.type}) received for ${order.department} - Total Value: ₹${(order.quantity * (order.pricePerUnit || 1000)).toLocaleString()}`,
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
    const existingIndex = inventory.findIndex(
      (item) =>
        (item.category || "").toLowerCase() === (itemDetails.category || "").toLowerCase() &&
        (item.subcategory || "").toLowerCase() === (itemDetails.subcategory || "").toLowerCase() &&
        (item.type || "").toLowerCase() === (itemDetails.type || "").toLowerCase()
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
