import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaFileExcel, FaBuilding, FaBoxes, FaCalendarAlt, FaChartBar,
  FaSpinner, FaCheckCircle, FaPrint, FaFilePdf, FaSearch,
  FaChevronDown, FaChevronRight, FaFilter, FaTimes
} from "react-icons/fa";
import { useStore } from "../context/StoreContext";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import ExcelJS from "exceljs";

export default function Reports() {
  const { inventory, issuedStock, orders, systemSettings, inventoryCategories, getRegisterForCategory } = useStore();
  const collegeInfo = systemSettings?.collegeInfo;

  const [activeReportType, setActiveReportType] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("2020-02-01");
  const [endDate, setEndDate] = useState("2020-02-29");
  const [expandedDept, setExpandedDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const getIssuedItemPrice = (log) => {
    if (log.unitCost && !isNaN(Number(log.unitCost)) && Number(log.unitCost) > 0)
      return Number(log.unitCost);
    const inv = inventory.find(i =>
      ((i.item || "").toLowerCase() === (log.item || "").toLowerCase() ||
       (i.subcategory || "").toLowerCase() === (log.item || "").toLowerCase()) &&
      (i.category || "").toLowerCase() === (log.category || "").toLowerCase()
    ) || inventory.find(i =>
      (i.category || "").toLowerCase() === (log.category || "").toLowerCase() &&
      (i.type || "").toLowerCase() === (log.type || "").toLowerCase()
    );
    return inv ? (Number(inv.price) || 0) : 0;
  };

  const inRange = (dateStr) => {
    if (!dateStr) return false;
    const d = dateStr.slice(0, 10);
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  };

  const norm = (s) => (s || "").toLowerCase().replace(/phynil/g, "phenyl").replace(/phenyle/g, "phenyl");

  const departmentsList = Array.from(new Set(
    issuedStock.map(l => l.department).filter(Boolean)
  )).sort();

  const categories = Array.from(new Set([
    ...inventory.map(i => i.category),
    ...issuedStock.map(l => l.category),
    ...inventoryCategories.map(c => c.name)
  ].filter(Boolean))).sort();

  const filteredIssued = issuedStock.filter(log => {
    if (!inRange(log.date)) return false;
    if (selectedDepartment !== "all" &&
      (log.department || "").trim().toLowerCase() !== selectedDepartment.trim().toLowerCase()) return false;
    if (selectedCategory !== "all") {
      const lc = (log.category || "").trim().toLowerCase();
      const sc = selectedCategory.trim().toLowerCase();
      if (lc !== sc && getRegisterForCategory(lc).toLowerCase() !== sc) return false;
    }
    if (itemSearchQuery.trim()) {
      const q = norm(itemSearchQuery.trim());
      if (!norm(log.item).includes(q) &&
          !norm(log.subcategory).includes(q) &&
          !norm(log.type).includes(q) &&
          !norm(log.category).includes(q)) return false;
    }
    return true;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const filteredOrders = orders.filter(o => {
    if (!inRange(o.orderDate) && !inRange(o.receiveDate)) return false;
    if (selectedCategory !== "all") {
      const oc = (o.category || "").toLowerCase();
      const sc = selectedCategory.toLowerCase();
      if (oc !== sc && getRegisterForCategory(oc).toLowerCase() !== sc) return false;
    }
    if (selectedDepartment !== "all") {
      const rn = getRegisterForCategory(o.category);
      if (rn.toLowerCase() !== selectedDepartment.toLowerCase() &&
        (o.department || "").toLowerCase() !== selectedDepartment.toLowerCase()) return false;
    }
    if (itemSearchQuery.trim()) {
      const q = norm(itemSearchQuery.trim());
      if (!norm(o.item).includes(q) && !norm(o.type).includes(q) && !norm(o.category).includes(q)) return false;
    }
    return true;
  });

  const totalIssuedQty = filteredIssued.reduce((s, l) => s + l.quantity, 0);
  const totalIssuedAmt = filteredIssued.reduce((s, l) => s + l.quantity * getIssuedItemPrice(l), 0);
  const totalOrderedQty = filteredOrders.reduce((s, o) => s + o.quantity, 0);
  const totalOrderedAmt = filteredOrders.reduce((s, o) => s + o.quantity * (o.pricePerUnit || 0), 0);

  const deptSummary = departmentsList.map(name => {
    const logs = filteredIssued.filter(l => (l.department || "").trim().toLowerCase() === name.trim().toLowerCase());
    const qty = logs.reduce((s, l) => s + l.quantity, 0);
    const amt = logs.reduce((s, l) => s + l.quantity * getIssuedItemPrice(l), 0);
    return { name, qty, amt, logs };
  }).filter(d => d.qty > 0 || (selectedDepartment !== "all" && d.name.toLowerCase() === selectedDepartment.toLowerCase()));

  const catSummary = categories.map(cat => {
    const logs = filteredIssued.filter(l => (l.category || "").toLowerCase() === cat.toLowerCase());
    const qty = logs.reduce((s, l) => s + l.quantity, 0);
    const amt = logs.reduce((s, l) => s + l.quantity * getIssuedItemPrice(l), 0);
    return { cat, qty, amt, logs };
  }).filter(c => c.qty > 0);

  const getStockAtEnd = (item) => {
    const issuedAfter = issuedStock.filter(l => {
      const d = (l.date || "").slice(0, 10);
      return (endDate && d > endDate) &&
        (l.category || "").toLowerCase() === (item.category || "").toLowerCase() &&
        (l.type || "").toLowerCase() === (item.type || "").toLowerCase();
    }).reduce((s, l) => s + l.quantity, 0);
    const receivedAfter = orders.filter(o => {
      const d = (o.receiveDate || "").slice(0, 10);
      return (o.status === "Received" || o.status === "Partially Received") && (endDate && d > endDate) &&
        (o.category || "").toLowerCase() === (item.category || "").toLowerCase() &&
        (o.type || "").toLowerCase() === (item.type || "").toLowerCase();
    }).reduce((s, o) => s + (o.receivedQuantity || o.quantity), 0);
    const val = item.stock + issuedAfter - receivedAfter;
    return val >= 0 ? val : 0;
  };

  const stockStatement = inventory
    .filter(item => !endDate || (item.createdAt || "").slice(0, 10) <= endDate)
    .map(item => ({ ...item, stockAtEnd: getStockAtEnd(item), value: getStockAtEnd(item) * item.price }))
    .filter(item => item.stockAtEnd > 0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 4000); };
  const fmt = (n) => (n || 0).toLocaleString("en-IN");

  const exportExcel = async (sheetTitle, rows, headers, colWidths) => {
    setLoading(true);
    showToast("Compiling report…");
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");
      ws.views = [{ showGridLines: true }];
      const cn = collegeInfo?.name || "Rustamji Institute of Technology";
      const ca = collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh";
      const cp = "Phone: " + (collegeInfo?.phone || "+91-(07524)-274320") + " | Email: " + (collegeInfo?.email || "rjit_bsft@yahoo.com");
      const colCount = headers.length;
      const endCol = String.fromCharCode(64 + Math.min(colCount, 26));
      const mergeRange = "A1:" + endCol;
      const periodLabel = (startDate && endDate) ? (startDate + " to " + endDate) : (startDate ? "From " + startDate : (endDate ? "Up to " + endDate : "All Dates"));
      [
        [cn, 14, "FF1E3A8A", "FFFFFFFF", 36],
        [ca, 9, "FFF8FAFC", "FF475569", 18],
        [cp, 9, "FFF8FAFC", "FF475569", 16],
        [sheetTitle.toUpperCase() + " — Period: " + periodLabel, 11, "FFEFF6FF", "FF1E40AF", 26],
        ["Generated: " + new Date().toLocaleString("en-IN"), 8, "FFFFFFFF", "FF94A3B8", 16]
      ].forEach(([val, sz, bg, fg, h], i) => {
        ws.mergeCells(mergeRange + (i + 1));
        const r = ws.getRow(i + 1);
        r.getCell(1).value = val;
        r.getCell(1).font = { name: "Calibri", size: sz, bold: i === 0 || i === 3, color: { argb: fg } };
        r.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        r.height = h;
      });
      if (collegeInfo?.logo && collegeInfo.logo.startsWith("data:image/")) {
        try {
          const parts = collegeInfo.logo.split(",");
          const b64 = parts[1];
          const ext = (parts[0].match(/image\/(\w+)/) || ["", "png"])[1];
          const imgId = wb.addImage({ base64: b64, extension: ext });
          ws.addImage(imgId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 48, height: 48 } });
        } catch (_) {}
      }
      const headerRow = ws.getRow(7);
      headerRow.values = headers;
      headerRow.height = 26;
      headers.forEach((_, ci) => {
        const cell = headerRow.getCell(ci + 1);
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
      });
      rows.forEach((rowData, ri) => {
        const r = ws.getRow(8 + ri);
        r.values = rowData;
        r.height = 18;
        rowData.forEach((_, ci) => {
          const cell = r.getCell(ci + 1);
          cell.font = { name: "Calibri", size: 10 };
          cell.border = { top: { style: "thin", color: { argb: "FFCBD5E1" } }, bottom: { style: "thin", color: { argb: "FFCBD5E1" } }, left: { style: "thin", color: { argb: "FFCBD5E1" } }, right: { style: "thin", color: { argb: "FFCBD5E1" } } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ri % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" } };
        });
      });
      colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
      const buf = await wb.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = sheetTitle.replace(/\s+/g, "_") + "_report.xlsx";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast("Report downloaded successfully!");
    } catch (e) {
      console.error(e);
      showToast("Export failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportDeptReport = () => exportExcel(
    selectedDepartment === "all" ? "Department Report" : "Department – " + selectedDepartment,
    filteredIssued.map(l => { const uc = getIssuedItemPrice(l); return [(l.date || "").slice(0, 10), l.department, l.item, l.type, l.category, l.faculty, l.quantity, uc, l.quantity * uc]; }),
    ["Date", "Department", "Item", "Type", "Category", "Faculty/Staff", "Qty", "Unit Rate (Rs)", "Total (Rs)"],
    [14, 20, 28, 14, 18, 18, 8, 14, 14]
  );

  const exportCatReport = () => exportExcel(
    selectedCategory === "all" ? "Category Report" : "Category – " + selectedCategory,
    filteredIssued.map(l => { const uc = getIssuedItemPrice(l); return [(l.date || "").slice(0, 10), l.category, l.item, l.type, l.department, l.faculty, l.quantity, uc, l.quantity * uc]; }),
    ["Date", "Category", "Item", "Type", "Department", "Faculty/Staff", "Qty", "Unit Rate (Rs)", "Total (Rs)"],
    [14, 18, 28, 14, 20, 18, 8, 14, 14]
  );

  const exportIssueRegister = () => exportExcel(
    "Issue Register",
    filteredIssued.map(l => { const uc = getIssuedItemPrice(l); return [(l.date || "").slice(0, 10), l.item, l.type, l.category, l.department, l.faculty, l.quantity, uc, l.quantity * uc]; }),
    ["Date", "Item", "Type", "Category", "Department", "Faculty/Staff", "Qty", "Unit Rate (Rs)", "Total (Rs)"],
    [14, 28, 14, 18, 20, 18, 8, 14, 14]
  );

  const exportPurchaseRegister = () => exportExcel(
    "Purchase Register",
    filteredOrders.map(o => [(o.orderDate || "").slice(0, 10), (o.receiveDate || "").slice(0, 10) || "—", o.item, o.type, o.supplier, o.category, o.quantity, o.pricePerUnit, o.quantity * (o.pricePerUnit || 0), o.status]),
    ["Order Date", "Receive Date", "Item", "Type", "Supplier", "Category", "Qty", "Unit Price (Rs)", "Total (Rs)", "Status"],
    [14, 14, 28, 14, 20, 18, 8, 14, 14, 12]
  );

  const reportCards = [
    { type: "department", title: "Department Report", desc: "Disbursements sorted by college department or hostel unit.", icon: <FaBuilding size={22}/>, gradient: "from-blue-600 to-indigo-700", accent: "blue" },
    { type: "category",   title: "Category Report",   desc: "Consumption breakdown by asset class — Sanitary, Electrical, etc.", icon: <FaBoxes size={22}/>, gradient: "from-purple-600 to-pink-700", accent: "purple" },
    { type: "detail",     title: "Issue & Purchase Register", desc: "Date-wise audit of issued stock and purchase orders.", icon: <FaCalendarAlt size={22}/>, gradient: "from-amber-500 to-orange-600", accent: "amber" },
    { type: "summary",    title: "Stock Statement",   desc: "Stock on hand with valuation as of the selected date.", icon: <FaChartBar size={22}/>, gradient: "from-emerald-500 to-teal-600", accent: "emerald" }
  ];

  const accentBg = { blue: "bg-blue-700", purple: "bg-purple-700", amber: "bg-amber-600", emerald: "bg-emerald-700" };
  const accentBorder = { blue: "border-blue-200", purple: "border-purple-200", amber: "border-amber-200", emerald: "border-emerald-200" };
  const accentThead = { blue: "bg-blue-700", purple: "bg-purple-700", amber: "bg-amber-600", emerald: "bg-emerald-700" };

  const activeCard = reportCards.find(c => c.type === activeReportType);

  const CollegeHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
      <div className="flex items-center gap-3 min-w-0">
        {collegeInfo?.logo
          ? <img src={collegeInfo.logo} alt="logo" className="w-12 h-12 object-contain rounded-lg border border-slate-200 flex-shrink-0 bg-white p-1"/>
          : <div className="w-12 h-12 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm">{(collegeInfo?.name || "R")[0]}</div>}
        <div className="min-w-0">
          <p className="font-black text-slate-800 text-sm leading-tight">{collegeInfo?.name || "Rustamji Institute of Technology"}</p>
          <p className="text-slate-500 text-xs mt-0.5 truncate">{collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh"}</p>
          <p className="text-slate-400 text-xs">{collegeInfo?.phone || "+91-(07524)-274320"} {collegeInfo?.email ? "· " + collegeInfo.email : ""}</p>
        </div>
      </div>
      <div className="sm:text-right flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report Period</p>
        <p className="font-black text-slate-700 text-sm">
          {startDate && endDate ? `${startDate} to ${endDate}` : (startDate ? `From ${startDate}` : (endDate ? `Up to ${endDate}` : "All Records"))}
        </p>
      </div>
    </div>
  );

  const StatChips = ({ chips }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map(c => (
        <div key={c.label} className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-baseline gap-2 shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{c.label}</span>
          <span className="font-black text-slate-800 text-sm">{c.val}</span>
        </div>
      ))}
    </div>
  );

  const DateInputs = () => (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"/>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"/>
      </div>
      <div className="flex items-center gap-1.5 pb-0.5">
        <button type="button" onClick={() => { setStartDate("2020-02-01"); setEndDate("2020-02-29"); }}
          className={"px-2.5 py-2 rounded-lg text-xs font-bold transition border cursor-pointer " + (startDate === "2020-02-01" && endDate === "2020-02-29" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100")}>
          Feb 2020
        </button>
        <button type="button" onClick={() => { setStartDate("2020-02-26"); setEndDate("2020-02-26"); }}
          className={"px-2.5 py-2 rounded-lg text-xs font-bold transition border cursor-pointer " + (startDate === "2020-02-26" && endDate === "2020-02-26" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100")}>
          26 Feb
        </button>
        <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }}
          className={"px-2.5 py-2 rounded-lg text-xs font-bold transition border cursor-pointer " + (!startDate && !endDate ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100")}>
          All Time
        </button>
      </div>
    </div>
  );

  const FilterBar = ({ children, onExport, onPrint }) => (
    <div className="flex flex-wrap gap-3 items-end mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {children}
      <div className="ml-auto flex gap-2 flex-shrink-0">
        <button onClick={onExport} disabled={loading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer active:scale-95 transition disabled:opacity-50">
          {loading ? <FaSpinner className="animate-spin"/> : <FaFileExcel/>} Excel
        </button>
        <button onClick={onPrint}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer active:scale-95 transition">
          <FaPrint/> Print
        </button>
      </div>
    </div>
  );

  const EmptyRow = ({ colSpan }) => (
    <tr>
      <td colSpan={colSpan} className="p-10 text-center text-slate-400 text-sm">
        <FaFilePdf className="mx-auto mb-2 text-2xl opacity-20"/>
        No records found for the selected filters and date range.
      </td>
    </tr>
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Sidebar/>
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar/>

        <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Reports Center</h1>
            <p className="text-slate-500 mt-1 text-sm">Generate, print and export simplified institutional reports for college management.</p>
          </div>
        </div>

        {toast && (
          <div className={"fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border text-white text-sm font-bold " + (loading ? "bg-indigo-600 border-indigo-500" : "bg-emerald-600 border-emerald-500")}>
            {loading ? <FaSpinner className="animate-spin"/> : <FaCheckCircle/>}
            {toast}
          </div>
        )}

        {/* Report Type Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reportCards.map(card => {
            const selected = activeReportType === card.type;
            return (
              <button key={card.type}
                onClick={() => {
                  setActiveReportType(selected ? null : card.type);
                  setSelectedDepartment("all");
                  setSelectedCategory("all");
                  setItemSearchQuery("");
                  setExpandedDept(null);
                }}
                className={"rounded-2xl p-5 text-left border transition-all duration-200 cursor-pointer w-full " + (selected
                  ? "bg-gradient-to-br " + card.gradient + " text-white border-transparent shadow-lg scale-[1.01]"
                  : "bg-white border-slate-200 text-slate-800 shadow-sm hover:border-slate-300 hover:shadow-md")}>
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-4 " + (selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600")}>
                  {card.icon}
                </div>
                <p className="font-black text-sm mb-1">{card.title}</p>
                <p className={"text-xs leading-relaxed " + (selected ? "text-white/75" : "text-slate-400")}>{card.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Report Panel */}
        {activeReportType && (
          <div className={"border " + accentBorder[activeCard.accent] + " rounded-2xl bg-white shadow-sm overflow-hidden"}>
            <div className={accentBg[activeCard.accent] + " px-6 py-4 flex items-center justify-between"}>
              <div className="flex items-center gap-3">
                <span className="text-white/80">{activeCard.icon}</span>
                <div>
                  <h2 className="text-white font-black text-base">{activeCard.title}</h2>
                  <p className="text-white/70 text-xs">{activeCard.desc}</p>
                </div>
              </div>
              <button onClick={() => setActiveReportType(null)}
                className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5">
                <FaTimes/> Close
              </button>
            </div>

            <div className="p-6">

              {/* DEPARTMENT REPORT */}
              {activeReportType === "department" && (<>
                <FilterBar onExport={exportDeptReport} onPrint={() => window.print()}>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</label>
                    <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer">
                      <option value="all">All Departments ({departmentsList.length})</option>
                      {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <DateInputs/>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
                    <div className="relative">
                      <input type="text" placeholder="e.g. Phenyl, Chalk…" value={itemSearchQuery}
                        onChange={e => setItemSearchQuery(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 pl-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"/>
                      <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs"/>
                    </div>
                  </div>
                </FilterBar>
                <CollegeHeader/>
                <StatChips chips={[
                  { label: "Departments", val: deptSummary.length },
                  { label: "Records", val: filteredIssued.length },
                  { label: "Qty Issued", val: fmt(totalIssuedQty) + " units" },
                  { label: "Total Value", val: "Rs " + fmt(totalIssuedAmt) }
                ]}/>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={accentThead["blue"] + " text-white"}>
                        <th className="p-3 text-left font-bold text-xs uppercase">Department</th>
                        <th className="p-3 text-center font-bold text-xs uppercase">Records</th>
                        <th className="p-3 text-center font-bold text-xs uppercase">Qty</th>
                        <th className="p-3 text-right font-bold text-xs uppercase">Value</th>
                        <th className="p-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedDepartment === "all" ? deptSummary : deptSummary.filter(d => d.name.toLowerCase() === selectedDepartment.toLowerCase()))
                        .sort((a, b) => b.amt - a.amt).map(dept => (
                        <React.Fragment key={dept.name}>
                          <tr onClick={() => setExpandedDept(expandedDept === dept.name ? null : dept.name)}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs flex-shrink-0">{dept.name[0]}</span>
                                <span className="font-semibold text-slate-800">{dept.name}</span>
                              </div>
                            </td>
                            <td className="p-3.5 text-center text-slate-500 font-medium">{dept.logs.length}</td>
                            <td className="p-3.5 text-center font-black text-blue-700">{dept.qty}</td>
                            <td className="p-3.5 text-right font-black text-slate-800">Rs {fmt(dept.amt)}</td>
                            <td className="p-3.5 text-center text-blue-400 text-xs">{expandedDept === dept.name ? <FaChevronDown/> : <FaChevronRight/>}</td>
                          </tr>
                          {expandedDept === dept.name && (
                            <tr className="bg-blue-50/30">
                              <td colSpan={5} className="p-3 pl-8">
                                <div className="bg-white rounded-lg border border-blue-100 shadow-sm overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-blue-50 text-blue-900 font-bold uppercase text-[10px] border-b border-blue-100">
                                        <th className="p-2.5 text-left">Date</th>
                                        <th className="p-2.5 text-left">Item Name</th>
                                        <th className="p-2.5 text-left">Category</th>
                                        <th className="p-2.5 text-left">Faculty / Staff</th>
                                        <th className="p-2.5 text-center">Qty</th>
                                        <th className="p-2.5 text-right">Unit Rate</th>
                                        <th className="p-2.5 text-right">Total Value</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {dept.logs.map(log => {
                                        const uc = getIssuedItemPrice(log);
                                        return (
                                          <tr key={log.id} className="hover:bg-blue-50/20">
                                            <td className="p-2.5 font-mono text-slate-500 font-semibold">{(log.date || "").slice(0, 10)}</td>
                                            <td className="p-2.5 font-medium text-slate-800">{log.item} <span className="text-slate-400">({log.type})</span></td>
                                            <td className="p-2.5 text-slate-500">{log.category}</td>
                                            <td className="p-2.5 text-slate-600">{log.faculty}</td>
                                            <td className="p-2.5 text-center font-bold text-blue-700">{log.quantity}</td>
                                            <td className="p-2.5 text-right text-slate-600">Rs {fmt(uc)}</td>
                                            <td className="p-2.5 text-right font-bold text-slate-800">Rs {fmt(log.quantity * uc)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {filteredIssued.length === 0 && <EmptyRow colSpan={5}/>}
                    </tbody>
                    {filteredIssued.length > 0 && (
                      <tfoot><tr className="bg-slate-800 text-white">
                        <td className="p-3 font-black text-xs uppercase">Total</td>
                        <td className="p-3 text-center text-xs font-bold">{filteredIssued.length}</td>
                        <td className="p-3 text-center text-xs font-black">{totalIssuedQty}</td>
                        <td className="p-3 text-right text-xs font-black">Rs {fmt(totalIssuedAmt)}</td>
                        <td></td>
                      </tr></tfoot>
                    )}
                  </table>
                </div>
              </>)}

              {/* CATEGORY REPORT */}
              {activeReportType === "category" && (<>
                <FilterBar onExport={exportCatReport} onPrint={() => window.print()}>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white cursor-pointer">
                      <option value="all">All Categories ({categories.length})</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <DateInputs/>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
                    <div className="relative">
                      <input type="text" placeholder="e.g. Phenyl, Chalk…" value={itemSearchQuery}
                        onChange={e => setItemSearchQuery(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 pl-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"/>
                      <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs"/>
                    </div>
                  </div>
                </FilterBar>
                <CollegeHeader/>
                <StatChips chips={[
                  { label: "Categories", val: catSummary.length },
                  { label: "Records", val: filteredIssued.length },
                  { label: "Qty Issued", val: fmt(totalIssuedQty) + " units" },
                  { label: "Total Value", val: "Rs " + fmt(totalIssuedAmt) }
                ]}/>
                {catSummary.length > 0 && (
                  <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Consumption by Category</p>
                    {catSummary.sort((a, b) => b.amt - a.amt).map(g => {
                      const maxAmt = Math.max(...catSummary.map(x => x.amt), 1);
                      return (
                        <div key={g.cat}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-slate-700">{g.cat}</span>
                            <span className="text-xs font-black text-slate-700">{g.qty} units · Rs {fmt(g.amt)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: (g.amt / maxAmt * 100) + "%" }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={accentThead["purple"] + " text-white"}>
                        {["#", "Date", "Item", "Type", "Category", "Department", "Faculty", "Qty", "Unit Rate", "Total"].map(h => (
                          <th key={h} className="p-3 text-left font-bold text-xs uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIssued.length > 0 ? filteredIssued.map((log, idx) => {
                        const uc = getIssuedItemPrice(log);
                        return (
                          <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                            <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-3 text-xs font-bold text-slate-700 font-mono whitespace-nowrap">{(log.date || "").slice(0, 10)}</td>
                            <td className="p-3 font-semibold text-slate-800">{log.item}</td>
                            <td className="p-3 text-xs text-slate-500">{log.type}</td>
                            <td className="p-3 text-xs font-bold text-purple-700">{log.category}</td>
                            <td className="p-3 text-xs text-slate-600">{log.department}</td>
                            <td className="p-3 text-xs text-slate-500">{log.faculty}</td>
                            <td className="p-3 text-center font-black text-slate-800">{log.quantity}</td>
                            <td className="p-3 text-right text-xs text-slate-600">Rs {fmt(uc)}</td>
                            <td className="p-3 text-right font-black text-slate-800">Rs {fmt(log.quantity * uc)}</td>
                          </tr>
                        );
                      }) : <EmptyRow colSpan={10}/>}
                    </tbody>
                    {filteredIssued.length > 0 && (
                      <tfoot><tr className="bg-slate-800 text-white">
                        <td colSpan={7} className="p-3 font-black text-xs uppercase">Total</td>
                        <td className="p-3 text-center font-black text-xs">{totalIssuedQty}</td>
                        <td></td>
                        <td className="p-3 text-right font-black text-xs">Rs {fmt(totalIssuedAmt)}</td>
                      </tr></tfoot>
                    )}
                  </table>
                </div>
              </>)}

              {/* ISSUE & PURCHASE REGISTER */}
              {activeReportType === "detail" && (<>
                <FilterBar onExport={exportIssueRegister} onPrint={() => window.print()}>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</label>
                    <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer">
                      <option value="all">All Departments</option>
                      {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer">
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <DateInputs/>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
                    <div className="relative">
                      <input type="text" placeholder="e.g. Phenyl, Chalk…" value={itemSearchQuery}
                        onChange={e => setItemSearchQuery(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 pl-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"/>
                      <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs"/>
                    </div>
                  </div>
                </FilterBar>
                <CollegeHeader/>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black text-amber-700 uppercase tracking-widest">Stock Issue Register (Date-Wise)</p>
                  <span className="text-xs text-slate-400">Chronological issue audit</span>
                </div>
                <StatChips chips={[
                  { label: "Records", val: filteredIssued.length },
                  { label: "Qty Issued", val: fmt(totalIssuedQty) + " units" },
                  { label: "Total Value", val: "Rs " + fmt(totalIssuedAmt) }
                ]}/>
                <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={accentThead["amber"] + " text-white"}>
                        {["#", "Date", "Item", "Type", "Category", "Department", "Faculty/Staff", "Qty", "Unit Rate", "Total"].map(h => (
                          <th key={h} className="p-3 text-left font-bold text-xs uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredIssued.length > 0 ? filteredIssued.map((log, idx) => {
                        const uc = getIssuedItemPrice(log);
                        return (
                          <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                            <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                            <td className="p-3 text-xs font-bold text-slate-700 font-mono whitespace-nowrap">{(log.date || "").slice(0, 10)}</td>
                            <td className="p-3 font-semibold text-slate-800">{log.item}</td>
                            <td className="p-3 text-xs text-slate-500">{log.type}</td>
                            <td className="p-3 text-xs text-slate-500">{log.category}</td>
                            <td className="p-3 text-xs font-bold text-amber-700">{log.department}</td>
                            <td className="p-3 text-xs text-slate-500">{log.faculty}</td>
                            <td className="p-3 text-center font-black text-slate-800">{log.quantity}</td>
                            <td className="p-3 text-right text-xs text-slate-600">Rs {fmt(uc)}</td>
                            <td className="p-3 text-right font-black text-slate-800">Rs {fmt(log.quantity * uc)}</td>
                          </tr>
                        );
                      }) : <EmptyRow colSpan={10}/>}
                    </tbody>
                    {filteredIssued.length > 0 && (
                      <tfoot><tr className="bg-slate-800 text-white">
                        <td colSpan={7} className="p-3 font-black text-xs uppercase">Total</td>
                        <td className="p-3 text-center font-black text-xs">{totalIssuedQty}</td>
                        <td></td>
                        <td className="p-3 text-right font-black text-xs">Rs {fmt(totalIssuedAmt)}</td>
                      </tr></tfoot>
                    )}
                  </table>
                </div>

                <div className="flex items-center justify-between mb-2 mt-4">
                  <p className="text-xs font-black text-orange-700 uppercase tracking-widest">Purchase Order Register</p>
                  <button onClick={exportPurchaseRegister} disabled={loading}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer active:scale-95 transition disabled:opacity-50">
                    <FaFileExcel/> Export Purchase Excel
                  </button>
                </div>
                <StatChips chips={[
                  { label: "Orders", val: filteredOrders.length },
                  { label: "Qty Ordered", val: fmt(totalOrderedQty) + " units" },
                  { label: "Total Value", val: "Rs " + fmt(totalOrderedAmt) }
                ]}/>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-orange-600 text-white">
                        {["#", "Order Date", "Receive Date", "Item", "Type", "Supplier", "Category", "Qty", "Unit Price", "Total", "Status"].map(h => (
                          <th key={h} className="p-3 text-left font-bold text-xs uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length > 0 ? filteredOrders.map((o, idx) => (
                        <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 text-xs font-bold text-slate-700 font-mono whitespace-nowrap">{(o.orderDate || "").slice(0, 10)}</td>
                          <td className="p-3 text-xs text-slate-500 font-mono whitespace-nowrap">{(o.receiveDate || "").slice(0, 10) || "—"}</td>
                          <td className="p-3 font-semibold text-slate-800">{o.item}</td>
                          <td className="p-3 text-xs text-slate-500">{o.type}</td>
                          <td className="p-3 text-xs text-slate-500">{o.supplier}</td>
                          <td className="p-3 text-xs text-slate-500">{o.category}</td>
                          <td className="p-3 text-center font-black text-slate-800">{o.quantity}</td>
                          <td className="p-3 text-right text-xs text-slate-600">Rs {fmt(o.pricePerUnit)}</td>
                          <td className="p-3 text-right font-black text-slate-800">Rs {fmt(o.quantity * (o.pricePerUnit || 0))}</td>
                          <td className="p-3">
                            <span className={"px-2 py-0.5 rounded-full text-[10px] font-black " + (o.status === "Received" ? "bg-emerald-100 text-emerald-700" : o.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700")}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      )) : <EmptyRow colSpan={11}/>}
                    </tbody>
                    {filteredOrders.length > 0 && (
                      <tfoot><tr className="bg-slate-800 text-white">
                        <td colSpan={7} className="p-3 font-black text-xs uppercase">Total</td>
                        <td className="p-3 text-center font-black text-xs">{totalOrderedQty}</td>
                        <td></td>
                        <td className="p-3 text-right font-black text-xs">Rs {fmt(totalOrderedAmt)}</td>
                        <td></td>
                      </tr></tfoot>
                    )}
                  </table>
                </div>
              </>)}

              {/* STOCK STATEMENT */}
              {activeReportType === "summary" && (<>
                <FilterBar
                  onExport={() => exportExcel(
                    "Stock Statement",
                    stockStatement.filter(item => selectedCategory === "all" || (item.category || "").toLowerCase() === selectedCategory.toLowerCase())
                      .map(item => [item.subcategory || item.item, item.type, item.category, item.stockAtEnd, item.price, item.value]),
                    ["Item", "Type", "Category", "Stock on Hand", "Unit Price (Rs)", "Total Value (Rs)"],
                    [30, 16, 18, 14, 14, 16]
                  )}
                  onPrint={() => window.print()}>
                  <DateInputs/>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white cursor-pointer">
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </FilterBar>
                <CollegeHeader/>
                <StatChips chips={[
                  { label: "Items in Stock", val: stockStatement.length },
                  { label: "Total Units", val: fmt(stockStatement.reduce((s, i) => s + i.stockAtEnd, 0)) },
                  { label: "Stock Value", val: "Rs " + fmt(stockStatement.reduce((s, i) => s + i.value, 0)) },
                  { label: "Issued (Period)", val: fmt(totalIssuedQty) + " units" }
                ]}/>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-emerald-700 px-4 py-2.5"><p className="text-white font-bold text-xs uppercase tracking-wider">Dept-wise Issues (this period)</p></div>
                    <table className="w-full border-collapse text-sm">
                      <thead><tr className="bg-emerald-50 border-b border-slate-200">
                        <th className="p-3 text-left text-xs font-bold text-emerald-700 uppercase">Department</th>
                        <th className="p-3 text-center text-xs font-bold text-emerald-700 uppercase">Qty</th>
                        <th className="p-3 text-right text-xs font-bold text-emerald-700 uppercase">Value</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {deptSummary.sort((a, b) => b.amt - a.amt).map(d => (
                          <tr key={d.name} className="hover:bg-emerald-50/40">
                            <td className="p-3 font-semibold text-slate-700">{d.name}</td>
                            <td className="p-3 text-center font-black text-emerald-700">{d.qty}</td>
                            <td className="p-3 text-right font-black text-slate-800">Rs {fmt(d.amt)}</td>
                          </tr>
                        ))}
                        {deptSummary.length === 0 && <EmptyRow colSpan={3}/>}
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-teal-700 px-4 py-2.5"><p className="text-white font-bold text-xs uppercase tracking-wider">Category-wise Issues (this period)</p></div>
                    <table className="w-full border-collapse text-sm">
                      <thead><tr className="bg-teal-50 border-b border-slate-200">
                        <th className="p-3 text-left text-xs font-bold text-teal-700 uppercase">Category</th>
                        <th className="p-3 text-center text-xs font-bold text-teal-700 uppercase">Qty</th>
                        <th className="p-3 text-right text-xs font-bold text-teal-700 uppercase">Value</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {catSummary.sort((a, b) => b.amt - a.amt).map(c => (
                          <tr key={c.cat} className="hover:bg-teal-50/40">
                            <td className="p-3 font-semibold text-slate-700">{c.cat}</td>
                            <td className="p-3 text-center font-black text-teal-700">{c.qty}</td>
                            <td className="p-3 text-right font-black text-slate-800">Rs {fmt(c.amt)}</td>
                          </tr>
                        ))}
                        {catSummary.length === 0 && <EmptyRow colSpan={3}/>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">Stock on Hand as of {endDate || "Today"}</p>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className={accentThead["emerald"] + " text-white"}>
                        {["#", "Item / Subcategory", "Type", "Category", "Stock on Hand", "Unit Price", "Total Value"].map(h => (
                          <th key={h} className="p-3 text-left font-bold text-xs uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stockStatement
                        .filter(item => selectedCategory === "all" || (item.category || "").toLowerCase() === selectedCategory.toLowerCase())
                        .sort((a, b) => b.value - a.value)
                        .map((item, idx) => (
                        <tr key={item.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-800">{item.subcategory || item.item}</td>
                          <td className="p-3 text-xs text-slate-500">{item.type}</td>
                          <td className="p-3 text-xs font-bold text-emerald-700">{item.category}</td>
                          <td className="p-3 text-center font-black text-slate-800">{item.stockAtEnd}</td>
                          <td className="p-3 text-right text-xs text-slate-600">Rs {fmt(item.price)}</td>
                          <td className="p-3 text-right font-black text-slate-800">Rs {fmt(item.value)}</td>
                        </tr>
                      ))}
                      {stockStatement.filter(item => selectedCategory === "all" || (item.category || "").toLowerCase() === selectedCategory.toLowerCase()).length === 0 && <EmptyRow colSpan={7}/>}
                    </tbody>
                    {stockStatement.length > 0 && (
                      <tfoot><tr className="bg-slate-800 text-white">
                        <td colSpan={4} className="p-3 font-black text-xs uppercase">Total</td>
                        <td className="p-3 text-center font-black text-xs">{fmt(stockStatement.reduce((s, i) => s + i.stockAtEnd, 0))}</td>
                        <td></td>
                        <td className="p-3 text-right font-black text-xs">Rs {fmt(stockStatement.reduce((s, i) => s + i.value, 0))}</td>
                      </tr></tfoot>
                    )}
                  </table>
                </div>
              </>)}

            </div>
          </div>
        )}

        {!activeReportType && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFilePdf className="text-2xl"/>
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-1">Select a Report Type</h2>
            <p className="text-slate-400 text-sm">Click one of the 4 cards above to configure filters, view on-screen records, print or export to Excel.</p>
          </div>
        )}
      </div>

      {/* Print Layout */}
      {activeReportType && createPortal(
        <div className="hidden print-report-layout p-8 bg-white text-black font-sans min-h-screen">
          <div className="flex items-center gap-4 border-b-2 border-slate-300 pb-4 mb-6">
            {collegeInfo?.logo
              ? <img src={collegeInfo.logo} alt="logo" className="w-16 h-16 object-contain"/>
              : <div className="w-16 h-16 bg-blue-900 text-white flex items-center justify-center font-black text-2xl">{(collegeInfo?.name || "R")[0]}</div>}
            <div>
              <h1 className="text-xl font-black">{collegeInfo?.name || "Rustamji Institute of Technology"}</h1>
              <p className="text-sm text-slate-600">{collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh"}</p>
              <p className="text-xs text-slate-500">{collegeInfo?.phone || "+91-(07524)-274320"} {collegeInfo?.email ? "· " + collegeInfo.email : ""}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500">Period: <strong>{startDate && endDate ? `${startDate} to ${endDate}` : (startDate ? `From ${startDate}` : (endDate ? `Up to ${endDate}` : "All Records"))}</strong></p>
              <p className="text-xs text-slate-400">Generated: {new Date().toLocaleString("en-IN")}</p>
            </div>
          </div>
          <h2 className="text-lg font-black mb-4 text-blue-900">{activeCard?.title}</h2>
          {(activeReportType === "department" || activeReportType === "category" || activeReportType === "detail") && (
            <table className="w-full border-collapse text-xs">
              <thead><tr className="bg-slate-800 text-white">
                {["#", "Date", "Item", "Category", "Department", "Faculty", "Qty", "Unit Rate", "Total"].map(h => (
                  <th key={h} className="border border-slate-600 p-2 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredIssued.map((log, idx) => {
                  const uc = getIssuedItemPrice(log);
                  return (
                    <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="border border-slate-200 p-2">{idx + 1}</td>
                      <td className="border border-slate-200 p-2 font-mono">{(log.date || "").slice(0, 10)}</td>
                      <td className="border border-slate-200 p-2 font-semibold">{log.item} ({log.type})</td>
                      <td className="border border-slate-200 p-2">{log.category}</td>
                      <td className="border border-slate-200 p-2 font-bold">{log.department}</td>
                      <td className="border border-slate-200 p-2">{log.faculty}</td>
                      <td className="border border-slate-200 p-2 text-center font-bold">{log.quantity}</td>
                      <td className="border border-slate-200 p-2 text-right">Rs {fmt(uc)}</td>
                      <td className="border border-slate-200 p-2 text-right font-bold">Rs {fmt(log.quantity * uc)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-800 text-white font-bold">
                  <td colSpan={6} className="border border-slate-600 p-2">Total</td>
                  <td className="border border-slate-600 p-2 text-center">{totalIssuedQty}</td>
                  <td></td>
                  <td className="border border-slate-600 p-2 text-right">Rs {fmt(totalIssuedAmt)}</td>
                </tr>
              </tbody>
            </table>
          )}
          {activeReportType === "summary" && (
            <table className="w-full border-collapse text-xs">
              <thead><tr className="bg-slate-800 text-white">
                {["#", "Item", "Type", "Category", "Stock on Hand", "Unit Price", "Total Value"].map(h => (
                  <th key={h} className="border border-slate-600 p-2 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {stockStatement.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-slate-200 p-2">{idx + 1}</td>
                    <td className="border border-slate-200 p-2 font-semibold">{item.subcategory || item.item}</td>
                    <td className="border border-slate-200 p-2">{item.type}</td>
                    <td className="border border-slate-200 p-2">{item.category}</td>
                    <td className="border border-slate-200 p-2 text-center font-bold">{item.stockAtEnd}</td>
                    <td className="border border-slate-200 p-2 text-right">Rs {fmt(item.price)}</td>
                    <td className="border border-slate-200 p-2 text-right font-bold">Rs {fmt(item.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
