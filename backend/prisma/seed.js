import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ROLE_DEFAULT_PERMISSIONS = {
  "Admin": ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings", "Maintenance"],
  "Store Manager": ["Dashboard", "Inventory", "Receive Order", "Issue Stock", "Reports", "Notifications", "Maintenance"],
  "Purchase Officer": ["Dashboard", "Place Order", "Receive Order", "Reports", "Notifications"],
  "Principal": ["Dashboard", "Analytics", "Reports", "Maintenance"],
  "Account Office": ["Dashboard", "Reports", "Notifications"]
};

async function main() {
  await prisma.approvalStep.deleteMany();
  await prisma.order.deleteMany();
  await prisma.issueLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.systemSettings.deleteMany();
  await prisma.approvalSequence.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.maintenanceHistory.deleteMany();
  await prisma.maintenanceUnit.deleteMany();
  await prisma.maintenanceCategory.deleteMany();
  await prisma.inventorySubcategory.deleteMany();
  await prisma.inventoryCategory.deleteMany();

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

  // 6. Seed Inventory Categories
  const categoriesToSeed = [
    { id: "stationary", name: "Stationary", icon: "FaPen", desc: "Admin stationery, files, registers, folders, writing assets and stock registers.", color: "from-blue-600 to-indigo-750" },
    { id: "sanitory", name: "Sanitory", icon: "FaBroom", desc: "Sanitation items, cleaning supplies, soaps, brushes, and hygiene products.", color: "from-teal-500 to-emerald-600" },
    { id: "electrical", name: "Electrical", icon: "FaBolt", desc: "Electrical bulbs, tube lights, wires, sockets, and switchboards.", color: "from-amber-500 to-orange-600" },
    { id: "electronics", name: "Electronics", icon: "FaDesktop", desc: "Desktop computers, monitors, printers, scanners, and UPS units.", color: "from-sky-500 to-blue-600" },
    { id: "sports", name: "Sports", icon: "FaRunning", desc: "Sports kits, athletics gear, fitness assets, and court equipment.", color: "from-rose-500 to-pink-600" },
    { id: "furniture", name: "Furniture", icon: "FaChair", desc: "Beds, wardrobes, tables, office chairs, desks, and cupboards.", color: "from-yellow-600 to-amber-700" },
    { id: "it_cse", name: "IT,CSE", icon: "FaDesktop", desc: "Servers, routers, access points, coding lab components and systems.", color: "from-indigo-500 to-purple-650" },
    { id: "laboratory", name: "laboratory", icon: "FaFlask", desc: "Glassware, scientific machinery, chemicals and compound microscopes.", color: "from-violet-500 to-fuchsia-600" }
  ];

  await prisma.inventoryCategory.createMany({ data: categoriesToSeed });
  console.log("Seeded inventory categories.");

  // 7. Seed Inventory Subcategories
  const subcategoriesToSeed = [
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

  await prisma.inventorySubcategory.createMany({ data: subcategoriesToSeed });
  console.log("Seeded inventory subcategories.");

  // 8. Seed Maintenance Categories
  const maintCategoriesToSeed = [
    { id: "RO", name: "RO (Water Purifiers)", icon: "FaTint" },
    { id: "AC", name: "Air Conditioners", icon: "FaWrench" },
    { id: "DG", name: "Diesel Generators", icon: "FaTools" }
  ];

  await prisma.maintenanceCategory.createMany({ data: maintCategoriesToSeed });
  console.log("Seeded maintenance categories.");

  // 9. Seed Maintenance Units & Logs
  const unitsToSeed = [
    {
      id: "ro-1",
      name: "CV RAMAN RO",
      category: "RO",
      location: "C.V. Raman Hostel",
      initialPrice: 15000,
      installDate: "2025-01-10",
      status: "Active"
    },
    {
      id: "ro-2",
      name: "ABDUL KALAM RO",
      category: "RO",
      location: "Abdul Kalam Block",
      initialPrice: 16500,
      installDate: "2025-02-15",
      status: "Active"
    },
    {
      id: "ro-3",
      name: "KALPANA CHAWLA RO",
      category: "RO",
      location: "Kalpana Chawla Hostel",
      initialPrice: 15000,
      installDate: "2025-01-20",
      status: "Active"
    },
    {
      id: "ro-4",
      name: "RO NEAR CIVIL LAB",
      category: "RO",
      location: "Civil Engineering Lab Block",
      initialPrice: 18000,
      installDate: "2024-11-05",
      status: "Active"
    },
    {
      id: "ro-5",
      name: "1ST FLOOR RO",
      category: "RO",
      location: "Main Building - 1st Floor",
      initialPrice: 14500,
      installDate: "2025-03-01",
      status: "Active"
    },
    {
      id: "ro-6",
      name: "2ND FLOOR RO",
      category: "RO",
      location: "Main Building - 2nd Floor",
      initialPrice: 14500,
      installDate: "2025-03-01",
      status: "Active"
    },
    {
      id: "ro-7",
      name: "RO INFRONT OF WORKSHOP",
      category: "RO",
      location: "Mechanical Workshop Gate",
      initialPrice: 20000,
      installDate: "2024-08-20",
      status: "Active"
    },
    {
      id: "ro-8",
      name: "LIBRARY RO",
      category: "RO",
      location: "Central Library Ground Floor",
      initialPrice: 15500,
      installDate: "2024-12-10",
      status: "Active"
    }
  ];

  for (const unit of unitsToSeed) {
    await prisma.maintenanceUnit.create({ data: unit });
  }

  const logsToSeed = [
    { id: "h-1-1", unitId: "ro-1", partRepaired: "Membrane Filter", quantity: 1, pricePerQty: 1500, totalAmount: 1500, date: "2025-08-12", technician: "Rakesh Verma", notes: "Routine membrane replacement" },
    { id: "h-1-2", unitId: "ro-1", partRepaired: "Pre-Filter Spun", quantity: 2, pricePerQty: 250, totalAmount: 500, date: "2026-03-10", technician: "Amit Sharma", notes: "Replaced dirty filter cartridges" },
    { id: "h-2-1", unitId: "ro-2", partRepaired: "Booster Pump 75 GPD", quantity: 1, pricePerQty: 2200, totalAmount: 2200, date: "2025-11-20", technician: "Rajesh Kumar", notes: "Pump pressure was low" },
    { id: "h-2-2", unitId: "ro-2", partRepaired: "Activated Carbon Filter", quantity: 1, pricePerQty: 450, totalAmount: 450, date: "2026-04-05", technician: "Rajesh Kumar", notes: "Scheduled maintenance" },
    { id: "h-3-1", unitId: "ro-3", partRepaired: "SMPS Power Adapter", quantity: 1, pricePerQty: 800, totalAmount: 800, date: "2025-09-05", technician: "Vijay Singh", notes: "Adapter burned due to voltage fluctuation" },
    { id: "h-4-1", unitId: "ro-4", partRepaired: "UV Lamp", quantity: 1, pricePerQty: 650, totalAmount: 650, date: "2025-06-12", technician: "Amit Sharma", notes: "Choke and lamp replacement" },
    { id: "h-4-2", unitId: "ro-4", partRepaired: "Sediment Filter", quantity: 2, pricePerQty: 300, totalAmount: 600, date: "2025-12-18", technician: "Suresh Pal", notes: "Annual filter replacement" },
    { id: "h-5-1", unitId: "ro-5", partRepaired: "Solenoid Valve", quantity: 1, pricePerQty: 400, totalAmount: 400, date: "2025-10-14", technician: "Vijay Singh", notes: "Water leakage issue resolved" },
    { id: "h-6-1", unitId: "ro-6", partRepaired: "FR (Flow Restrictor)", quantity: 1, pricePerQty: 150, totalAmount: 150, date: "2025-10-15", technician: "Vijay Singh", notes: "Replaced flow restrictor" },
    { id: "h-7-1", unitId: "ro-7", partRepaired: "RO Membrane & Carbon Filter", quantity: 1, pricePerQty: 2100, totalAmount: 2100, date: "2025-05-22", technician: "Rakesh Verma", notes: "Complete filter service" },
    { id: "h-7-2", unitId: "ro-7", partRepaired: "Pre-Filter Spun", quantity: 3, pricePerQty: 250, totalAmount: 750, date: "2026-01-10", technician: "Amit Sharma", notes: "Workshop dust caused fast clogging" },
    { id: "h-8-1", unitId: "ro-8", partRepaired: "TDS Controller Valve", quantity: 1, pricePerQty: 350, totalAmount: 350, date: "2025-07-08", technician: "Suresh Pal", notes: "Adjusted TDS level to 120" }
  ];

  await prisma.maintenanceHistory.createMany({ data: logsToSeed });
  console.log("Seeded maintenance history logs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
