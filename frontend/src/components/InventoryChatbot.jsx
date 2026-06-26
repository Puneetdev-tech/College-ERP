import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useStore } from "../context/StoreContext";
import { speak, playBeep } from "./useSpeech";
import ExcelJS from "exceljs";

/* ─── Excel Exporter ───────────────────────────────────────────────────────── */
async function downloadExcelReport(startDate, endDate, { orders, issuedStock, inventory, systemSettings, maintenanceLogs }, conditions) {
  const isWithinRange = (dateStr) => {
    if (!dateStr) return false;
    const cleanDate = dateStr.split(" ")[0]; // YYYY-MM-DD
    return cleanDate >= startDate && cleanDate <= endDate;
  };

  const filteredIssued = issuedStock.filter(log => isWithinRange(log.date));
  const filteredOrders = orders.filter(o => isWithinRange(o.orderDate));

  const collegeName = systemSettings?.collegeInfo?.name || "RJ Institute of Technology";
  const collegeAddress = systemSettings?.collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi";
  const collegeDetails = `Phone: ${systemSettings?.collegeInfo?.phone || "+91 11 2690 7400"} | Email: ${systemSettings?.collegeInfo?.email || "info@rjit.edu.in"} | Web: ${systemSettings?.collegeInfo?.website || "www.rjit.edu.in"}`;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Audit Report");
  worksheet.views = [{ showGridLines: true }];

  // Row 1: Title
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
  let reportTitle = "AUDIT REPORT";
  if (conditions?.onlyOrdered) reportTitle = "AUDIT REPORT - PURCHASE ORDERS";
  else if (conditions?.onlyIssued) reportTitle = "AUDIT REPORT - STOCK DISBURSEMENTS";
  else if (conditions?.onlyReceived) reportTitle = "AUDIT REPORT - RECEIVED SHIPMENTS";
  else if (conditions?.onlyMaintenance) {
    if (conditions?.maintenanceUnitId) {
      reportTitle = "AUDIT REPORT - EQUIPMENT SERVICE HISTORY";
    } else {
      reportTitle = "AUDIT REPORT - MAINTENANCE REGISTRY";
    }
  }

  const reportNameRow = worksheet.getRow(4);
  reportNameRow.getCell(1).value = reportTitle;
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

  const getIssuedItemPrice = (log) => {
    const invItem = inventory.find(item => 
      (item.category || "").toLowerCase() === (log.category || "").toLowerCase() &&
      (item.subcategory || "").toLowerCase() === (log.subcategory || "").toLowerCase() &&
      (item.type || "").toLowerCase() === (log.type || "").toLowerCase()
    );
    return invItem ? invItem.price : 0;
  };

  // Check which sections to include
  const includeMaintenance = !!conditions?.onlyMaintenance;
  const includeIssued = !includeMaintenance && !conditions?.onlyOrdered && !conditions?.onlyReceived;
  const includeOrdered = !includeMaintenance && !conditions?.onlyIssued;

  // Render maintenance sections
  if (includeMaintenance) {
    if (conditions?.maintenanceUnitId) {
      // Single equipment service history
      const unit = (maintenanceLogs || []).find(ro => ro.id === conditions.maintenanceUnitId);
      if (unit) {
        // Render Unit metadata info box
        worksheet.getRow(currentRow).values = ["Equipment ID", "Equipment Name", "Category", "Location", "Install Date", "Initial Price (INR)", "Status", "", ""];
        applyHeaderStyles(currentRow, 7);
        currentRow++;

        const infoRow = worksheet.getRow(currentRow);
        infoRow.values = [unit.id, unit.name, unit.category, unit.location, unit.installDate, unit.initialPrice, unit.status, "", ""];
        for (let c = 1; c <= 7; c++) {
          infoRow.getCell(c).border = borderStyle;
          infoRow.getCell(c).font = { name: "Calibri", size: 10 };
          if (c === 6) infoRow.getCell(c).numFmt = '"₹"#,##0.00';
        }
        currentRow += 3;

        const bannerRow = worksheet.getRow(currentRow);
        bannerRow.getCell(1).value = `SERVICE & MAINTENANCE HISTORY LOG`;
        worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
        bannerRow.height = 25;
        const bannerCell = bannerRow.getCell(1);
        bannerCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
        bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
        bannerCell.alignment = { vertical: "middle", horizontal: "left" };

        currentRow++;

        worksheet.getRow(currentRow).values = ["Service ID", "Part Repaired / Service", "Qty", "Cost per Qty (INR)", "Total Amount (INR)", "Date", "Technician", "Notes", ""];
        applyHeaderStyles(currentRow, 8);
        currentRow++;

        const matchedHistory = (unit.history || []).filter(h => isWithinRange(h.date));
        matchedHistory.forEach(h => {
          const row = worksheet.getRow(currentRow);
          row.values = [h.id, h.partRepaired, h.quantity, h.pricePerQty, h.totalAmount, h.date, h.technician, h.notes, ""];
          row.height = 20;
          for (let c = 1; c <= 8; c++) {
            row.getCell(c).border = borderStyle;
            row.getCell(c).font = { name: "Calibri", size: 10 };
            if (c === 4 || c === 5) row.getCell(c).numFmt = '"₹"#,##0.00';
          }
          currentRow++;
        });
      }
    } else {
      // General Maintenance registry
      const bannerRow = worksheet.getRow(currentRow);
      bannerRow.getCell(1).value = "INSTITUTIONAL EQUIPMENT MAINTENANCE REGISTRY";
      worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
      bannerRow.height = 25;
      const bannerCell = bannerRow.getCell(1);
      bannerCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
      bannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

      currentRow++;

      worksheet.getRow(currentRow).values = ["Unit ID", "Name", "Category", "Location", "Install Date", "Initial Price (INR)", "Logs Count", "Total Repair Cost (INR)", "Status"];
      applyHeaderStyles(currentRow, 9);
      currentRow++;

      (maintenanceLogs || []).forEach(unit => {
        const matchedHistory = (unit.history || []).filter(h => isWithinRange(h.date));
        const logsCount = matchedHistory.length;
        const totalRepair = matchedHistory.reduce((sum, h) => sum + h.totalAmount, 0);

        const row = worksheet.getRow(currentRow);
        row.values = [unit.id, unit.name, unit.category, unit.location, unit.installDate, unit.initialPrice, logsCount, totalRepair, unit.status];
        row.height = 20;
        for (let c = 1; c <= 9; c++) {
          row.getCell(c).border = borderStyle;
          row.getCell(c).font = { name: "Calibri", size: 10 };
          if (c === 6 || c === 8) row.getCell(c).numFmt = '"₹"#,##0.00';
        }
        currentRow++;
      });

      currentRow += 2;

      const detailBannerRow = worksheet.getRow(currentRow);
      detailBannerRow.getCell(1).value = "DETAILED MAINTENANCE SERVICE TRANSACTIONS";
      worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
      detailBannerRow.height = 25;
      const detailBannerCell = detailBannerRow.getCell(1);
      detailBannerCell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
      detailBannerCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };

      currentRow++;

      worksheet.getRow(currentRow).values = ["Unit Name", "Location", "Part Repaired", "Qty", "Cost (INR)", "Service Date", "Technician", "Notes", ""];
      applyHeaderStyles(currentRow, 8);
      currentRow++;

      (maintenanceLogs || []).forEach(unit => {
        const matchedHistory = (unit.history || []).filter(h => isWithinRange(h.date));
        matchedHistory.forEach(h => {
          const row = worksheet.getRow(currentRow);
          row.values = [unit.name, unit.location, h.partRepaired, h.quantity, h.totalAmount, h.date, h.technician, h.notes, ""];
          row.height = 20;
          for (let c = 1; c <= 8; c++) {
            row.getCell(c).border = borderStyle;
            row.getCell(c).font = { name: "Calibri", size: 10 };
            if (c === 5) row.getCell(c).numFmt = '"₹"#,##0.00';
          }
          currentRow++;
        });
      });
    }
  } else {
    // Section 1: Stock Disbursement
    if (includeIssued && filteredIssued.length > 0) {
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

      filteredIssued.forEach(log => {
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
    if (includeOrdered && filteredOrders.length > 0) {
      let displayOrders = filteredOrders;
      if (conditions?.onlyReceived) {
        displayOrders = filteredOrders.filter(o => o.status === "Received");
      }

      if (displayOrders.length > 0) {
        const bannerRow = worksheet.getRow(currentRow);
        bannerRow.getCell(1).value = conditions?.onlyReceived ? "RECEIVED SHIPMENTS REGISTRY" : "PURCHASE ORDER SHIPMENTS REGISTRY";
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

        displayOrders.forEach(order => {
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
    }
  }

  const colWidths = [32, 16, 22, 22, 22, 14, 20, 18, 20];
  colWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);

  let downloadFilename = `Audit_Report_${startDate}_to_${endDate}.xlsx`;
  if (conditions?.onlyOrdered) downloadFilename = `Purchase_Orders_Report_${startDate}_to_${endDate}.xlsx`;
  else if (conditions?.onlyIssued) downloadFilename = `Stock_Disbursements_Report_${startDate}_to_${endDate}.xlsx`;
  else if (conditions?.onlyReceived) downloadFilename = `Received_Orders_Report_${startDate}_to_${endDate}.xlsx`;
  else if (conditions?.onlyMaintenance) {
    if (conditions?.maintenanceUnitId) {
      downloadFilename = `Service_History_${conditions.maintenanceUnitId}_${startDate}_to_${endDate}.xlsx`;
    } else {
      downloadFilename = `Maintenance_Ledger_${startDate}_to_${endDate}.xlsx`;
    }
  }

  link.setAttribute("download", downloadFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatLocalDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeDateString(dateStr) {
  if (!dateStr) return "";
  // Strip out times/AM/PM
  const clean = dateStr.replace(/(AM|PM)/i, "").trim().split(" ")[0];
  // Parse dd/mm/yyyy or dd-mm-yyyy or yyyy-mm-dd
  if (clean.includes("/") || clean.includes("-")) {
    const delimiter = clean.includes("/") ? "/" : "-";
    const parts = clean.split(delimiter);
    if (parts[0].length <= 2 && parts[2]?.length === 4) {
      // dd/mm/yyyy -> yyyy-mm-dd
      const d = parts[0].padStart(2, "0");
      const m = parts[1].padStart(2, "0");
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
  }
  return clean;
}

/* ─── Date Parsing Helpers ─────────────────────────────────────────────────── */
function extractDates(q) {
  const currentYear = new Date().getFullYear();
  const dates = [];
  
  // 1. ISO format: YYYY-MM-DD
  const isoRegex = /\b(20\d{2})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/g;
  let match;
  while ((match = isoRegex.exec(q)) !== null) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    dates.push({
      date: new Date(year, month, day),
      start: match.index,
      end: isoRegex.lastIndex,
      isMonthOnly: false
    });
  }

  // Helper to check if a range overlaps with already matched dates
  const isOverlapping = (start, end) => {
    return dates.some(d => (start >= d.start && start < d.end) || (end > d.start && end <= d.end));
  };

  // 2. DD-MM-YYYY format
  const ddmmRegex = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](20\d{2}|\d{2})\b/g;
  while ((match = ddmmRegex.exec(q)) !== null) {
    if (isOverlapping(match.index, ddmmRegex.lastIndex)) continue;
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    let year = parseInt(match[3]);
    if (year < 100) year += 2000;
    dates.push({
      date: new Date(year, month, day),
      start: match.index,
      end: ddmmRegex.lastIndex,
      isMonthOnly: false
    });
  }

  const monthsMap = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
    may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
  };

  // 3. Day of Month (e.g., "1st June" or "1 of June" or "01 June")
  const dayMonthRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi;
  while ((match = dayMonthRegex.exec(q)) !== null) {
    if (isOverlapping(match.index, dayMonthRegex.lastIndex)) continue;
    const day = parseInt(match[1]);
    const monthStr = match[2].toLowerCase();
    const month = monthsMap[monthStr];
    dates.push({
      date: new Date(currentYear, month, day),
      start: match.index,
      end: dayMonthRegex.lastIndex,
      isMonthOnly: false
    });
  }

  // 4. Month Day (e.g., "June 1st" or "June 1" or "June 01")
  const monthDayRegex = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?\b/gi;
  while ((match = monthDayRegex.exec(q)) !== null) {
    if (isOverlapping(match.index, monthDayRegex.lastIndex)) continue;
    const monthStr = match[1].toLowerCase();
    const month = monthsMap[monthStr];
    const day = parseInt(match[2]);
    dates.push({
      date: new Date(currentYear, month, day),
      start: match.index,
      end: monthDayRegex.lastIndex,
      isMonthOnly: false
    });
  }

  // 5. Month name only (e.g., "June" or "in June")
  const monthOnlyRegex = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi;
  while ((match = monthOnlyRegex.exec(q)) !== null) {
    if (isOverlapping(match.index, monthOnlyRegex.lastIndex)) continue;
    const monthStr = match[1].toLowerCase();
    const month = monthsMap[monthStr];
    dates.push({
      date: new Date(currentYear, month, 1),
      start: match.index,
      end: monthOnlyRegex.lastIndex,
      isMonthOnly: true,
      monthIndex: month
    });
  }

  return dates.sort((a, b) => a.start - b.start);
}

function parseDateRange(q) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (/\b(today)\b/i.test(q)) {
    return { fromDate: todayStart, toDate: todayEnd, isDateQuery: true };
  }
  if (/\b(yesterday)\b/i.test(q)) {
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    return { fromDate: yesterdayStart, toDate: yesterdayEnd, isDateQuery: true };
  }
  if (/\b(this week)\b/i.test(q)) {
    const day = todayStart.getDay();
    const diff = todayStart.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(todayStart);
    monday.setDate(diff);
    return { fromDate: monday, toDate: todayEnd, isDateQuery: true };
  }
  if (/\b(last week)\b/i.test(q)) {
    const day = todayStart.getDay();
    const diff = todayStart.getDate() - day + (day === 0 ? -6 : 1) - 7;
    const lastMonday = new Date(todayStart);
    lastMonday.setDate(diff);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastSunday.getDate() + 6);
    lastSunday.setHours(23, 59, 59, 999);
    return { fromDate: lastMonday, toDate: lastSunday, isDateQuery: true };
  }
  if (/\b(this month)\b/i.test(q)) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { fromDate: startOfMonth, toDate: endOfMonth, isDateQuery: true };
  }
  if (/\b(last month)\b/i.test(q)) {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { fromDate: startOfLastMonth, toDate: endOfLastMonth, isDateQuery: true };
  }

  const dates = extractDates(q);
  if (dates.length === 0) {
    return { fromDate: null, toDate: null, isDateQuery: false };
  }

  if (dates.length === 1) {
    const singleDate = dates[0].date;
    const textBefore = q.substring(0, dates[0].start);
    
    const isTill = /\b(till|until|before|up\s+to|to)\b/i.test(textBefore);
    const isFrom = /\b(from|since|after|start\s+of|beginning\s+of)\b/i.test(textBefore);

    if (isTill) {
      let toDate;
      if (dates[0].isMonthOnly) {
        toDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), 1, 0, 0, 0, 0);
      } else {
        toDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), singleDate.getDate(), 23, 59, 59, 999);
      }
      return { fromDate: null, toDate, isDateQuery: true };
    }

    if (isFrom) {
      let fromDate;
      if (dates[0].isMonthOnly) {
        fromDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), 1, 0, 0, 0, 0);
      } else {
        fromDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), singleDate.getDate(), 0, 0, 0, 0);
      }
      return { fromDate, toDate: null, isDateQuery: true };
    }

    // Default: exact day or exact month
    if (dates[0].isMonthOnly) {
      const fromDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), 1, 0, 0, 0, 0);
      const toDate = new Date(singleDate.getFullYear(), singleDate.getMonth() + 1, 0, 23, 59, 59, 999);
      return { fromDate, toDate, isDateQuery: true };
    } else {
      const fromDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), singleDate.getDate(), 0, 0, 0, 0);
      const toDate = new Date(singleDate.getFullYear(), singleDate.getMonth(), singleDate.getDate(), 23, 59, 59, 999);
      return { fromDate, toDate, isDateQuery: true };
    }
  }

  // 2 or more dates
  const startD = dates[0].date;
  const endD = dates[1].date;
  const fromDate = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate(), 0, 0, 0, 0);
  let toDate;
  if (dates[1].isMonthOnly) {
    toDate = new Date(endD.getFullYear(), endD.getMonth() + 1, 0, 23, 59, 59, 999);
  } else {
    toDate = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate(), 23, 59, 59, 999);
  }
  return { fromDate, toDate, isDateQuery: true };
}

