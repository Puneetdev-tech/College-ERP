import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaFileExcel, FaBuilding, FaListAlt, FaShoppingCart,
  FaSpinner, FaCheckCircle, FaPrint, FaFilePdf, FaSearch,
  FaThList, FaChartBar, FaTimes, FaChevronDown, FaChevronRight
} from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import ExcelJS from "exceljs";

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyRow = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="p-10 text-center text-slate-400 text-sm">
      <FaFilePdf className="mx-auto mb-2 text-2xl opacity-20" />
      No records found for the selected filters and date range.
    </td>
  </tr>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function Reports() {
  const {
    inventory, issuedStock, orders, sanitaryInventory,
    systemSettings, inventoryCategories, getRegisterForCategory
  } = useStore();
  const collegeInfo = systemSettings?.collegeInfo;

  // Active report: "department" | "issue" | "purchase" | null
  const [activeReport, setActiveReport] = useState(null);

  // Shared filters
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory]     = useState("all");
  const [itemSearchQuery, setItemSearchQuery]       = useState("");

  // Date filters: "range" | "single"
  const [dateMode, setDateMode]     = useState("range");
  const [startDate, setStartDate]   = useState("2020-02-01");
  const [endDate,   setEndDate]     = useState("2020-02-29");
  const [singleDate, setSingleDate] = useState("2020-02-28");

  // Expand states for item drill-downs
  const [expandedDept, setExpandedDept]                 = useState(null);
  const [expandedItem, setExpandedItem]                 = useState(null);
  const [expandedPurchaseItem, setExpandedPurchaseItem] = useState(null);

  // Print scope & modal: "summary" | "full"
  const [printScope, setPrintScope] = useState("summary");
  const [showPrintModal, setShowPrintModal] = useState(false);

  const triggerPrint = (scope) => {
    const finalScope = (typeof scope === "string" && (scope === "summary" || scope === "full"))
      ? scope
      : (printScope === "full" ? "full" : "summary");
    setPrintScope(finalScope);
    setShowPrintModal(false);
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 300);
    });
  };

  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getIssuedItemPrice = (log) => {
    if (log.unitCost && !isNaN(Number(log.unitCost)) && Number(log.unitCost) > 0)
      return Number(log.unitCost);
    const inv =
      inventory.find(i =>
        ((i.item || "").toLowerCase() === (log.item || "").toLowerCase() ||
         (i.subcategory || "").toLowerCase() === (log.item || "").toLowerCase()) &&
        (i.category || "").toLowerCase() === (log.category || "").toLowerCase()
      ) ||
      inventory.find(i =>
        (i.category || "").toLowerCase() === (log.category || "").toLowerCase() &&
        (i.type || "").toLowerCase() === (log.type || "").toLowerCase()
      );
    return inv ? (Number(inv.price) || 0) : 0;
  };

  const inRange = (dateStr) => {
    if (!dateStr) return false;
    if (dateMode === "all") return true;
    const d = dateStr.slice(0, 10);
    if (dateMode === "single") {
      return singleDate ? d === singleDate : true;
    }
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  };

  const getPeriodLabel = () => {
    if (dateMode === "all") {
      return "All Time (All Records)";
    }
    if (dateMode === "single") {
      return singleDate ? `Date: ${singleDate}` : "All Records";
    }
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    }
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Up to ${endDate}`;
    return "All Records";
  };

  const norm = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .replace(/phynil/g, "phenyl")
      .replace(/phenyle/g, "phenyl")
      .trim();

  const matchSearch = (query, fields) => {
    if (!query || !query.trim()) return true;
    const cleanQ = norm(query);
    const tokens = cleanQ.split(/\s+/).filter(Boolean);
    const haystack = fields.filter(Boolean).map(f => norm(f)).join(" ");
    return tokens.every(tok => haystack.includes(tok));
  };

  const fmt  = (n) => (n || 0).toLocaleString("en-IN");
  const dFmt = (s) => (s || "").slice(0, 10);

  // ── Derived lists ──────────────────────────────────────────────────────────
  const departmentsList = Array.from(new Set(
    issuedStock.map(l => l.department).filter(Boolean)
  )).sort();

  const categories = Array.from(new Set([
    ...inventory.map(i => i.category),
    ...issuedStock.map(l => l.category),
    ...inventoryCategories.map(c => c.name)
  ].filter(Boolean))).sort();

  // Filtered issued logs (used by both Issue and Department reports)
  const filteredIssued = issuedStock.filter(log => {
    if (!inRange(log.date)) return false;
    if (selectedDepartment !== "all" &&
      (log.department || "").trim().toLowerCase() !== selectedDepartment.trim().toLowerCase())
      return false;
    if (selectedCategory !== "all") {
      const lc = (log.category || "").trim().toLowerCase();
      const sc = selectedCategory.trim().toLowerCase();
      if (lc !== sc && getRegisterForCategory(lc).toLowerCase() !== sc) return false;
    }
    if (itemSearchQuery.trim()) {
      if (!matchSearch(itemSearchQuery, [
        log.item,
        log.subcategory,
        log.type,
        log.category,
        log.department,
        log.faculty,
        log.id
      ])) return false;
    }
    return true;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Filtered orders (Purchase report)
  const filteredOrders = orders.filter(o => {
    const oDate = o.orderDate ? o.orderDate.slice(0, 10) : null;
    const rDate = o.receiveDate ? o.receiveDate.slice(0, 10) : null;
    if (!inRange(oDate) && !inRange(rDate)) return false;

    if (selectedCategory !== "all") {
      const oc = (o.category || "").toLowerCase();
      const sc = selectedCategory.toLowerCase();
      if (oc !== sc && getRegisterForCategory(oc).toLowerCase() !== sc) return false;
    }
    if (activeReport === "department" && selectedDepartment !== "all") {
      const rn = getRegisterForCategory(o.category);
      if (rn.toLowerCase() !== selectedDepartment.toLowerCase() &&
          (o.department || "").toLowerCase() !== selectedDepartment.toLowerCase())
        return false;
    }
    if (itemSearchQuery.trim()) {
      if (!matchSearch(itemSearchQuery, [
        o.item,
        o.subcategory,
        o.type,
        o.category,
        o.supplier,
        o.department,
        o.faculty,
        o.status,
        o.id
      ])) return false;
    }
    return true;
  }).sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""));

  // Totals
  const totalIssuedQty  = filteredIssued.reduce((s, l) => s + l.quantity, 0);
  const totalIssuedAmt  = filteredIssued.reduce((s, l) => s + l.quantity * getIssuedItemPrice(l), 0);
  const totalOrderedQty = filteredOrders.reduce((s, o) => s + o.quantity, 0);
  const totalOrderedAmt = filteredOrders.reduce((s, o) => s + o.quantity * (o.pricePerUnit || 0), 0);

  // Department summary: grouped by dept → category → items
  const deptSummary = departmentsList.map(name => {
    const logs = filteredIssued.filter(
      l => (l.department || "").trim().toLowerCase() === name.trim().toLowerCase()
    );
    const qty = logs.reduce((s, l) => s + l.quantity, 0);
    const amt = logs.reduce((s, l) => s + l.quantity * getIssuedItemPrice(l), 0);

    // Category breakdown within dept
    const catBreakdown = Array.from(new Set(logs.map(l => l.category).filter(Boolean))).map(cat => {
      const catLogs = logs.filter(l => (l.category || "").toLowerCase() === cat.toLowerCase());
      return {
        cat,
        qty: catLogs.reduce((s, l) => s + l.quantity, 0),
        amt: catLogs.reduce((s, l) => s + l.quantity * getIssuedItemPrice(l), 0),
        logs: catLogs,
      };
    }).filter(c => c.qty > 0).sort((a, b) => b.amt - a.amt);

    return { name, qty, amt, logs, catBreakdown };
  }).filter(d => d.qty > 0 ||
    (selectedDepartment !== "all" && d.name.toLowerCase() === selectedDepartment.toLowerCase())
  );

  // Issue Items summary: grouped by item + type + category
  const itemsSummary = Array.from(
    filteredIssued.reduce((m, log) => {
      const itemName = (log.item || "Unknown").trim();
      const itemType = (log.type || "").trim();
      const category = (log.category || "").trim();
      const key = `${itemName}:::${itemType}:::${category}`;
      if (!m.has(key)) {
        m.set(key, {
          key,
          itemName,
          itemType,
          displayName: itemType ? `${itemName} (${itemType})` : itemName,
          category,
          qty: 0,
          amt: 0,
          logs: [],
        });
      }
      const entry = m.get(key);
      const uc = getIssuedItemPrice(log);
      entry.qty += log.quantity;
      entry.amt += log.quantity * uc;
      entry.logs.push(log);
      return m;
    }, new Map()).values()
  ).sort((a, b) => b.amt - a.amt || b.qty - a.qty);

  // Purchase Items summary: grouped by item + type + category
  const purchaseItemsSummary = Array.from(
    filteredOrders.reduce((m, o) => {
      const itemName = (o.item || "Unknown").trim();
      const itemType = (o.type || "").trim();
      const category = (o.category || "").trim();
      const key = `${itemName}:::${itemType}:::${category}`;
      if (!m.has(key)) {
        m.set(key, {
          key,
          itemName,
          itemType,
          displayName: itemType ? `${itemName} (${itemType})` : itemName,
          category,
          qty: 0,
          amt: 0,
          orders: [],
        });
      }
      const entry = m.get(key);
      const qty = Number(o.quantity) || 0;
      const amt = qty * (Number(o.pricePerUnit) || 0);
      entry.qty += qty;
      entry.amt += amt;
      entry.orders.push(o);
      return m;
    }, new Map()).values()
  ).sort((a, b) => b.amt - a.amt || b.qty - a.qty);

  // ── Excel export ───────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const getMonthTimeline = () => {
    let startD = new Date("2024-11-01");
    let endD = new Date("2026-08-01");

    if (dateMode === "range" && startDate && endDate) {
      startD = new Date(startDate);
      endD = new Date(endDate);
    } else if (dateMode === "single" && singleDate) {
      startD = new Date(singleDate);
      endD = new Date(singleDate);
    } else {
      const dates = [
        ...filteredIssued.map(l => l.date).filter(Boolean),
        ...filteredOrders.map(o => o.orderDate).filter(Boolean)
      ].map(d => new Date(d)).filter(d => !isNaN(d.getTime()));

      if (dates.length > 0) {
        startD = new Date(Math.min(...dates));
        endD = new Date(Math.max(...dates));
      }
    }

    if (isNaN(startD.getTime())) startD = new Date("2024-11-01");
    if (isNaN(endD.getTime())) endD = new Date();
    if (startD > endD) {
      const t = startD; startD = endD; endD = t;
    }

    const months = [];
    const cur = new Date(startD.getFullYear(), startD.getMonth(), 1);
    const endMonth = new Date(endD.getFullYear(), endD.getMonth(), 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let count = 0;
    while (cur <= endMonth && count < 48) {
      const y = cur.getFullYear();
      const m = cur.getMonth();
      const shortYear = String(y).slice(-2);
      months.push({
        label: `${monthNames[m]}-${shortYear}`,
        key: `${y}-${String(m + 1).padStart(2, "0")}`,
        year: y,
        month: m
      });
      cur.setMonth(cur.getMonth() + 1);
      count++;
    }

    if (months.length === 0) {
      const y = startD.getFullYear();
      const m = startD.getMonth();
      months.push({
        label: `${monthNames[m]}-${String(y).slice(-2)}`,
        key: `${y}-${String(m + 1).padStart(2, "0")}`,
        year: y,
        month: m
      });
    }

    return months;
  };

  const getItemUnit = (itemObj) => {
    if (!itemObj) return "No";
    if (itemObj.itemType && itemObj.itemType !== "Standard") return itemObj.itemType;
    const clean = (itemObj.itemName || "").toLowerCase();
    const inv = inventory.find(i => (i.item || "").toLowerCase() === clean);
    if (inv?.type && inv.type !== "Standard") return inv.type;
    const san = (sanitaryInventory || []).find(s => (s.item_name || "").toLowerCase() === clean);
    if (san?.quantity_unit) return san.quantity_unit;
    if (san?.quantity_text) return san.quantity_text;

    if (/ltr|litre|liter/i.test(itemObj.displayName)) return "Ltrs";
    if (/pkt|packet/i.test(itemObj.displayName)) return "Pkt";
    if (/ml|500ml/i.test(itemObj.displayName)) return "ml";
    if (/kg/i.test(itemObj.displayName)) return "KG";
    if (/pair/i.test(itemObj.displayName)) return "Pair";
    if (/bottle|btl/i.test(itemObj.displayName)) return "Bottel";
    return "No";
  };

  const exportExcel = async ({
    sheetTitle,
    headers,
    rows,
    colWidths,
    fileName = "Report",
    extraSheets = []
  }) => {
    setLoading(true);
    showToast("Compiling Excel report…");
    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = "RJIT College ERP";
      wb.lastModifiedBy = "RJIT College ERP";
      wb.created = new Date();

      const createSheet = (ws, title, sHeaders, sRows, sWidths) => {
        const cn = collegeInfo?.name || "Rustamji Institute of Technology";
        const ca = collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh";
        const cp = "Phone: " + (collegeInfo?.phone || "+91-(07524)-274320") + " | Email: " + (collegeInfo?.email || "rjit_bsft@yahoo.com");
        const periodLabel = getPeriodLabel();
        const totalCols = Math.max(sHeaders.length, 8);

        // 1. College Header Rows
        const headerRowsData = [
          { text: cn, size: 14, bold: true, bg: "FF1E3A8A", fg: "FFFFFFFF", height: 32 },
          { text: ca, size: 9, bold: false, bg: "FFF8FAFC", fg: "FF475569", height: 18 },
          { text: cp, size: 9, bold: false, bg: "FFF8FAFC", fg: "FF475569", height: 16 },
          { text: (title || "EXPENSE VOUCHER").toUpperCase() + " — PERIOD: " + periodLabel, size: 11, bold: true, bg: "FFEFF6FF", fg: "FF1E40AF", height: 26 },
          { text: "Generated: " + new Date().toLocaleString("en-IN"), size: 8, bold: false, bg: "FFFFFFFF", fg: "FF94A3B8", height: 16 }
        ];

        headerRowsData.forEach((h, idx) => {
          const rowNum = idx + 1;
          ws.mergeCells(rowNum, 1, rowNum, totalCols);
          const cell = ws.getCell(rowNum, 1);
          cell.value = h.text;
          cell.font = { name: "Calibri", size: h.size, bold: h.bold, color: { argb: h.fg } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: h.bg } };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          ws.getRow(rowNum).height = h.height;
        });

        // 2. Table Headers (Row 7)
        const headerRowIndex = 7;
        const hr = ws.getRow(headerRowIndex);
        hr.values = sHeaders;
        hr.height = 26;

        sHeaders.forEach((_, ci) => {
          const cell = hr.getCell(ci + 1);
          cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF334155" } };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FF0F172A" } },
            bottom: { style: "thin", color: { argb: "FF0F172A" } },
            left: { style: "thin", color: { argb: "FF0F172A" } },
            right: { style: "thin", color: { argb: "FF0F172A" } }
          };
        });

        // 3. Data Rows
        sRows.forEach((rowData, ri) => {
          const rIndex = headerRowIndex + 1 + ri;
          const r = ws.getRow(rIndex);
          r.values = rowData;
          r.height = 20;

          const isTotalRow = ri === sRows.length - 1 && (String(rowData[0]).toUpperCase().includes("TOTAL") || String(rowData[1]).toUpperCase().includes("TOTAL"));

          rowData.forEach((val, ci) => {
            const cell = r.getCell(ci + 1);
            if (isTotalRow) {
              cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };
              cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
              cell.border = {
                top: { style: "thin", color: { argb: "FF475569" } },
                bottom: { style: "double", color: { argb: "FF0F172A" } },
                left: { style: "thin", color: { argb: "FFCBD5E1" } },
                right: { style: "thin", color: { argb: "FFCBD5E1" } }
              };
            } else {
              cell.font = { name: "Calibri", size: 10, color: { argb: "FF1E293B" } };
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: ri % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" }
              };
              cell.border = {
                top: { style: "thin", color: { argb: "FFE2E8F0" } },
                bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
                left: { style: "thin", color: { argb: "FFE2E8F0" } },
                right: { style: "thin", color: { argb: "FFE2E8F0" } }
              };
            }

            if (typeof val === "number") {
              cell.alignment = { vertical: "middle", horizontal: "right" };
            } else if (val === "-" || val === "—") {
              cell.alignment = { vertical: "middle", horizontal: "center" };
            } else if (ci === 1) {
              cell.alignment = { vertical: "middle", horizontal: "left" };
            } else {
              cell.alignment = { vertical: "middle", horizontal: "center" };
            }
          });
        });

        // 4. Column Widths
        if (sWidths && sWidths.length > 0) {
          sWidths.forEach((w, i) => {
            ws.getColumn(i + 1).width = w;
          });
        }
      };

      // Create primary worksheet
      const cleanTitle = (sheetTitle || "Expense Voucher").replace(/[\\/*?[\]:]/g, "").slice(0, 31);
      const ws = wb.addWorksheet(cleanTitle);
      createSheet(ws, sheetTitle, headers, rows, colWidths);

      // Create extra worksheets
      if (Array.isArray(extraSheets) && extraSheets.length > 0) {
        extraSheets.forEach(es => {
          if (!es || !es.name) return;
          const extraTitle = es.name.replace(/[\\/*?[\]:]/g, "").slice(0, 31);
          const extraWs = wb.addWorksheet(extraTitle);
          createSheet(extraWs, es.name, es.headers, es.rows, es.colWidths);
        });
      }

      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Excel Report downloaded successfully!");
    } catch (e) {
      console.error("Excel generation error:", e);
      showToast("Export failed: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const buildExpenseVoucherData = (itemsList, titleName) => {
    const months = getMonthTimeline();
    const staticHeaders = ["S. No.", "Nomenclature", "A/U", "Purchase", "Issue Qty", "Balance Qty", "Page No.", "DOP"];
    const monthHeaders = months.map(m => m.label);
    const headers = [...staticHeaders, ...monthHeaders];

    let totalPurchase = 0;
    let totalIssue = 0;
    let totalBalance = 0;
    let totalAmount = 0;
    const monthTotals = new Array(months.length).fill(0);

    const rows = itemsList.map((item, idx) => {
      const unit = getItemUnit(item);
      const cleanName = (item.itemName || "").toLowerCase();

      const pItem = purchaseItemsSummary.find(p => (p.itemName || "").toLowerCase() === cleanName);
      const san = (sanitaryInventory || []).find(s => (s.item_name || "").toLowerCase() === cleanName);
      const inv = inventory.find(i => (i.item || "").toLowerCase() === cleanName);

      const purchaseQty = pItem
        ? pItem.qty
        : (san?.quantity != null
            ? Math.round(Number(san.quantity))
            : (inv ? inv.stock + item.qty : item.qty));

      const issueQty = item.qty;
      const balanceQty = purchaseQty - issueQty;
      const pageNo = san?.s_no || inv?.id || (idx + 1);
      const dopDate = pItem?.orders?.[0]?.orderDate || san?.dop || inv?.createdAt;
      const dop = dopDate ? dFmt(dopDate) : "—";

      totalPurchase += purchaseQty;
      totalIssue += issueQty;
      totalBalance += balanceQty;
      totalAmount += (item.amt || 0);

      const formattedBal = balanceQty < 0 ? `(${Math.abs(balanceQty)})` : (balanceQty === 0 ? "-" : balanceQty);

      const monthValues = months.map((m, mIdx) => {
        const mLogs = item.logs.filter(l => (l.date || "").startsWith(m.key));
        const mQty = mLogs.reduce((s, l) => s + l.quantity, 0);
        if (mQty > 0) {
          monthTotals[mIdx] += mQty;
          return mQty;
        }
        return "-";
      });

      return [
        idx + 1,
        item.displayName,
        unit,
        purchaseQty,
        issueQty,
        formattedBal,
        pageNo,
        dop,
        ...monthValues
      ];
    });

    const totalRow = [
      "",
      "Total",
      "",
      totalPurchase,
      totalIssue,
      totalBalance < 0 ? `(${Math.abs(totalBalance)})` : totalBalance,
      "",
      totalAmount > 0 ? `₹${fmt(totalAmount)}` : "—",
      ...monthTotals.map(t => (t > 0 ? t : "-"))
    ];
    rows.push(totalRow);

    const colWidths = [
      8, 32, 10, 12, 12, 14, 12, 14,
      ...months.map(() => 10)
    ];

    return {
      name: titleName,
      headers,
      rows,
      colWidths
    };
  };

  const exportIssue = () => {
    if (expandedItem) {
      const item = itemsSummary.find(i => i.key === expandedItem);
      if (item) {
        const rows = item.logs
          .slice()
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
          .map((l, idx) => {
            const uc = getIssuedItemPrice(l);
            return [idx + 1, dFmt(l.date), l.department, l.faculty, l.quantity, uc, l.quantity * uc];
          });
        rows.push(["", "TOTAL FOR " + item.displayName.toUpperCase(), "", "", item.qty, "", item.amt]);
        return exportExcel({
          sheetTitle: `Issue – ${item.displayName.slice(0, 20)}`,
          rows,
          headers: ["#", "Date", "Department", "Faculty/Staff", "Qty", "Unit Rate (Rs)", "Total (Rs)"],
          colWidths: [6, 14, 24, 22, 10, 14, 16],
          fileName: `Expense_Voucher_${item.displayName}`
        });
      }
    }

    const mainSheetName = selectedCategory !== "all" ? selectedCategory : "Expense Voucher";
    const primaryData = buildExpenseVoucherData(itemsSummary, mainSheetName);

    const extraSheets = [];
    if (selectedCategory === "all") {
      const distinctCategories = Array.from(new Set(itemsSummary.map(i => i.category).filter(Boolean)));
      if (distinctCategories.length > 1) {
        distinctCategories.forEach(cat => {
          const catItems = itemsSummary.filter(i => (i.category || "").toLowerCase() === cat.toLowerCase());
          if (catItems.length > 0) {
            extraSheets.push(buildExpenseVoucherData(catItems, cat));
          }
        });
      }
    }

    return exportExcel({
      sheetTitle: primaryData.name,
      headers: primaryData.headers,
      rows: primaryData.rows,
      colWidths: primaryData.colWidths,
      fileName: "Expense_Voucher_Report",
      extraSheets
    });
  };

  const exportDept = () => {
    if (expandedDept) {
      const dept = deptSummary.find(d => d.name === expandedDept);
      if (dept) {
        const rows = dept.logs
          .slice()
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
          .map((l, idx) => {
            const uc = getIssuedItemPrice(l);
            return [idx + 1, dFmt(l.date), l.item, l.category, l.faculty, l.quantity, uc, l.quantity * uc];
          });
        rows.push(["", "TOTAL FOR " + dept.name.toUpperCase(), "", "", "", dept.qty, "", dept.amt]);
        return exportExcel({
          sheetTitle: `Dept – ${dept.name.slice(0, 20)}`,
          rows,
          headers: ["#", "Date", "Item", "Category", "Faculty/Staff", "Qty", "Unit Rate (Rs)", "Total (Rs)"],
          colWidths: [6, 14, 28, 18, 22, 10, 14, 16],
          fileName: `Department_Report_${dept.name}`
        });
      }
    }

    const rows = [];
    let idx = 1;
    deptSummary.forEach(d => {
      d.catBreakdown.forEach(c => {
        rows.push([idx++, d.name, c.cat, c.qty, c.amt]);
      });
    });
    rows.push(["", "GRAND TOTAL", "", totalIssuedQty, totalIssuedAmt]);
    return exportExcel({
      sheetTitle: selectedDepartment === "all" ? "Department Summary" : `Dept – ${selectedDepartment}`,
      rows,
      headers: ["#", "Department", "Category", "Total Qty", "Total Value (Rs)"],
      colWidths: [6, 26, 20, 14, 18],
      fileName: "Department_Summary_Report"
    });
  };

  const exportPurchase = () => {
    if (expandedPurchaseItem) {
      const item = purchaseItemsSummary.find(i => i.key === expandedPurchaseItem);
      if (item) {
        const rows = item.orders
          .slice()
          .sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""))
          .map((o, idx) => [
            idx + 1, dFmt(o.orderDate), dFmt(o.receiveDate) || "—", o.supplier, o.status,
            o.quantity, o.pricePerUnit, o.quantity * (o.pricePerUnit || 0)
          ]);
        rows.push(["", "TOTAL FOR " + item.displayName.toUpperCase(), "", "", "", item.qty, "", item.amt]);
        return exportExcel({
          sheetTitle: `Purchase – ${item.displayName.slice(0, 20)}`,
          rows,
          headers: ["#", "Order Date", "Receive Date", "Supplier", "Status", "Qty", "Unit Price (Rs)", "Total (Rs)"],
          colWidths: [6, 14, 14, 24, 14, 10, 14, 16],
          fileName: `Purchase_History_${item.displayName}`
        });
      }
    }

    const rows = purchaseItemsSummary.map((item, idx) => [
      idx + 1, item.displayName, item.category, item.orders.length, item.qty, item.amt
    ]);
    rows.push(["", "GRAND TOTAL", "", filteredOrders.length, totalOrderedQty, totalOrderedAmt]);
    return exportExcel({
      sheetTitle: "Purchase Items Report",
      rows,
      headers: ["#", "Item", "Category", "Total Orders", "Total Qty Ordered", "Total Value (Rs)"],
      colWidths: [6, 30, 20, 14, 18, 18],
      fileName: "Purchase_Items_Report"
    });
  };

  // ── Report card config ──────────────────────────────────────────────────────
  const reportCards = [
    {
      type: "department",
      title: "Department Report",
      desc: "Dept-wise consumption grouped by category.",
      icon: <FaBuilding size={20} />,
      gradient: "from-blue-600 to-indigo-700",
      accent: "blue",
      hdr: "bg-blue-700",
      border: "border-blue-200",
      thead: "bg-blue-700",
    },
    {
      type: "issue",
      title: "Issue Report",
      desc: "Date-wise stock disbursements to departments.",
      icon: <FaListAlt size={20} />,
      gradient: "from-amber-500 to-orange-600",
      accent: "amber",
      hdr: "bg-amber-600",
      border: "border-amber-200",
      thead: "bg-amber-600",
    },
    {
      type: "purchase",
      title: "Purchase Report",
      desc: "All purchase orders placed in the period.",
      icon: <FaShoppingCart size={20} />,
      gradient: "from-emerald-500 to-teal-600",
      accent: "emerald",
      hdr: "bg-emerald-700",
      border: "border-emerald-200",
      thead: "bg-emerald-700",
    },
  ];

  const activeCard = reportCards.find(c => c.type === activeReport);

  // ── Sub-components & Render helpers ─────────────────────────────────────────
  const renderCollegeHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4
                    bg-slate-50 border border-slate-200 rounded-xl mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {collegeInfo?.logo
          ? <img src={collegeInfo.logo} alt="logo"
              className="w-12 h-12 object-contain rounded-lg border border-slate-200 flex-shrink-0 bg-white p-1" />
          : <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center
                            font-black text-lg flex-shrink-0 shadow-sm">
              {(collegeInfo?.name || "R")[0]}
            </div>}
        <div className="min-w-0">
          <p className="font-black text-slate-800 text-sm leading-tight">
            {collegeInfo?.name || "Rustamji Institute of Technology"}
          </p>
          <p className="text-slate-500 text-xs mt-0.5 truncate">
            {collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh"}
          </p>
          <p className="text-slate-400 text-xs">
            {collegeInfo?.phone || "+91-(07524)-274320"}
            {collegeInfo?.email ? " · " + collegeInfo.email : ""}
          </p>
        </div>
      </div>
      <div className="sm:text-right flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report Period</p>
        <p className="font-black text-slate-700 text-sm">
          {getPeriodLabel()}
        </p>
      </div>
    </div>
  );

  const renderStatChips = (chips) => (
    <div className="flex flex-wrap gap-2 mb-5">
      {chips.map(c => (
        <div key={c.label}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex flex-col gap-0.5 shadow-sm min-w-[100px]">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{c.label}</span>
          <span className="font-black text-slate-800 text-lg leading-tight">{c.val}</span>
        </div>
      ))}
    </div>
  );

  const renderDateBar = (accentColor = "blue") => {
    const ringClass =
      accentColor === "amber"   ? "focus:ring-amber-400" :
      accentColor === "emerald" ? "focus:ring-emerald-400" :
                                  "focus:ring-blue-400";
    const activeChipClass =
      accentColor === "amber"   ? "bg-amber-600 text-white shadow-xs" :
      accentColor === "emerald" ? "bg-emerald-600 text-white shadow-xs" :
                                  "bg-blue-600 text-white shadow-xs";

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Filter</label>
          <div className="inline-flex bg-slate-200/90 p-0.5 rounded-lg text-[10px] font-bold shadow-inner">
            <button
              type="button"
              onClick={() => {
                setDateMode("range");
                if (!startDate) setStartDate("2020-02-01");
                if (!endDate) setEndDate("2020-02-29");
              }}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition ${
                dateMode === "range" ? activeChipClass : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Date Range
            </button>
            <button
              type="button"
              onClick={() => {
                setDateMode("single");
                if (!singleDate) setSingleDate("2020-02-28");
              }}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition ${
                dateMode === "single" ? activeChipClass : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Specific Date
            </button>
            <button
              type="button"
              onClick={() => setDateMode("all")}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition ${
                dateMode === "all" ? activeChipClass : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {dateMode === "range" && (
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className={`border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700
                         focus:outline-none focus:ring-2 ${ringClass} bg-white`}
            />
            <span className="text-slate-400 text-xs font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className={`border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700
                         focus:outline-none focus:ring-2 ${ringClass} bg-white`}
            />
          </div>
        )}

        {dateMode === "single" && (
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="date"
              value={singleDate}
              onChange={e => setSingleDate(e.target.value)}
              className={`border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700
                         focus:outline-none focus:ring-2 ${ringClass} bg-white w-44`}
            />
            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Specific Date
            </span>
          </div>
        )}

        {dateMode === "all" && (
          <div className="flex items-center gap-1.5 mt-0.5 py-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <FaCheckCircle className="text-xs" /> Showing All Historical Records
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderFilterBar = (onExport, onPrint, children) => (
    <div className="flex flex-wrap gap-3 items-end mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {children}
      <div className="ml-auto flex gap-2 flex-shrink-0">
        <button onClick={onExport} disabled={loading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs
                     font-bold px-4 py-2 rounded-lg cursor-pointer active:scale-95 transition disabled:opacity-50">
          {loading ? <FaSpinner className="animate-spin" /> : <FaFileExcel />} Excel
        </button>
        <button onClick={onPrint}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs
                     font-bold px-4 py-2 rounded-lg cursor-pointer active:scale-95 transition">
          <FaPrint /> Print
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // DEPARTMENT REPORT
  // ══════════════════════════════════════════════════════════════════════════
  const renderDepartmentReport = () => {
    const depts = selectedDepartment === "all"
      ? deptSummary
      : deptSummary.filter(d => d.name.toLowerCase() === selectedDepartment.toLowerCase());

    return (
      <>
        {renderFilterBar(exportDept, () => setShowPrintModal(true), (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</label>
              <select
                value={selectedDepartment}
                onChange={e => { setSelectedDepartment(e.target.value); setExpandedDept(null); }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer"
              >
                <option value="all">All Departments ({departmentsList.length})</option>
                {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {renderDateBar("blue")}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Phenyl, Chalk…"
                  value={itemSearchQuery}
                  onChange={e => { setItemSearchQuery(e.target.value); setExpandedDept(null); }}
                  className="border border-slate-200 rounded-lg px-3 py-2 pl-8 pr-7 text-sm text-slate-700
                             focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-48 transition"
                />
                <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs pointer-events-none" />
                {itemSearchQuery && (
                  <button
                    type="button"
                    onClick={() => { setItemSearchQuery(""); setExpandedDept(null); }}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 text-xs rounded-full hover:bg-slate-100 cursor-pointer"
                    title="Clear search"
                  >
                    <FaTimes size={11} />
                  </button>
                )}
              </div>
            </div>
          </>
        ))}

        {renderCollegeHeader()}

        {renderStatChips([
          { label: "Departments", val: depts.length },
          { label: "Total Qty",   val: fmt(totalIssuedQty) },
          { label: "Total Value", val: "₹" + fmt(totalIssuedAmt) },
        ])}

        <p className="text-xs text-slate-400 mb-3 -mt-2">
          Click any department to see all its issue records.
        </p>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="p-3 text-left font-bold text-xs uppercase">Department</th>
                <th className="p-3 text-left font-bold text-xs uppercase">Category</th>
                <th className="p-3 text-center font-bold text-xs uppercase">Total Qty</th>
                <th className="p-3 text-right font-bold text-xs uppercase">Total Value</th>
                <th className="p-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depts.length === 0 ? (
                <EmptyRow colSpan={5} />
              ) : (
                depts.sort((a, b) => b.amt - a.amt).map(dept => {
                  const isOpen = expandedDept === dept.name;
                  return (
                    <React.Fragment key={dept.name}>
                      {dept.catBreakdown.length === 0 ? (
                        <tr
                          className="cursor-pointer hover:bg-blue-50/60 transition-colors"
                          onClick={() => setExpandedDept(isOpen ? null : dept.name)}
                        >
                          <td className="p-3.5 font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center
                                               justify-center font-black text-xs flex-shrink-0">{dept.name[0]}</span>
                              {dept.name}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-400 text-xs italic" colSpan={3}>No records</td>
                          <td className="p-3.5 text-center text-blue-400">
                            {isOpen ? <FaChevronDown size={11}/> : <FaChevronRight size={11}/>}
                          </td>
                        </tr>
                      ) : (
                        dept.catBreakdown.map((c, ci) => (
                          <tr
                            key={dept.name + c.cat}
                            className={"cursor-pointer transition-colors " +
                              (isOpen
                                ? "bg-blue-50/40 "
                                : ci % 2 === 0 ? "bg-white " : "bg-slate-50/50 ") +
                              "hover:bg-blue-50/70"}
                            onClick={() => setExpandedDept(isOpen ? null : dept.name)}
                          >
                            {ci === 0 ? (
                              <td className="p-3.5 align-top font-semibold text-slate-800"
                                  rowSpan={dept.catBreakdown.length}>
                                <div className="flex items-center gap-2">
                                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center
                                                   justify-center font-black text-xs flex-shrink-0">
                                    {dept.name[0]}
                                  </span>
                                  <div>
                                    <p>{dept.name}</p>
                                    <p className="text-[11px] font-bold text-blue-600 mt-0.5">
                                      {dept.qty} units · ₹{fmt(dept.amt)}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {isOpen ? "▲ Collapse" : "▼ See all items"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            ) : null}
                            <td className="p-3.5 text-xs text-slate-600 font-medium">{c.cat}</td>
                            <td className="p-3.5 text-center font-black text-slate-800">{c.qty}</td>
                            <td className="p-3.5 text-right font-bold text-slate-700">₹{fmt(c.amt)}</td>
                            {ci === 0 ? (
                              <td className="p-3.5 text-center text-blue-400 align-top"
                                  rowSpan={dept.catBreakdown.length}>
                                {isOpen ? <FaChevronDown size={11}/> : <FaChevronRight size={11}/>}
                              </td>
                            ) : null}
                          </tr>
                        ))
                      )}

                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="border-y-2 border-blue-300 bg-white">
                              <div className="flex items-center justify-between px-5 py-2.5 bg-blue-700">
                                <p className="text-white text-xs font-black uppercase tracking-wider">
                                  {dept.name} — {dept.logs.length} issue record{dept.logs.length !== 1 ? "s" : ""}
                                </p>
                                <button
                                  onClick={e => { e.stopPropagation(); setExpandedDept(null); }}
                                  className="text-white/70 hover:text-white text-xs font-bold px-2 py-1
                                             rounded hover:bg-white/10 transition cursor-pointer"
                                >
                                  ✕ Close
                                </button>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-blue-50 border-b border-blue-100 text-blue-900">
                                      <th className="p-2.5 text-left font-bold uppercase">#</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Date</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Item</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Category</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Faculty / Staff</th>
                                      <th className="p-2.5 text-center font-bold uppercase">Qty</th>
                                      <th className="p-2.5 text-right font-bold uppercase">Unit Rate</th>
                                      <th className="p-2.5 text-right font-bold uppercase">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {dept.logs
                                      .slice()
                                      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                                      .map((log, idx) => {
                                        const uc = getIssuedItemPrice(log);
                                        return (
                                          <tr key={log.id}
                                              className={idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                                            <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="p-2.5 font-mono font-semibold text-slate-600 whitespace-nowrap">
                                              {dFmt(log.date)}
                                            </td>
                                            <td className="p-2.5 font-semibold text-slate-800">
                                              {log.item}
                                              {log.type
                                                ? <span className="text-slate-400 font-normal ml-1">({log.type})</span>
                                                : null}
                                            </td>
                                            <td className="p-2.5 text-slate-500">{log.category}</td>
                                            <td className="p-2.5 text-slate-600">{log.faculty}</td>
                                            <td className="p-2.5 text-center font-black text-blue-700">{log.quantity}</td>
                                            <td className="p-2.5 text-right text-slate-500">₹{fmt(uc)}</td>
                                            <td className="p-2.5 text-right font-bold text-slate-800">
                                              ₹{fmt(log.quantity * uc)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-blue-700 text-white">
                                      <td colSpan={5} className="p-2.5 font-black text-xs uppercase">
                                        {dept.name} Total
                                      </td>
                                      <td className="p-2.5 text-center font-black text-xs">{dept.qty}</td>
                                      <td />
                                      <td className="p-2.5 text-right font-black text-xs">₹{fmt(dept.amt)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {depts.length > 0 && (
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={2} className="p-3 font-black text-xs uppercase">Grand Total</td>
                  <td className="p-3 text-center font-black text-xs">{totalIssuedQty}</td>
                  <td className="p-3 text-right font-black text-xs">₹{fmt(totalIssuedAmt)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ISSUE REPORT
  // ══════════════════════════════════════════════════════════════════════════
  const renderIssueReport = () => {
    return (
      <>
        {renderFilterBar(exportIssue, () => setShowPrintModal(true), (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</label>
              <select
                value={selectedDepartment}
                onChange={e => { setSelectedDepartment(e.target.value); setExpandedItem(null); }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setExpandedItem(null); }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {renderDateBar("amber")}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Phenyl, Chalk, Pen…"
                  value={itemSearchQuery}
                  onChange={e => { setItemSearchQuery(e.target.value); setExpandedItem(null); }}
                  className="border border-slate-200 rounded-lg px-3 py-2 pl-8 pr-7 text-sm text-slate-700
                             focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white w-48 transition"
                />
                <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs pointer-events-none" />
                {itemSearchQuery && (
                  <button
                    type="button"
                    onClick={() => { setItemSearchQuery(""); setExpandedItem(null); }}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 text-xs rounded-full hover:bg-slate-100 cursor-pointer"
                    title="Clear search"
                  >
                    <FaTimes size={11} />
                  </button>
                )}
              </div>
            </div>
          </>
        ))}

        {renderCollegeHeader()}

        {renderStatChips([
          { label: "Items",       val: itemsSummary.length },
          { label: "Total Qty",   val: fmt(totalIssuedQty) + " units" },
          { label: "Total Value", val: "₹" + fmt(totalIssuedAmt) },
        ])}

        <p className="text-xs text-slate-400 mb-3 -mt-2">
          Click any item to see all its issue records.
        </p>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-amber-600 text-white">
                <th className="p-3 text-left font-bold text-xs uppercase">Item</th>
                <th className="p-3 text-left font-bold text-xs uppercase">Category</th>
                <th className="p-3 text-center font-bold text-xs uppercase">Total Qty</th>
                <th className="p-3 text-right font-bold text-xs uppercase">Total Value</th>
                <th className="p-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemsSummary.length === 0 ? (
                <EmptyRow colSpan={5} />
              ) : (
                itemsSummary.map((item, idx) => {
                  const isOpen = expandedItem === item.key;
                  return (
                    <React.Fragment key={item.key}>
                      <tr
                        className={"cursor-pointer transition-colors " +
                          (isOpen
                            ? "bg-amber-50/50 "
                            : idx % 2 === 0 ? "bg-white " : "bg-slate-50/50 ") +
                          "hover:bg-amber-50/70"}
                        onClick={() => setExpandedItem(isOpen ? null : item.key)}
                      >
                        <td className="p-3.5 font-semibold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                              {(item.itemName || "I")[0].toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {item.itemName}
                                {item.itemType ? (
                                  <span className="text-slate-400 font-normal ml-1 text-xs">({item.itemType})</span>
                                ) : null}
                              </p>
                              <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                                {item.logs.length} record{item.logs.length !== 1 ? "s" : ""} · {item.qty} units · ₹{fmt(item.amt)}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {isOpen ? "▲ Collapse" : "▼ See all records"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-xs font-medium text-slate-600">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {item.category || "—"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-black text-slate-800 text-sm">
                          {item.qty}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-800 text-sm">
                          ₹{fmt(item.amt)}
                        </td>
                        <td className="p-3.5 text-center text-amber-500">
                          {isOpen ? <FaChevronDown size={12}/> : <FaChevronRight size={12}/>}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="border-y-2 border-amber-300 bg-white">
                              <div className="flex items-center justify-between px-5 py-2.5 bg-amber-600">
                                <p className="text-white text-xs font-black uppercase tracking-wider">
                                  {item.displayName} — {item.logs.length} issue record{item.logs.length !== 1 ? "s" : ""}
                                </p>
                                <button
                                  onClick={e => { e.stopPropagation(); setExpandedItem(null); }}
                                  className="text-white/80 hover:text-white text-xs font-bold px-2 py-1
                                             rounded hover:bg-white/10 transition cursor-pointer"
                                >
                                  ✕ Close
                                </button>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-amber-50 border-b border-amber-100 text-amber-900">
                                      <th className="p-2.5 text-left font-bold uppercase">#</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Date</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Department</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Faculty / Staff</th>
                                      <th className="p-2.5 text-center font-bold uppercase">Qty</th>
                                      <th className="p-2.5 text-right font-bold uppercase">Unit Rate</th>
                                      <th className="p-2.5 text-right font-bold uppercase">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {item.logs
                                      .slice()
                                      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
                                      .map((log, idx) => {
                                        const uc = getIssuedItemPrice(log);
                                        return (
                                          <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50/30"}>
                                            <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                                            <td className="p-2.5 font-mono font-semibold text-slate-600 whitespace-nowrap">
                                              {dFmt(log.date)}
                                            </td>
                                            <td className="p-2.5 font-bold text-amber-800">
                                              {log.department}
                                            </td>
                                            <td className="p-2.5 text-slate-600">{log.faculty}</td>
                                            <td className="p-2.5 text-center font-black text-amber-700">{log.quantity}</td>
                                            <td className="p-2.5 text-right text-slate-500">₹{fmt(uc)}</td>
                                            <td className="p-2.5 text-right font-bold text-slate-800">
                                              ₹{fmt(log.quantity * uc)}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-amber-600 text-white">
                                      <td colSpan={4} className="p-2.5 font-black text-xs uppercase">
                                        {item.displayName} Total
                                      </td>
                                      <td className="p-2.5 text-center font-black text-xs">{item.qty}</td>
                                      <td />
                                      <td className="p-2.5 text-right font-black text-xs">₹{fmt(item.amt)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {itemsSummary.length > 0 && (
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={2} className="p-3 font-black text-xs uppercase">
                    Grand Total ({itemsSummary.length} item{itemsSummary.length !== 1 ? "s" : ""})
                  </td>
                  <td className="p-3 text-center font-black text-xs">{totalIssuedQty}</td>
                  <td className="p-3 text-right font-black text-xs">₹{fmt(totalIssuedAmt)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PURCHASE REPORT
  // ══════════════════════════════════════════════════════════════════════════
  const renderPurchaseReport = () => {
    // Status badge colour
    const statusBadge = (s) =>
      s === "Received" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" :
      s === "Pending"  ? "bg-amber-100 text-amber-700 border border-amber-300" :
      s === "Rejected" ? "bg-red-100 text-red-700 border border-red-300" :
                         "bg-blue-100 text-blue-700 border border-blue-300";

    return (
      <>
        {renderFilterBar(exportPurchase, () => setShowPrintModal(true), (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
              <select
                value={selectedCategory}
                onChange={e => { setSelectedCategory(e.target.value); setExpandedPurchaseItem(null); }}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {renderDateBar("emerald")}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Laptop, Phenyl, Supplier…"
                  value={itemSearchQuery}
                  onChange={e => { setItemSearchQuery(e.target.value); setExpandedPurchaseItem(null); }}
                  className="border border-slate-200 rounded-lg px-3 py-2 pl-8 pr-7 text-sm text-slate-700
                             focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white w-48 transition"
                />
                <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs pointer-events-none" />
                {itemSearchQuery && (
                  <button
                    type="button"
                    onClick={() => { setItemSearchQuery(""); setExpandedPurchaseItem(null); }}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 text-xs rounded-full hover:bg-slate-100 cursor-pointer"
                    title="Clear search"
                  >
                    <FaTimes size={11} />
                  </button>
                )}
              </div>
            </div>
          </>
        ))}

        {renderCollegeHeader()}

        {renderStatChips([
          { label: "Items",       val: purchaseItemsSummary.length },
          { label: "Orders",      val: filteredOrders.length },
          { label: "Total Qty",   val: fmt(totalOrderedQty) + " units" },
          { label: "Total Value", val: "₹" + fmt(totalOrderedAmt) },
        ])}

        <p className="text-xs text-slate-400 mb-3 -mt-2">
          Click any item to see all its purchase orders and history.
        </p>

        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th className="p-3 text-left font-bold text-xs uppercase">Item</th>
                <th className="p-3 text-left font-bold text-xs uppercase">Category</th>
                <th className="p-3 text-center font-bold text-xs uppercase">Total Qty</th>
                <th className="p-3 text-right font-bold text-xs uppercase">Total Value</th>
                <th className="p-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseItemsSummary.length === 0 ? (
                <EmptyRow colSpan={5} />
              ) : (
                purchaseItemsSummary.map((item, idx) => {
                  const isOpen = expandedPurchaseItem === item.key;
                  return (
                    <React.Fragment key={item.key}>
                      <tr
                        className={"cursor-pointer transition-colors " +
                          (isOpen
                            ? "bg-emerald-50/50 "
                            : idx % 2 === 0 ? "bg-white " : "bg-slate-50/50 ") +
                          "hover:bg-emerald-50/70"}
                        onClick={() => setExpandedPurchaseItem(isOpen ? null : item.key)}
                      >
                        <td className="p-3.5 font-semibold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs flex-shrink-0">
                              {(item.itemName || "P")[0].toUpperCase()}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">
                                {item.itemName}
                                {item.itemType ? (
                                  <span className="text-slate-400 font-normal ml-1 text-xs">({item.itemType})</span>
                                ) : null}
                              </p>
                              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                                {item.orders.length} order{item.orders.length !== 1 ? "s" : ""} · {item.qty} units · ₹{fmt(item.amt)}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {isOpen ? "▲ Collapse" : "▼ See all purchase records"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-xs font-medium text-slate-600">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {item.category || "—"}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-black text-slate-800 text-sm">
                          {item.qty}
                        </td>
                        <td className="p-3.5 text-right font-black text-slate-800 text-sm">
                          ₹{fmt(item.amt)}
                        </td>
                        <td className="p-3.5 text-center text-emerald-600">
                          {isOpen ? <FaChevronDown size={12}/> : <FaChevronRight size={12}/>}
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="p-0">
                            <div className="border-y-2 border-emerald-300 bg-white">
                              <div className="flex items-center justify-between px-5 py-2.5 bg-emerald-700">
                                <p className="text-white text-xs font-black uppercase tracking-wider">
                                  {item.displayName} — {item.orders.length} purchase record{item.orders.length !== 1 ? "s" : ""}
                                </p>
                                <button
                                  type="button"
                                  onClick={e => { e.stopPropagation(); setExpandedPurchaseItem(null); }}
                                  className="text-white/80 hover:text-white text-xs font-bold px-2 py-1
                                             rounded hover:bg-white/10 transition cursor-pointer"
                                >
                                  ✕ Close
                                </button>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                  <thead>
                                    <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-950">
                                      <th className="p-2.5 text-left font-bold uppercase">#</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Order Date</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Receive Date</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Supplier</th>
                                      <th className="p-2.5 text-left font-bold uppercase">Department</th>
                                      <th className="p-2.5 text-center font-bold uppercase">Qty</th>
                                      <th className="p-2.5 text-right font-bold uppercase">Unit Price</th>
                                      <th className="p-2.5 text-right font-bold uppercase">Total</th>
                                      <th className="p-2.5 text-center font-bold uppercase">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {item.orders
                                      .slice()
                                      .sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""))
                                      .map((o, oIdx) => (
                                        <tr key={o.id || oIdx} className={oIdx % 2 === 0 ? "bg-white" : "bg-emerald-50/20"}>
                                          <td className="p-2.5 text-slate-400 font-mono">{oIdx + 1}</td>
                                          <td className="p-2.5 font-mono font-semibold text-slate-600 whitespace-nowrap">
                                            {dFmt(o.orderDate)}
                                          </td>
                                          <td className="p-2.5 font-mono text-slate-500 whitespace-nowrap">
                                            {dFmt(o.receiveDate) || "—"}
                                          </td>
                                          <td className="p-2.5 font-medium text-slate-700">{o.supplier || "—"}</td>
                                          <td className="p-2.5 text-slate-600">{o.department || "—"}</td>
                                          <td className="p-2.5 text-center font-black text-emerald-800">{o.quantity}</td>
                                          <td className="p-2.5 text-right text-slate-500">₹{fmt(o.pricePerUnit)}</td>
                                          <td className="p-2.5 text-right font-bold text-slate-800">
                                            ₹{fmt(o.quantity * (o.pricePerUnit || 0))}
                                          </td>
                                          <td className="p-2.5 text-center">
                                            <span className={"px-2 py-0.5 rounded-full text-[10px] font-black " + statusBadge(o.status)}>
                                              {o.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-emerald-700 text-white">
                                      <td colSpan={5} className="p-2.5 font-black text-xs uppercase">
                                        {item.displayName} Total
                                      </td>
                                      <td className="p-2.5 text-center font-black text-xs">{item.qty}</td>
                                      <td />
                                      <td className="p-2.5 text-right font-black text-xs">₹{fmt(item.amt)}</td>
                                      <td />
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {purchaseItemsSummary.length > 0 && (
              <tfoot>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={2} className="p-3 font-black text-xs uppercase">
                    Grand Total ({purchaseItemsSummary.length} item{purchaseItemsSummary.length !== 1 ? "s" : ""})
                  </td>
                  <td className="p-3 text-center font-black text-xs">{totalOrderedQty}</td>
                  <td className="p-3 text-right font-black text-xs">₹{fmt(totalOrderedAmt)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PRINT PORTAL
  // ══════════════════════════════════════════════════════════════════════════
  const renderPrintPortal = () => (
    <div className="hidden print-report-layout p-8 bg-white text-black font-sans min-h-screen">
      <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-4 mb-6">
        {collegeInfo?.logo
          ? <img src={collegeInfo.logo} alt="logo" className="w-16 h-16 object-contain" />
          : <div className="w-16 h-16 bg-blue-900 text-white flex items-center justify-center font-black text-2xl">
              {(collegeInfo?.name || "R")[0]}
            </div>}
        <div>
          <h1 className="text-xl font-black">{collegeInfo?.name || "Rustamji Institute of Technology"}</h1>
          <p className="text-sm text-slate-600">{collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh"}</p>
          <p className="text-xs text-slate-500">{collegeInfo?.phone || "+91-(07524)-274320"}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-500">
            Period: <strong>{getPeriodLabel()}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Report Type: <strong className="uppercase">{printScope === "full" ? "Full Detailed Report" : "Summary Data"}</strong>
          </p>
          <p className="text-xs text-slate-400">Generated: {new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
      <h2 className="text-lg font-black mb-4 text-blue-900">{activeCard?.title}</h2>

      {/* ────────────────── DEPARTMENT REPORT PRINT ────────────────── */}
      {activeReport === "department" && (
        <div>
          {expandedDept ? (
            (() => {
              const dept = deptSummary.find(d => d.name === expandedDept);
              if (!dept) return null;
              return (
                <div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
                    <p className="font-bold text-sm text-blue-900">
                      Department: <span className="font-black">{dept.name}</span>
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Total Issued: {dept.qty} units · Total Value: ₹{fmt(dept.amt)} ({dept.logs.length} records)
                    </p>
                  </div>

                  {dept.catBreakdown && dept.catBreakdown.length > 0 && (
                    <table className="w-full border-collapse text-xs mb-4">
                      <thead>
                        <tr className="bg-blue-800 text-white">
                          <th className="border border-blue-900 p-2 text-left">#</th>
                          <th className="border border-blue-900 p-2 text-left">Category</th>
                          <th className="border border-blue-900 p-2 text-center">Quantity Issued</th>
                          <th className="border border-blue-900 p-2 text-right">Total Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dept.catBreakdown.map((c, idx) => (
                          <tr key={c.cat} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="border border-slate-300 p-2">{idx + 1}</td>
                            <td className="border border-slate-300 p-2 font-bold">{c.cat}</td>
                            <td className="border border-slate-300 p-2 text-center font-bold">{c.qty}</td>
                            <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(c.amt)}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-800 text-white font-bold">
                          <td colSpan={2} className="border border-slate-600 p-2 uppercase">Total for {dept.name}</td>
                          <td className="border border-slate-600 p-2 text-center">{dept.qty}</td>
                          <td className="border border-slate-600 p-2 text-right">₹{fmt(dept.amt)}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {printScope === "full" && (
                    <>
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Detailed Transaction Records</p>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-700 text-white">
                            {["#", "Date", "Item", "Category", "Faculty / Staff", "Qty", "Unit Rate", "Total"].map(h => (
                              <th key={h} className="border border-slate-600 p-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dept.logs.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((l, idx) => {
                            const uc = getIssuedItemPrice(l);
                            return (
                              <tr key={l.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                <td className="border border-slate-300 p-2">{idx + 1}</td>
                                <td className="border border-slate-300 p-2 font-mono">{dFmt(l.date)}</td>
                                <td className="border border-slate-300 p-2 font-semibold">{l.item}</td>
                                <td className="border border-slate-300 p-2">{l.category}</td>
                                <td className="border border-slate-300 p-2">{l.faculty}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold">{l.quantity}</td>
                                <td className="border border-slate-300 p-2 text-right">₹{fmt(uc)}</td>
                                <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(l.quantity * uc)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-slate-800 text-white font-bold">
                            <td colSpan={5} className="border border-slate-600 p-2">Total for {dept.name}</td>
                            <td className="border border-slate-600 p-2 text-center">{dept.qty}</td>
                            <td />
                            <td className="border border-slate-600 p-2 text-right">₹{fmt(dept.amt)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Department Summary</p>
              <table className="w-full border-collapse text-xs mb-6">
                <thead>
                  <tr className="bg-blue-800 text-white">
                    <th className="border border-blue-900 p-2 text-left">#</th>
                    <th className="border border-blue-900 p-2 text-left">Department</th>
                    <th className="border border-blue-900 p-2 text-left">Category</th>
                    <th className="border border-blue-900 p-2 text-center">Total Qty</th>
                    <th className="border border-blue-900 p-2 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let count = 0;
                    return deptSummary.map(d =>
                      d.catBreakdown.map(c => (
                        <tr key={d.name + c.cat} className={count++ % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="border border-slate-300 p-2">{count}</td>
                          <td className="border border-slate-300 p-2 font-bold">{d.name}</td>
                          <td className="border border-slate-300 p-2">{c.cat}</td>
                          <td className="border border-slate-300 p-2 text-center font-bold">{c.qty}</td>
                          <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(c.amt)}</td>
                        </tr>
                      ))
                    );
                  })()}
                  <tr className="bg-slate-800 text-white font-bold">
                    <td colSpan={3} className="border border-slate-600 p-2 uppercase">Grand Total</td>
                    <td className="border border-slate-600 p-2 text-center">{totalIssuedQty}</td>
                    <td className="border border-slate-600 p-2 text-right">₹{fmt(totalIssuedAmt)}</td>
                  </tr>
                </tbody>
              </table>

              {printScope === "full" && (
                <>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Department-wise Breakdown</p>
                  {deptSummary.map(d => (
                    <div key={d.name} className="mb-5 break-inside-avoid">
                      <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 font-bold text-xs flex justify-between">
                        <span>Department: {d.name}</span>
                        <span>Total: {d.qty} units · ₹{fmt(d.amt)}</span>
                      </div>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-700 text-white">
                            {["#", "Date", "Item", "Category", "Faculty / Staff", "Qty", "Unit Rate", "Total"].map(h => (
                              <th key={h} className="border border-slate-600 p-1.5 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {d.logs.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((l, idx) => {
                            const uc = getIssuedItemPrice(l);
                            return (
                              <tr key={l.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                <td className="border border-slate-200 p-1.5">{idx + 1}</td>
                                <td className="border border-slate-200 p-1.5 font-mono">{dFmt(l.date)}</td>
                                <td className="border border-slate-200 p-1.5 font-semibold">{l.item}</td>
                                <td className="border border-slate-200 p-1.5">{l.category}</td>
                                <td className="border border-slate-200 p-1.5">{l.faculty}</td>
                                <td className="border border-slate-200 p-1.5 text-center font-bold">{l.quantity}</td>
                                <td className="border border-slate-200 p-1.5 text-right">₹{fmt(uc)}</td>
                                <td className="border border-slate-200 p-1.5 text-right font-bold">₹{fmt(l.quantity * uc)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── ISSUE REPORT PRINT ────────────────── */}
      {activeReport === "issue" && (
        <div>
          {expandedItem ? (
            (() => {
              const item = itemsSummary.find(i => i.key === expandedItem);
              if (!item) return null;
              return (
                <div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded mb-4">
                    <p className="font-bold text-sm text-amber-900">
                      Item: <span className="font-black">{item.displayName}</span> ({item.category})
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Total Issued: {item.qty} units · Total Value: ₹{fmt(item.amt)} ({item.logs.length} records)
                    </p>
                  </div>

                  {printScope === "summary" && (
                    <div className="bg-white border border-slate-200 rounded p-4 mb-4 text-xs">
                      <p className="font-bold text-slate-700 mb-2">Item Overview</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                          <span className="font-bold text-slate-800 text-sm">{item.category}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Issued Qty</span>
                          <span className="font-black text-amber-600 text-sm">{item.qty} units</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Value</span>
                          <span className="font-black text-slate-800 text-sm">₹{fmt(item.amt)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {printScope === "full" && (
                    <>
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Detailed Issue Records</p>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-amber-600 text-white">
                            {["#", "Date", "Department", "Faculty / Staff", "Qty", "Unit Rate", "Total"].map(h => (
                              <th key={h} className="border border-amber-700 p-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.logs.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((l, idx) => {
                            const uc = getIssuedItemPrice(l);
                            return (
                              <tr key={l.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                <td className="border border-slate-300 p-2">{idx + 1}</td>
                                <td className="border border-slate-300 p-2 font-mono">{dFmt(l.date)}</td>
                                <td className="border border-slate-300 p-2 font-bold">{l.department}</td>
                                <td className="border border-slate-300 p-2">{l.faculty}</td>
                                <td className="border border-slate-300 p-2 text-center font-bold">{l.quantity}</td>
                                <td className="border border-slate-300 p-2 text-right">₹{fmt(uc)}</td>
                                <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(l.quantity * uc)}</td>
                              </tr>
                            );
                          })}
                          <tr className="bg-slate-800 text-white font-bold">
                            <td colSpan={4} className="border border-slate-600 p-2">Total for {item.displayName}</td>
                            <td className="border border-slate-600 p-2 text-center">{item.qty}</td>
                            <td />
                            <td className="border border-slate-600 p-2 text-right">₹{fmt(item.amt)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Item Issue Summary</p>
              <table className="w-full border-collapse text-xs mb-6">
                <thead>
                  <tr className="bg-amber-600 text-white">
                    <th className="border border-amber-700 p-2 text-left">#</th>
                    <th className="border border-amber-700 p-2 text-left">Item</th>
                    <th className="border border-amber-700 p-2 text-left">Category</th>
                    <th className="border border-amber-700 p-2 text-center">Total Qty Issued</th>
                    <th className="border border-amber-700 p-2 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsSummary.map((item, idx) => (
                    <tr key={item.key} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 p-2">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{item.displayName}</td>
                      <td className="border border-slate-300 p-2">{item.category}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{item.qty}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(item.amt)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-800 text-white font-bold">
                    <td colSpan={3} className="border border-slate-600 p-2 uppercase">Grand Total</td>
                    <td className="border border-slate-600 p-2 text-center">{totalIssuedQty}</td>
                    <td className="border border-slate-600 p-2 text-right">₹{fmt(totalIssuedAmt)}</td>
                  </tr>
                </tbody>
              </table>

              {printScope === "full" && (
                <>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Item-wise Disbursement Records</p>
                  {itemsSummary.map(item => (
                    <div key={item.key} className="mb-5 break-inside-avoid">
                      <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 font-bold text-xs flex justify-between">
                        <span>Item: {item.displayName} ({item.category})</span>
                        <span>Total: {item.qty} units · ₹{fmt(item.amt)}</span>
                      </div>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-700 text-white">
                            {["#", "Date", "Department", "Faculty / Staff", "Qty", "Unit Rate", "Total"].map(h => (
                              <th key={h} className="border border-slate-600 p-1.5 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.logs.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")).map((l, idx) => {
                            const uc = getIssuedItemPrice(l);
                            return (
                              <tr key={l.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                <td className="border border-slate-200 p-1.5">{idx + 1}</td>
                                <td className="border border-slate-200 p-1.5 font-mono">{dFmt(l.date)}</td>
                                <td className="border border-slate-200 p-1.5 font-bold">{l.department}</td>
                                <td className="border border-slate-200 p-1.5">{l.faculty}</td>
                                <td className="border border-slate-200 p-1.5 text-center font-bold">{l.quantity}</td>
                                <td className="border border-slate-200 p-1.5 text-right">₹{fmt(uc)}</td>
                                <td className="border border-slate-200 p-1.5 text-right font-bold">₹{fmt(l.quantity * uc)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ────────────────── PURCHASE REPORT PRINT ────────────────── */}
      {activeReport === "purchase" && (
        <div>
          {expandedPurchaseItem ? (
            (() => {
              const item = purchaseItemsSummary.find(i => i.key === expandedPurchaseItem);
              if (!item) return null;
              return (
                <div>
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded mb-4">
                    <p className="font-bold text-sm text-emerald-900">
                      Purchase History: <span className="font-black">{item.displayName}</span> ({item.category})
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Total Orders: {item.orders.length} · Total Qty: {item.qty} units · Total Value: ₹{fmt(item.amt)}
                    </p>
                  </div>

                  {printScope === "summary" && (
                    <div className="bg-white border border-slate-200 rounded p-4 mb-4 text-xs">
                      <p className="font-bold text-slate-700 mb-2">Purchase Overview</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                          <span className="font-bold text-slate-800 text-sm">{item.category}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Ordered Qty</span>
                          <span className="font-black text-emerald-600 text-sm">{item.qty} units</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Value</span>
                          <span className="font-black text-slate-800 text-sm">₹{fmt(item.amt)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {printScope === "full" && (
                    <>
                      <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Detailed Purchase Orders</p>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-emerald-700 text-white">
                            {["#", "Order Date", "Receive Date", "Supplier", "Status", "Qty", "Unit Price", "Total"].map(h => (
                              <th key={h} className="border border-emerald-800 p-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.orders.slice().sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || "")).map((o, idx) => (
                            <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                              <td className="border border-slate-300 p-2">{idx + 1}</td>
                              <td className="border border-slate-300 p-2 font-mono">{dFmt(o.orderDate)}</td>
                              <td className="border border-slate-300 p-2 font-mono">{dFmt(o.receiveDate) || "—"}</td>
                              <td className="border border-slate-300 p-2">{o.supplier}</td>
                              <td className="border border-slate-300 p-2 font-semibold">{o.status}</td>
                              <td className="border border-slate-300 p-2 text-center font-bold">{o.quantity}</td>
                              <td className="border border-slate-300 p-2 text-right">₹{fmt(o.pricePerUnit)}</td>
                              <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(o.quantity * (o.pricePerUnit || 0))}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-800 text-white font-bold">
                            <td colSpan={5} className="border border-slate-600 p-2">Total for {item.displayName}</td>
                            <td className="border border-slate-600 p-2 text-center">{item.qty}</td>
                            <td />
                            <td className="border border-slate-600 p-2 text-right">₹{fmt(item.amt)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              );
            })()
          ) : (
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Purchase Items Summary</p>
              <table className="w-full border-collapse text-xs mb-6">
                <thead>
                  <tr className="bg-emerald-700 text-white">
                    <th className="border border-emerald-800 p-2 text-left">#</th>
                    <th className="border border-emerald-800 p-2 text-left">Item</th>
                    <th className="border border-emerald-800 p-2 text-left">Category</th>
                    <th className="border border-emerald-800 p-2 text-center">Orders Count</th>
                    <th className="border border-emerald-800 p-2 text-center">Total Qty Ordered</th>
                    <th className="border border-emerald-800 p-2 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItemsSummary.map((item, idx) => (
                    <tr key={item.key} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-300 p-2">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{item.displayName}</td>
                      <td className="border border-slate-300 p-2">{item.category}</td>
                      <td className="border border-slate-300 p-2 text-center">{item.orders.length}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{item.qty}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">₹{fmt(item.amt)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-800 text-white font-bold">
                    <td colSpan={3} className="border border-slate-600 p-2 uppercase">Grand Total</td>
                    <td className="border border-slate-600 p-2 text-center">{filteredOrders.length}</td>
                    <td className="border border-slate-600 p-2 text-center">{totalOrderedQty}</td>
                    <td className="border border-slate-600 p-2 text-right">₹{fmt(totalOrderedAmt)}</td>
                  </tr>
                </tbody>
              </table>

              {printScope === "full" && (
                <>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Item-wise Purchase Orders</p>
                  {purchaseItemsSummary.map(item => (
                    <div key={item.key} className="mb-5 break-inside-avoid">
                      <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 font-bold text-xs flex justify-between">
                        <span>Item: {item.displayName} ({item.category})</span>
                        <span>{item.orders.length} order{item.orders.length !== 1 ? "s" : ""} · {item.qty} units · ₹{fmt(item.amt)}</span>
                      </div>
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-700 text-white">
                            {["#", "Order Date", "Receive Date", "Supplier", "Status", "Qty", "Unit Price", "Total"].map(h => (
                              <th key={h} className="border border-slate-600 p-1.5 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.orders.slice().sort((a, b) => (b.orderDate || "").localeCompare(a.orderDate || "")).map((o, idx) => (
                            <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                              <td className="border border-slate-200 p-1.5">{idx + 1}</td>
                              <td className="border border-slate-200 p-1.5 font-mono">{dFmt(o.orderDate)}</td>
                              <td className="border border-slate-200 p-1.5 font-mono">{dFmt(o.receiveDate) || "—"}</td>
                              <td className="border border-slate-200 p-1.5">{o.supplier}</td>
                              <td className="border border-slate-200 p-1.5">{o.status}</td>
                              <td className="border border-slate-200 p-1.5 text-center font-bold">{o.quantity}</td>
                              <td className="border border-slate-200 p-1.5 text-right">₹{fmt(o.pricePerUnit)}</td>
                              <td className="border border-slate-200 p-1.5 text-right font-bold">₹{fmt(o.quantity * (o.pricePerUnit || 0))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        <div className="mt-8 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Reports Center</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Generate, filter, print and export institutional reports.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={"fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-white text-sm font-bold " +
            (loading ? "bg-indigo-600 border-indigo-500" : "bg-emerald-600 border-emerald-500")}>
            {loading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
            {toast}
          </div>
        )}

        {/* Report Type Cards — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {reportCards.map(card => {
            const selected = activeReport === card.type;
            return (
              <button key={card.type}
                onClick={() => {
                  if (selected) { setActiveReport(null); return; }
                  setActiveReport(card.type);
                  setSelectedDepartment("all");
                  setSelectedCategory("all");
                  setItemSearchQuery("");
                  setExpandedDept(null);
                  setExpandedItem(null);
                  setExpandedPurchaseItem(null);
                }}
                className={"rounded-2xl p-5 text-left border transition-all duration-200 cursor-pointer w-full " +
                  (selected
                    ? "bg-gradient-to-br " + card.gradient + " text-white border-transparent shadow-lg scale-[1.01]"
                    : "bg-white border-slate-200 text-slate-800 shadow-sm hover:border-slate-300 hover:shadow-md")}>
                <div className={"w-11 h-11 rounded-xl flex items-center justify-center mb-4 " +
                  (selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600")}>
                  {card.icon}
                </div>
                <p className="font-black text-sm mb-1">{card.title}</p>
                <p className={"text-xs leading-relaxed " + (selected ? "text-white/75" : "text-slate-400")}>
                  {card.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Report Panel */}
        {activeReport && activeCard && (
          <div className={"border " + activeCard.border + " rounded-2xl bg-white shadow-sm overflow-hidden"}>
            {/* Panel header */}
            <div className={activeCard.hdr + " px-6 py-4 flex items-center justify-between"}>
              <div className="flex items-center gap-3">
                <span className="text-white/80">{activeCard.icon}</span>
                <div>
                  <h2 className="text-white font-black text-base">{activeCard.title}</h2>
                  <p className="text-white/70 text-xs">{activeCard.desc}</p>
                </div>
              </div>
              <button onClick={() => { setActiveReport(null); setExpandedDept(null); setExpandedItem(null); setExpandedPurchaseItem(null); }}
                className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg
                           hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5">
                <FaTimes /> Close
              </button>
            </div>

            <div className="p-6">
              {activeReport === "department" && renderDepartmentReport()}
              {activeReport === "issue"      && renderIssueReport()}
              {activeReport === "purchase"   && renderPurchaseReport()}
            </div>
          </div>
        )}

        {/* Placeholder when nothing selected */}
        {!activeReport && (
          <div className="bg-white border border-slate-200 rounded-2xl p-14 text-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFilePdf className="text-2xl" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-1">Select a Report</h2>
            <p className="text-slate-400 text-sm">
              Click one of the 3 cards above. Drill down into departments, issued stock, or purchases by item with real-time search, specific single-day or date-range filtering, and instant Excel export.
            </p>
          </div>
        )}
      </div>

      {/* Print Options Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Print Options</h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">Select the level of detail for the printed report:</p>
              
              <div className="space-y-3">
                <label className={"flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors " + (printScope === "summary" ? "bg-indigo-50 border-indigo-200" : "hover:bg-slate-50 border-slate-200")}>
                  <input type="radio" name="printScope" value="summary" checked={printScope === "summary"} onChange={() => setPrintScope("summary")} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <div className="font-bold text-sm text-slate-800">Summary Data</div>
                    <div className="text-xs text-slate-500">Only main totals and aggregated figures</div>
                  </div>
                </label>
                
                <label className={"flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors " + (printScope === "full" ? "bg-indigo-50 border-indigo-200" : "hover:bg-slate-50 border-slate-200")}>
                  <input type="radio" name="printScope" value="full" checked={printScope === "full"} onChange={() => setPrintScope("full")} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <div className="font-bold text-sm text-slate-800">Full Detailed Data</div>
                    <div className="text-xs text-slate-500">Includes all itemized transactions and breakdown</div>
                  </div>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => triggerPrint(printScope)}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <FaPrint /> Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print portal */}
      {activeReport && createPortal(renderPrintPortal(), document.body)}
    </div>
  );
}
