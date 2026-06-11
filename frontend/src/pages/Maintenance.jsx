import React, { useState, useMemo } from "react";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import * as FaIcons from "react-icons/fa";
import ConfirmDialog from "../components/ConfirmDialog";
import ExcelJS from "exceljs";

const availableIcons = [
  { name: "FaTint", icon: <FaIcons.FaTint />, label: "Water / RO" },
  { name: "FaWrench", icon: <FaIcons.FaWrench />, label: "Tools" },
  { name: "FaTools", icon: <FaIcons.FaTools />, label: "Equipment" },
  { name: "FaTv", icon: <FaIcons.FaTv />, label: "Electronics" },
  { name: "FaDesktop", icon: <FaIcons.FaDesktop />, label: "IT / Computers" },
  { name: "FaBolt", icon: <FaIcons.FaBolt />, label: "Electrical" },
  { name: "FaWind", icon: <FaIcons.FaWind />, label: "AC / Cooling" },
  { name: "FaFire", icon: <FaIcons.FaFire />, label: "Heating" }
];

export default function Maintenance() {
  const {
    maintenanceCategories,
    addMaintenanceCategory,
    deleteMaintenanceCategory,
    maintenanceLogs,
    addMaintenanceLog,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    addMaintenanceSubcategory,
    deleteMaintenanceSubcategory,
    updateMaintenanceUnitStatus,
    updateMaintenanceUnitDetails,
    addNotification,
    systemSettings
  } = useStore();

  const collegeInfo = systemSettings?.collegeInfo;

  // State Management
  const [selectedCategory, setSelectedCategory] = useState("RO"); // Default to RO Systems as in reference image
  const [selectedRoId, setSelectedRoId] = useState(null);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showEditUnitModal, setShowEditUnitModal] = useState(false);
  const [showEditLogModal, setShowEditLogModal] = useState(false);
  
  // Quick Actions Modals
  const [showReportFormatModal, setShowReportFormatModal] = useState(false);
  const [activeMenuCardId, setActiveMenuCardId] = useState(null); // Options menu dropdown state for cards

  const [successMessage, setSuccessMessage] = useState("");
  const [editingLogId, setEditingLogId] = useState(null);
  
  // Search & Filters for Assets list
  const [assetSearch, setAssetSearch] = useState("");
  const [assetStatusFilter, setAssetStatusFilter] = useState("all");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Search, filter & sort states for logs table
  const [logSearch, setLogSearch] = useState("");
  const [logSort, setLogSort] = useState("date-desc");
  const [logTechFilter, setLogTechFilter] = useState("all");

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "danger"
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    name: "",
    icon: "FaTools"
  });

  // Unit Form State
  const [unitForm, setUnitForm] = useState(() => ({
    name: "",
    location: "",
    initialPrice: "",
    installDate: new Date().toISOString().split("T")[0]
  }));

  // Edit Unit Form State
  const [editUnitForm, setEditUnitForm] = useState({
    name: "",
    location: "",
    initialPrice: "",
    installDate: ""
  });

  // Log Form State
  const [logForm, setLogForm] = useState({
    partRepaired: "",
    quantity: "1",
    pricePerQty: "",
    date: new Date().toISOString().split("T")[0],
    technician: "",
    notes: ""
  });

  // Edit Log Form State
  const [editLogForm, setEditLogForm] = useState({
    partRepaired: "",
    quantity: "1",
    pricePerQty: "",
    date: "",
    technician: "",
    notes: ""
  });

  const getIcon = (iconName) => {
    const IconComponent = FaIcons[iconName];
    return IconComponent ? <IconComponent /> : <FaIcons.FaTools />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getROStats = (ro) => {
    if (!ro) return { totalRepairsCost: 0, totalInvested: 0, repairsCount: 0 };
    const totalRepairsCost = (ro.history || []).reduce((sum, item) => sum + item.totalAmount, 0);
    const totalInvested = (ro.initialPrice || 0) + totalRepairsCost;
    const repairsCount = (ro.history || []).length;
    return { totalRepairsCost, totalInvested, repairsCount };
  };

  // Submission Handlers
  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    addMaintenanceCategory(catForm.name.trim(), catForm.icon);
    setSuccessMessage(`Category "${catForm.name.trim()}" created successfully!`);
    setCatForm({ name: "", icon: "FaTools" });
    setShowAddCatModal(false);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleUnitSubmit = (e) => {
    e.preventDefault();
    if (!unitForm.name.trim() || !selectedCategory) return;
    addMaintenanceSubcategory(
      selectedCategory,
      unitForm.name.trim(),
      unitForm.location.trim(),
      parseFloat(unitForm.initialPrice || 0),
      unitForm.installDate
    );
    setSuccessMessage(`Asset "${unitForm.name.trim()}" registered successfully!`);
    setUnitForm({
      name: "",
      location: "",
      initialPrice: "",
      installDate: new Date().toISOString().split("T")[0]
    });
    setShowAddUnitModal(false);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleEditUnitSubmit = (e) => {
    e.preventDefault();
    if (!editUnitForm.name.trim() || !editUnitForm.location.trim() || !selectedRoId) return;
    updateMaintenanceUnitDetails(selectedRoId, {
      name: editUnitForm.name.trim(),
      location: editUnitForm.location.trim(),
      initialPrice: parseFloat(editUnitForm.initialPrice || 0),
      installDate: editUnitForm.installDate
    });
    setSuccessMessage(`Unit details updated successfully!`);
    setShowEditUnitModal(false);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logForm.partRepaired || !logForm.pricePerQty || !logForm.technician || !selectedRoId) return;

    addMaintenanceLog(selectedRoId, {
      partRepaired: logForm.partRepaired,
      quantity: parseInt(logForm.quantity || 1),
      pricePerQty: parseFloat(logForm.pricePerQty || 0),
      date: logForm.date,
      technician: logForm.technician,
      notes: logForm.notes
    });

    setLogForm({
      partRepaired: "",
      quantity: "1",
      pricePerQty: "",
      date: new Date().toISOString().split("T")[0],
      technician: "",
      notes: ""
    });

    setShowAddLogModal(false);
    setSuccessMessage(`Maintenance activity logged successfully!`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleEditLogSubmit = (e) => {
    e.preventDefault();
    if (!editLogForm.partRepaired || !editLogForm.pricePerQty || !editLogForm.technician || !selectedRoId || !editingLogId) return;

    updateMaintenanceLog(selectedRoId, editingLogId, {
      partRepaired: editLogForm.partRepaired,
      quantity: parseInt(editLogForm.quantity || 1),
      pricePerQty: parseFloat(editLogForm.pricePerQty || 0),
      date: editLogForm.date,
      technician: editLogForm.technician,
      notes: editLogForm.notes
    });

    setShowEditLogModal(false);
    setEditingLogId(null);
    setSuccessMessage(`Maintenance log updated successfully!`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };



  const handleGeneratePDFReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker is enabled! Please allow popups to generate the PDF report.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Facility Maintenance Report</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b; background-color: #ffffff; }
            h1 { font-size: 26px; font-weight: 800; color: #1e3a8a; margin: 0 0 5px 0; }
            .date { font-size: 13px; color: #64748b; margin-bottom: 25px; }
            .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 30px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background-color: #f8fafc; }
            .stat-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }
            .stat-value { font-size: 20px; font-weight: 800; margin-top: 6px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px 10px; text-align: left; font-size: 13px; }
            th { background-color: #f1f5f9; font-weight: 700; color: #475569; }
            .status-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
            .status-active { background-color: #d1fae5; color: #065f46; }
            .status-repair { background-color: #fef3c7; color: #92400e; }
            .status-service { background-color: #fee2e2; color: #991b1b; }
            .status-decom { background-color: #f1f5f9; color: #334155; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <!-- Institution Header Banner -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              ${collegeInfo?.logo ? `
                <img src="${collegeInfo.logo}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; border: 1px solid #e2e8f0; padding: 5px; border-radius: 8px;" />
              ` : `
                <div style="width: 60px; height: 60px; background: linear-gradient(to bottom right, #1e3a8a, #3b82f6); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px; border-radius: 8px;">
                  ${(collegeInfo?.name ? collegeInfo.name[0] : 'C')}
                </div>
              `}
              <div>
                <h2 style="font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0;">${collegeInfo?.name || "RJ Institute of Technology"}</h2>
                <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">${collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
                <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">Email: ${collegeInfo?.email || "info@rjit.edu.in"} | Web: ${collegeInfo?.website || "www.rjit.edu.in"}</p>
              </div>
            </div>
            <div style="text-align: right;">
              <span style="background-color: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-size: 9px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                Maintenance Center
              </span>
            </div>
          </div>

          <h1>Facility Maintenance Report</h1>
          <div class="date">Generated on: ${new Date().toLocaleString()} | Scope: ${selectedCategory ? selectedCategory : 'All Categories'}</div>
          
          <div class="section-title">Summary Statistics</div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Assets</div>
              <div class="stat-value">${totalAssetsCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Cumulative Investment</div>
              <div class="stat-value">₹${totalInvestmentAmount.toLocaleString("en-IN")}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Pending Maintenance</div>
              <div class="stat-value">${pendingRepairsCount}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Avg. Service Cost</div>
              <div class="stat-value">₹${avgRepairCostAmount.toLocaleString("en-IN", {maximumFractionDigits: 0})}</div>
            </div>
          </div>

          <div class="section-title">Asset Inventory Details</div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 25%">Name</th>
                <th style="width: 25%">Location</th>
                <th style="width: 15%">Status</th>
                <th style="width: 10%">Purchase Cost</th>
                <th style="width: 10%">Servicing Count</th>
                <th style="width: 10%">Servicing Cost</th>
              </tr>
            </thead>
            <tbody>
              ${statsScopeUnits.map((u, i) => {
                const stats = getROStats(u);
                let statusClass = 'status-active';
                if (u.status === 'Under Repair') statusClass = 'status-repair';
                else if (u.status === 'Needs Service') statusClass = 'status-service';
                else if (u.status === 'Decommissioned') statusClass = 'status-decom';
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.location}</td>
                    <td><span class="status-badge ${statusClass}">${u.status}</span></td>
                    <td>₹${u.initialPrice.toLocaleString("en-IN")}</td>
                    <td>${stats.repairsCount}</td>
                    <td>₹${stats.totalRepairsCost.toLocaleString("en-IN")}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setSuccessMessage("PDF Print job initiated successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleGenerateExcelReport = async () => {
    const rows = statsScopeUnits.map(u => {
      const stats = getROStats(u);
      return [
        u.name,
        u.location,
        u.status,
        Number(u.initialPrice),
        Number(stats.repairsCount),
        Number(stats.totalRepairsCost),
        Number(stats.totalInvested)
      ];
    });

    const collegeName = collegeInfo?.name || "RJ Institute of Technology";
    const collegeAddress = collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi";
    const collegeDetails = `Phone: ${collegeInfo?.phone || "+91 11 2690 7400"} | Email: ${collegeInfo?.email || "info@rjit.edu.in"} | Web: ${collegeInfo?.website || "www.rjit.edu.in"}`;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Maintenance Report");

      // Enable gridlines
      worksheet.views = [{ showGridLines: true }];

      // Row 1: College Title
      const titleRow = worksheet.getRow(1);
      titleRow.getCell(1).value = collegeName;
      worksheet.mergeCells("A1:G1");
      titleRow.getCell(1).font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        titleRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; // Blue theme
      }
      worksheet.getRow(1).height = 40;

      // Row 2: Address
      const addrRow = worksheet.getRow(2);
      addrRow.getCell(1).value = collegeAddress;
      worksheet.mergeCells("A2:G2");
      addrRow.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
      addrRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        addrRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      worksheet.getRow(2).height = 20;

      // Row 3: Contact Details
      const contactRow = worksheet.getRow(3);
      contactRow.getCell(1).value = collegeDetails;
      worksheet.mergeCells("A3:G3");
      contactRow.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
      contactRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        contactRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      worksheet.getRow(3).height = 20;

      // Row 4: Report Name
      const reportNameRow = worksheet.getRow(4);
      reportNameRow.getCell(1).value = "FACILITY MAINTENANCE REPORT";
      worksheet.mergeCells("A4:G4");
      reportNameRow.getCell(1).font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF1E40AF" } };
      reportNameRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        reportNameRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
      }
      worksheet.getRow(4).height = 30;

      // Row 5: Metadata
      const metaRow = worksheet.getRow(5);
      metaRow.getCell(1).value = `Scope: ${selectedCategory ? selectedCategory : 'All Categories'} | Generated on: ${new Date().toLocaleString()}`;
      worksheet.mergeCells("A5:G5");
      metaRow.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748B" } };
      metaRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(5).height = 20;

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

      // Summary Statistics (KPI Block)
      worksheet.getRow(7).getCell(1).value = "Summary Statistics";
      worksheet.mergeCells("A7:C7");
      worksheet.getRow(7).getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
      worksheet.getRow(7).getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
      
      const stats = [
        ["Total Assets", totalAssetsCount, ""],
        ["Cumulative Investment", totalInvestmentAmount, "INR"],
        ["Pending Maintenance", pendingRepairsCount, ""],
        ["Average Service Cost", avgRepairCostAmount, "INR"]
      ];

      let statRowIndex = 8;
      const statLabelStyle = { font: { name: "Calibri", size: 10, bold: true }, fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } } };
      
      stats.forEach(stat => {
        const row = worksheet.getRow(statRowIndex);
        row.getCell(1).value = stat[0];
        row.getCell(1).font = statLabelStyle.font;
        row.getCell(1).fill = statLabelStyle.fill;
        worksheet.mergeCells(`A${statRowIndex}:B${statRowIndex}`);

        row.getCell(3).value = Number(stat[1]);
        row.getCell(3).font = { name: "Calibri", size: 10, bold: true };
        row.getCell(3).alignment = { horizontal: stat[2] === "INR" ? "right" : "center" };
        if (stat[2] === "INR") {
          row.getCell(3).numFmt = '"₹"#,##0.00';
        }
        
        statRowIndex++;
      });

      // Space before asset inventory
      let startTableIndex = 14;
      worksheet.getRow(startTableIndex).getCell(1).value = "Asset Inventory Details";
      worksheet.mergeCells(`A${startTableIndex}:G${startTableIndex}`);
      worksheet.getRow(startTableIndex).getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
      worksheet.getRow(startTableIndex).getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
      startTableIndex++;

      // Header row
      const headers = [
        "Asset Name", "Location", "Status", 
        "Purchase Cost (INR)", "Servicing Count", "Cumulative Servicing Cost (INR)", "Total Invested (INR)"
      ];
      worksheet.getRow(startTableIndex).values = headers;

      const borderStyle = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };

      // Style header
      const headerRow = worksheet.getRow(startTableIndex);
      headerRow.height = 28;
      for (let c = 1; c <= 7; c++) {
        const cell = headerRow.getCell(c);
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = borderStyle;
      }
      startTableIndex++;

      // Data Rows
      rows.forEach(rowValues => {
        const row = worksheet.getRow(startTableIndex);
        row.values = rowValues;
        row.height = 20;

        row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(3).alignment = { vertical: "middle", horizontal: "center" };
        
        row.getCell(4).alignment = { vertical: "middle", horizontal: "right" };
        row.getCell(4).numFmt = '"₹"#,##0.00';

        row.getCell(5).alignment = { vertical: "middle", horizontal: "center" };
        row.getCell(5).numFmt = "#,##0";

        row.getCell(6).alignment = { vertical: "middle", horizontal: "right" };
        row.getCell(6).numFmt = '"₹"#,##0.00';

        row.getCell(7).alignment = { vertical: "middle", horizontal: "right" };
        row.getCell(7).numFmt = '"₹"#,##0.00';

        for (let c = 1; c <= 7; c++) {
          row.getCell(c).border = borderStyle;
          row.getCell(c).font = { name: "Calibri", size: 10 };
        }
        startTableIndex++;
      });

      // Columns widths: name, location, status, purchase, count, service cost, total
      const colWidths = [32, 25, 18, 20, 15, 32, 22];
      colWidths.forEach((width, index) => {
        worksheet.getColumn(index + 1).width = width;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Facility_Maintenance_Report_${selectedCategory || 'All'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Excel Spreadsheet downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to generate excel sheet: ", err);
      setSuccessMessage("❌ Failed to compile excel sheet.");
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  const handleDeleteCategory = (e, catId, catName) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: "Delete Category",
      message: `Are you sure you want to delete the category "${catName}" and all of its registered asset units?`,
      onConfirm: () => {
        deleteMaintenanceCategory(catId);
        if (selectedCategory === catId) {
          setSelectedCategory(null);
          setSelectedRoId(null);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSuccessMessage(`Category "${catName}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      },
      type: "danger"
    });
  };

  const handleDeleteUnit = (e, roId, roName) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setConfirmDialog({
      isOpen: true,
      title: "Delete Asset Unit",
      message: `Are you sure you want to delete the asset unit "${roName}" and its servicing logs?`,
      onConfirm: () => {
        deleteMaintenanceSubcategory(roId);
        if (selectedRoId === roId) {
          setSelectedRoId(null);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSuccessMessage(`Asset unit "${roName}" deleted successfully!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      },
      type: "danger"
    });
  };

  const handleDeleteLog = (logId, partRepaired) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Maintenance Log",
      message: `Are you sure you want to delete the maintenance record for "${partRepaired}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteMaintenanceLog(selectedRoId, logId);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setSuccessMessage(`Maintenance log entry deleted!`);
        setTimeout(() => setSuccessMessage(""), 4000);
      },
      type: "danger"
    });
  };

  const handleOpenEditUnit = (unit) => {
    setSelectedRoId(unit.id);
    setEditUnitForm({
      name: unit.name,
      location: unit.location,
      initialPrice: unit.initialPrice.toString(),
      installDate: unit.installDate
    });
    setShowEditUnitModal(true);
  };

  const handleOpenEditLog = (log) => {
    setEditingLogId(log.id);
    setEditLogForm({
      partRepaired: log.partRepaired,
      quantity: log.quantity.toString(),
      pricePerQty: log.pricePerQty.toString(),
      date: log.date,
      technician: log.technician,
      notes: log.notes || ""
    });
    setShowEditLogModal(true);
  };

  const handleStatusChange = (status) => {
    updateMaintenanceUnitStatus(selectedRoId, status);
    setSuccessMessage(`Asset status changed to "${status}"`);
    setTimeout(() => setSuccessMessage(""), 4500);
  };

  const handleExportLogsCSV = async (unit) => {
    if (!unit || !unit.history || unit.history.length === 0) {
      alert("No logs to export!");
      return;
    }

    const collegeName = collegeInfo?.name || "RJ Institute of Technology";
    const collegeAddress = collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi";
    const collegeDetails = `Phone: ${collegeInfo?.phone || "+91 11 2690 7400"} | Email: ${collegeInfo?.email || "info@rjit.edu.in"} | Web: ${collegeInfo?.website || "www.rjit.edu.in"}`;

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Asset Maintenance Logs");

      // Enable gridlines
      worksheet.views = [{ showGridLines: true }];

      // Row 1: College Title
      const titleRow = worksheet.getRow(1);
      titleRow.getCell(1).value = collegeName;
      worksheet.mergeCells("A1:G1");
      titleRow.getCell(1).font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        titleRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } }; // Blue theme
      }
      worksheet.getRow(1).height = 40;

      // Row 2: Address
      const addrRow = worksheet.getRow(2);
      addrRow.getCell(1).value = collegeAddress;
      worksheet.mergeCells("A2:G2");
      addrRow.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
      addrRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        addrRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      worksheet.getRow(2).height = 20;

      // Row 3: Contact Details
      const contactRow = worksheet.getRow(3);
      contactRow.getCell(1).value = collegeDetails;
      worksheet.mergeCells("A3:G3");
      contactRow.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF475569" } };
      contactRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        contactRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
      worksheet.getRow(3).height = 20;

      // Row 4: Asset Details Banner
      const assetBannerRow = worksheet.getRow(4);
      assetBannerRow.getCell(1).value = `MAINTENANCE LOG REGISTRY - ${unit.name.toUpperCase()}`;
      worksheet.mergeCells("A4:G4");
      assetBannerRow.getCell(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF1E40AF" } };
      assetBannerRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      for (let c = 1; c <= 7; c++) {
        assetBannerRow.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF6FF" } };
      }
      worksheet.getRow(4).height = 30;

      // Row 5: Metadata (Location / Status)
      const metaRow = worksheet.getRow(5);
      metaRow.getCell(1).value = `Location: ${unit.location} | Current Status: ${unit.status} | Generated: ${new Date().toLocaleString()}`;
      worksheet.mergeCells("A5:G5");
      metaRow.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748B" } };
      metaRow.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
      metaRow.height = 20;

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

      // Space before log table
      let startTableIndex = 7;
      
      // Header row
      const headers = ["Date", "Part Repaired", "Quantity", "Price Per Qty (INR)", "Total Amount (INR)", "Technician", "Notes"];
      worksheet.getRow(startTableIndex).values = headers;

      const borderStyle = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };

      // Style header
      const headerRow = worksheet.getRow(startTableIndex);
      headerRow.height = 28;
      for (let c = 1; c <= 7; c++) {
        const cell = headerRow.getCell(c);
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = borderStyle;
      }
      startTableIndex++;

      // Data Rows
      unit.history.forEach(log => {
        const row = worksheet.getRow(startTableIndex);
        row.values = [
          log.date,
          log.partRepaired,
          Number(log.quantity),
          Number(log.pricePerQty),
          Number(log.totalAmount),
          log.technician,
          log.notes || ""
        ];
        row.height = 20;

        row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };
        
        row.getCell(3).alignment = { vertical: "middle", horizontal: "center" };
        row.getCell(3).numFmt = "#,##0";

        row.getCell(4).alignment = { vertical: "middle", horizontal: "right" };
        row.getCell(4).numFmt = '"₹"#,##0.00';

        row.getCell(5).alignment = { vertical: "middle", horizontal: "right" };
        row.getCell(5).numFmt = '"₹"#,##0.00';

        row.getCell(6).alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(7).alignment = { vertical: "middle", horizontal: "left" };

        for (let c = 1; c <= 7; c++) {
          row.getCell(c).border = borderStyle;
          row.getCell(c).font = { name: "Calibri", size: 10 };
        }
        startTableIndex++;
      });

      // Columns widths: date, part, qty, price, total, tech, notes
      const colWidths = [18, 25, 12, 20, 20, 22, 35];
      colWidths.forEach((width, index) => {
        worksheet.getColumn(index + 1).width = width;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${unit.name.replace(/\s+/g, "_")}_maintenance_logs.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Excel Spreadsheet downloaded successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to generate excel sheet: ", err);
      setSuccessMessage("❌ Failed to compile excel sheet.");
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    let list = maintenanceLogs;
    if (selectedCategory) {
      list = list.filter(ro => ro.category === selectedCategory);
    }
    
    if (assetSearch.trim()) {
      const q = assetSearch.toLowerCase();
      list = list.filter(ro => 
        ro.name.toLowerCase().includes(q) || 
        ro.location.toLowerCase().includes(q)
      );
    }

    if (assetStatusFilter !== "all") {
      list = list.filter(ro => ro.status === assetStatusFilter);
    }

    return list;
  }, [maintenanceLogs, selectedCategory, assetSearch, assetStatusFilter]);

  // Selected Unit & logs filtering
  const currentRO = useMemo(() => {
    return maintenanceLogs.find(ro => ro.id === selectedRoId);
  }, [maintenanceLogs, selectedRoId]);

  const uniqueTechnicians = useMemo(() => {
    if (!currentRO || !currentRO.history) return [];
    const techs = currentRO.history.map(log => log.technician).filter(Boolean);
    return Array.from(new Set(techs));
  }, [currentRO]);

  const processedLogs = useMemo(() => {
    if (!currentRO || !currentRO.history) return [];
    
    let list = currentRO.history.filter(log => {
      const searchLower = logSearch.toLowerCase();
      return (
        (log.partRepaired || "").toLowerCase().includes(searchLower) ||
        (log.technician || "").toLowerCase().includes(searchLower) ||
        (log.notes || "").toLowerCase().includes(searchLower)
      );
    });
    
    if (logTechFilter !== "all") {
      list = list.filter(log => log.technician === logTechFilter);
    }
    
    list.sort((a, b) => {
      if (logSort === "date-desc") {
        return new Date(b.date) - new Date(a.date);
      } else if (logSort === "date-asc") {
        return new Date(a.date) - new Date(b.date);
      } else if (logSort === "cost-desc") {
        return b.totalAmount - a.totalAmount;
      } else if (logSort === "cost-asc") {
        return a.totalAmount - b.totalAmount;
      } else if (logSort === "qty-desc") {
        return b.quantity - a.quantity;
      } else if (logSort === "qty-asc") {
        return a.quantity - b.quantity;
      }
      return 0;
    });
    
    return list;
  }, [currentRO, logSearch, logTechFilter, logSort]);

  // Overview Statistics Calculations (Context dependent: based on selection or whole system)
  const statsScopeUnits = useMemo(() => {
    return selectedCategory 
      ? maintenanceLogs.filter(u => u.category === selectedCategory)
      : maintenanceLogs;
  }, [maintenanceLogs, selectedCategory]);

  const totalAssetsCount = statsScopeUnits.length;
  
  const totalInvestmentAmount = useMemo(() => {
    return statsScopeUnits.reduce((sum, u) => {
      const initialPrice = u.initialPrice || 0;
      const historyCost = (u.history || []).reduce((s, h) => s + (h.totalAmount || 0), 0);
      return sum + initialPrice + historyCost;
    }, 0);
  }, [statsScopeUnits]);

  const pendingRepairsCount = useMemo(() => {
    return statsScopeUnits.filter(u => u.status === "Needs Service" || u.status === "Under Repair").length;
  }, [statsScopeUnits]);

  const avgRepairCostAmount = useMemo(() => {
    const totalRepairsCount = statsScopeUnits.reduce((sum, u) => sum + (u.history || []).length, 0);
    const totalRepairsCost = statsScopeUnits.reduce(
      (sum, u) => sum + (u.history || []).reduce((s, h) => s + (h.totalAmount || 0), 0), 0
    );
    return totalRepairsCount > 0 ? totalRepairsCost / totalRepairsCount : 0;
  }, [statsScopeUnits]);

  const getStatusStyle = (status) => {
    const normalized = (status || "Active").toLowerCase();
    switch (normalized) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border border-emerald-250";
      case "under repair":
        return "bg-amber-50 text-amber-700 border border-amber-250";
      case "needs service":
        return "bg-rose-50 text-rose-700 border border-rose-250";
      case "decommissioned":
        return "bg-slate-100 text-slate-650 border border-slate-350";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-200";
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(status)}`}>
        {status}
      </span>
    );
  };



  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-6 font-sans">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <FaIcons.FaWrench className="text-blue-600 animate-pulse" />
            <span>Asset Maintenance Center</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track maintenance, repair history, parts replacement and cumulative costing of institutional assets.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl shadow-sm transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaIcons.FaCheckCircle className="text-emerald-600 text-lg shrink-0" />
              <span className="font-semibold text-sm">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-850 hover:text-emerald-950 font-bold text-lg cursor-pointer">
              <FaIcons.FaTimes />
            </button>
          </div>
        )}

        {/* 1. Quick Actions Section */}
        <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FaIcons.FaBolt className="text-blue-500" />
            <span>Quick Actions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button 
              onClick={() => setShowAddUnitModal(true)}
              className="flex items-center justify-between p-4 bg-slate-55 hover:bg-blue-50/45 border border-slate-200/60 rounded-xl transition group text-left cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm shadow">
                  <FaIcons.FaPlus />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Register Asset</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Add new asset</p>
                </div>
              </div>
              <FaIcons.FaChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform text-xs" />
            </button>

            <button 
              onClick={() => setShowReportFormatModal(true)}
              className="flex items-center justify-between p-4 bg-slate-55 hover:bg-purple-50/45 border border-slate-200/60 rounded-xl transition group text-left cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm shadow">
                  <FaIcons.FaFileAlt />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Generate Report</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Download report</p>
                </div>
              </div>
              <FaIcons.FaChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform text-xs" />
            </button>

          </div>
        </div>

        {/* 2. Middle Row: Asset Categories (left) & Overview Statistics (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Left panel: Asset Categories */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-bold text-slate-800">Asset Categories</h2>
                <button 
                  onClick={() => setShowAddCatModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Manage Categories
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {maintenanceCategories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const categoryUnits = maintenanceLogs.filter(ro => ro.category === cat.id);
                  const count = categoryUnits.length;
                  
                  // Compute investment cost for category
                  const investment = categoryUnits.reduce((sum, u) => {
                    const costStats = getROStats(u);
                    return sum + u.initialPrice + costStats.totalRepairsCost;
                  }, 0);

                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                        setSelectedRoId(null);
                        setAssetSearch("");
                      }}
                      className={`p-4 rounded-xl border transition-all duration-300 relative flex flex-col justify-between cursor-pointer group ${
                        isActive
                          ? "bg-gradient-to-br from-blue-600 to-indigo-650 text-white border-transparent shadow-[0_8px_25px_-4px_rgba(37,99,235,0.35)]"
                          : "bg-slate-50/50 hover:bg-slate-50 text-slate-800 border-slate-200/70 hover:border-blue-400 hover:shadow-sm"
                      }`}
                    >
                      {/* Active indicator checkmark */}
                      {isActive && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-white text-blue-600 rounded-full flex items-center justify-center text-[10px] shadow font-bold">
                          <FaIcons.FaCheck />
                        </div>
                      )}

                      <div>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-3 border ${
                          isActive 
                            ? "bg-white text-blue-600 border-transparent shadow-sm" 
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {getIcon(cat.icon)}
                        </div>
                        <h3 className="font-extrabold text-sm tracking-tight">{cat.name}</h3>
                        <p className={`text-xs mt-1 font-semibold ${isActive ? "text-blue-100" : "text-slate-500"}`}>
                          {count} Unit{count !== 1 && "s"}
                        </p>
                        <p className={`text-[10px] mt-0.5 font-bold ${isActive ? "text-blue-200" : "text-slate-400"}`}>
                          {formatCurrency(investment)} Invested
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-current/10 flex items-center gap-1 text-[10px] font-bold">
                        <span>View Assets</span>
                        <FaIcons.FaArrowRight className="text-[8px] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}

                {/* Add new category dotted card */}
                <div
                  onClick={() => setShowAddCatModal(true)}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/20 hover:bg-blue-50/5 transition cursor-pointer text-slate-400 hover:text-blue-600 text-center min-h-[135px]"
                >
                  <FaIcons.FaPlus className="text-lg mb-1" />
                  <span className="font-bold text-xs">Add New Category</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Create a new asset category</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Overview Statistics */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-4">
                Overview Statistics {selectedCategory ? `- ${selectedCategory}` : ""}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Total Assets KPI */}
                <div className="p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-200/50 flex flex-col justify-between min-h-[90px] relative shadow-sm hover:shadow transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                      <FaIcons.FaBoxes />
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <FaIcons.FaArrowUp className="text-[7px]" /> 12%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Assets</span>
                    <span className="text-lg font-black text-slate-800">{totalAssetsCount}</span>
                  </div>
                </div>

                {/* Total Investment KPI */}
                <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-200/50 flex flex-col justify-between min-h-[90px] relative shadow-sm hover:shadow transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                      <FaIcons.FaRupeeSign />
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <FaIcons.FaArrowUp className="text-[7px]" /> 8%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Investment</span>
                    <span className="text-sm font-black text-slate-800 block truncate">{formatCurrency(totalInvestmentAmount)}</span>
                  </div>
                </div>

                {/* Pending Repairs KPI */}
                <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-200/50 flex flex-col justify-between min-h-[90px] relative shadow-sm hover:shadow transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${pendingRepairsCount > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                      <FaIcons.FaExclamationTriangle />
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      - 0%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Pending Repairs</span>
                    <span className={`text-lg font-black ${pendingRepairsCount > 0 ? "text-amber-600 animate-pulse" : "text-slate-800"}`}>
                      {pendingRepairsCount}
                    </span>
                  </div>
                </div>

                {/* Avg Repair Cost KPI */}
                <div className="p-3.5 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 rounded-xl border border-purple-200/50 flex flex-col justify-between min-h-[90px] relative shadow-sm hover:shadow transition duration-200">
                  <div className="flex justify-between items-start">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs">
                      <FaIcons.FaWrench />
                    </div>
                    <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                      <FaIcons.FaArrowUp className="text-[7px]" /> 5%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Avg. Cost per Repair</span>
                    <span className="text-lg font-black text-slate-800">{formatCurrency(avgRepairCostAmount)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* 3. Section Title, Search, Filter & Grid */}
        {selectedCategory && (
          <div className="mb-8 animate-fade-in">
            
            {/* Header section with Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-slate-200/70 pb-4">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <span>Registered Assets - {maintenanceCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
              </h2>
              
              {/* Toolbar */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaIcons.FaSearch className="text-xs" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                  {assetSearch && (
                    <button 
                      onClick={() => setAssetSearch("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                    >
                      <FaIcons.FaTimes className="text-xs" />
                    </button>
                  )}
                </div>

                {/* Filter Trigger button */}
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`px-3 py-2 border rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm ${
                    showFiltersPanel || assetStatusFilter !== "all"
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FaIcons.FaFilter className="text-[10px]" />
                  <span>Filter</span>
                </button>

                {/* Register Asset unit button */}
                <button
                  onClick={() => setShowAddUnitModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                >
                  <FaIcons.FaPlus /> Register Asset Unit
                </button>
              </div>
            </div>

            {/* Filter Toggle Panel */}
            {showFiltersPanel && (
              <div className="bg-white border border-slate-200/80 p-4 rounded-2xl mb-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-down">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Operational Status
                  </label>
                  <select
                    value={assetStatusFilter}
                    onChange={(e) => setAssetStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-slate-650"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Under Repair">Under Repair</option>
                    <option value="Needs Service">Needs Service</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>
            )}

            {/* Asset Cards Grid */}
            {filteredAssets.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 shadow-sm border-dashed">
                <FaIcons.FaBoxes className="text-4xl mx-auto mb-2 text-slate-300" />
                <h4 className="font-extrabold text-slate-700">No Asset Units Found</h4>
                <p className="text-xs mt-1">There are no asset sub-units matching your query registered in this category.</p>
                <button
                  onClick={() => setShowAddUnitModal(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <FaIcons.FaPlus /> Register Asset Unit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredAssets.map((ro) => {
                  const isSelected = selectedRoId === ro.id;
                  const { repairsCount } = getROStats(ro);
                  const isMenuOpen = activeMenuCardId === ro.id;
                  
                  return (
                    <div
                      key={ro.id}
                      onClick={() => {
                        setSelectedRoId(ro.id);
                      }}
                      className={`rounded-2xl border-2 transition-all duration-300 relative shadow-sm flex flex-col justify-between overflow-visible group cursor-pointer ${
                        isSelected
                          ? "bg-blue-50/50 border-blue-600 ring-4 ring-blue-500/10 shadow-md scale-[1.02]"
                          : "bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      {/* Top section: Icon & status pill, three dots menu */}
                      <div className="p-4 pb-0 flex justify-between items-center relative overflow-visible">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs shrink-0">
                            {getIcon(maintenanceCategories.find(c => c.id === selectedCategory)?.icon)}
                          </div>
                          {getStatusBadge(ro.status)}
                          {isSelected && (
                            <span className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm animate-pulse flex items-center gap-0.5">
                              <FaIcons.FaCheck className="text-[7px]" /> Selected
                            </span>
                          )}
                        </div>
                        
                        {/* Options button */}
                        <div className="relative overflow-visible">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuCardId(isMenuOpen ? null : ro.id);
                            }}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-100 transition cursor-pointer"
                            title="Actions Menu"
                          >
                            <FaIcons.FaEllipsisV className="text-[10px]" />
                          </button>
                          
                          {/* Options menu dropdown */}
                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs animate-scale-up font-semibold text-slate-700">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuCardId(null);
                                  handleOpenEditUnit(ro);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <FaIcons.FaPen className="text-[10px] text-slate-400" />
                                <span>Edit Details</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuCardId(null);
                                  handleDeleteUnit(e, ro.id, ro.name);
                                }}
                                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                              >
                                <FaIcons.FaTrash className="text-[10px]" />
                                <span>Delete Unit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle section: Asset Name & location */}
                      <div className="p-4 pt-3 flex-1">
                        <h3 className="font-black text-slate-900 tracking-tight text-sm line-clamp-1">
                          {ro.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                          <FaIcons.FaMapMarkerAlt className="shrink-0 text-[10px]" />
                          <span className="line-clamp-1">{ro.location}</span>
                        </div>
                      </div>

                      {/* Info columns section: Cost & Services */}
                      <div className="px-4 pb-4 grid grid-cols-2 border-b border-slate-100 gap-2">
                        <div>
                          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Cost</span>
                          <span className="text-xs font-black text-slate-800 mt-0.5 block">{formatCurrency(ro.initialPrice)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Services</span>
                          <span className="text-xs font-black text-slate-800 mt-0.5 block">
                            {repairsCount} Service{repairsCount !== 1 && "s"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom row: Button bar */}
                      <div className="text-xs font-bold text-slate-650 bg-slate-50/50 rounded-b-2xl">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoId(ro.id);
                            // Scroll to logs table
                            setTimeout(() => {
                              document.getElementById("service-logs-section")?.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }}
                          className="w-full py-2.5 text-center hover:bg-slate-100 hover:text-slate-800 transition rounded-b-2xl cursor-pointer"
                        >
                          Service History
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Selected Asset Logs History Drawer/Container */}
            {selectedRoId && currentRO && (
              <div id="service-logs-section" className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in scroll-mt-6">
                
                {/* Left panel: Specifications and Cost analysis */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-fit gap-5">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative">
                      <div className="flex items-center gap-3 min-w-0 pr-8">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0 border border-blue-100">
                          {getIcon(maintenanceCategories.find(c => c.id === selectedCategory)?.icon)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-lg truncate" title={currentRO.name}>{currentRO.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                            <FaIcons.FaMapMarkerAlt /> {currentRO.location}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedRoId(null)}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg border border-slate-100 transition cursor-pointer"
                        title="Close Detail Drawer"
                      >
                        <FaIcons.FaTimes />
                      </button>
                    </div>

                    {/* Operational Status selection drop */}
                    <div className="mt-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Operational Status
                      </label>
                      <select
                        value={currentRO.status || "Active"}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700"
                      >
                        <option value="Active">🟢 Active</option>
                        <option value="Under Repair">🟡 Under Repair</option>
                        <option value="Needs Service">🔴 Needs Service</option>
                        <option value="Decommissioned">⚪ Decommissioned</option>
                      </select>
                    </div>

                    {/* Cost summary table */}
                    <div className="mt-5 space-y-3">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50 text-sm">
                        <span className="text-slate-500">Installation Date</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <FaIcons.FaCalendarAlt className="text-slate-400 text-xs" /> {currentRO.installDate}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50 text-sm">
                        <span className="text-slate-500">Initial Bought Price</span>
                        <span className="font-bold text-slate-800">{formatCurrency(currentRO.initialPrice)}</span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-50 text-sm">
                        <span className="text-slate-500">Cumulative Repair Costs</span>
                        <span className="font-extrabold text-blue-600">
                          {formatCurrency(getROStats(currentRO).totalRepairsCost)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-slate-650 font-semibold">Total Cost Invested</span>
                        <span className="font-black text-slate-900 text-base">
                          {formatCurrency(getROStats(currentRO).totalInvested)}
                        </span>
                      </div>
                    </div>

                    {/* MCR bar */}
                    {(() => {
                      const { totalRepairsCost } = getROStats(currentRO);
                      const ratio = currentRO.initialPrice > 0 ? (totalRepairsCost / currentRO.initialPrice) * 100 : 0;
                      
                      let barColor = "bg-emerald-500";
                      if (ratio >= 40 && ratio < 80) barColor = "bg-amber-500";
                      else if (ratio >= 80) barColor = "bg-rose-500";
                      
                      return (
                        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                            <span>Maintenance-to-Asset Ratio</span>
                            <span className={ratio >= 100 ? "text-rose-600 font-extrabold animate-pulse" : "text-slate-700"}>
                              {ratio.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${barColor} transition-all duration-500 ${ratio >= 100 ? "animate-pulse" : ""}`}
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                          </div>
                          {ratio >= 100 && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1.5 animate-pulse">
                              <FaIcons.FaExclamationTriangle className="shrink-0" /> Repairs exceed initial price!
                            </p>
                          )}
                        </div>
                      );
                    })()}

                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setShowAddLogModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow hover:shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <FaIcons.FaPlus />
                      <span>Log Repair Activity</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteUnit(e, currentRO.id, currentRO.name)}
                      className="w-full bg-white hover:bg-red-50 text-red-650 hover:text-red-750 border border-red-200 hover:border-red-300 font-semibold py-2.5 px-4 rounded-xl transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer text-sm"
                    >
                      <FaIcons.FaTrash className="text-xs" />
                      <span>Delete Asset Unit</span>
                    </button>
                  </div>
                </div>

                {/* Right panel: Servicing Logs Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                  <div>
                    {/* Log table header & export */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 mb-4 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 self-start sm:self-center">
                        <FaIcons.FaHistory className="text-slate-400 shrink-0" />
                        <span>Maintenance & Servicing Log</span>
                      </h3>
                      <button
                        onClick={() => handleExportLogsCSV(currentRO)}
                        className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-1.5 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-slate-200"
                      >
                        <FaIcons.FaFileExcel className="text-[10px]" /> Export Excel
                      </button>
                    </div>

                    {/* Table Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {/* Search */}
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <FaIcons.FaSearch className="text-xs" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search logs..."
                          value={logSearch}
                          onChange={(e) => setLogSearch(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-blue-500"
                        />
                        {logSearch && (
                          <button 
                            onClick={() => setLogSearch("")}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-655"
                          >
                            <FaIcons.FaTimes className="text-xs" />
                          </button>
                        )}
                      </div>

                      {/* Filter by Tech */}
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0">Tech:</span>
                        <select
                          value={logTechFilter}
                          onChange={(e) => setLogTechFilter(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-semibold text-slate-700"
                        >
                          <option value="all">All Technicians</option>
                          {uniqueTechnicians.map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sort by */}
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0">Sort:</span>
                        <select
                          value={logSort}
                          onChange={(e) => setLogSort(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-blue-500 cursor-pointer font-semibold text-slate-700"
                        >
                          <option value="date-desc">🗓️ Date: Newest First</option>
                          <option value="date-asc">🗓️ Date: Oldest First</option>
                          <option value="cost-desc">💰 Cost: Highest First</option>
                          <option value="cost-asc">💰 Cost: Lowest First</option>
                          <option value="qty-desc">📦 Qty: Highest First</option>
                          <option value="qty-asc">📦 Qty: Lowest First</option>
                        </select>
                      </div>
                    </div>

                    {/* Table Render */}
                    {!currentRO.history || currentRO.history.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <FaIcons.FaTools className="text-5xl mb-3 text-slate-300" />
                        <p className="font-semibold">No maintenance logs found for this item.</p>
                        <p className="text-xs mt-1">Click the "Log Repair Activity" button to add a new repair record.</p>
                      </div>
                    ) : processedLogs.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <FaIcons.FaSearch className="text-4xl mb-3 text-slate-300" />
                        <p className="font-semibold">No records match your filters.</p>
                        <p className="text-xs mt-1">Try clearing your search query or technician filter.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50/50">
                              <th className="py-3 px-4">Date</th>
                              <th className="py-3 px-4">Part Repaired</th>
                              <th className="py-3 px-4 text-center">Qty</th>
                              <th className="py-3 px-4 text-right">Price/Qty</th>
                              <th className="py-3 px-4 text-right">Total Amount</th>
                              <th className="py-3 px-4">Technician</th>
                              <th className="py-3 px-4 font-semibold text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {processedLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-slate-50/55 transition-colors">
                                <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">{log.date}</td>
                                <td className="py-3 px-4 font-bold text-slate-900">{log.partRepaired}</td>
                                <td className="py-3 px-4 text-center font-semibold text-slate-700">{log.quantity}</td>
                                <td className="py-3 px-4 text-right text-slate-605">{formatCurrency(log.pricePerQty)}</td>
                                <td className="py-3 px-4 text-right font-extrabold text-slate-800">{formatCurrency(log.totalAmount)}</td>
                                <td className="py-3 px-4 text-slate-606 whitespace-nowrap">{log.technician}</td>
                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditLog(log)}
                                      className="text-slate-400 hover:text-blue-650 p-1.5 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition duration-150 cursor-pointer"
                                    >
                                      <FaIcons.FaPen className="text-[10px]" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLog(log.id, log.partRepaired)}
                                      className="text-slate-400 hover:text-rose-650 p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition duration-150 cursor-pointer"
                                    >
                                      <FaIcons.FaTrash className="text-[10px]" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* MODALS SECTION */}

      {/* 1. Add Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FaIcons.FaPlus /> Add Category
              </h3>
              <button onClick={() => setShowAddCatModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleCatSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CCTV, Air Conditioners"
                  value={catForm.name}
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Visual Icon *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableIcons.map((item) => {
                    const isIconSelected = catForm.icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setCatForm(prev => ({ ...prev, icon: item.name }))}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                          isIconSelected
                            ? "bg-blue-50 text-blue-600 border-blue-400 shadow-sm"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                        }`}
                      >
                        <div className="text-lg">{item.icon}</div>
                        <span className="text-[9px] font-bold line-clamp-1">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-655 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Register Asset Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FaIcons.FaPlus /> Register Asset Unit
              </h3>
              <button onClick={() => setShowAddUnitModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleUnitSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Unit Name / ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3RD FLOOR RO, PRINCIPAL AC"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. C.V. Raman Hostel, Block-B Room 102"
                  value={unitForm.location}
                  onChange={(e) => setUnitForm(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Initial Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={unitForm.initialPrice}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, initialPrice: e.target.value }))}
                    required
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Installation Date *
                  </label>
                  <input
                    type="date"
                    value={unitForm.installDate}
                    onChange={(e) => setUnitForm(prev => ({ ...prev, installDate: e.target.value }))}
                    required
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-655 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition cursor-pointer"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Asset Unit Modal */}
      {showEditUnitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FaIcons.FaPen /> Edit Asset Details
              </h3>
              <button onClick={() => setShowEditUnitModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleEditUnitSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Unit Name / ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3RD FLOOR RO, PRINCIPAL AC"
                  value={editUnitForm.name}
                  onChange={(e) => setEditUnitForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g. C.V. Raman Hostel, Block-B Room 102"
                  value={editUnitForm.location}
                  onChange={(e) => setEditUnitForm(prev => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={editUnitForm.initialPrice}
                    onChange={(e) => setEditUnitForm(prev => ({ ...prev, initialPrice: e.target.value }))}
                    required
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Installation Date *
                  </label>
                  <input
                    type="date"
                    value={editUnitForm.installDate}
                    onChange={(e) => setEditUnitForm(prev => ({ ...prev, installDate: e.target.value }))}
                    required
                    className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowEditUnitModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-655 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* 5. Generate Report Format Modal */}
      {showReportFormatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-purple-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <FaIcons.FaFileAlt /> Generate Report
              </h3>
              <button onClick={() => setShowReportFormatModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Choose your preferred format to download the Maintenance Report:
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => {
                    setShowReportFormatModal(false);
                    handleGeneratePDFReport();
                  }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-55/30 transition flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <FaIcons.FaFilePdf className="text-3xl text-rose-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm text-slate-700">Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    setShowReportFormatModal(false);
                    handleGenerateExcelReport();
                  }}
                  className="p-4 border border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-55/30 transition flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <FaIcons.FaFileExcel className="text-3xl text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm text-slate-700">Download Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add Servicing Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-up">
            
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaIcons.FaWrench className="text-xl" />
                <h3 className="font-extrabold text-lg">Log Maintenance Record - {currentRO?.name}</h3>
              </div>
              <button onClick={() => setShowAddLogModal(false)} className="text-white/80 hover:text-white transition text-lg cursor-pointer">
                <FaIcons.FaTimes />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date of Maintenance *
                  </label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Technician Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Kumar"
                    value={logForm.technician}
                    onChange={(e) => setLogForm(prev => ({ ...prev, technician: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Part Repaired / Replaced *
                </label>
                <input
                  type="text"
                  placeholder="e.g. RO Membrane, Carbon Filter, Booster Pump"
                  value={logForm.partRepaired}
                  onChange={(e) => setLogForm(prev => ({ ...prev, partRepaired: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Quantity Used
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={logForm.quantity}
                    onChange={(e) => setLogForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Price per Unit (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={logForm.pricePerQty}
                    onChange={(e) => setLogForm(prev => ({ ...prev, pricePerQty: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-sm border border-slate-100">
                <span className="text-slate-500 font-semibold">Total Amount (Estimated):</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {formatCurrency((parseInt(logForm.quantity) || 0) * (parseFloat(logForm.pricePerQty) || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Enter details of the issues and diagnostics..."
                  rows="3"
                  value={logForm.notes}
                  onChange={(e) => setLogForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-655 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition cursor-pointer"
                >
                  Save Maintenance Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Servicing Log Modal */}
      {showEditLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-up">
            
            <div className="bg-blue-600 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaIcons.FaWrench className="text-xl" />
                <h3 className="font-extrabold text-lg">Edit Maintenance Log - {currentRO?.name}</h3>
              </div>
              <button
                onClick={() => {
                  setShowEditLogModal(false);
                  setEditingLogId(null);
                }}
                className="text-white/80 hover:text-white transition text-lg cursor-pointer"
              >
                <FaIcons.FaTimes />
              </button>
            </div>

            <form onSubmit={handleEditLogSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date of Maintenance *
                  </label>
                  <input
                    type="date"
                    value={editLogForm.date}
                    onChange={(e) => setEditLogForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Technician Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Kumar"
                    value={editLogForm.technician}
                    onChange={(e) => setEditLogForm(prev => ({ ...prev, technician: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Part Repaired / Replaced *
                </label>
                <input
                  type="text"
                  placeholder="e.g. RO Membrane, Carbon Filter, Booster Pump"
                  value={editLogForm.partRepaired}
                  onChange={(e) => setEditLogForm(prev => ({ ...prev, partRepaired: e.target.value }))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Quantity Used
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={editLogForm.quantity}
                    onChange={(e) => setEditLogForm(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Price per Unit (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={editLogForm.pricePerQty}
                    onChange={(e) => setEditLogForm(prev => ({ ...prev, pricePerQty: e.target.value }))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-sm border border-slate-100">
                <span className="text-slate-500 font-semibold">Total Amount (Estimated):</span>
                <span className="font-extrabold text-slate-800 text-base">
                  {formatCurrency((parseInt(editLogForm.quantity) || 0) * (parseFloat(editLogForm.pricePerQty) || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Enter details of the issues and diagnostics..."
                  rows="3"
                  value={editLogForm.notes}
                  onChange={(e) => setEditLogForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditLogModal(false);
                    setEditingLogId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-605 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
      />

    </div>
  );
}