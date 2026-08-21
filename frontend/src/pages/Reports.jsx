import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  FaFileExcel,
  FaBuilding,
  FaBoxes,
  FaCalendarAlt,
  FaChartBar,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaInfoCircle,
  FaPrint,
  FaFilePdf,
  FaChevronDown,
  FaChevronRight,
  FaTimes
} from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import ExcelJS from "exceljs";



export default function Reports() {
  const navigate = useNavigate();
  const { inventory, issuedStock, orders, systemSettings, inventoryCategories, getRegisterForCategory } = useStore();
  const collegeInfo = systemSettings?.collegeInfo;

  // Active Report Category: 'department', 'category', 'detail', 'summary', or null
  const [activeReportType, setActiveReportType] = useState(null);
  const [datePreset, setDatePreset] = useState("monthly");

  // State for Summary dashboard active tab and expandable department table
  const [activeSummaryTab, setActiveSummaryTab] = useState(null);
  const [expandedDepartment, setExpandedDepartment] = useState(null);

  // Configuration options
  const [selectedDepartment, setSelectedDepartment] = useState("IT,CSE");
  const [selectedCategory, setSelectedCategory] = useState("Electronics");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");

  // Dual report type checkboxes
  const [includeIssued, setIncludeIssued] = useState(true);
  const [includeOrdered, setIncludeOrdered] = useState(true);

  // Interaction feed alerts
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const getIssuedItemPrice = (log) => {
    const invItem = inventory.find(item => 
      (item.category || "").toLowerCase() === (log.category || "").toLowerCase() &&
      (item.subcategory || "").toLowerCase() === (log.subcategory || "").toLowerCase() &&
      (item.type || "").toLowerCase() === (log.type || "").toLowerCase()
    );
    return invItem ? invItem.price : 0;
  };

  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset === "custom") return;

    // Standard relative today: 2026-06-10 (from current local time metadata)
    const today = new Date("2026-06-10");
    let start = "";
    let end = "";

    if (preset === "weekly") {
      const day = today.getDay();
      const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diffToMonday));
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      start = monday.toISOString().split("T")[0];
      end = sunday.toISOString().split("T")[0];
    } else if (preset === "monthly") {
      const year = today.getFullYear();
      const month = today.getMonth();
      
      const mm = String(month + 1).padStart(2, "0");
      const lastDay = new Date(year, month + 1, 0).getDate();
      start = `${year}-${mm}-01`;
      end = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;
    } else if (preset === "yearly") {
      const year = today.getFullYear();
      start = `${year}-01-01`;
      end = `${year}-12-31`;
    }

    if (start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const triggerDownload = async (reportName, isBulk = false) => {
    if (!includeIssued && !includeOrdered) {
      setToastMessage("⚠ Please select at least one report type (Issued or Ordered).");
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    setLoading(true);
    let typeDesc = "";
    if (includeIssued && includeOrdered) typeDesc = "combined (Issued & Ordered)";
    else if (includeIssued) typeDesc = "Stock Issued";
    else typeDesc = "Items Ordered";

    setToastMessage(`Compiling ${isBulk ? "bulk" : "individual"} ${typeDesc} report for ${reportName}...`);

    try {
      // Get target data
      let targetIssued = filteredIssued;
      let targetOrders = filteredOrders;

      if (isBulk) {
        targetIssued = issuedStock.filter(log => isWithinRange(log.date));
        targetOrders = orders.filter(order => isWithinRange(order.orderDate));
      }

      const collegeName = collegeInfo?.name || "Rustamji Institute of Technology";
      const collegeAddress = collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi";
      const collegeDetails = `Phone: ${collegeInfo?.phone || "+91 11 2690 7400"} | Email: ${collegeInfo?.email || "info@rjit.edu.in"} | Web: ${collegeInfo?.website || "www.rjit.edu.in"}`;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Audit Report");

      // Enable gridlines
      worksheet.views = [{ showGridLines: true }];

      // Row 1: College Name
      const titleRow = worksheet.getRow(1);
      titleRow.getCell(1).value = collegeName;
      worksheet.mergeCells("A1:I1");
      titleRow.getCell(1).font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 9; c++) {
        titleRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
      }
      worksheet.getRow(1).height = 40;

      // Row 2: Address
      const addrRow = worksheet.getRow(2);
      addrRow.getCell(1).value = collegeAddress;
      worksheet.mergeCells("A2:I2");
      addrRow.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
      addrRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 9; c++) {
        addrRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      worksheet.getRow(2).height = 20;

      // Row 3: Contact Details
      const contactRow = worksheet.getRow(3);
      contactRow.getCell(1).value = collegeDetails;
      worksheet.mergeCells("A3:I3");
      contactRow.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
      contactRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 9; c++) {
        contactRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      worksheet.getRow(3).height = 20;

      // Row 4: Report Name
      const reportNameRow = worksheet.getRow(4);
      reportNameRow.getCell(1).value = `INSTITUTIONAL AUDIT REPORT - ${reportName.toUpperCase()}`;
      worksheet.mergeCells("A4:I4");
      reportNameRow.getCell(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF1E40AF" } };
      reportNameRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 9; c++) {
        reportNameRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
      }
      worksheet.getRow(4).height = 30;

      // Row 5: Metadata
      const metaRow = worksheet.getRow(5);
      metaRow.getCell(1).value = `Date Range: ${startDate} to ${endDate} | Generated on: ${new Date().toLocaleString()}`;
      worksheet.mergeCells("A5:I5");
      metaRow.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748B" } };
      metaRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(5).height = 20;

      let currentRow = 7;

      // Add Logo Image if exists in base64 format
      if (collegeInfo?.logo && collegeInfo.logo.startsWith("data:image/")) {
        try {
          const parts = collegeInfo.logo.split(",");
          const base64Data = parts[1];
          const match = parts[0].match(/data:image\/(\w+);base64/);
          const ext = match ? match[1] : "png";

          const imageId = workbook.addImage({
            base64: base64Data,
            extension: ext,
          });
          worksheet.addImage(imageId, {
            tl: { col: 0.1, row: 0.1 },
            ext: { width: 50, height: 50 }
          });
        } catch (imgErr) {
          console.warn("Could not embed logo in exceljs: ", imgErr);
        }
      }

      const borderStyle = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };

      const applyHeaderStyles = (rowNumber, columnCount) => {
        const headerRow = worksheet.getRow(rowNumber);
        headerRow.height = 28;
        for (let c = 1; c <= columnCount; c++) {
          const cell = headerRow.getCell(c);
          cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.border = borderStyle;
        }
      };

      // Section 1: Stock Disbursement
      if (includeIssued) {
        const bannerRow = worksheet.getRow(currentRow);
        bannerRow.getCell(1).value = "STOCK DISBURSEMENT LEDGER";
        worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
        bannerRow.height = 25;
        const bannerCell = bannerRow.getCell(1);
        bannerCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
        bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
        bannerCell.alignment = { vertical: "middle", horizontal: "left" };
        bannerCell.border = {
          top: { style: "medium", color: { argb: "FF94A3B8" } },
          bottom: { style: "medium", color: { argb: "FF94A3B8" } }
        };

        currentRow++;

        const headers = [
          "Item Details", "Type", "Category", "Department", 
          "Faculty", "Quantity", "Issue Date", "Price (INR)", "Total Cost (INR)"
        ];
        worksheet.getRow(currentRow).values = headers;
        applyHeaderStyles(currentRow, 9);
        currentRow++;

        targetIssued.forEach(log => {
          const qty = Number(log.quantity) || 0;
          const price = Number(getIssuedItemPrice(log)) || 0;
          const total = qty * price;
          const row = worksheet.getRow(currentRow);
          row.values = [
            log.item || "",
            log.type || "",
            log.category || "",
            log.department || "",
            log.faculty || "",
            qty,
            log.date || "",
            price,
            total
          ];
          row.height = 20;

          row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(3).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(4).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(5).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(6).alignment = { vertical: "middle", horizontal: "right" };
          row.getCell(6).numFmt = "#,##0";
          row.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(8).alignment = { vertical: "middle", horizontal: "right" };
          row.getCell(8).numFmt = '"₹"#,##0.00';
          row.getCell(9).alignment = { vertical: "middle", horizontal: "right" };
          row.getCell(9).numFmt = '"₹"#,##0.00';

          for (let c = 1; c <= 9; c++) {
            row.getCell(c).border = borderStyle;
            row.getCell(c).font = { name: "Calibri", size: 10 };
          }
          currentRow++;
        });

        currentRow += 2;
      }

      // Section 2: Purchase Shipments
      if (includeOrdered) {
        const bannerRow = worksheet.getRow(currentRow);
        bannerRow.getCell(1).value = "PURCHASE ORDER SHIPMENTS REGISTRY";
        worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
        bannerRow.height = 25;
        const bannerCell = bannerRow.getCell(1);
        bannerCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
        bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
        bannerCell.alignment = { vertical: "middle", horizontal: "left" };
        bannerCell.border = {
          top: { style: "medium", color: { argb: "FF94A3B8" } },
          bottom: { style: "medium", color: { argb: "FF94A3B8" } }
        };

        currentRow++;

        const headers = [
          "Item Details", "Type", "Supplier", "Category", 
          "Quantity", "Price Per Unit (INR)", "Total Cost (INR)", "Order Date", "Status"
        ];
        worksheet.getRow(currentRow).values = headers;
        applyHeaderStyles(currentRow, 9);
        currentRow++;

        targetOrders.forEach(order => {
          const qty = Number(order.quantity) || 0;
          const price = Number(order.pricePerUnit) || 0;
          const total = qty * price;
          const row = worksheet.getRow(currentRow);
          row.values = [
            order.item || "",
            order.type || "",
            order.supplier || "",
            order.category || "",
            qty,
            price,
            total,
            order.orderDate || "",
            order.status || ""
          ];
          row.height = 20;

          row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(3).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(4).alignment = { vertical: "middle", horizontal: "left" };
          row.getCell(5).alignment = { vertical: "middle", horizontal: "right" };
          row.getCell(5).numFmt = "#,##0";
          row.getCell(6).alignment = { vertical: "middle", horizontal: "right" };
          row.getCell(6).numFmt = '"₹"#,##0.00';
          row.getCell(7).alignment = { vertical: "middle", horizontal: "right" };
          row.getCell(7).numFmt = '"₹"#,##0.00';
          row.getCell(8).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(9).alignment = { vertical: "middle", horizontal: "center" };
          row.getCell(9).font = { name: "Calibri", size: 10, bold: true };

          for (let c = 1; c <= 9; c++) {
            row.getCell(c).border = borderStyle;
            if (c !== 9) {
              row.getCell(c).font = { name: "Calibri", size: 10 };
            }
          }
          currentRow++;
        });
      }

      // Column widths adjusted so all text and date fields are fully visible
      const colWidths = [32, 16, 22, 22, 22, 14, 20, 18, 20];
      colWidths.forEach((width, index) => {
        worksheet.getColumn(index + 1).width = width;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportName.replace(/[^a-z0-9]/gi, '_')}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMessage(`✓ ${isBulk ? "Bulk" : "Selected"} ${typeDesc} report for "${reportName}" downloaded successfully!`);
    } catch (err) {
      console.error("Failed to generate report file: ", err);
      setToastMessage("❌ Failed to compile report file.");
    } finally {
      setLoading(false);
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  // Unique categories in inventory
  const categories = Array.from(new Set(inventory.map((item) => item.category)));

  // Helper date matching function
  const isWithinRange = (dateStr) => {
    if (!dateStr) return false;
    const cleanDate = dateStr.split(" ")[0]; // Extract YYYY-MM-DD
    return cleanDate >= startDate && cleanDate <= endDate;
  };

  // 1. FILTER ISSUED STOCK LOGS
  const filteredIssued = issuedStock.filter((log) => {
    if (!isWithinRange(log.date)) return false;
    if (activeReportType === "department" && log.department !== selectedDepartment) return false;
    if (activeReportType === "category" && (log.category || "").toLowerCase() !== (selectedCategory || "").toLowerCase()) return false;
    return true;
  });

  // 2. FILTER PURCHASE ORDERS
  const filteredOrders = orders.filter((order) => {
    if (!isWithinRange(order.orderDate)) return false;
    if (activeReportType === "category" && (order.category || "").toLowerCase() !== (selectedCategory || "").toLowerCase()) return false;
    if (activeReportType === "department") {
      const regName = getRegisterForCategory(order.category);
      if (regName.toLowerCase() !== selectedDepartment.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  const getStockAtEndDate = (item) => {
    // Filter issues that occurred after the endDate
    const issuesAfter = issuedStock.filter(log => {
      const cleanDate = (log.date || "").split(" ")[0];
      return cleanDate > endDate && 
             (log.category || "").toLowerCase() === (item.category || "").toLowerCase() &&
             (log.subcategory || "").toLowerCase() === (item.subcategory || "").toLowerCase() &&
             (log.type || "").toLowerCase() === (item.type || "").toLowerCase();
    });
    const totalIssuedAfter = issuesAfter.reduce((sum, log) => sum + log.quantity, 0);

    // Filter received orders that occurred after the endDate
    const receivedAfter = orders.filter(o => {
      const cleanDate = (o.receiveDate || "").split(" ")[0];
      return (o.status === "Received" || o.status === "Partially Received") && 
             cleanDate > endDate && 
             (o.category || "").toLowerCase() === (item.category || "").toLowerCase() &&
             (o.subcategory || "").toLowerCase() === (item.subcategory || "").toLowerCase() &&
             (o.type || "").toLowerCase() === (item.type || "").toLowerCase();
    });
    const totalReceivedAfter = receivedAfter.reduce((sum, o) => sum + (o.receivedQuantity || o.quantity), 0);

    const computedStock = item.stock + totalIssuedAfter - totalReceivedAfter;
    return computedStock >= 0 ? computedStock : 0;
  };

  // Filtered inventory based on endDate
  const filteredInventory = inventory.filter(item => {
    const cleanDate = (item.createdAt || "").split(" ")[0];
    return cleanDate <= endDate;
  });

  const totalOrderedQty = filteredOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalOrderedAmount = filteredOrders.reduce((sum, o) => sum + (o.quantity * o.pricePerUnit), 0);

  const totalPurchasedQty = filteredOrders.reduce((sum, o) => sum + (o.receivedQuantity || (o.status === "Received" ? o.quantity : 0)), 0);
  const totalPurchasedAmount = filteredOrders.reduce((sum, o) => sum + ((o.receivedQuantity || (o.status === "Received" ? o.quantity : 0)) * o.pricePerUnit), 0);

  const totalNotReceivedQty = filteredOrders.reduce((sum, o) => sum + (o.pendingQuantity !== undefined ? o.pendingQuantity : (o.status === "Received" ? 0 : o.quantity)), 0);
  const totalNotReceivedAmount = filteredOrders.reduce((sum, o) => sum + ((o.pendingQuantity !== undefined ? o.pendingQuantity : (o.status === "Received" ? 0 : o.quantity)) * o.pricePerUnit), 0);

  const totalIssuedQty = filteredIssued.reduce((sum, log) => sum + log.quantity, 0);
  const totalIssuedAmount = filteredIssued.reduce((sum, log) => sum + (log.quantity * getIssuedItemPrice(log)), 0);

  const itemsRemaining = filteredInventory.reduce((sum, item) => sum + getStockAtEndDate(item), 0);
  const totalInventoryAmountRemaining = filteredInventory.reduce((sum, item) => sum + (getStockAtEndDate(item) * item.price), 0);

  const departmentsList = inventoryCategories.map(c => c.name);
  
  const departmentIssuesSummary = departmentsList.map(dept => {
    const deptLogs = filteredIssued.filter(log => {
      const logReg = getRegisterForCategory(log.category || log.department);
      return logReg.toLowerCase() === dept.toLowerCase();
    });
    const qty = deptLogs.reduce((sum, log) => sum + log.quantity, 0);
    const amount = deptLogs.reduce((sum, log) => sum + (log.quantity * getIssuedItemPrice(log)), 0);
    return {
      name: dept,
      qty,
      amount
    };
  });

  const reportCards = [
    {
      type: "department",
      title: "Department Report",
      description: "Disbursements and orders sorted by college divisions.",
      icon: <FaBuilding size={28} />,
      colorClass: "from-blue-600 to-indigo-700 shadow-blue-500/10 hover:shadow-blue-500/25"
    },
    {
      type: "category",
      title: "Category Report",
      description: "Drill down of logs based on asset classifications.",
      icon: <FaBoxes size={28} />,
      colorClass: "from-purple-600 to-pink-700 shadow-purple-500/10 hover:shadow-purple-500/25"
    },
    {
      type: "detail",
      title: "Detail Report",
      description: "Generate comprehensive date-wise reports of purchased and issued stock.",
      icon: <FaCalendarAlt size={28} />,
      colorClass: "from-amber-500 to-orange-700 shadow-amber-500/10 hover:shadow-amber-500/25"
    },
    {
      type: "summary",
      title: "Summary",
      description: "View full detailed summary of stock, costs, and department issues.",
      icon: <FaChartBar size={28} />,
      colorClass: "from-emerald-500 to-teal-700 shadow-emerald-500/10 hover:shadow-emerald-500/25"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* Title Section */}
        <div className="mt-8 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Reports Center
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Generate, preview, and print official institutional spreadsheets and transaction ledgers.
          </p>
        </div>

        {/* Feedback Alert Toast */}
        {toastMessage && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border ${
            loading ? "bg-indigo-600 text-white border-indigo-500 animate-pulse animate-bounce" : "bg-emerald-600 text-white border-emerald-500"
          }`}>
            {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaCheckCircle className="text-lg text-emerald-300" />}
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Re-designed 3D Card selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportCards.map((card, index) => {
            const isSelected = activeReportType === card.type;
            return (
              <div
                key={index}
                onClick={() => {
                  setActiveReportType(card.type === activeReportType ? null : card.type);
                }}
                className={`card-3d relative rounded-3xl p-6 cursor-pointer border overflow-hidden transition-all duration-300 transform ${
                  isSelected
                    ? `bg-gradient-to-br ${card.colorClass} text-white border-transparent scale-[1.03] rotate-1 shadow-2xl`
                    : "bg-white text-slate-800 border-slate-100 dark:border-slate-800 dark:bg-slate-900 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-50 dark:bg-slate-800/80 text-indigo-600 dark:text-cyan-400"
                }`}>
                  {card.icon}
                </div>

                <h3 className="font-black text-lg mb-1">{card.title}</h3>
                <p className={`text-xs leading-relaxed ${isSelected ? "text-white/80" : "text-slate-400 dark:text-slate-400"}`}>
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Conditional Configuration Panel */}
        {activeReportType ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 transition-all duration-500 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b pb-5 mb-6 border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-855 dark:text-white capitalize">
                  {activeReportType === "detail" ? "Detail Report Configuration" : activeReportType === "summary" ? "Inventory Summary Dashboard" : `${activeReportType} Configuration`}
                </h2>
                <p className="text-slate-450 dark:text-slate-400 text-xs mt-1">
                  {activeReportType === "summary"
                    ? "Full overview of purchased, issued, and remaining stock valuation."
                    : "Select dates and toggle categories to compile preview documents."}
                </p>
              </div>
              
              <button 
                onClick={() => setActiveReportType(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-semibold px-3.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition"
              >
                Cancel Selection
              </button>
            </div>

            {/* Inputs & Parameters Panel */}
            <div className="space-y-6 mb-8">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                {/* Dynamic Parameter Dropdown */}
                {activeReportType === "department" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Target Department</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {departmentsList.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeReportType === "category" && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Asset Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Universal Preset selector */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Report Period</label>
                  <select
                    value={datePreset}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                    <option value="yearly">Yearly Report</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>

                {/* Date Filters */}
                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold text-xs mb-2 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 p-3.5 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Checkboxes & Action Row */}
              {activeReportType !== "summary" && (
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 animate-fadeIn">
                  <div className="flex flex-wrap gap-6 items-center">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Include:</span>
                    
                    <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-slate-300 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeIssued}
                        onChange={(e) => setIncludeIssued(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Disbursed Logs</span>
                    </label>

                    <label className="flex items-center gap-2.5 font-bold text-slate-700 dark:text-slate-300 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeOrdered}
                        onChange={(e) => setIncludeOrdered(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Purchase Shipments</span>
                    </label>
                  </div>

                  {/* Print and Export Buttons */}
                  <div className="flex flex-wrap gap-3 no-print">
                    <button
                      disabled={loading}
                      onClick={() => triggerDownload(
                        activeReportType === "department" ? selectedDepartment : activeReportType === "category" ? selectedCategory : `${startDate} to ${endDate}`
                      )}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 transition disabled:opacity-50 text-xs"
                    >
                      <FaFileExcel className="text-sm" />
                      <span>Export Excel</span>
                    </button>

                    <button
                      disabled={loading}
                      onClick={() => window.print()}
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 transition disabled:opacity-50 text-xs"
                    >
                      <FaPrint className="text-sm" />
                      <span>Print Report</span>
                    </button>

                    {(activeReportType === "department" || activeReportType === "category") && (
                      <button
                        disabled={loading}
                        onClick={() => triggerDownload(
                          activeReportType === "department" ? "All Departments" : "All Categories",
                          true
                        )}
                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-95 transition disabled:opacity-50 text-xs"
                      >
                        <FaDownload className="text-sm" />
                        <span>Download Bulk</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Conditionally Render Summary dashboard OR Preview mockup container */}
            {activeReportType === "summary" ? (
              /* Inline Summary Dashboard */
              <div className="space-y-8 animate-fadeIn pt-6 border-t border-slate-100 dark:border-slate-800">
                {/* 3D KPI Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  
                  {/* Card 1: Total Stock Ordered */}
                  <div 
                    onClick={() => setActiveSummaryTab(activeSummaryTab === "ordered" ? null : "ordered")}
                    className={`card-3d relative rounded-3xl p-6 border cursor-pointer overflow-hidden transition-all duration-300 group ${
                      activeSummaryTab === "ordered"
                        ? "bg-indigo-600 text-white border-transparent shadow-xl scale-[1.02] ring-2 ring-indigo-500/50"
                        : "bg-gradient-to-br from-indigo-500/10 to-purple-600/10 dark:from-indigo-950/20 dark:to-purple-950/20 border-slate-150 dark:border-slate-800 hover:border-indigo-400"
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${activeSummaryTab === "ordered" ? "text-white/80" : "text-slate-450 dark:text-slate-400"}`}>Total Stock Ordered</h3>
                    <p className={`text-3xl font-black mt-2 ${activeSummaryTab === "ordered" ? "text-white" : "text-slate-800 dark:text-white"}`}>{totalOrderedQty} <span className="text-xs font-semibold">units</span></p>
                    <p className={`text-sm font-bold mt-2 ${activeSummaryTab === "ordered" ? "text-white/90" : "text-indigo-650 dark:text-indigo-400"}`}>Value: ₹{totalOrderedAmount.toLocaleString()}</p>
                  </div>

                  {/* Card 2: Total Purchased (Received) */}
                  <div 
                    onClick={() => setActiveSummaryTab(activeSummaryTab === "purchased" ? null : "purchased")}
                    className={`card-3d relative rounded-3xl p-6 border cursor-pointer overflow-hidden transition-all duration-300 group ${
                      activeSummaryTab === "purchased"
                        ? "bg-blue-600 text-white border-transparent shadow-xl scale-[1.02] ring-2 ring-blue-500/50"
                        : "bg-gradient-to-br from-blue-500/10 to-indigo-650/10 dark:from-blue-950/20 dark:to-indigo-950/20 border-slate-150 dark:border-slate-800 hover:border-blue-400"
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${activeSummaryTab === "purchased" ? "text-white/80" : "text-slate-455 dark:text-slate-400"}`}>Total Purchased (Received)</h3>
                    <p className={`text-3xl font-black mt-2 ${activeSummaryTab === "purchased" ? "text-white" : "text-slate-800 dark:text-white"}`}>{totalPurchasedQty} <span className="text-xs font-semibold">units</span></p>
                    <p className={`text-sm font-bold mt-2 ${activeSummaryTab === "purchased" ? "text-white/90" : "text-blue-650 dark:text-cyan-400"}`}>Cost: ₹{totalPurchasedAmount.toLocaleString()}</p>
                  </div>

                  {/* Card 3: Items Not Received */}
                  <div 
                    onClick={() => setActiveSummaryTab(activeSummaryTab === "not_received" ? null : "not_received")}
                    className={`card-3d relative rounded-3xl p-6 border cursor-pointer overflow-hidden transition-all duration-300 group ${
                      activeSummaryTab === "not_received"
                        ? "bg-rose-600 text-white border-transparent shadow-xl scale-[1.02] ring-2 ring-rose-500/50"
                        : "bg-gradient-to-br from-rose-500/10 to-red-600/10 dark:from-rose-950/20 dark:to-red-950/20 border-slate-150 dark:border-slate-800 hover:border-rose-400"
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${activeSummaryTab === "not_received" ? "text-white/80" : "text-slate-455 dark:text-slate-400"}`}>Items Not Received</h3>
                    <p className={`text-3xl font-black mt-2 ${activeSummaryTab === "not_received" ? "text-white" : "text-slate-800 dark:text-white"}`}>{totalNotReceivedQty} <span className="text-xs font-semibold">units</span></p>
                    <p className={`text-sm font-bold mt-2 ${activeSummaryTab === "not_received" ? "text-white/90" : "text-rose-650 dark:text-rose-450"}`}>Value: ₹{totalNotReceivedAmount.toLocaleString()}</p>
                  </div>

                  {/* Card 4: Total Stock Issued */}
                  <div 
                    onClick={() => setActiveSummaryTab(activeSummaryTab === "issued" ? null : "issued")}
                    className={`card-3d relative rounded-3xl p-6 border cursor-pointer overflow-hidden transition-all duration-300 group ${
                      activeSummaryTab === "issued"
                        ? "bg-amber-600 text-white border-transparent shadow-xl scale-[1.02] ring-2 ring-amber-500/50"
                        : "bg-gradient-to-br from-amber-500/10 to-orange-600/10 dark:from-amber-950/20 dark:to-orange-950/20 border-slate-150 dark:border-slate-800 hover:border-amber-500"
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${activeSummaryTab === "issued" ? "text-white/80" : "text-slate-450 dark:text-slate-400"}`}>Total Stock Issued</h3>
                    <p className={`text-3xl font-black mt-2 ${activeSummaryTab === "issued" ? "text-white" : "text-slate-800 dark:text-white"}`}>{totalIssuedQty} <span className="text-xs font-semibold">units</span></p>
                    <p className={`text-sm font-bold mt-2 ${activeSummaryTab === "issued" ? "text-white/90" : "text-amber-600 dark:text-amber-450"}`}>Cost: ₹{totalIssuedAmount.toLocaleString()}</p>
                  </div>

                  {/* Card 5: Remaining Valuation */}
                  <div 
                    onClick={() => setActiveSummaryTab(activeSummaryTab === "remaining" ? null : "remaining")}
                    className={`card-3d relative rounded-3xl p-6 border cursor-pointer overflow-hidden transition-all duration-300 group ${
                      activeSummaryTab === "remaining"
                        ? "bg-emerald-600 text-white border-transparent shadow-xl scale-[1.02] ring-2 ring-emerald-500/50"
                        : "bg-gradient-to-br from-emerald-500/10 to-teal-650/10 dark:from-emerald-950/20 dark:to-teal-950/20 border-slate-150 dark:border-slate-800 hover:border-emerald-400"
                    }`}
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
                    <h3 className={`font-bold text-xs uppercase tracking-wider ${activeSummaryTab === "remaining" ? "text-white/80" : "text-slate-450 dark:text-slate-400"}`}>Remaining Valuation</h3>
                    <p className={`text-3xl font-black mt-2 ${activeSummaryTab === "remaining" ? "text-white" : "text-slate-800 dark:text-white"}`}>{itemsRemaining} <span className="text-xs font-semibold">units</span></p>
                    <p className={`text-sm font-bold mt-2 ${activeSummaryTab === "remaining" ? "text-white/90" : "text-emerald-600 dark:text-cyan-400"}`}>Value: ₹{totalInventoryAmountRemaining.toLocaleString()}</p>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Department-wise Issuance Table */}
                  <div className={`bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300 ${
                    activeSummaryTab && activeSummaryTab !== "issued" ? "opacity-30 blur-[2px] pointer-events-none" : ""
                  }`}>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3.5 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Department-wise Disbursement Summary (Click to expand details)</span>
                    </h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Department</th>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Qty Issued</th>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Total Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {departmentIssuesSummary.map((dept, idx) => {
                            const isExpanded = expandedDepartment === dept.name;
                            const deptLogs = filteredIssued.filter(log => {
                               const logReg = getRegisterForCategory(log.category || log.department);
                               return logReg.toLowerCase() === dept.name.toLowerCase();
                             });

                            return (
                              <React.Fragment key={idx}>
                                <tr 
                                  onClick={() => setExpandedDepartment(isExpanded ? null : dept.name)}
                                  className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-2">
                                    {isExpanded ? <FaChevronDown className="text-indigo-650 text-xs" /> : <FaChevronRight className="text-slate-400 text-xs" />}
                                    <span>{dept.name}</span>
                                  </td>
                                  <td className="p-3 text-sm font-black text-slate-850 dark:text-white">{dept.qty}</td>
                                  <td className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">₹{dept.amount.toLocaleString()}</td>
                                </tr>

                                {isExpanded && (
                                  <tr className="bg-slate-50 dark:bg-slate-950/40">
                                    <td colSpan="3" className="p-4 border-t border-b border-slate-150 dark:border-slate-800">
                                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-inner">
                                        <h5 className="font-bold text-xs text-indigo-650 dark:text-cyan-400 uppercase tracking-wider mb-2.5">
                                          Disbursement Breakdown ({deptLogs.length} items)
                                        </h5>
                                        {deptLogs.length > 0 ? (
                                          <table className="w-full text-xs text-left">
                                            <thead>
                                              <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800 font-bold uppercase">
                                                <th className="pb-1.5">Item</th>
                                                <th className="pb-1.5">Faculty</th>
                                                <th className="pb-1.5 text-right">Qty</th>
                                                <th className="pb-1.5 text-right">Cost</th>
                                                <th className="pb-1.5 text-right">Date</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                              {deptLogs.map((log, lIdx) => {
                                                const itemCost = log.quantity * getIssuedItemPrice(log);
                                                return (
                                                  <tr key={lIdx} className="hover:bg-slate-50/20">
                                                    <td className="py-2 text-slate-750 dark:text-slate-350 font-semibold">{log.item} ({log.type})</td>
                                                    <td className="py-2 text-slate-600 dark:text-slate-400">{log.faculty}</td>
                                                    <td className="py-2 text-right font-black text-slate-800 dark:text-white">{log.quantity}</td>
                                                    <td className="py-2 text-right text-slate-600 dark:text-slate-450 font-bold">₹{itemCost.toLocaleString()}</td>
                                                    <td className="py-2 text-right text-slate-450 font-mono text-[10px]">{log.date.split(" ")[0]}</td>
                                                  </tr>
                                                );
                                              })}
                                            </tbody>
                                          </table>
                                        ) : (
                                          <p className="text-xs text-slate-400 italic">No items disbursed in this date range.</p>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Remaining Inventory Table */}
                  <div className={`bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300 ${
                    activeSummaryTab && activeSummaryTab !== "remaining" ? "opacity-30 blur-[2px] pointer-events-none" : ""
                  }`}>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3.5 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Stock Valuation at Period End</span>
                    </h4>
                    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 max-h-[300px] overflow-y-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Item Details</th>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Stock</th>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Price</th>
                            <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Valuation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {filteredInventory.map((item) => {
                            const stockAtEnd = getStockAtEndDate(item);
                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-350">
                                  {item.item} <span className="text-[10px] text-slate-400 font-normal">({item.category})</span>
                                </td>
                                <td className="p-3 text-sm font-black text-slate-850 dark:text-white">{stockAtEnd}</td>
                                <td className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-400">₹{item.price.toLocaleString()}</td>
                                <td className="p-3 text-sm font-black text-slate-800 dark:text-white">₹{(stockAtEnd * item.price).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Total Item Ordered List (New Table) */}
                <div className={`bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm transition-all duration-300 ${
                  activeSummaryTab && !["ordered", "purchased", "not_received"].includes(activeSummaryTab) ? "opacity-30 blur-[2px] pointer-events-none" : ""
                }`}>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                        activeSummaryTab === "purchased" ? "bg-blue-500" : activeSummaryTab === "not_received" ? "bg-rose-500" : "bg-indigo-500"
                      }`} />
                      <span>
                        {activeSummaryTab === "purchased" 
                          ? "Total Item Purchased List" 
                          : activeSummaryTab === "not_received" 
                          ? "Items Not Received List (Pending/Approved)" 
                          : "Total Item Ordered List"}
                        {` (${
                          activeSummaryTab === "purchased" 
                            ? filteredOrders.filter(o => o.status === "Received" || o.status === "Partially Received").length
                            : activeSummaryTab === "not_received"
                            ? filteredOrders.filter(o => o.status !== "Received").length
                            : filteredOrders.length
                        } records)`}
                      </span>
                    </div>
                    {activeSummaryTab && (
                      <button 
                        onClick={() => setActiveSummaryTab(null)}
                        className="text-xs bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <FaTimes className="text-[10px]" />
                        <span>Clear Filter</span>
                      </button>
                    )}
                  </h4>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 max-h-[350px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Item Details</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Supplier</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">
                            {activeSummaryTab === "not_received" ? "Qty Pending" : activeSummaryTab === "purchased" ? "Qty Recd" : "Qty"}
                          </th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Per Unit</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Total Cost</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Order Date</th>
                          <th className="p-3 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {(() => {
                          const list = activeSummaryTab === "purchased"
                            ? filteredOrders.filter(o => o.status === "Received" || o.status === "Partially Received")
                            : activeSummaryTab === "not_received"
                            ? filteredOrders.filter(o => o.status !== "Received")
                            : filteredOrders;

                          return list.length > 0 ? (
                            list.map((order) => {
                              const displayQty = activeSummaryTab === "purchased"
                                ? (order.receivedQuantity !== undefined ? order.receivedQuantity : (order.status === "Received" ? order.quantity : 0))
                                : activeSummaryTab === "not_received"
                                ? (order.pendingQuantity !== undefined ? order.pendingQuantity : (order.status === "Received" ? 0 : order.quantity))
                                : order.quantity;

                              const displayCost = displayQty * order.pricePerUnit;

                              return (
                                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                  <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-350">
                                    {order.item} <span className="text-[10px] text-slate-455 font-normal">({order.type})</span>
                                  </td>
                                  <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{order.supplier}</td>
                                  <td className="p-3 text-sm font-black text-slate-800 dark:text-white">{displayQty}</td>
                                  <td className="p-3 text-sm font-semibold text-slate-700 dark:text-slate-350">₹{order.pricePerUnit?.toLocaleString()}</td>
                                  <td className="p-3 text-sm font-black text-slate-855 dark:text-white">₹{displayCost?.toLocaleString()}</td>
                                  <td className="p-3 text-xs text-slate-500">{order.orderDate}</td>
                                  <td className="p-3 text-sm">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                      order.status === "Pending" 
                                        ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400" 
                                        : order.status === "Approved"
                                        ? "bg-amber-550/20 text-amber-600 dark:bg-amber-950/20 dark:text-amber-455"
                                        : order.status === "Partially Received"
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="7" className="p-8 text-center text-sm text-slate-400 font-medium bg-white dark:bg-slate-950">
                                {activeSummaryTab === "not_received" 
                                  ? "All orders have been received!" 
                                  : "No orders found in this date range."}
                              </td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              /* Premium printed-sheet mockup preview container */
              <div className="space-y-6 mt-8 border-t pt-6 border-slate-150 dark:border-slate-800 live-report-container">
              
              <div className="flex items-center justify-between mb-2 no-print">
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Live Preview Document Sheet
                </h3>
                <span className="text-slate-400 text-xs font-bold bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-slate-200/40 dark:border-slate-800">
                  <FaInfoCircle />
                  <span>Audit Dates: {startDate} to {endDate}</span>
                </span>
              </div>

              {/* Institution Banners Mockup */}
              <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-4 shadow-inner">
                <div className="flex items-center gap-5">
                  {collegeInfo?.logo ? (
                    <img src={collegeInfo.logo} alt="College Logo" className="w-16 h-16 rounded-2xl object-contain bg-white border border-slate-200 p-1.5 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                      {collegeInfo?.name ? collegeInfo.name[0] : "C"}
                    </div>
                  )}
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{collegeInfo?.name || "Rustamji Institute of Technology"}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">{collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <span>Phone: {collegeInfo?.phone || "+91 11 2690 7400"}</span>
                      <span>Email: {collegeInfo?.email || "info@rjit.edu.in"}</span>
                      <span>Web: {collegeInfo?.website || "www.rjit.edu.in"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider border border-blue-200 dark:border-blue-900/50 shadow-sm">
                    {activeReportType === "detail" ? "Official Detail Report" : "Official Audit Sheet"}
                  </span>
                </div>
              </div>

              {/* Report Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 mb-2 no-print">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow transition duration-200">
                  <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Qty Purchased</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">{totalPurchasedQty}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow transition duration-200">
                  <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Purchase Cost</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">₹{totalPurchasedAmount.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow transition duration-200">
                  <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Qty Issued</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">{totalIssuedQty}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm hover:shadow transition duration-200">
                  <span className="block text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Issued Value</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-1 block">₹{totalIssuedAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* 1. DISBURSED LOGS PREVIEW */}
              {includeIssued && (
                <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Stock Disbursement Ledger ({filteredIssued.length} transaction logs)</span>
                    </h4>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">Item Details</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-450 uppercase">Category</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Department</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Faculty</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Qty</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Issue Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {filteredIssued.length > 0 ? (
                          filteredIssued.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-3.5 text-sm font-semibold text-slate-700 dark:text-slate-350">
                                {log.item} <span className="text-xs text-slate-400 font-normal">({log.type})</span>
                              </td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{log.category}</td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{log.department}</td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{log.faculty}</td>
                              <td className="p-3.5 text-sm font-black text-slate-800 dark:text-white">{log.quantity}</td>
                              <td className="p-3.5 text-xs text-slate-500">{log.date}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-sm text-slate-400 font-medium bg-white dark:bg-slate-950">
                              No disbursed assets found in this configuration range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. ORDER SHIPMENTS PREVIEW */}
              {includeOrdered && (
                <div className="bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-150 dark:border-slate-800/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                      <span>Purchase Order Shipments Registry ({filteredOrders.length} records)</span>
                    </h4>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Item Details</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Supplier</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Category</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Qty</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Per Unit</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Total Cost</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Order Date</th>
                          <th className="p-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-455 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <td className="p-3.5 text-sm font-semibold text-slate-700 dark:text-slate-350">
                                {order.item} <span className="text-xs text-slate-400 font-normal">({order.type})</span>
                              </td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{order.supplier}</td>
                              <td className="p-3.5 text-sm text-slate-600 dark:text-slate-400">{order.category}</td>
                              <td className="p-3.5 text-sm font-black text-slate-800 dark:text-white">{order.quantity}</td>
                              <td className="p-3.5 text-sm font-semibold text-slate-700 dark:text-slate-350">₹{order.pricePerUnit?.toLocaleString()}</td>
                              <td className="p-3.5 text-sm font-black text-slate-850 dark:text-white">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                              <td className="p-3.5 text-xs text-slate-500">{order.orderDate}</td>
                              <td className="p-3.5 text-sm">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                  order.status === "Pending" 
                                    ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400" 
                                    : order.status === "Approved"
                                    ? "bg-amber-550/20 text-amber-600 dark:bg-amber-950/20 dark:text-amber-455"
                                    : order.status === "Partially Received"
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="p-8 text-center text-sm text-slate-400 font-medium bg-white dark:bg-slate-950">
                              No purchase shipments found in this configuration range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Official Seal / Sign-off block at bottom */}
              <div className="pt-10 flex justify-between items-center text-xs border-t border-slate-200 dark:border-slate-800 mt-8">
                <div className="text-slate-400 font-bold uppercase tracking-wider">
                  Generated by: {systemSettings?.collegeInfo?.name || "RJIT STORE SYSTEM"}
                </div>
                <div className="text-center border-t border-slate-300 dark:border-slate-800 pt-2 w-48 text-slate-650 dark:text-slate-300 font-semibold">
                  Authorized Signature
                </div>
              </div>

            </div>
          )}

          </div>
        ) : (
          /* Empty Selector Guide */
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FaFilePdf className="text-xl" />
            </div>
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">Select a Report Configuration</h2>
            <p className="text-slate-450 text-sm max-w-md mx-auto">
              Please click one of the interactive card grids above (Department, Category, or Detail Report) to configure filters and view live mockups.
            </p>
          </div>
        )}

      </div>

      {activeReportType && createPortal(
        <div className="hidden print-report-layout p-8 bg-white text-black font-sans min-h-screen">
          {/* Header Banners */}
          <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6">
            {collegeInfo?.logo ? (
              <img src={collegeInfo.logo} alt="College Logo" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 border border-slate-300 flex items-center justify-center font-black text-2xl bg-blue-900 text-white rounded">
                {collegeInfo?.name ? collegeInfo.name[0] : "C"}
              </div>
            )}
            <div className="text-right">
              <h1 className="text-2xl font-bold">{collegeInfo?.name || "Rustamji Institute of Technology"}</h1>
              <p className="text-xs text-slate-500">{collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
              <p className="text-xs text-slate-500">Phone: {collegeInfo?.phone || "+91 11 2690 7400"} | Email: {collegeInfo?.email || "info@rjit.edu.in"}</p>
              <p className="text-xs text-slate-500">Website: {collegeInfo?.website || "www.rjit.edu.in"}</p>
            </div>
          </div>

          {/* Title and Date Range */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800">
              {activeReportType === "department" 
                ? `${selectedDepartment} Department Report` 
                : activeReportType === "category" 
                ? `${selectedCategory} Category Report` 
                : activeReportType === "detail" 
                ? "Detail Report" 
                : "Report"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Date Range: {startDate} to {endDate}
            </p>
          </div>

          {/* Print Summary Metrics Row */}
          <div className="grid grid-cols-4 gap-4 mb-8 p-4 border border-slate-300 rounded-xl bg-slate-50 text-center">
            <div>
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">Total Qty Purchased</span>
              <span className="text-base font-black text-slate-950 mt-1 block">{totalPurchasedQty}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">Total Purchase Cost</span>
              <span className="text-base font-black text-slate-950 mt-1 block">₹{totalPurchasedAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">Total Qty Issued</span>
              <span className="text-base font-black text-slate-950 mt-1 block">{totalIssuedQty}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider">Total Issued Value</span>
              <span className="text-base font-black text-slate-950 mt-1 block">₹{totalIssuedAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* 1. DISBURSED LOGS PREVIEW */}
          {includeIssued && (
            <div className="mb-8" style={includeOrdered ? { pageBreakAfter: "always", breakAfter: "page" } : {}}>
              <h3 className="font-bold text-slate-850 text-sm mb-3 uppercase tracking-wider border-b pb-1 border-slate-200">
                Stock Disbursement Ledger ({filteredIssued.length} transaction logs)
              </h3>
              <table className="w-full border-collapse border border-slate-200 text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-2 border border-slate-200 font-bold uppercase">Item Details</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Category</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Department</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Faculty</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Qty</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Issue Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssued.length > 0 ? (
                    filteredIssued.map((log) => (
                      <tr key={log.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-200 font-semibold">{log.item} ({log.type})</td>
                        <td className="p-2 border border-slate-200">{log.category}</td>
                        <td className="p-2 border border-slate-200">{log.department}</td>
                        <td className="p-2 border border-slate-200">{log.faculty}</td>
                        <td className="p-2 border border-slate-200 font-bold">{log.quantity}</td>
                        <td className="p-2 border border-slate-200">{log.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-400 italic">
                        No disbursed assets found in this configuration range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. ORDER SHIPMENTS PREVIEW */}
          {includeOrdered && (
            <div className="mb-8">
              <h3 className="font-bold text-slate-850 text-sm mb-3 uppercase tracking-wider border-b pb-1 border-slate-200">
                Purchase Order Shipments Registry ({filteredOrders.length} records)
              </h3>
              <table className="w-full border-collapse border border-slate-200 text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="p-2 border border-slate-200 font-bold uppercase">Item Details</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Supplier</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Category</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Qty</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Per Unit</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Total Cost</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Order Date</th>
                    <th className="p-2 border border-slate-200 font-bold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-200 font-semibold">{order.item} ({order.type})</td>
                        <td className="p-2 border border-slate-200">{order.supplier}</td>
                        <td className="p-2 border border-slate-200">{order.category}</td>
                        <td className="p-2 border border-slate-200 font-bold">{order.quantity}</td>
                        <td className="p-2 border border-slate-200">₹{order.pricePerUnit?.toLocaleString()}</td>
                        <td className="p-2 border border-slate-200 font-bold">₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                        <td className="p-2 border border-slate-200">{order.orderDate}</td>
                        <td className="p-2 border border-slate-200 font-bold">{order.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-slate-400 italic">
                        No purchase shipments found in this configuration range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Seal / Sign-off block at bottom */}
          <div className="pt-10 flex justify-between items-center text-xs border-t border-slate-200 mt-8">
            <div className="text-slate-400 font-bold uppercase tracking-wider">
              Generated by: {collegeInfo?.name || "RJIT STORE SYSTEM"}
            </div>
            <div className="text-center border-t border-slate-350 pt-2 w-48 text-slate-650 font-bold uppercase">
              Authorized Signature
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}