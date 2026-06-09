import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports"],
  "Account Office": ["Dashboard", "Reports", "Notifications"]
};

async function main() {
  // Clear existing data (optional, but good for clean seed)
  await prisma.approvalStep.deleteMany();
  await prisma.order.deleteMany();
  await prisma.issueLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.approvalSequence.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();

  console.log("Deleted existing database records.");

  // 1. Seed Users
  const usersToSeed = [
    {
      name: "Rahul Sharma",
      email: "rahul@rjit.edu.in",
      password: "admin",
      role: "Admin",
      status: "Active",
      permissions: ROLE_DEFAULT_PERMISSIONS["Admin"]
    },
    {
      name: "Priya Singh",
      email: "priya@rjit.edu.in",
      password: "manager",
      role: "Store Manager",
      status: "Active",
      permissions: ROLE_DEFAULT_PERMISSIONS["Store Manager"]
    },
    {
      name: "Amit Verma",
      email: "amit@rjit.edu.in",
      password: "officer",
      role: "Purchase Officer",
      status: "Active",
      permissions: ROLE_DEFAULT_PERMISSIONS["Purchase Officer"]
    },
    {
      name: "Dr. Roy",
      email: "principal@rjit.edu.in",
      password: "principal",
      role: "Principal",
      status: "Active",
      permissions: ROLE_DEFAULT_PERMISSIONS["Principal"]
    },
    {
      name: "Sanjay Mehta",
      email: "accounts@rjit.edu.in",
      password: "accounts",
      role: "Account Office",
      status: "Active",
      permissions: ROLE_DEFAULT_PERMISSIONS["Account Office"]
    }
  ];

  const seededUsers = [];
  for (const u of usersToSeed) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        status: u.status,
        permissions: u.permissions,
        phone: "",
        photo: ""
      }
    });
    seededUsers.push(user);
    console.log(`Seeded user: ${user.email}`);
  }

  // 2. Seed System Settings
  await prisma.systemSettings.create({
    data: {
      id: 1,
      lowStockThreshold: 10,
      collegeName: "RJ Institute of Technology",
      collegeLogo: "/rjit_logo.png",
      collegeAddress: "123 Campus Lane, Okhla, New Delhi",
      collegePhone: "+91 11 2690 7400",
      collegeEmail: "info@rjit.edu.in",
      collegeWebsite: "www.rjit.edu.in"
    }
  });
  console.log("Seeded system settings.");

  // 3. Seed Approval Sequence
  // Map users Sanjay Mehta (Accounts, role in sequence position 1) and Dr. Roy (Principal, position 2)
  const sanjay = seededUsers.find(u => u.email === "accounts@rjit.edu.in");
  const roy = seededUsers.find(u => u.email === "principal@rjit.edu.in");

  if (sanjay && roy) {
    await prisma.approvalSequence.createMany({
      data: [
        { userId: sanjay.id, position: 1 },
        { userId: roy.id, position: 2 }
      ]
    });
    console.log("Seeded approval sequence (Sanjay Mehta -> Dr. Roy).");
  }

  // 4. Seed Inventory Items
  const stationeryItems = [
    { item: "A4 size paper Rim", category: "Stationery", subcategory: "A4 size paper Rim", type: "Rim", stock: 80, price: 221.99, status: "Good" },
    { item: "Add Gel pen", category: "Stationery", subcategory: "Add Gel pen", type: "Blue/Black", stock: 29, price: 45.50, status: "Good" },
    { item: "Add gel refill", category: "Stationery", subcategory: "Add gel refill", type: "0.5mm", stock: 20, price: 23.00, status: "Good" },
    { item: "Cell AAA", category: "Stationery", subcategory: "Cell AAA", type: "Alkaline", stock: 50, price: 16.80, status: "Good" },
    { item: "Cell AA", category: "Stationery", subcategory: "Cell AA", type: "Alkaline", stock: 50, price: 16.80, status: "Good" },
    { item: "Envelope small brown", category: "Stationery", subcategory: "Envelope small brown", type: "Brown paper", stock: 800, price: 1.003, status: "Good" },
    { item: "File flag", category: "Stationery", subcategory: "File flag", type: "Sticky", stock: 50, price: 11.0684, status: "Good" },
    { item: "Highlighter", category: "Stationery", subcategory: "Highlighter", type: "Neon Pack", stock: 19, price: 15.5996, status: "Good" },
    { item: "Liquid gum", category: "Stationery", subcategory: "Liquid gum", type: "50ml", stock: 20, price: 29.9956, status: "Good" },
    { item: "Notice board pin", category: "Stationery", subcategory: "Notice board pin", type: "Push pin", stock: 19, price: 16.8032, status: "Good" },
    { item: "Register 100 pages", category: "Stationery", subcategory: "Register 100 pages", type: "Standard", stock: 29, price: 84.9954, status: "Good" },
    { item: "Register 200 pages", category: "Stationery", subcategory: "Register 200 pages", type: "Standard", stock: 10, price: 139.9952, status: "Good" },
    { item: "Staff attendance register", category: "Stationery", subcategory: "Staff attendance register", type: "Ledger", stock: 7, price: 78.7178, status: "Low" },
    { item: "Student attendance register", category: "Stationery", subcategory: "Student attendance register", type: "Ledger", stock: 0, price: 150.00, status: "Low" },
    { item: "Use and throw pen", category: "Stationery", subcategory: "Use and throw pen", type: "Blue", stock: 177, price: 3.10, status: "Good" },
    { item: "White board marker", category: "Stationery", subcategory: "White board marker", type: "Black/Blue", stock: 20, price: 18.00, status: "Good" },
    { item: "Whitener pen", category: "Stationery", subcategory: "Whitener pen", type: "Correction Pen", stock: 20, price: 18.00, status: "Good" },
    { item: "File cover J-280", category: "Stationery", subcategory: "File cover J-280", type: "Plastic J-280", stock: 200, price: 9.20, status: "Good" }
  ];

  const otherItems = [
    { item: "Desktop Computer", category: "Electronics", subcategory: "Computer", type: "i5 16GB", stock: 25, price: 45000, status: "Good" },
    { item: "Laser Printer", category: "Electronics", subcategory: "Printer", type: "LaserJet", stock: 4, price: 12000, status: "Low" },
    { item: "Office Chair", category: "Furniture", subcategory: "Chair", type: "Ergonomic Mesh", stock: 18, price: 3500, status: "Good" },
    { item: "Football", category: "Sports", subcategory: "Balls", type: "Leather size 5", stock: 10, price: 800, status: "Good" },
    { item: "Microscope", category: "Equipment", subcategory: "Lab Equipment", type: "Compound 1000x", stock: 15, price: 10000, status: "Good" },
    { item: "Study Desk", category: "Furniture", subcategory: "Desk", type: "Study Desk", stock: 30, price: 5000, status: "Good" },
    { item: "Bed (Iron Frame)", category: "Furniture", subcategory: "Bed", type: "Iron Frame Bed", stock: 50, price: 5000, status: "Good" },
    { item: "Reading Chair", category: "Furniture", subcategory: "Chair", type: "Reading Chair", stock: 80, price: 1500, status: "Good" },
    { item: "Executive Desk", category: "Furniture", subcategory: "Desk", type: "Executive Desk", stock: 15, price: 7000, status: "Good" },
    { item: "Wi-Fi Router", category: "Electronics", subcategory: "Router", type: "Dual Band Wi-Fi", stock: 5, price: 3000, status: "Good" },
    { item: "Barcode Scanner", category: "Electronics", subcategory: "Barcode Scanner", type: "Laser Scanner", stock: 3, price: 3000, status: "Good" }
  ];

  const allItems = [...stationeryItems, ...otherItems];
  for (const item of allItems) {
    await prisma.inventoryItem.create({
      data: item
    });
  }
  console.log(`Seeded ${allItems.length} inventory items.`);

  // 5. Seed some initial notifications matching defaults
  await prisma.notification.createMany({
    data: [
      {
        type: "Low Stock",
        message: "A4 Sheets stock below minimum level",
        read: false,
        color: "bg-red-100 text-red-800",
        iconType: "low-stock"
      },
      {
        type: "Stock Received",
        message: "20 Desktop Computers received",
        read: false,
        color: "bg-green-100 text-green-800",
        iconType: "received"
      },
      {
        type: "Stock Issued",
        message: "5 Projectors issued to Laboratory",
        read: false,
        color: "bg-blue-100 text-blue-800",
        iconType: "issued"
      },
      {
        type: "Purchase Order",
        message: "New Purchase Order PO001 created",
        read: false,
        color: "bg-yellow-100 text-yellow-800",
        iconType: "order"
      }
    ]
  });
  console.log("Seeded default notifications.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
