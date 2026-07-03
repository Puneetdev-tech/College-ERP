import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function main() {
  console.log("Restoring maintenance units...");
  for (const unit of unitsToSeed) {
    await prisma.maintenanceUnit.upsert({
      where: { id: unit.id },
      update: unit,
      create: unit
    });
  }
  console.log(`Successfully restored/updated ${unitsToSeed.length} maintenance units.`);

  console.log("Restoring maintenance history logs...");
  for (const log of logsToSeed) {
    await prisma.maintenanceHistory.upsert({
      where: { id: log.id },
      update: log,
      create: log
    });
  }
  console.log(`Successfully restored/updated ${logsToSeed.length} maintenance history records.`);
}

main()
  .catch((e) => {
    console.error("Error during recovery:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