/* ─── NLP Intent Engine ────────────────────────────────────────────────────── */
function parseComparison(q) {
  const months = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
    may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8,
    october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
  };
  
  // Find years (e.g. 2025, 2026)
  const years = q.match(/\b20\d{2}\b/g);
  if (years && years.length >= 2) {
    return { type: "years", val1: parseInt(years[0]), val2: parseInt(years[1]) };
  }

  // Find months
  const matchedMonths = [];
  const words = q.split(/[\s,]+/);
  words.forEach(w => {
    const cleanWord = w.replace(/[^a-z]/gi, "");
    if (months[cleanWord] !== undefined && !matchedMonths.includes(months[cleanWord])) {
      matchedMonths.push(months[cleanWord]);
    }
  });

  if (matchedMonths.length >= 2) {
    return { type: "months", val1: matchedMonths[0], val2: matchedMonths[1] };
  }

  if (matchedMonths.length === 1) {
    const prev = matchedMonths[0] === 0 ? 11 : matchedMonths[0] - 1;
    return { type: "months", val1: prev, val2: matchedMonths[0] };
  }

  return { type: "months", val1: 0, val2: 1 };
}

function parseIntent(query, lastIntent) {
  const q = (query || "").toLowerCase().trim();

  // 1. Check for greeting / conversational intents
  if (/\b(hi|hello|hey|yo|greetings|good\s+(morning|afternoon|evening))\b/i.test(q)) {
    return { type: "greetings" };
  }
  if (/\b(thanks|thank\s+you|thx|ty|great\s+help|awesome|perfect|ok|okay)\b/i.test(q)) {
    return { type: "gratitude" };
  }
  if (/\b(bye|goodbye|see\s+you|exit)\b/i.test(q)) {
    return { type: "goodbye" };
  }

  // 1.5. Write/mutation actions check (denying direct write actions as requested)
  const isWriteAction = /\b(place\s+order|issue\s+stock|delete|remove|update|add|create|insert|modify|edit)\b/i.test(q) &&
    !/\b(show|view|list|report|reports|summary|analytics|chart|graph|history|logs|track|status|find|search|compare)\b/i.test(q) &&
    !/\b(go\s+to|open|navigate|take\s+me)\b/i.test(q);
  
  if (isWriteAction) {
    return { type: "write-denied" };
  }

  // 2. Navigation intents (strictly mapping to open/goto/navigate actions)
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(dashboard|home)\b/i.test(q)) return { type: "navigate", target: "/dashboard" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(inventor)/i.test(q)) return { type: "navigate", target: "/inventory" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(place order|purchase order|order)\b/i.test(q)) return { type: "navigate", target: "/place-order" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(receive order|received|stock receipt)\b/i.test(q)) return { type: "navigate", target: "/receive-order" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(issue stock|disburse|checkout)\b/i.test(q)) return { type: "navigate", target: "/issue-stock" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(analytics|analysis|chart|graph)\b/i.test(q)) return { type: "navigate", target: "/analytics" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(reports|report)\b/i.test(q)) return { type: "navigate", target: "/reports" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(notification|alerts)\b/i.test(q)) return { type: "navigate", target: "/notifications" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(settings|setting)\b/i.test(q)) return { type: "navigate", target: "/settings" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(users|user management|manage users)\b/i.test(q)) return { type: "navigate", target: "/users" };
  if (/\b(open|go to|navigate|take me to|redirect to)\b.*\b(maintenance)\b/i.test(q)) return { type: "navigate", target: "/maintenance" };

  // 3. Report downloads & conditional reports
  const isReportKeyword = /\b(report|reports|spreadsheet|ledger|excel|pdf|sheet|registry)\b/i.test(q) ||
    /\b(service\s+history|history\s+log|history\s+logs)\b/i.test(q);
  const isDownloadAction = /\b(download|export|generate|print)\b/i.test(q);
  const isReportRequest = isDownloadAction || isReportKeyword;

  if (isReportRequest) {
    const onlyOrdered = /\b(only\s+)?(ordered|order\s+placed|placed|purchase|purchases)\b/i.test(q) && !/\b(issued|received|disbursed)\b/i.test(q);
    const onlyIssued = /\b(only\s+)?(issued|issue|disbursed|disbursement|dispatches)\b/i.test(q);
    const onlyReceived = /\b(only\s+)?(received|received\s+orders)\b/i.test(q);
    const onlyMaintenance = /\b(maintenance|service|repair|history|ro\s*\d+|purifier)\b/i.test(q);

    let maintenanceUnitId = null;
    if (onlyMaintenance) {
      const roMatch = q.match(/\bro\s*(?:no|number)?\s*(\d+)\b/i);
      if (roMatch) {
        maintenanceUnitId = `ro-${roMatch[1]}`;
      } else if (/\bcivil\b/i.test(q)) {
        maintenanceUnitId = "ro-4";
      } else if (/\braman\b/i.test(q)) {
        maintenanceUnitId = "ro-1";
      } else if (/\bkalam\b/i.test(q)) {
        maintenanceUnitId = "ro-2";
      } else if (/\bchawla\b/i.test(q)) {
        maintenanceUnitId = "ro-3";
      }
    }

    return { 
      type: "download-report", 
      query: q,
      onlyOrdered,
      onlyIssued,
      onlyReceived,
      onlyMaintenance,
      maintenanceUnitId
    };
  }

  // 4. Combined most and least frequent items query
  if (
    (/\bmost\b/i.test(q) && /\bleast\b/i.test(q)) ||
    (/\b(frequent|freq)\b/i.test(q) && /\b(least|lowest)\b/i.test(q))
  ) {
    return { type: "most-least-frequent-reason", query: q };
  }

  // 5. Comparison
  if (/\b(compare|comparison|difference between)\b/i.test(q)) {
    return { type: "comparison", query: q };
  }

  // 6. Why frequent Q&A
  if (/\b(why is|why this|why).*ordered\s+freq/i.test(q) || /\b(why is|why).*issued\s+freq/i.test(q) || /\b(why is|why).*popular/i.test(q) || /\b(why do we need|reason for ordering)\b/i.test(q)) {
    return { type: "why-frequent", query: q };
  }

  // 7. Date check
  const dateRange = parseDateRange(q);

  // Department-wise report queries
  if (/\b(depart|dept|department)\b.*\b(wise|report|summary|details)\b/i.test(q)) {
    return { type: "dept-report", query: q };
  }

  // Combined order and stock dispatches queries
  const hasOrderKeyword = /\b(orders?|purchase\s+orders?|ordered|placed|purchase|purchases)\b/i.test(q);
  const hasIssueKeyword = /\b(issued?|disbursed?|checkout|given\s+to|disbursed\s+to|dispatches|disbursement|issue\s+stocked?|issued\s+stock|stocked?)\b/i.test(q);
  if (hasOrderKeyword && hasIssueKeyword) {
    return { type: "orders-and-issued", query: q };
  }

  // Order intents
  if (hasOrderKeyword) {
    if (/\b(pending|waiting|unapproved)\b/i.test(q)) return { type: "pending-orders", query: q };
    if (/\b(approved|ready)\b/i.test(q)) return { type: "approved-orders", query: q };
    if (/\b(received|completed|fully\s+received)\b/i.test(q)) return { type: "received-orders", query: q };
    if (/\b(rejected)\b/i.test(q)) return { type: "rejected-orders", query: q };
    if (dateRange.isDateQuery) return { type: "orders-date", query: q };
    return { type: "all-orders", query: q };
  }

  // Issued stock intents
  if (hasIssueKeyword) {
    if (/\b(to|given\s+to|disbursed\s+to|for)\b/i.test(q) && !/\b(what|show|list)\b/i.test(q)) {
      return { type: "issued-to", query: q };
    }
    return { type: "issued-stock", query: q };
  }

  // Stock / inventory queries
  if (/\b(low\s+stock|low\s+in\s+stock|below\s+threshold|running\s+out|almost\s+out|threshold)\b/i.test(q)) return { type: "low-stock" };
  if (/\b(total\s+value|inventory\s+value|worth|total\s+worth|asset\s+value)\b/i.test(q)) return { type: "inventory-value" };
  if (/\b(total\s+items|total\s+assets|item\s+count|total\s+count)\b/i.test(q)) return { type: "total-items" };
  if (/\b(categor|type\s+of\s+items|what\s+categories|show\s+categories)\b/i.test(q)) return { type: "categories" };
  if (/\b(all\s+items|full\s+inventory|list\s+all|show\s+inventory|show\s+all\s+items|every\s+item)\b/i.test(q)) return { type: "all-inventory" };
  if (/\b(how\s+much|how\s+many|what\s+is\s+the\s+stock|stock\s+level|quantity|remaining|left|available)\b/i.test(q)) return { type: "stock-query", query: q };

  // Analytics / frequency intents
  if (/\b(most\s+frequent|most\s+issued|most\s+popular|most\s+used|top\s+item|highest\s+issued)\b/i.test(q)) return { type: "most-frequent" };
  if (/\b(least\s+frequent|least\s+issued|least\s+popular|least\s+used|bottom\s+item|lowest\s+issued)\b/i.test(q)) return { type: "least-frequent" };
  if (/\b(most\s+expensive|highest\s+price|costliest|priciest)\b/i.test(q)) return { type: "most-expensive" };
  if (/\b(cheapest|lowest\s+price|least\s+expensive|most\s+affordable)\b/i.test(q)) return { type: "cheapest" };
  if (/\b(total\s+orders?|order\s+count|number\s+of\s+orders?)\b/i.test(q)) return { type: "order-count" };
  if (/\b(top\s+supplier|best\s+supplier|supplier\s+with\s+most|most\s+orders\s+from\s+supplier)\b/i.test(q)) return { type: "top-supplier" };

  // Summary / Help
  if (/\b(summary|overview|snapshot|status|today|current\s+status|what\s+is\s+going\s+on)\b/i.test(q)) return { type: "summary", query: q };
  if (/\b(help|what\s+can\s+you\s+do|commands|capabilities|what\s+do\s+you\s+know|how\s+to\s+use)\b/i.test(q)) return { type: "help" };

  // 8. Contextual Fallback
  if (dateRange.isDateQuery && lastIntent) {
    const isOrderIntent = ["all-orders", "orders-date", "pending-orders", "approved-orders", "received-orders", "rejected-orders"].includes(lastIntent.type);
    if (isOrderIntent) {
      return { type: "orders-date", query: query, parentIntent: lastIntent.type };
    }
    if (lastIntent.type === "issued-stock") {
      return { type: "issued-stock", query: query };
    }
  }

  // 9. Fuzzy inventory match
  const genericInventoryKeywords = [
    "item", "items", "stock", "stocks", "inventory", "inventories", "product", "products", "asset", "assets", "material", "materials",
    "order", "orders", "ordered", "purchase", "purchases", "purchased", "supplier", "suppliers", "vendor", "vendors",
    "issue", "issued", "disburse", "disbursed", "faculty", "department", "departments", "dept", "office", "lab", "laboratory",
    "price", "prices", "cost", "costs", "value", "worth", "expensive", "cheap", "cheapest",
    "quantity", "quantities", "threshold", "low", "left", "remaining", "available",
    "stationary", "stationery", "sanitory", "sanitary", "cleaning", "electronics", "furniture", "sports", "printer", "computer", "register", "marker", "pen", "paper", "wheel", "soap"
  ];
  const containsInventoryWord = genericInventoryKeywords.some(kw => q.includes(kw));

  if (containsInventoryWord) {
    return { type: "fuzzy-inventory", query: q };
  }

  // 10. Genuinely off-topic
  return { type: "off-topic", query: q };
}

