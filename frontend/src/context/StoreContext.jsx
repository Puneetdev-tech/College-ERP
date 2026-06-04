import { createContext, useContext, useState } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // Initial inventory items
  const [inventory, setInventory] = useState([
    { id: 1, item: "Desktop Computer", category: "Electronics", subcategory: "Computer", type: "i5 16GB", stock: 25, price: 45000, status: "Good" },
    { id: 2, item: "Laser Printer", category: "Electronics", subcategory: "Printer", type: "LaserJet", stock: 4, price: 12000, status: "Low" },
    { id: 3, item: "Office Chair", category: "Furniture", subcategory: "Chair", type: "Ergonomic Mesh", stock: 18, price: 3500, status: "Good" },
    { id: 4, item: "Football", category: "Sports", subcategory: "Balls", type: "Leather size 5", stock: 10, price: 800, status: "Good" },
    { id: 5, item: "Microscope", category: "Equipment", subcategory: "Lab Equipment", type: "Compound 1000x", stock: 15, price: 10000, status: "Good" },
    { id: 6, item: "A4 Sheets", category: "Stationery", subcategory: "Paper", type: "80GSM White", stock: 350, price: 200, status: "Good" },
    { id: 7, item: "Markers", category: "Stationery", subcategory: "Writing", type: "Whiteboard Blue", stock: 120, price: 50, status: "Good" },
    { id: 8, item: "100 Page Register", category: "Stationery", subcategory: "Register", type: "100 Page", stock: 85, price: 60, status: "Good" },
    { id: 9, item: "200 Page Register", category: "Stationery", subcategory: "Register", type: "200 Page", stock: 40, price: 100, status: "Good" },
    { id: 10, item: "Study Desk", category: "Furniture", subcategory: "Desk", type: "Study Desk", stock: 30, price: 5000, status: "Good" },
    { id: 11, item: "Bed (Iron Frame)", category: "Furniture", subcategory: "Bed", type: "Iron Frame Bed", stock: 50, price: 5000, status: "Good" },
    { id: 12, item: "Reading Chair", category: "Furniture", subcategory: "Chair", type: "Reading Chair", stock: 80, price: 1500, status: "Good" },
    { id: 13, item: "Executive Desk", category: "Furniture", subcategory: "Desk", type: "Executive Desk", stock: 15, price: 7000, status: "Good" },
    { id: 14, item: "Wi-Fi Router", category: "Electronics", subcategory: "Router", type: "Dual Band Wi-Fi", stock: 5, price: 3000, status: "Good" },
    { id: 15, item: "Barcode Scanner", category: "Electronics", subcategory: "Barcode Scanner", type: "Laser Scanner", stock: 3, price: 3000, status: "Good" }
  ]);

  // Initial issued stock log
  const [issuedStock, setIssuedStock] = useState([
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
  ]);

  // Initial placed & received orders log
  const [orders, setOrders] = useState([
    {
      id: "PO001",
      supplier: "HP Technologies",
      item: "Desktop Computer",
      category: "Electronics",
      subcategory: "Computer",
      type: "i5 16GB",
      quantity: 20,
      status: "Pending",
      orderDate: "2026-06-02"
    },
    {
      id: "PO002",
      supplier: "Dell India",
      item: "Laser Printer",
      category: "Electronics",
      subcategory: "Printer",
      type: "LaserJet",
      quantity: 10,
      status: "Approved",
      orderDate: "2026-06-03"
    }
  ]);

  // Helper action: Issue Stock
  const issueStockItem = (details) => {
    // 1. Look up matching item in inventory (case-insensitive check for type)
    const matchingItemIndex = inventory.findIndex(
      (item) =>
        item.category.toLowerCase() === details.category.toLowerCase() &&
        item.subcategory.toLowerCase() === details.subcategory.toLowerCase() &&
        item.type.toLowerCase() === details.type.toLowerCase()
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
      status: updatedStock <= 4 ? "Low" : updatedStock <= 15 ? "Medium" : "Good"
    };

    setInventory(updatedInventory);

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

    setIssuedStock([newIssue, ...issuedStock]);
    return { success: true };
  };

  // Helper action: Place Purchase Order
  const placeOrderItem = (details) => {
    const newOrder = {
      id: `PO00${orders.length + 1}`,
      supplier: details.supplier,
      item: details.item,
      category: details.category,
      subcategory: details.subcategory,
      type: details.type,
      quantity: details.quantity,
      status: "Pending",
      orderDate: details.orderDate
    };
    setOrders([newOrder, ...orders]);
    return { success: true };
  };

  // Helper action: Receive Order (Update status & increase stock count)
  const receiveOrderItem = (orderId) => {
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: "Order not found!" };

    const order = orders[orderIndex];
    if (order.status === "Approved") {
      // 1. Mark order as Approved/Received
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = { ...order, status: "Received" };
      setOrders(updatedOrders);

      // 2. Increase inventory stock
      const itemIndex = inventory.findIndex(
        (item) =>
          item.category.toLowerCase() === order.category.toLowerCase() &&
          item.subcategory.toLowerCase() === order.subcategory.toLowerCase() &&
          item.type.toLowerCase() === order.type.toLowerCase()
      );

      if (itemIndex !== -1) {
        const updatedInventory = [...inventory];
        const updatedStock = updatedInventory[itemIndex].stock + order.quantity;
        updatedInventory[itemIndex] = {
          ...updatedInventory[itemIndex],
          stock: updatedStock,
          status: updatedStock <= 4 ? "Low" : updatedStock <= 15 ? "Medium" : "Good"
        };
        setInventory(updatedInventory);
      } else {
        // Create new item in inventory if not present
        const newItem = {
          id: inventory.length + 1,
          item: order.item,
          category: order.category,
          subcategory: order.subcategory,
          type: order.type,
          stock: order.quantity,
          price: 1000, // Default mock unit price
          status: "Good"
        };
        setInventory([...inventory, newItem]);
      }
      return { success: true };
    }
    return { success: false, message: "Order cannot be received!" };
  };

  return (
    <StoreContext.Provider
      value={{
        inventory,
        issuedStock,
        orders,
        issueStockItem,
        placeOrderItem,
        receiveOrderItem
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  return useContext(StoreContext);
}