/* ─── AI Response Engine ───────────────────────────────────────────────────── */
function generateResponse(intent, { inventory, orders, issuedStock, systemSettings, maintenanceLogs }) {
  const threshold = systemSettings?.lowStockThreshold || 10;

  switch (intent.type) {

    case "greetings": {
      const greetings = [
        "Hello! I'm your AI Inventory Assistant. How can I help you with the inventory today?",
        "Hi there! Hope you are having a great day. Ask me anything about stock levels, orders, or dispatches!",
        "Hey! Ready to manage some inventory? How can I assist you right now?"
      ];
      const selected = greetings[Math.floor(Math.random() * greetings.length)];
      return { text: selected, speak: selected };
    }

    case "gratitude": {
      const gratitudeResponses = [
        "You're very welcome! Let me know if you need anything else.",
        "Happy to help! Let me know if you have other inventory queries.",
        "No problem! Always here to assist with the college ERP inventory."
      ];
      const selected = gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)];
      return { text: selected, speak: selected };
    }

    case "goodbye": {
      const goodbyeResponses = [
        "Goodbye! Have a great day ahead.",
        "Bye! Let me know when you need inventory assistance again.",
        "See you later! Keep the warehouse running smoothly."
      ];
      const selected = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
      return { text: selected, speak: selected };
    }

    case "navigate": {
      return {
        text: `Navigating you there now...`,
        navigate: intent.target,
        speak: `Taking you there now.`
      };
    }

    case "write-denied": {
      return {
        text: `🔒 **Access Restricted**\nI have read-only access to the inventory database. I can search, analyze, and generate reports, but I am not authorized to add, modify, or delete any stock entries or orders directly.`,
        speak: "I have read-only access to the inventory. I cannot add, modify, or delete any entries."
      };
    }

    case "download-report": {
      const q = intent.query;
      const dateRange = parseDateRange(q);
      
      let startStr, endStr;
      if (dateRange.isDateQuery) {
        startStr = dateRange.fromDate ? formatLocalDate(dateRange.fromDate) : "2026-06-01";
        endStr = dateRange.toDate ? formatLocalDate(dateRange.toDate) : "2026-06-30";
      } else {
        if (intent.onlyMaintenance) {
          startStr = "2024-01-01";
          endStr = "2026-12-31";
        } else {
          startStr = "2026-06-01";
          endStr = "2026-06-30";
        }
      }

      let typeDesc = "audit report";
      if (intent.onlyOrdered) typeDesc = "placed orders report";
      else if (intent.onlyIssued) typeDesc = "stock dispatches report";
      else if (intent.onlyReceived) typeDesc = "received orders report";
      else if (intent.onlyMaintenance) {
        if (intent.maintenanceUnitId) {
          typeDesc = `RO Unit Service History report (${intent.maintenanceUnitId.toUpperCase()})`;
        } else {
          typeDesc = "maintenance ledger report";
        }
      }

      const isWithinRange = (dateStr) => {
        if (!dateStr) return false;
        const cleanDate = dateStr.split(" ")[0]; // YYYY-MM-DD
        return cleanDate >= startStr && cleanDate <= endStr;
      };

      let previewTable = [];
      let totalRecords = 0;

      if (intent.onlyOrdered) {
        const filtered = orders.filter(o => isWithinRange(o.orderDate));
        totalRecords = filtered.length;
        previewTable = filtered.slice(0, 10).map(o => ({
          "Item": o.item,
          "Supplier": o.supplier,
          "Qty": o.quantity,
          "Price": `₹${o.pricePerUnit?.toLocaleString()}`,
          "Status": o.status,
          "Date": o.orderDate
        }));
      } else if (intent.onlyIssued) {
        const filtered = issuedStock.filter(log => isWithinRange(log.date));
        totalRecords = filtered.length;
        previewTable = filtered.slice(0, 10).map(log => ({
          "Item": log.item,
          "Department": log.department,
          "Faculty": log.faculty || "N/A",
          "Qty": log.quantity,
          "Date": log.date.split(" ")[0]
        }));
      } else if (intent.onlyReceived) {
        const filtered = orders.filter(o => o.status === "Received" && isWithinRange(o.orderDate));
        totalRecords = filtered.length;
        previewTable = filtered.slice(0, 10).map(o => ({
          "Item": o.item,
          "Supplier": o.supplier,
          "Qty": o.quantity,
          "Price": `₹${o.pricePerUnit?.toLocaleString()}`,
          "Date": o.orderDate
        }));
      } else if (intent.onlyMaintenance) {
        if (intent.maintenanceUnitId) {
          const unit = (maintenanceLogs || []).find(ro => ro.id === intent.maintenanceUnitId);
          if (unit) {
            const filtered = (unit.history || []).filter(h => isWithinRange(h.date));
            totalRecords = filtered.length;
            previewTable = filtered.slice(0, 10).map(h => ({
              "Part": h.partRepaired,
              "Qty": h.quantity,
              "Cost": `₹${h.totalAmount?.toLocaleString()}`,
              "Date": h.date,
              "Tech": h.technician
            }));
          }
        } else {
          const list = (maintenanceLogs || []);
          totalRecords = list.length;
          previewTable = list.slice(0, 10).map(unit => {
            const filtered = (unit.history || []).filter(h => isWithinRange(h.date));
            const totalCost = filtered.reduce((sum, h) => sum + h.totalAmount, 0);
            return {
              "Unit ID": unit.id,
              "Name": unit.name,
              "Location": unit.location,
              "Logs": filtered.length,
              "Repair Cost": `₹${totalCost.toLocaleString()}`,
              "Status": unit.status
            };
          });
        }
      } else {
        const filteredOrders = orders.filter(o => isWithinRange(o.orderDate));
        const filteredIssued = issuedStock.filter(log => isWithinRange(log.date));
        totalRecords = filteredOrders.length + filteredIssued.length;
        
        previewTable = [
          ...filteredOrders.slice(0, 5).map(o => ({
            "Type": "Purchase",
            "Item": o.item,
            "Qty": o.quantity,
            "Entity/Dept": o.supplier,
            "Date": o.orderDate
          })),
          ...filteredIssued.slice(0, 5).map(log => ({
            "Type": "Issued",
            "Item": log.item,
            "Qty": log.quantity,
            "Entity/Dept": log.department,
            "Date": log.date.split(" ")[0]
          }))
        ];
      }

      let textResponse = `📊 **Report Preview: ${typeDesc}**\nHere is a preview of the requested report data for the range **${startStr}** to **${endStr}** (Total: **${totalRecords}** records found).\n\nUse the buttons below to export or print the full report:`;
      if (totalRecords === 0) {
        textResponse = `📊 **Report Preview: ${typeDesc}**\nNo records were found for the range **${startStr}** to **${endStr}**.\n\nYou can still download or print the blank layout if needed:`;
      }

      return {
        text: textResponse,
        table: previewTable.length > 0 ? previewTable : null,
        downloadReportOptions: {
          startDate: startStr,
          endDate: endStr,
          conditions: {
            onlyOrdered: intent.onlyOrdered,
            onlyIssued: intent.onlyIssued,
            onlyReceived: intent.onlyReceived,
            onlyMaintenance: intent.onlyMaintenance,
            maintenanceUnitId: intent.maintenanceUnitId
          }
        },
        speak: `Here is the preview and download options for the ${typeDesc}.`
      };
    }

    case "comparison": {
      const comp = parseComparison(intent.query);
      if (comp.type === "years") {
        const y1 = comp.val1;
        const y2 = comp.val2;

        const getYearData = (year) => {
          const yOrders = orders.filter(o => new Date(o.orderDate).getFullYear() === year);
          const yIssues = issuedStock.filter(log => {
            const cleanDateStr = log.date.replace(/AM|PM/i, "").trim();
            return new Date(cleanDateStr).getFullYear() === year;
          });
          const totalOrdersAmt = yOrders.reduce((sum, o) => sum + (o.quantity * o.pricePerUnit), 0);
          const totalIssuesQty = yIssues.reduce((sum, log) => sum + log.quantity, 0);
          return { ordersCount: yOrders.length, ordersAmount: totalOrdersAmt, issuesCount: yIssues.length, issuesQty: totalIssuesQty };
        };

        const d1 = getYearData(y1);
        const d2 = getYearData(y2);

        const tableData = [
          { "Metric": "Orders Placed (Count)", [y1]: d1.ordersCount, [y2]: d2.ordersCount, "Difference": d2.ordersCount - d1.ordersCount },
          { "Metric": "Orders Value", [y1]: `₹${d1.ordersAmount.toLocaleString()}`, [y2]: `₹${d2.ordersAmount.toLocaleString()}`, "Difference": `₹${(d2.ordersAmount - d1.ordersAmount).toLocaleString()}` },
          { "Metric": "Stock Dispatches (Count)", [y1]: d1.issuesCount, [y2]: d2.issuesCount, "Difference": d2.issuesCount - d1.issuesCount },
          { "Metric": "Units Disbursed", [y1]: d1.issuesQty, [y2]: d2.issuesQty, "Difference": d2.issuesQty - d1.issuesQty }
        ];

        return {
          text: `📊 **Comparison Report: Year ${y1} vs ${y2}**:\nHere is the comparison table of orders and dispatches for the selected years:`,
          table: tableData,
          speak: `Comparing data for year ${y1} and year ${y2}.`,
          suggestedNavigate: "/analytics",
          suggestedNavigateLabel: "Analytics"
        };
      } else {
        const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const m1 = comp.val1;
        const m2 = comp.val2;
        const currentYear = new Date().getFullYear();

        const getMonthData = (monthIndex) => {
          const mOrders = orders.filter(o => {
            const d = new Date(o.orderDate);
            return d.getMonth() === monthIndex && d.getFullYear() === currentYear;
          });
          const mIssues = issuedStock.filter(log => {
            const cleanDateStr = log.date.replace(/AM|PM/i, "").trim();
            const d = new Date(cleanDateStr);
            return d.getMonth() === monthIndex && d.getFullYear() === currentYear;
          });
          const totalOrdersAmt = mOrders.reduce((sum, o) => sum + (o.quantity * o.pricePerUnit), 0);
          const totalIssuesQty = mIssues.reduce((sum, log) => sum + log.quantity, 0);
          return { ordersCount: mOrders.length, ordersAmount: totalOrdersAmt, issuesCount: mIssues.length, issuesQty: totalIssuesQty };
        };

        const d1 = getMonthData(m1);
        const d2 = getMonthData(m2);

        const tableData = [
          { "Metric": "Orders Placed (Count)", [mNames[m1]]: d1.ordersCount, [mNames[m2]]: d2.ordersCount, "Difference": d2.ordersCount - d1.ordersCount },
          { "Metric": "Orders Value", [mNames[m1]]: `₹${d1.ordersAmount.toLocaleString()}`, [mNames[m2]]: `₹${d2.ordersAmount.toLocaleString()}`, "Difference": `₹${(d2.ordersAmount - d1.ordersAmount).toLocaleString()}` },
          { "Metric": "Stock Dispatches (Count)", [mNames[m1]]: d1.issuesCount, [mNames[m2]]: d2.issuesCount, "Difference": d2.issuesCount - d1.issuesCount },
          { "Metric": "Units Disbursed", [mNames[m1]]: d1.issuesQty, [mNames[m2]]: d2.issuesQty, "Difference": d2.issuesQty - d1.issuesQty }
        ];

        return {
          text: `📊 **Comparison Report: ${mNames[m1]} vs ${mNames[m2]} (${currentYear})**:\nHere is the comparison table of orders and dispatches:`,
          table: tableData,
          speak: `Comparing data for ${mNames[m1]} and ${mNames[m2]}.`,
          suggestedNavigate: "/analytics",
          suggestedNavigateLabel: "Analytics"
        };
      }
    }

    case "most-least-frequent-reason": {
      // Calculate order frequencies
      const orderFreq = {};
      orders.forEach(o => {
        const key = o.item || o.subcategory || "Unknown";
        orderFreq[key] = (orderFreq[key] || 0) + o.quantity;
      });

      // Calculate issue frequencies
      const issueFreq = {};
      issuedStock.forEach(log => {
        const key = log.item || log.subcategory || "Unknown";
        issueFreq[key] = (issueFreq[key] || 0) + log.quantity;
      });

      // Sort
      const sortedOrders = Object.entries(orderFreq).sort(([, a], [, b]) => b - a);
      const sortedIssues = Object.entries(issueFreq).sort(([, a], [, b]) => b - a);

      // Most frequent
      let mostFreqOrderName = "Desktop Computer";
      let mostFreqOrderQty = 0;
      if (sortedOrders.length > 0) {
        mostFreqOrderName = sortedOrders[0][0];
        mostFreqOrderQty = sortedOrders[0][1];
      }

      let mostFreqIssueName = "Desktop Computer";
      let mostFreqIssueQty = 0;
      if (sortedIssues.length > 0) {
        mostFreqIssueName = sortedIssues[0][0];
        mostFreqIssueQty = sortedIssues[0][1];
      }

      // Least frequent (positive transaction count)
      let leastFreqOrderName = "Laser Printer";
      let leastFreqOrderQty = 0;
      if (sortedOrders.length > 0) {
        const positiveOrders = sortedOrders.filter(([, qty]) => qty > 0);
        if (positiveOrders.length > 0) {
          const least = positiveOrders[positiveOrders.length - 1];
          leastFreqOrderName = least[0];
          leastFreqOrderQty = least[1];
        }
      }

      let leastFreqIssueName = "Projector";
      let leastFreqIssueQty = 0;
      if (sortedIssues.length > 0) {
        const positiveIssues = sortedIssues.filter(([, qty]) => qty > 0);
        if (positiveIssues.length > 0) {
          const least = positiveIssues[positiveIssues.length - 1];
          leastFreqIssueName = least[0];
          leastFreqIssueQty = least[1];
        }
      }

      const text = `📊 **Most and Least Frequent Items Analysis**

• **Most Frequently Ordered Item**: **${mostFreqOrderName}** (with a total of **${mostFreqOrderQty}** units ordered).
• **Most Frequently Issued Item**: **${mostFreqIssueName}** (with a total of **${mostFreqIssueQty}** units disbursed).

• **Least Frequently Ordered Item (Active)**: **${leastFreqOrderName}** (with only **${leastFreqOrderQty}** units ordered).
• **Least Frequently Issued Item (Active)**: **${leastFreqIssueName}** (with only **${leastFreqIssueQty}** units disbursed).
*Note: Other cataloged inventory items currently have 0 active transactions.*

---

### 🔍 Comparison & Reasons Behind It

1. **Why is ${mostFreqOrderName || mostFreqIssueName} frequently ordered/issued?**
   • **Core Infrastructure Demand**: Desktop Computers are foundational hardware. They are ordered and issued in high numbers to establish new computer labs, upgrade departmental workspaces, and equip faculty cabins.
   • **Consumable Velocity**: If high-volume consumables (like A4 paper or markers) rank high, it's due to their daily usage for lectures, examinations, and administrative record-keeping, requiring regular replenishment.

2. **Why is ${leastFreqOrderName || leastFreqIssueName} infrequently ordered/issued?**
   • **High-Durability & Cost**: Items like Laser Printers and Projectors are expensive capital investments with a long lifecycle (3–5 years). They are shared by multiple staff members and departments, meaning they do not require recurring replacement.
   • **Asset Permanence**: Unlike pens or paper, once a desk, printer, or projector is issued to a lab, it remains active there for years, keeping transaction logs for these items low.`;

      const speakText = `The most frequently ordered item is ${mostFreqOrderName} with ${mostFreqOrderQty} units, while the least ordered is ${leastFreqOrderName} with ${leastFreqOrderQty} units. This is because core hardware like computers are in constant demand for college labs, whereas durable equipment like printers have long lifecycles and are rarely replaced.`;

      return {
        text,
        speak: speakText,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "why-frequent": {
      const q = intent.query;
      const matchedItem = inventory.find(item =>
        q.includes(item.item.toLowerCase()) ||
        q.includes(item.subcategory.toLowerCase()) ||
        item.item.toLowerCase().split(" ").some(word => word.length > 3 && q.includes(word))
      );

      if (!matchedItem) {
        return {
          text: `I couldn't identify the specific item you are asking about. Can you specify the item name? For example, "why is register ordered frequently?" or "why is desktop computer ordered freq?"`,
          speak: "I couldn't identify the item. Please specify the item name."
        };
      }

      const itemLogs = issuedStock.filter(log =>
        log.item.toLowerCase().includes(matchedItem.subcategory.toLowerCase()) ||
        log.item.toLowerCase().includes(matchedItem.item.toLowerCase())
      );

      const totalQtyIssued = itemLogs.reduce((sum, log) => sum + log.quantity, 0);
      const uniqueDepts = [...new Set(itemLogs.map(log => log.department))];
      const frequencyCount = itemLogs.length;

      if (frequencyCount === 0) {
        return {
          text: `Based on current records, **${matchedItem.item}** has not been issued to any departments yet. However, standard consumables like this are ordered to maintain base stock levels in the warehouse.`,
          speak: `${matchedItem.item} has not been issued yet, but we stock it as a standard commodity.`,
          suggestedNavigate: "/inventory",
          suggestedNavigateLabel: "Inventory"
        };
      }

      return {
        text: `📈 **Usage Analysis for ${matchedItem.item}**:\n• **High Consumption**: It has been disbursed/issued **${frequencyCount}** times, with a total of **${totalQtyIssued}** units distributed.\n• **Widespread Demand**: It is requested across **${uniqueDepts.length}** department(s): *${uniqueDepts.join(", ")}*.\n• **Stock Type**: Being classified under **${matchedItem.category}**, this item is a high-demand consumable that requires regular reordering to prevent stockouts (current stock: **${matchedItem.stock}** units).`,
        speak: `${matchedItem.item} is ordered frequently because it has been issued ${frequencyCount} times across ${uniqueDepts.length} departments to support college operations.`,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "stock-query": {
      const q = intent.query;
      // Try to extract item name from query
      const matchedItems = inventory.filter(item =>
        item.item.toLowerCase().split(" ").some(word => word.length > 2 && q.includes(word.toLowerCase())) ||
        item.subcategory.toLowerCase().split(" ").some(word => word.length > 2 && q.includes(word.toLowerCase())) ||
        q.includes(item.item.toLowerCase()) ||
        q.includes(item.subcategory.toLowerCase())
      ).slice(0, 10);

      if (matchedItems.length === 0) {
        return {
          text: `I couldn't find any matching items. Try asking about a specific item name like "how much A4 paper is left" or "stock of highlighter".`,
          speak: `I couldn't find matching items. Please try with a specific item name.`
        };
      }

      const tableData = matchedItems.map(item => ({
        "Item": item.item,
        "Category": item.category,
        "Type": item.type,
        "Stock": item.stock,
        "Status": item.stock <= threshold ? "⚠️ Low" : "✅ Good"
      }));

      const spokenSummary = matchedItems.length === 1
        ? `${matchedItems[0].item} has ${matchedItems[0].stock} units remaining.`
        : `Found ${matchedItems.length} items. The first one, ${matchedItems[0].item}, has ${matchedItems[0].stock} units.`;

      return {
        text: `Here are the stock levels for your query:`,
        table: tableData,
        speak: spokenSummary,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "low-stock": {
      const lowItems = inventory.filter(item => item.stock <= threshold);
      if (lowItems.length === 0) {
        return { text: `✅ Great news! No items are currently below the low-stock threshold of ${threshold} units.`, speak: `All items are well stocked. No low stock alerts.` };
      }
      const tableData = lowItems.map(item => ({ "Item": item.item, "Category": item.category, "Current Stock": item.stock, "Threshold": threshold }));
      return {
        text: `⚠️ ${lowItems.length} item(s) are low on stock (threshold: ${threshold} units):`,
        table: tableData,
        speak: `Alert! ${lowItems.length} items are running low on stock. The first one is ${lowItems[0].item} with only ${lowItems[0].stock} units remaining.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "all-inventory": {
      const tableData = inventory.slice(0, 20).map(item => ({
        "ID": item.id,
        "Item": item.item,
        "Category": item.category,
        "Stock": item.stock,
        "Price (₹)": item.price?.toLocaleString()
      }));
      return {
        text: `📦 Showing first 20 of ${inventory.length} total inventory items:`,
        table: tableData,
        speak: `The inventory has ${inventory.length} total items. Showing the top 20 here.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "inventory-value": {
      const total = inventory.reduce((acc, item) => acc + (item.stock * (item.price || 0)), 0);
      return {
        text: `💰 Total inventory value is ₹${total.toLocaleString()} across ${inventory.length} item types.`,
        speak: `Total inventory value is rupees ${(total / 100000).toFixed(1)} lakh.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "total-items": {
      const totalQty = inventory.reduce((acc, item) => acc + item.stock, 0);
      return {
        text: `📊 Total stock: **${totalQty.toLocaleString()} units** across **${inventory.length} item types**.`,
        speak: `There are ${totalQty.toLocaleString()} total units across ${inventory.length} item types in inventory.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "categories": {
      const cats = [...new Set(inventory.map(i => i.category))];
      const catCounts = cats.map(cat => ({ "Category": cat, "Item Types": inventory.filter(i => i.category === cat).length, "Total Stock": inventory.filter(i => i.category === cat).reduce((a, i) => a + i.stock, 0) }));
      return {
        text: `🗂️ Inventory categories (${cats.length} total):`,
        table: catCounts,
        speak: `There are ${cats.length} categories in inventory: ${cats.slice(0, 3).join(", ")} and more.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "pending-orders": {
      const pending = orders.filter(o => o.status === "Pending");
      if (pending.length === 0) return { text: `✅ No pending orders right now. All orders have been processed.`, speak: `No pending orders at the moment.` };
      const tableData = pending.map(o => ({ "Order ID": o.id, "Item": o.item, "Supplier": o.supplier, "Qty": o.quantity, "Total (₹)": (o.quantity * o.pricePerUnit)?.toLocaleString() }));
      return {
        text: `⏳ ${pending.length} order(s) are pending approval:`,
        table: tableData,
        speak: `There are ${pending.length} orders pending approval. The first is order ${pending[0].id} for ${pending[0].item}.`,
        suggestedNavigate: "/place-order",
        suggestedNavigateLabel: "Place Order"
      };
    }

    case "approved-orders": {
      const approved = orders.filter(o => o.status === "Approved");
      if (approved.length === 0) return { text: `No orders have been fully approved yet.`, speak: `No approved orders found.` };
      const tableData = approved.map(o => ({ "Order ID": o.id, "Item": o.item, "Supplier": o.supplier, "Qty": o.quantity }));
      return {
        text: `✅ ${approved.length} approved order(s):`,
        table: tableData,
        speak: `${approved.length} orders have been approved and are ready to be received.`,
        suggestedNavigate: "/receive-order",
        suggestedNavigateLabel: "Receive Order"
      };
    }

    case "received-orders": {
      const received = orders.filter(o => o.status === "Received");
      if (received.length === 0) return { text: `No orders have been fully received yet.`, speak: `No received orders found.` };
      const tableData = received.map(o => ({ "Order ID": o.id, "Item": o.item, "Qty": o.quantity, "Received On": o.receiveDate || "N/A" }));
      return {
        text: `📦 ${received.length} received order(s):`,
        table: tableData,
        speak: `${received.length} orders have been received into the warehouse.`,
        suggestedNavigate: "/receive-order",
        suggestedNavigateLabel: "Receive Order"
      };
    }

    case "rejected-orders": {
      const rejected = orders.filter(o => o.status === "Rejected");
      if (rejected.length === 0) return { text: `✅ No orders have been rejected.`, speak: `No rejected orders.` };
      const tableData = rejected.map(o => ({ "Order ID": o.id, "Item": o.item, "Supplier": o.supplier, "Qty": o.quantity }));
      return {
        text: `❌ ${rejected.length} rejected order(s):`,
        table: tableData,
        speak: `${rejected.length} orders were rejected.`,
        suggestedNavigate: "/place-order",
        suggestedNavigateLabel: "Place Order"
      };
    }

    case "all-orders": {
      const tableData = orders.slice(0, 15).map(o => ({ "Order ID": o.id, "Item": o.item, "Supplier": o.supplier, "Qty": o.quantity, "Status": o.status, "Date": o.orderDate }));
      return {
        text: `📋 Showing ${Math.min(15, orders.length)} of ${orders.length} total orders:`,
        table: tableData,
        speak: `There are ${orders.length} total purchase orders in the system.`,
        suggestedNavigate: "/place-order",
        suggestedNavigateLabel: "Place Order"
      };
    }

    case "orders-date": {
      const q = intent.query;
      const dateRange = parseDateRange(q);
      
      let filtered = orders;
      if (dateRange.isDateQuery) {
        filtered = orders.filter(o => {
          const d = new Date(o.orderDate);
          if (dateRange.fromDate && d < dateRange.fromDate) return false;
          if (dateRange.toDate && d > dateRange.toDate) return false;
          return true;
        });
      }
      
      // If the intent has a parentIntent or we want to filter subcategories of orders (e.g. pending, approved, etc.)
      const statusFilter = intent.parentIntent || q;
      if (/\b(pending|waiting|unapproved)\b/i.test(statusFilter)) {
        filtered = filtered.filter(o => o.status === "Pending");
      } else if (/\b(approved|ready)\b/i.test(statusFilter)) {
        filtered = filtered.filter(o => o.status === "Approved");
      } else if (/\b(received|completed|fully\s+received)\b/i.test(statusFilter)) {
        filtered = filtered.filter(o => o.status === "Received");
      } else if (/\b(rejected)\b/i.test(statusFilter)) {
        filtered = filtered.filter(o => o.status === "Rejected");
      }

      if (filtered.length === 0) {
        let msg = "No orders found for the specified period.";
        if (dateRange.fromDate && dateRange.toDate) {
          msg = `No orders found between ${dateRange.fromDate.toLocaleDateString()} and ${dateRange.toDate.toLocaleDateString()}.`;
        } else if (dateRange.toDate) {
          msg = `No orders found placed up to ${dateRange.toDate.toLocaleDateString()}.`;
        } else if (dateRange.fromDate) {
          msg = `No orders found placed after ${dateRange.fromDate.toLocaleDateString()}.`;
        }
        return {
          text: `📅 ${msg}`,
          speak: `No orders found for that period.`,
          suggestedNavigate: "/place-order",
          suggestedNavigateLabel: "Place Order"
        };
      }

      const tableData = filtered.map(o => ({
        "Order ID": o.id,
        "Item": o.item,
        "Status": o.status,
        "Qty": o.quantity,
        "Date": o.orderDate
      }));

      let rangeStr = "";
      if (dateRange.fromDate && dateRange.toDate) {
        rangeStr = `between ${dateRange.fromDate.toLocaleDateString()} and ${dateRange.toDate.toLocaleDateString()}`;
      } else if (dateRange.toDate) {
        rangeStr = `up to ${dateRange.toDate.toLocaleDateString()}`;
      } else if (dateRange.fromDate) {
        rangeStr = `since ${dateRange.fromDate.toLocaleDateString()}`;
      }

      return {
        text: `📅 Found ${filtered.length} order(s) for the period ${rangeStr}:`,
        table: tableData,
        speak: `Found ${filtered.length} orders for the requested period.`,
        suggestedNavigate: "/place-order",
        suggestedNavigateLabel: "Place Order"
      };
    }

    case "issued-stock": {
      const q = intent.query || "";
      const dateRange = parseDateRange(q);
      
      let filtered = issuedStock;
      if (dateRange.isDateQuery) {
        filtered = issuedStock.filter(log => {
          const cleanDateStr = log.date.replace(/AM|PM/i, "").trim();
          const d = new Date(cleanDateStr);
          if (dateRange.fromDate && d < dateRange.fromDate) return false;
          if (dateRange.toDate && d > dateRange.toDate) return false;
          return true;
        });
      }

      if (filtered.length === 0) {
        return {
          text: `No stock issues found for the specified period.`,
          speak: `No issue records found for that period.`,
          suggestedNavigate: "/issue-stock",
          suggestedNavigateLabel: "Issue Stock"
        };
      }

      // Group identical items by item name, department, faculty, and normalized date
      const groupedIssued = {};
      filtered.forEach(log => {
        const itemKey = (log.item || "").trim();
        const deptKey = (log.department || "").trim();
        const facultyKey = (log.faculty || "N/A").trim();
        const dateKey = normalizeDateString(log.date);
        const key = `${itemKey}|${deptKey}|${facultyKey}|${dateKey}`;

        if (groupedIssued[key]) {
          groupedIssued[key].Qty += log.quantity;
        } else {
          groupedIssued[key] = {
            id: log.id,
            item: itemKey,
            department: deptKey,
            faculty: facultyKey,
            Qty: log.quantity,
            date: dateKey
          };
        }
      });

      const groupedList = Object.values(groupedIssued);
      const tableData = groupedList.slice(0, 50).map(log => ({
        "ID": `#IS-${String(log.id).padStart(3, "0")}`,
        "Item": log.item,
        "Qty": log.Qty,
        "Issued To": log.department,
        "Faculty": log.faculty,
        "Date": log.date
      }));

      return {
        text: `📤 Stock issue records for the queried period (Found ${filtered.length} entries, showing ${tableData.length} consolidated rows):`,
        table: tableData,
        speak: `Found ${filtered.length} stock issue records, grouped into ${groupedList.length} unique batches.`,
        suggestedNavigate: "/issue-stock",
        suggestedNavigateLabel: "Issue Stock"
      };
    }

    case "issued-to": {
      const q = intent.query;
      const filtered = issuedStock.filter(log =>
        log.department.toLowerCase().split(" ").some(w => q.includes(w)) ||
        (log.faculty || "").toLowerCase().split(" ").some(w => w.length > 2 && q.includes(w))
      );
      if (filtered.length === 0) return { text: `I couldn't find any issued stock records matching your query. Try mentioning a department or faculty name.`, speak: `No matching issue records found.` };
      const tableData = filtered.map(log => ({ "Item": log.item, "Qty": log.quantity, "Issued To": log.department, "Faculty": log.faculty, "Date": log.date }));
      return {
        text: `📤 Issued stock matching your query:`,
        table: tableData,
        speak: `Found ${filtered.length} records matching your query.`,
        suggestedNavigate: "/issue-stock",
        suggestedNavigateLabel: "Issue Stock"
      };
    }

    case "most-frequent": {
      const itemFreq = {};
      issuedStock.forEach(log => {
        const key = log.item || log.subcategory || "Unknown";
        itemFreq[key] = (itemFreq[key] || 0) + log.quantity;
      });
      const sorted = Object.entries(itemFreq).sort(([, a], [, b]) => b - a).slice(0, 10);
      if (sorted.length === 0) return { text: `No issued stock data available to analyze frequencies.`, speak: `No frequency data available yet.` };
      const tableData = sorted.map(([item, qty]) => ({ "Item": item, "Total Issued": qty }));
      return {
        text: `🏆 Most frequently issued items:`,
        table: tableData,
        speak: `The most frequently issued item is ${sorted[0][0]} with ${sorted[0][1]} units issued in total.`,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "least-frequent": {
      const itemFreq = {};
      issuedStock.forEach(log => {
        const key = log.item || log.subcategory || "Unknown";
        itemFreq[key] = (itemFreq[key] || 0) + log.quantity;
      });
      const sorted = Object.entries(itemFreq).sort(([, a], [, b]) => a - b).slice(0, 10);
      if (sorted.length === 0) return { text: `No issued stock data to analyze.`, speak: `No data available.` };
      const tableData = sorted.map(([item, qty]) => ({ "Item": item, "Total Issued": qty }));
      return {
        text: `📉 Least frequently issued items:`,
        table: tableData,
        speak: `The least issued item is ${sorted[0][0]} with only ${sorted[0][1]} units issued.`,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "most-expensive": {
      const sorted = [...inventory].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, 10);
      const tableData = sorted.map(item => ({ "Item": item.item, "Category": item.category, "Price (₹)": (item.price || 0).toLocaleString(), "Stock": item.stock }));
      return {
        text: `💎 Most expensive items in inventory:`,
        table: tableData,
        speak: `The most expensive item is ${sorted[0].item} at rupees ${sorted[0].price?.toLocaleString()} per unit.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "cheapest": {
      const sorted = [...inventory].filter(i => i.price > 0).sort((a, b) => (a.price || 0) - (b.price || 0)).slice(0, 10);
      const tableData = sorted.map(item => ({ "Item": item.item, "Category": item.category, "Price (₹)": (item.price || 0).toLocaleString(), "Stock": item.stock }));
      return {
        text: `💸 Least expensive items in inventory:`,
        table: tableData,
        speak: `The cheapest item is ${sorted[0].item} at only rupees ${sorted[0].price} per unit.`,
        suggestedNavigate: "/inventory",
        suggestedNavigateLabel: "Inventory"
      };
    }

    case "order-count": {
      const by_status = { Pending: 0, Approved: 0, Received: 0, Rejected: 0 };
      orders.forEach(o => { by_status[o.status] = (by_status[o.status] || 0) + 1; });
      const tableData = Object.entries(by_status).map(([status, count]) => ({ "Status": status, "Count": count }));
      return {
        text: `📊 Order summary (${orders.length} total):`,
        table: tableData,
        speak: `There are ${orders.length} total orders: ${by_status.Pending} pending, ${by_status.Approved} approved, ${by_status.Received} received, and ${by_status.Rejected} rejected.`,
        suggestedNavigate: "/place-order",
        suggestedNavigateLabel: "Place Order"
      };
    }

    case "top-supplier": {
      const supplierFreq = {};
      orders.forEach(o => { supplierFreq[o.supplier] = (supplierFreq[o.supplier] || 0) + 1; });
      const sorted = Object.entries(supplierFreq).sort(([, a], [, b]) => b - a).slice(0, 5);
      if (sorted.length === 0) return { text: `No order data available.`, speak: `No supplier data found.` };
      const tableData = sorted.map(([supplier, count]) => ({ "Supplier": supplier, "Orders Placed": count }));
      return {
        text: `🏢 Top suppliers by order count:`,
        table: tableData,
        speak: `The top supplier is ${sorted[0][0]} with ${sorted[0][1]} orders.`,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "dept-report": {
      return {
        text: `📊 **Department-Wise Reports**\nAll department-wise records of item purchases and stock disbursements are visualised dynamically in the **Analytics** section. This includes department charts, item distributions, and detailed audit lists.\n\nWould you like to open the **Analytics** page to view the full department-wise report?`,
        speak: `The analytics section contains all the information of items issued and ordered department-wise. I recommend opening the Analytics page.`,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "orders-and-issued": {
      const q = intent.query || "";
      const dateRange = parseDateRange(q);
      
      let filteredOrders = orders;
      let filteredIssued = issuedStock;
      if (dateRange.isDateQuery) {
        filteredOrders = orders.filter(o => {
          const d = new Date(o.orderDate);
          if (dateRange.fromDate && d < dateRange.fromDate) return false;
          if (dateRange.toDate && d > dateRange.toDate) return false;
          return true;
        });
        filteredIssued = issuedStock.filter(log => {
          const cleanDateStr = log.date.replace(/AM|PM/i, "").trim();
          const d = new Date(cleanDateStr);
          if (dateRange.fromDate && d < dateRange.fromDate) return false;
          if (dateRange.toDate && d > dateRange.toDate) return false;
          return true;
        });
      }

      // Group duplicate items to consolidate records
      const groupedData = {};

      filteredOrders.forEach(o => {
        const itemKey = (o.item || "").trim();
        const supplierKey = (o.supplier || "").trim();
        const dateStatusKey = `${normalizeDateString(o.orderDate)} (${o.status})`;
        const key = `order|${itemKey}|${supplierKey}|${dateStatusKey}`;

        if (groupedData[key]) {
          groupedData[key].Qty += o.quantity;
        } else {
          groupedData[key] = {
            "Type": "📦 Order",
            "Item": itemKey,
            "Qty": o.quantity,
            "Dept/Supplier": supplierKey,
            "Date/Status": dateStatusKey
          };
        }
      });

      filteredIssued.forEach(log => {
        const itemKey = (log.item || "").trim();
        const deptKey = (log.department || "").trim();
        const dateKey = normalizeDateString(log.date);
        const key = `issued|${itemKey}|${deptKey}|${dateKey}`;

        if (groupedData[key]) {
          groupedData[key].Qty += log.quantity;
        } else {
          groupedData[key] = {
            "Type": "📤 Issued",
            "Item": itemKey,
            "Qty": log.quantity,
            "Dept/Supplier": deptKey,
            "Date/Status": dateKey
          };
        }
      });

      const groupedList = Object.values(groupedData);
      const tableData = groupedList.slice(0, 50);

      return {
        text: `📋 **Orders and Stock Disbursements Report:**\nFound **${filteredOrders.length}** order(s) and **${filteredIssued.length}** item(s) issued for the period (showing ${tableData.length} consolidated rows):\n\nShowing the entries:`,
        table: tableData.length > 0 ? tableData : null,
        speak: `Here are the details for both the orders placed and items issued.`,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "summary": {
      const q = intent.query || "";
      const dateRange = parseDateRange(q);

      if (dateRange.isDateQuery) {
        const startStr = dateRange.fromDate ? formatLocalDate(dateRange.fromDate) : "2026-06-01";
        const endStr = dateRange.toDate ? formatLocalDate(dateRange.toDate) : "2026-06-30";
        
        const isWithinRange = (dateStr) => {
          if (!dateStr) return false;
          const cleanDate = dateStr.split(" ")[0];
          return cleanDate >= startStr && cleanDate <= endStr;
        };

        const periodOrders = orders.filter(o => isWithinRange(o.orderDate));
        const periodReceived = orders.filter(o => o.status === "Received" && isWithinRange(o.orderDate));
        const periodIssued = issuedStock.filter(log => isWithinRange(log.date));

        const totalOrdersValue = periodOrders.reduce((sum, o) => sum + (o.quantity * o.pricePerUnit), 0);
        const totalReceivedValue = periodReceived.reduce((sum, o) => sum + (o.quantity * o.pricePerUnit), 0);
        const totalIssuedQty = periodIssued.reduce((sum, log) => sum + log.quantity, 0);

        const getIssuedItemPrice = (log) => {
          const invItem = inventory.find(item => 
            (item.category || "").toLowerCase() === (log.category || "").toLowerCase() &&
            (item.subcategory || "").toLowerCase() === (log.subcategory || "").toLowerCase() &&
            (item.type || "").toLowerCase() === (log.type || "").toLowerCase()
          );
          return invItem ? invItem.price : 0;
        };
        const totalIssuedValue = periodIssued.reduce((sum, log) => sum + (log.quantity * getIssuedItemPrice(log)), 0);

        const rangeLabel = dateRange.fromDate && dateRange.toDate
          ? `from **${startStr}** to **${endStr}**`
          : dateRange.fromDate
            ? `since **${startStr}**`
            : `up to **${endStr}**`;

        return {
          text: `📊 **Period Summary (${rangeLabel}):**\n\n• 📦 **Purchase Orders:** **${periodOrders.length}** placed (Value: **₹${totalOrdersValue.toLocaleString()}**)\n• ✅ **Received Shipments:** **${periodReceived.length}** (Value: **₹${totalReceivedValue.toLocaleString()}**)\n• 📤 **Disbursed Stock:** **${periodIssued.length}** disbursements containing **${totalIssuedQty}** units (Value: **₹${totalIssuedValue.toLocaleString()}**)\n\nWould you like to view summaries for another period?`,
          speak: `Here is the inventory summary for the selected period.`,
          summaryOptions: true,
          suggestedNavigate: "/analytics",
          suggestedNavigateLabel: "Analytics"
        };
      }

      const totalItems = inventory.length;
      const totalStock = inventory.reduce((a, i) => a + i.stock, 0);
      const totalValue = inventory.reduce((a, i) => a + (i.stock * (i.price || 0)), 0);
      const pendingCount = orders.filter(o => o.status === "Pending").length;
      const lowCount = inventory.filter(i => i.stock <= threshold).length;
      return {
        text: `📊 **Inventory Snapshot (Global):**\n• **${totalItems}** item types | **${totalStock.toLocaleString()}** total units\n• **₹${(totalValue/100000).toFixed(1)}L** total value\n• **${pendingCount}** orders awaiting approval\n• **${lowCount}** items low on stock\n\nWould you like a summary of the **week**, **month**, or a **custom** date range?`,
        speak: `Here is the general inventory snapshot. Would you like a summary of the week, month, or a custom range?`,
        summaryOptions: true,
        suggestedNavigate: "/analytics",
        suggestedNavigateLabel: "Analytics"
      };
    }

    case "help": {
      return {
        text: `🤖 **I can help you with:**\n• **Stock queries** — "How much A4 paper is left?"\n• **Low stock** — "Show low stock items"\n• **Orders** — "Show pending orders" / "Show orders from June"\n• **Issued stock** — "What was issued to lab?"\n• **Analytics** — "Most frequent item" / "Most expensive item"\n• **Navigation** — "Open inventory" / "Go to reports"\n• **Summary** — "Give me a summary"`,
        speak: `I can answer questions about stock levels, orders, issued items, and analytics. Just ask me anything related to the inventory!`
      };
    }

    case "fuzzy-inventory": {
      const q = intent.query;
      const matchedItems = inventory.filter(item =>
        item.item.toLowerCase().split(" ").some(word => word.length > 2 && q.includes(word.toLowerCase())) ||
        item.subcategory.toLowerCase().split(" ").some(word => word.length > 2 && q.includes(word.toLowerCase())) ||
        q.includes(item.item.toLowerCase()) ||
        q.includes(item.subcategory.toLowerCase())
      ).slice(0, 10);

      if (matchedItems.length > 0) {
        const tableData = matchedItems.map(item => ({
          "Item": item.item,
          "Category": item.category,
          "Type": item.type,
          "Stock": item.stock,
          "Status": item.stock <= threshold ? "⚠️ Low" : "✅ Good"
        }));

        const spokenSummary = matchedItems.length === 1
          ? `${matchedItems[0].item} has ${matchedItems[0].stock} units remaining.`
          : `Found ${matchedItems.length} items. The first one, ${matchedItems[0].item}, has ${matchedItems[0].stock} units.`;

        return {
          text: `I found these stock levels related to your query:`,
          table: tableData,
          speak: spokenSummary,
          suggestedNavigate: "/inventory",
          suggestedNavigateLabel: "Inventory"
        };
      }

      if (/\b(orders?|purchase|placed)\b/i.test(q)) {
        return {
          text: `I understood you are asking about orders, but I couldn't understand the specific request. You can try:\n• "Show pending orders"\n• "Show all orders"\n• "Show orders from [date]"`,
          speak: `I couldn't understand your order query. Try asking to show pending or all orders.`,
          suggestedNavigate: "/place-order",
          suggestedNavigateLabel: "Place Order"
        };
      }

      if (/\b(issue|issued|given|disbursed)\b/i.test(q)) {
        return {
          text: `I understood you are asking about issued stock, but I couldn't understand the specific request. You can try:\n• "Show issued stock"\n• "What was issued to Mr. Sharma?"\n• "Show stock issued this week"`,
          speak: `I couldn't understand your issue query. Try asking to show issued stock.`,
          suggestedNavigate: "/issue-stock",
          suggestedNavigateLabel: "Issue Stock"
        };
      }

      return {
        text: `I understood this is an inventory-related question, but I couldn't find specific data or a matching command.\nCan you try rephrasing? For example:\n• "How much A4 paper is left?"\n• "Show me orders from June 1st"\n• "Show low stock items"`,
        speak: `I understood your question is about inventory, but I couldn't find matching data. Please try rephrasing.`
      };
    }

    case "off-topic":
    default:
      return {
        text: `❌ Sorry, I can only answer inventory-related questions. Please ask me about stock levels, orders, issued items, or analytics. Type "help" to see what I can do!`,
        speak: `Sorry, I can only answer inventory related questions. Thank you.`
      };
  }
}

/* ─── Chat Message Component ──────────────────────────────────────────────── */
function ChatMessage({ msg, onExecuteReport, onExecuteNavigate, onExecuteSummaryChoice }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-fadeIn`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 shadow-lg shadow-violet-500/30">
          AI
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-violet-500/25"
            : "bg-white/10 backdrop-blur-sm border border-white/10 text-slate-100 rounded-bl-sm"
        }`}>
          {msg.text?.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1" : ""}>
              {line.split("**").map((part, j) =>
                j % 2 === 1 ? <strong key={j} className="font-bold">{part}</strong> : part
              )}
            </p>
          ))}

          {/* Download Report Options buttons */}
          {msg.downloadReportOptions && (
            <div className="flex gap-2 mt-3 no-print">
              <button
                onClick={() => onExecuteReport(msg.downloadReportOptions.startDate, msg.downloadReportOptions.endDate, "excel", msg.downloadReportOptions.conditions)}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-lg active:scale-95 transition"
              >
                📥 Excel (.xlsx)
              </button>
              <button
                onClick={() => onExecuteReport(msg.downloadReportOptions.startDate, msg.downloadReportOptions.endDate, "pdf", msg.downloadReportOptions.conditions)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-lg active:scale-95 transition"
              >
                📄 PDF (Print)
              </button>
            </div>
          )}

          {/* Summary Choice buttons */}
          {msg.summaryOptions && (
            <div className="flex flex-wrap gap-2 mt-3 no-print">
              <button
                onClick={() => onExecuteSummaryChoice("week")}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition"
              >
                📅 Week Summary
              </button>
              <button
                onClick={() => onExecuteSummaryChoice("month")}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition"
              >
                📅 Month Summary
              </button>
              <button
                onClick={() => onExecuteSummaryChoice("custom")}
                className="px-3 py-1.5 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition"
              >
                ⚙️ Custom Summary
              </button>
            </div>
          )}

          {/* Suggested Navigation link/button */}
          {msg.suggestedNavigate && (
            <div className="flex gap-2 mt-3 no-print">
              <button
                onClick={() => onExecuteNavigate(msg.suggestedNavigate)}
                className="px-3 py-1.5 rounded-xl bg-violet-500/30 hover:bg-violet-500/50 text-violet-200 border border-violet-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                🔗 Take me to {msg.suggestedNavigateLabel || "Page"}
              </button>
            </div>
          )}
        </div>

        {/* Inline data table */}
        {msg.table && msg.table.length > 0 && (
          <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  {Object.keys(msg.table[0]).map(col => (
                    <th key={col} className="p-2 text-left text-violet-300 font-bold uppercase tracking-wider whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {msg.table.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-2 text-slate-200 whitespace-nowrap">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <span className="text-[10px] text-slate-500 px-1">{msg.time}</span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold ml-2 flex-shrink-0 mt-1">
          U
        </div>
      )}
    </div>
  );
}

/* ─── Main Chatbot Component ──────────────────────────────────────────────── */
export default function InventoryChatbot() {
  const { currentUser, inventory, orders, issuedStock, systemSettings, maintenanceLogs } = useStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastIntent, setLastIntent] = useState(null);
  const [printReportData, setPrintReportData] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: `👋 Hello, ${currentUser?.name?.split(" ")[0] || "there"}! I'm your AI Inventory Assistant. Ask me anything about stock levels, orders, issued items, or analytics!`,
      speak: `Hello! I'm your AI Inventory Assistant. How can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Check if user has chatbot access
  const hasAccess = currentUser?.role === "Admin" || currentUser?.chatbotAccess === true;
  if (!hasAccess) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    if (printReportData) {
      const originalTitle = document.title;
      const cond = printReportData.conditions;
      let printTitle = "AUDIT REPORT";
      if (cond?.onlyOrdered) printTitle = "AUDIT REPORT - PURCHASE ORDERS";
      else if (cond?.onlyIssued) printTitle = "AUDIT REPORT - STOCK DISBURSEMENTS";
      else if (cond?.onlyReceived) printTitle = "AUDIT REPORT - RECEIVED SHIPMENTS";
      else if (cond?.onlyMaintenance) {
        if (cond?.maintenanceUnitId) {
          printTitle = `AUDIT REPORT - EQUIPMENT SERVICE HISTORY (${cond.maintenanceUnitId.toUpperCase()})`;
        } else {
          printTitle = "AUDIT REPORT - MAINTENANCE REGISTRY";
        }
      }
      
      document.title = printTitle;
      
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      
      return () => {
        clearTimeout(timer);
        document.title = originalTitle;
      };
    }
  }, [printReportData]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintReportData(null);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handleExecuteReport = useCallback(async (startDate, endDate, format, conditions) => {
    if (format === "excel") {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "ai",
        text: `⏳ Compiling report from **${startDate}** to **${endDate}** and generating Excel download...`,
        time: getTime()
      }]);
      playBeep("chat-receive");
      try {
        await downloadExcelReport(startDate, endDate, { orders, issuedStock, inventory, systemSettings, maintenanceLogs }, conditions);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: "ai",
          text: `✅ Excel report downloaded successfully!`,
          time: getTime()
        }]);
        playBeep("chat-receive");
      } catch (err) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: "ai",
          text: `❌ Failed to download Excel report.`,
          time: getTime()
        }]);
        playBeep("chat-receive");
      }
    } else if (format === "pdf") {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "ai",
        text: `🖨️ Opening print/PDF window for reports...`,
        time: getTime()
      }]);
      playBeep("chat-receive");
      setPrintReportData({ startDate, endDate, conditions });
    }
  }, [orders, issuedStock, inventory, systemSettings, maintenanceLogs]);

  const handleExecuteNavigate = useCallback((path) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: "ai",
      text: `Taking you there now...`,
      time: getTime()
    }]);
    playBeep("chat-receive");
    setTimeout(() => {
      navigate(path);
      setIsOpen(false);
    }, 1200);
  }, [navigate]);

  const sendMessage = useCallback((text, isVoice = false) => {
    const query = (text || input).trim();
    if (!query) return;
    setInput("");

    // Add user message
    const userMsg = { id: Date.now(), role: "user", text: query, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    playBeep("chat-send");

    // Explicitly turn off recognition if active to avoid recording synthetic response
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    // Check if there is a pending navigation recommendation in the previous message
    const lastAiMessage = [...messages].reverse().find(m => m.role === "ai");
    if (lastAiMessage && lastAiMessage.suggestedNavigate && /\b(yes|yep|sure|ok|okay|open|do it|take me|go ahead)\b/i.test(query)) {
      handleExecuteNavigate(lastAiMessage.suggestedNavigate);
      return;
    }

    // Show typing indicator
    setIsTyping(true);
    const delay = isVoice ? 50 : (700 + Math.random() * 400);
    setTimeout(() => {
      setIsTyping(false);

      const intent = parseIntent(query, lastIntent);

      const nonContextIntents = ["greetings", "gratitude", "goodbye", "off-topic", "help", "navigate"];
      if (intent.type && !nonContextIntents.includes(intent.type)) {
        setLastIntent(intent);
      }

      const response = generateResponse(intent, { inventory, orders, issuedStock, systemSettings, maintenanceLogs });

      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: response.text,
        table: response.table,
        downloadReportOptions: response.downloadReportOptions,
        summaryOptions: response.summaryOptions,
        suggestedNavigate: response.suggestedNavigate,
        suggestedNavigateLabel: response.suggestedNavigateLabel,
        time: getTime()
      };

      setMessages(prev => [...prev, aiMsg]);
      playBeep("chat-receive");

      // Speak response
      if (response.speak) {
        speak(response.speak);
      }

      // Navigate if needed
      if (response.navigate) {
        setTimeout(() => {
          navigate(response.navigate);
          setIsOpen(false);
        }, 1200);
      }
    }, delay);
  }, [input, inventory, orders, issuedStock, systemSettings, navigate, lastIntent, messages, handleExecuteNavigate, isListening]);

  const handleExecuteSummaryChoice = useCallback((choice) => {
    if (choice === "week") {
      sendMessage("summary of this week");
    } else if (choice === "month") {
      sendMessage("summary of this month");
    } else if (choice === "custom") {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "ai",
        text: `📅 **Custom Summary:**\nPlease type your custom range in the chat. For example:\n• "summary from 2026-06-01 to 2026-06-15"\n• "from June 1st to June 10th"`,
        time: getTime()
      }]);
      playBeep("chat-receive");
    }
  }, [sendMessage, getTime]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: Date.now(), role: "ai",
        text: "⚠️ Voice input is not supported in this browser. Please use Chrome or Edge.",
        time: getTime()
      }]);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript, true);
      try {
        recognition.stop();
      } catch (e) {}
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(), role: "ai",
      text: `Chat cleared! How can I assist you?`,
      time: getTime()
    }]);
  };

  const quickQueries = [
    "Show low stock items",
    "Pending orders",
    "Most frequent item",
    "Inventory summary",
    "All orders"
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); playBeep("modal-open"); }}
        className="fixed bottom-6 right-6 z-[9999] group"
        title="AI Inventory Assistant"
      >
        <div className={`relative w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-gradient-to-br from-slate-700 to-slate-800 scale-95"
            : "bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 hover:scale-110 hover:shadow-violet-500/50"
        }`}>
          {/* Pulsing ring */}
          {!isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
              <span className="absolute inset-[-4px] rounded-full border-2 border-violet-400/40 animate-pulse" />
            </>
          )}
          <div className="absolute inset-0 flex items-center justify-center text-white text-xl">
            {isOpen ? "✕" : "🤖"}
          </div>
        </div>
        {!isOpen && (
          <span className="absolute -top-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            AI Assistant
          </span>
        )}
      </button>
 
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] w-[380px] max-h-[75vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/40 animate-fadeIn border border-white/10"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1a1a3e 50%, #0f172a 100%)" }}>
 
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(79,70,229,0.3))" }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-violet-500/40">
                  🤖
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AI Inventory Assistant</h3>
                <p className="text-violet-300 text-[10px] font-medium">Always up-to-date • Inventory only</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} title="Clear chat" className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 text-xs">
                🗑️
              </button>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10 text-sm font-bold">
                ✕
              </button>
            </div>
          </div>
 
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0" style={{ maxHeight: "calc(75vh - 200px)" }}>
            {messages.map(msg => <ChatMessage key={msg.id} msg={msg} onExecuteReport={handleExecuteReport} onExecuteNavigate={handleExecuteNavigate} onExecuteSummaryChoice={handleExecuteSummaryChoice} />)}
 
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 justify-start mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/30 flex-shrink-0">
                  AI
                </div>
                <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <span key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 border-t border-white/5">
            <div className="flex gap-1.5 flex-wrap">
              {quickQueries.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-violet-500/20 text-violet-300 hover:bg-violet-500/40 hover:text-white border border-violet-500/20 transition cursor-pointer whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="px-4 pb-4 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 focus-within:border-violet-500/50 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about inventory..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500 font-medium"
              />
              <button
                onClick={startVoiceInput}
                title={isListening ? "Stop listening" : "Voice input"}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer text-sm ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                    : "bg-white/10 text-slate-400 hover:bg-violet-500/30 hover:text-violet-300"
                }`}
              >
                {isListening ? "■" : "🎤"}
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center hover:from-violet-500 hover:to-indigo-500 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-violet-500/30"
              >
                ➤
              </button>
            </div>
            <p className="text-[9px] text-slate-600 text-center mt-1.5 font-medium">
              Inventory queries only • Press Enter to send
            </p>
          </div>
        </div>
      )}

      {printReportData && createPortal(
        <div className="print-report-layout p-8 bg-white text-black font-sans min-h-screen">
          {/* Header Banners */}
          <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #cbd5e1", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            {systemSettings?.collegeInfo?.logo ? (
              <img src={systemSettings.collegeInfo.logo} alt="College Logo" className="w-20 h-20 object-contain" style={{ width: "5rem", height: "5rem", objectFit: "contain" }} />
            ) : (
              <div className="w-20 h-20 border border-slate-300 flex items-center justify-center font-black text-2xl bg-blue-900 text-white rounded" style={{ width: "5rem", height: "5rem", border: "1px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.5rem", backgroundColor: "#1e3a8a", color: "white", borderRadius: "0.25rem" }}>
                {systemSettings?.collegeInfo?.name ? systemSettings.collegeInfo.name[0] : "C"}
              </div>
            )}
            <div className="text-right" style={{ textAlign: "right" }}>
              <h1 className="text-2xl font-bold" style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>{systemSettings?.collegeInfo?.name || "RJ Institute of Technology"}</h1>
              <p className="text-xs text-slate-500" style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.125rem 0 0 0" }}>{systemSettings?.collegeInfo?.address || "123 Campus Lane, Okhla, New Delhi"}</p>
              <p className="text-xs text-slate-500" style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.125rem 0 0 0" }}>
                Phone: {systemSettings?.collegeInfo?.phone || "+91 11 2690 7400"} | Email: {systemSettings?.collegeInfo?.email || "info@rjit.edu.in"}
              </p>
              <p className="text-xs text-slate-500" style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.125rem 0 0 0" }}>
                Website: {systemSettings?.collegeInfo?.website || "www.rjit.edu.in"}
              </p>
            </div>
          </div>

          {/* Title and Date Range */}
          <div className="text-center mb-6" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800" style={{ fontSize: "1.25rem", fontWeight: "bold", letterSpacing: "0.05em", textTransform: "uppercase", color: "#1e293b", margin: 0 }}>
              {(() => {
                const cond = printReportData.conditions;
                if (cond?.onlyOrdered) return "AUDIT REPORT - PURCHASE ORDERS";
                if (cond?.onlyIssued) return "AUDIT REPORT - STOCK DISBURSEMENTS";
                if (cond?.onlyReceived) return "AUDIT REPORT - RECEIVED SHIPMENTS";
                if (cond?.onlyMaintenance) {
                  if (cond?.maintenanceUnitId) return "AUDIT REPORT - EQUIPMENT SERVICE HISTORY";
                  return "AUDIT REPORT - MAINTENANCE REGISTRY";
                }
                return "AUDIT REPORT";
              })()}
            </h2>
            <p className="text-sm text-slate-500 mt-1" style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem", marginBottom: 0 }}>
              Date Range: {printReportData.startDate} to {printReportData.endDate}
            </p>
          </div>

          {/* Conditional Rendering of Tables */}
          {(() => {
            const cond = printReportData.conditions;
            const isWithinPrintRange = (dateStr) => {
              if (!dateStr) return false;
              const cleanDate = dateStr.split(" ")[0];
              return cleanDate >= printReportData.startDate && cleanDate <= printReportData.endDate;
            };

            const pIssued = issuedStock.filter(log => isWithinPrintRange(log.date));
            const pOrders = orders.filter(o => isWithinPrintRange(o.orderDate));

            const getIssuedItemPrice = (log) => {
              const invItem = inventory.find(item => 
                (item.category || "").toLowerCase() === (log.category || "").toLowerCase() &&
                (item.subcategory || "").toLowerCase() === (log.subcategory || "").toLowerCase() &&
                (item.type || "").toLowerCase() === (log.type || "").toLowerCase()
              );
              return invItem ? invItem.price : 0;
            };

            // 1. Maintenance Reports
            if (cond?.onlyMaintenance) {
              if (cond?.maintenanceUnitId) {
                const unit = (maintenanceLogs || []).find(ro => ro.id === cond.maintenanceUnitId);
                if (!unit) {
                  return <p style={{ textAlign: "center", fontStyle: "italic", color: "#64748b" }}>Equipment unit not found.</p>;
                }
                const matchedHistory = (unit.history || []).filter(h => isWithinPrintRange(h.date));
                const totalCost = matchedHistory.reduce((sum, h) => sum + h.totalAmount, 0);

                return (
                  <div>
                    {/* Unit details */}
                    <div style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", backgroundColor: "#f8fafc", marginBottom: "1.5rem" }}>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}><strong>Equipment:</strong> {unit.name} ({unit.id})</p>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}><strong>Category:</strong> {unit.category} | <strong>Location:</strong> {unit.location}</p>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}><strong>Install Date:</strong> {unit.installDate} | <strong>Status:</strong> {unit.status}</p>
                      <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}><strong>Total Repair Cost:</strong> ₹{totalCost.toLocaleString()}</p>
                    </div>

                    <h3 style={{ fontSize: "0.875rem", fontWeight: "bold", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>SERVICE HISTORY DETAILS</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", fontSize: "0.75rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f1f5f9" }}>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>ID</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Part Repaired / Service</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Qty</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Price</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Total Cost</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Date</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Technician</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchedHistory.length > 0 ? (
                          matchedHistory.map(h => (
                            <tr key={h.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{h.id}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "600" }}>{h.partRepaired}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{h.quantity}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>₹{h.pricePerQty.toLocaleString()}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold" }}>₹{h.totalAmount.toLocaleString()}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{h.date}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{h.technician}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{h.notes}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>No service logs found in this date range.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              } else {
                return (
                  <div>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: "bold", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>EQUIPMENT SUMMARY REGISTRY</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", fontSize: "0.75rem", marginBottom: "2rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f1f5f9" }}>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Unit ID</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Name</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Category</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Location</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Install Date</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Initial Price</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Logs</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Total Repair Cost</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(maintenanceLogs || []).map(unit => {
                          const matchedHistory = (unit.history || []).filter(h => isWithinPrintRange(h.date));
                          const totalCost = matchedHistory.reduce((sum, h) => sum + h.totalAmount, 0);
                          return (
                            <tr key={unit.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{unit.id}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "600" }}>{unit.name}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{unit.category}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{unit.location}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{unit.installDate}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>₹{unit.initialPrice.toLocaleString()}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{matchedHistory.length}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold" }}>₹{totalCost.toLocaleString()}</td>
                              <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{unit.status}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <h3 style={{ fontSize: "0.875rem", fontWeight: "bold", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", marginBottom: "0.75rem", pageBreakBefore: "always", breakBefore: "page" }}>ALL MAINTENANCE SERVICE TRANSACTIONS</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", fontSize: "0.75rem" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f1f5f9" }}>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Unit Name</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Location</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Part Repaired</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Qty</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Cost</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Service Date</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Technician</th>
                          <th style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const allRows = [];
                          (maintenanceLogs || []).forEach(unit => {
                            const matchedHistory = (unit.history || []).filter(h => isWithinPrintRange(h.date));
                            matchedHistory.forEach(h => {
                              allRows.push({ unitName: unit.name, location: unit.location, ...h });
                            });
                          });

                          return allRows.length > 0 ? (
                            allRows.map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "600" }}>{row.unitName}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{row.location}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{row.partRepaired}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{row.quantity}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold" }}>₹{row.totalAmount.toLocaleString()}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{row.date}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{row.technician}</td>
                                <td style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{row.notes}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>No repair records found.</td>
                            </tr>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                );
              }
            }

            // 2. Regular Inventory / Orders Reports
            const showIssuedSection = !cond?.onlyOrdered && !cond?.onlyReceived;
            const showOrderedSection = !cond?.onlyIssued;
            const displayOrders = cond?.onlyReceived ? pOrders.filter(o => o.status === "Received") : pOrders;

            const totalPOrdersQty = displayOrders.reduce((sum, o) => sum + o.quantity, 0);
            const totalPOrdersAmt = displayOrders.reduce((sum, o) => sum + (o.quantity * o.pricePerUnit), 0);
            const totalPIssuedQty = showIssuedSection ? pIssued.reduce((sum, log) => sum + log.quantity, 0) : 0;
            const totalPIssuedAmt = showIssuedSection ? pIssued.reduce((sum, log) => sum + (log.quantity * getIssuedItemPrice(log)), 0) : 0;

            return (
              <>
                {/* Print Summary Metrics Row */}
                <div className="grid grid-cols-4 gap-4 mb-8 p-4 border border-slate-300 rounded-xl bg-slate-50 text-center" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "1rem", padding: "1rem", border: "1px solid #cbd5e1", borderRadius: "0.75rem", backgroundColor: "#f8fafc", textAlign: "center", marginBottom: "2rem" }}>
                  <div>
                    <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider" style={{ display: "block", color: "#64748b", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Qty Purchased</span>
                    <span className="text-base font-black text-slate-950 mt-1 block" style={{ fontSize: "1rem", fontWeight: "900", color: "#0f172a", marginTop: "0.25rem", display: "block" }}>{showOrderedSection ? totalPOrdersQty : 0}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider" style={{ display: "block", color: "#64748b", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Purchase Cost</span>
                    <span className="text-base font-black text-slate-950 mt-1 block" style={{ fontSize: "1rem", fontWeight: "900", color: "#0f172a", marginTop: "0.25rem", display: "block" }}>₹{(showOrderedSection ? totalPOrdersAmt : 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider" style={{ display: "block", color: "#64748b", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Qty Issued</span>
                    <span className="text-base font-black text-slate-950 mt-1 block" style={{ fontSize: "1rem", fontWeight: "900", color: "#0f172a", marginTop: "0.25rem", display: "block" }}>{totalPIssuedQty}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider" style={{ display: "block", color: "#64748b", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Issued Value</span>
                    <span className="text-base font-black text-slate-950 mt-1 block" style={{ fontSize: "1rem", fontWeight: "900", color: "#0f172a", marginTop: "0.25rem", display: "block" }}>₹{totalPIssuedAmt.toLocaleString()}</span>
                  </div>
                </div>

                {/* 1. DISBURSED LOGS PREVIEW */}
                {showIssuedSection && (
                  <div className="mb-8" style={{ marginBottom: "2rem", pageBreakAfter: (showOrderedSection && displayOrders.length > 0) ? "always" : "auto", breakAfter: (showOrderedSection && displayOrders.length > 0) ? "page" : "auto" }}>
                    <h3 className="font-bold text-slate-850 text-sm mb-3 uppercase tracking-wider border-b pb-1 border-slate-200" style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>
                      Stock Disbursement Ledger ({pIssued.length} transaction logs)
                    </h3>
                    <table className="w-full border-collapse border border-slate-200 text-xs text-left" style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", fontSize: "0.75rem", textAlign: "left" }}>
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200" style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Item Details</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Category</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Department</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Faculty</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Qty</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Issue Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pIssued.length > 0 ? (
                          pIssued.map((log) => (
                            <tr key={log.id} className="border-b border-slate-200" style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <td className="p-2 border border-slate-200 font-semibold" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "600" }}>{log.item} ({log.type})</td>
                              <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{log.category}</td>
                              <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{log.department}</td>
                              <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{log.faculty}</td>
                              <td className="p-2 border border-slate-200 font-bold" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "700" }}>{log.quantity}</td>
                              <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{log.date}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-4 text-center text-slate-400 italic" style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                              No disbursed assets found in this configuration range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. ORDER SHIPMENTS PREVIEW */}
                {showOrderedSection && displayOrders.length > 0 && (
                  <div className="mb-8" style={{ marginBottom: "2rem" }}>
                    <h3 className="font-bold text-slate-850 text-sm mb-3 uppercase tracking-wider border-b pb-1 border-slate-200" style={{ fontSize: "0.875rem", fontWeight: "bold", color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.25rem", marginBottom: "0.75rem" }}>
                      {cond?.onlyReceived ? "Received Shipments Registry" : "Purchase Order Shipments Registry"} ({displayOrders.length} records)
                    </h3>
                    <table className="w-full border-collapse border border-slate-200 text-xs text-left" style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #e2e8f0", fontSize: "0.75rem", textAlign: "left" }}>
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200" style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Item Details</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Supplier</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Category</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Qty</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Per Unit</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Total Cost</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Order Date</th>
                          <th className="p-2 border border-slate-200 font-bold uppercase" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "bold", textTransform: "uppercase" }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayOrders.map((order) => (
                          <tr key={order.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <td className="p-2 border border-slate-200 font-semibold" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "600" }}>{order.item} ({order.type})</td>
                            <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{order.supplier}</td>
                            <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{order.category}</td>
                            <td className="p-2 border border-slate-200 font-bold" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "700" }}>{order.quantity}</td>
                            <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>₹{order.pricePerUnit?.toLocaleString()}</td>
                            <td className="p-2 border border-slate-200 font-bold" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "700" }}>₹{(order.pricePerUnit * order.quantity)?.toLocaleString()}</td>
                            <td className="p-2 border border-slate-200" style={{ padding: "0.5rem", border: "1px solid #e2e8f0" }}>{order.orderDate}</td>
                            <td className="p-2 border border-slate-200 font-bold" style={{ padding: "0.5rem", border: "1px solid #e2e8f0", fontWeight: "700" }}>{order.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            );
          })()}

          {/* Official Seal / Sign-off block at bottom */}
          <div className="pt-10 flex justify-between items-center text-xs border-t border-slate-200 mt-8" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", borderTop: "1px solid #cbd5e1", paddingTop: "2.5rem", marginTop: "2rem" }}>
            <div className="text-slate-400 font-bold uppercase tracking-wider" style={{ color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Generated by: {systemSettings?.collegeInfo?.name || "RJIT STORE SYSTEM"}
            </div>
            <div className="text-center border-t border-slate-350 pt-2 w-48 text-slate-650 font-bold uppercase" style={{ textAlign: "center", borderTop: "1px solid #cbd5e1", paddingTop: "0.5rem", width: "12rem", color: "#475569", fontWeight: "bold", textTransform: "uppercase" }}>
              Authorized Signature
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
