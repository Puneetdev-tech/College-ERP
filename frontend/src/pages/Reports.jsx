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

// ─── View mode toggle chip ────────────────────────────────────────────────────
const ViewToggle = ({ mode, setMode }) => (
  <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
    <button
      onClick={() => setMode("summary")}
      className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer " +
        (mode === "summary" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
    >
      <FaChartBar className="text-[11px]" /> Summary
    </button>
    <button
      onClick={() => setMode("list")}
      className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer " +
        (mode === "list" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
    >
      <FaThList className="text-[11px]" /> Full List
    </button>
  </div>
);

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
    inventory, issuedStock, orders,
    systemSettings, inventoryCategories, getRegisterForCategory
  } = useStore();
  const collegeInfo = systemSettings?.collegeInfo;

  // Active report: "department" | "issue" | "purchase" | null
  const [activeReport, setActiveReport] = useState(null);
  // View mode per report: "summary" | "list"
  const [viewMode, setViewMode] = useState("summary");

  // Shared filters
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory]   = useState("all");
  const [itemSearchQuery, setItemSearchQuery]       = useState("");
  const [startDate, setStartDate] = useState("2020-02-01");
  const [endDate,   setEndDate]   = useState("2020-02-29");

  // Department report expand
  const [expandedDept, setExpandedDept] = useState(null);

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
    const d = dateStr.slice(0, 10);
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  };

  const norm = (s) =>
    (s || "").toLowerCase()
      .replace(/phynil/g, "phenyl")
      .replace(/phenyle/g, "phenyl");

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
      const q = norm(itemSearchQuery.trim());
      if (!norm(log.item).includes(q) && !norm(log.subcategory).includes(q) &&
          !norm(log.type).includes(q)  && !norm(log.category).includes(q))
        return false;
    }
    return true;
  }).sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Filtered orders (Purchase report)
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
          (o.department || "").toLowerCase() !== selectedDepartment.toLowerCase())
        return false;
    }
    if (itemSearchQuery.trim()) {
      const q = norm(itemSearchQuery.trim());
      if (!norm(o.item).includes(q) && !norm(o.type).includes(q) &&
          !norm(o.category).includes(q)) return false;
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

  // ── Excel export ───────────────────────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const exportExcel = async (sheetTitle, rows, headers, colWidths) => {
    setLoading(true);
    showToast("Compiling report…");
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Report");
      const cn = collegeInfo?.name    || "Rustamji Institute of Technology";
      const ca = collegeInfo?.address || "BSF Academy, Tekanpur, Gwalior, Madhya Pradesh";
      const cp =
        "Phone: " + (collegeInfo?.phone || "+91-(07524)-274320") +
        " | Email: " + (collegeInfo?.email || "rjit_bsft@yahoo.com");
      const periodLabel =
        startDate && endDate ? `${startDate} to ${endDate}` :
        startDate ? `From ${startDate}` : endDate ? `Up to ${endDate}` : "All Dates";
      const cols = headers.length;
      const endCol = String.fromCharCode(64 + Math.min(cols, 26));
      const mr = "A1:" + endCol;

      [
        [cn, 14, "FF1E3A8A", "FFFFFFFF", 36],
        [ca, 9,  "FFF8FAFC", "FF475569", 18],
        [cp, 9,  "FFF8FAFC", "FF475569", 16],
        [sheetTitle.toUpperCase() + " — Period: " + periodLabel, 11, "FFEFF6FF", "FF1E40AF", 26],
        ["Generated: " + new Date().toLocaleString("en-IN"), 8, "FFFFFFFF", "FF94A3B8", 16],
      ].forEach(([val, sz, bg, fg, h], i) => {
        ws.mergeCells(mr + (i + 1));
        const r = ws.getRow(i + 1);
        r.getCell(1).value = val;
        r.getCell(1).font  = { name: "Calibri", size: sz, bold: i === 0 || i === 3, color: { argb: fg } };
        r.getCell(1).fill  = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
        r.height = h;
      });

      if (collegeInfo?.logo?.startsWith("data:image/")) {
        try {
          const parts = collegeInfo.logo.split(",");
          const ext = (parts[0].match(/image\/(\w+)/) || ["", "png"])[1];
          const imgId = wb.addImage({ base64: parts[1], extension: ext });
          ws.addImage(imgId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 48, height: 48 } });
        } catch (_) {}
      }

      const hr = ws.getRow(7);
      hr.values = headers;
      hr.height = 26;
      headers.forEach((_, ci) => {
        const cell = hr.getCell(ci + 1);
        cell.font  = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { top: {style:"thin"}, bottom: {style:"thin"}, left: {style:"thin"}, right: {style:"thin"} };
      });

      rows.forEach((rowData, ri) => {
        const r = ws.getRow(8 + ri);
        r.values = rowData;
        r.height = 18;
        rowData.forEach((_, ci) => {
          const cell = r.getCell(ci + 1);
          cell.font   = { name: "Calibri", size: 10 };
          cell.fill   = { type: "pattern", pattern: "solid",
            fgColor: { argb: ri % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" } };
          cell.border = {
            top: {style:"thin", color:{argb:"FFCBD5E1"}}, bottom: {style:"thin", color:{argb:"FFCBD5E1"}},
            left: {style:"thin", color:{argb:"FFCBD5E1"}}, right: {style:"thin", color:{argb:"FFCBD5E1"}},
          };
        });
      });

      colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
      const buf = await wb.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }));
      const a = document.createElement("a");
      a.href = url;
      a.download = sheetTitle.replace(/\s+/g, "_") + "_report.xlsx";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast("Report downloaded!");
    } catch (e) {
      console.error(e);
      showToast("Export failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportDept = () => exportExcel(
    selectedDepartment === "all" ? "Department Report" : "Dept – " + selectedDepartment,
    deptSummary.flatMap(d =>
      d.catBreakdown.map(c => [d.name, c.cat, c.qty, c.amt])
    ),
    ["Department", "Category", "Total Qty", "Total Value (Rs)"],
    [24, 22, 12, 18]
  );

  const exportIssue = () => exportExcel(
    "Issue Register",
    filteredIssued.map(l => {
      const uc = getIssuedItemPrice(l);
      return [dFmt(l.date), l.item, l.category, l.department, l.faculty, l.quantity, uc, l.quantity * uc];
    }),
    ["Date", "Item", "Category", "Department", "Faculty/Staff", "Qty", "Unit Rate (Rs)", "Total (Rs)"],
    [14, 28, 18, 20, 18, 8, 14, 14]
  );

  const exportPurchase = () => exportExcel(
    "Purchase Register",
    filteredOrders.map(o => [
      dFmt(o.orderDate), dFmt(o.receiveDate) || "—",
      o.item, o.type, o.supplier, o.category,
      o.quantity, o.pricePerUnit, o.quantity * (o.pricePerUnit || 0), o.status
    ]),
    ["Order Date", "Receive Date", "Item", "Type", "Supplier", "Category", "Qty", "Unit Price (Rs)", "Total (Rs)", "Status"],
    [14, 14, 26, 14, 20, 16, 8, 14, 14, 12]
  );

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

  // ── Sub-components ──────────────────────────────────────────────────────────
  const CollegeHeader = () => (
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
          {startDate && endDate
            ? `${startDate} to ${endDate}`
            : startDate ? `From ${startDate}` : endDate ? `Up to ${endDate}` : "All Records"}
        </p>
      </div>
    </div>
  );

  const StatChips = ({ chips }) => (
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

  const DateBar = () => (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To</label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                     focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
      </div>

    </div>
  );

  const FilterBar = ({ onExport, onPrint, children }) => (
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
  const DepartmentReport = () => {
    const depts = selectedDepartment === "all"
      ? deptSummary
      : deptSummary.filter(d => d.name.toLowerCase() === selectedDepartment.toLowerCase());

    return (
      <>
        <FilterBar onExport={exportDept} onPrint={() => window.print()}>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</label>
            <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white cursor-pointer">
              <option value="all">All Departments ({departmentsList.length})</option>
              {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <DateBar />
        </FilterBar>

        <CollegeHeader />

        <StatChips chips={[
          { label: "Departments", val: depts.length },
          { label: "Total Qty",   val: fmt(totalIssuedQty) },
          { label: "Total Value", val: "₹" + fmt(totalIssuedAmt) },
        ]} />

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
  const IssueReport = () => {
    // Summary: group by date → total qty & value per day
    const byDate = Array.from(
      filteredIssued.reduce((m, log) => {
        const d = dFmt(log.date);
        if (!m.has(d)) m.set(d, { date: d, qty: 0, amt: 0, items: new Set() });
        const uc = getIssuedItemPrice(log);
        const e = m.get(d);
        e.qty += log.quantity;
        e.amt += log.quantity * uc;
        e.items.add(log.item);
        return m;
      }, new Map())
    ).map(([, v]) => ({ ...v, items: v.items.size }))
     .sort((a, b) => b.date.localeCompare(a.date));

    return (
      <>
        <FilterBar onExport={exportIssue} onPrint={() => window.print()}>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Department</label>
            <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer">
              <option value="all">All Departments</option>
              {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <DateBar />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
            <div className="relative">
              <input type="text" placeholder="e.g. Phenyl, Chalk…" value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 pl-8 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white w-44" />
              <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs" />
            </div>
          </div>
        </FilterBar>

        <CollegeHeader />

        <div className="flex items-center justify-between mb-4">
          <StatChips chips={[
            { label: "Records",     val: filteredIssued.length },
            { label: "Total Qty",   val: fmt(totalIssuedQty) + " units" },
            { label: "Total Value", val: "₹" + fmt(totalIssuedAmt) },
          ]} />
          <ViewToggle mode={viewMode} setMode={setViewMode} />
        </div>

        {viewMode === "summary" ? (
          /* ─ SUMMARY: date-wise totals ─ */
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-600 text-white">
                  <th className="p-3 text-left font-bold text-xs uppercase">Date</th>
                  <th className="p-3 text-center font-bold text-xs uppercase">Distinct Items</th>
                  <th className="p-3 text-center font-bold text-xs uppercase">Total Qty</th>
                  <th className="p-3 text-right font-bold text-xs uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byDate.length === 0
                  ? <EmptyRow colSpan={4} />
                  : byDate.map((row, idx) => (
                    <tr key={row.date} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="p-3 font-bold text-slate-700 font-mono">{row.date}</td>
                      <td className="p-3 text-center text-slate-600">{row.items}</td>
                      <td className="p-3 text-center font-black text-amber-700">{row.qty}</td>
                      <td className="p-3 text-right font-black text-slate-800">₹{fmt(row.amt)}</td>
                    </tr>
                  ))}
              </tbody>
              {byDate.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td className="p-3 font-black text-xs uppercase">Total ({byDate.length} days)</td>
                    <td />
                    <td className="p-3 text-center font-black text-xs">{totalIssuedQty}</td>
                    <td className="p-3 text-right font-black text-xs">₹{fmt(totalIssuedAmt)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          /* ─ FULL LIST ─ */
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-600 text-white">
                  {["#", "Date", "Item", "Category", "Department", "Faculty/Staff", "Qty", "Unit Rate", "Total"].map(h => (
                    <th key={h} className="p-3 text-left font-bold text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssued.length > 0
                  ? filteredIssued.map((log, idx) => {
                      const uc = getIssuedItemPrice(log);
                      return (
                        <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 text-xs font-bold text-slate-700 font-mono whitespace-nowrap">{dFmt(log.date)}</td>
                          <td className="p-3 font-semibold text-slate-800">{log.item}</td>
                          <td className="p-3 text-xs text-slate-500">{log.category}</td>
                          <td className="p-3 text-xs font-bold text-amber-700">{log.department}</td>
                          <td className="p-3 text-xs text-slate-500">{log.faculty}</td>
                          <td className="p-3 text-center font-black text-slate-800">{log.quantity}</td>
                          <td className="p-3 text-right text-xs text-slate-600">₹{fmt(uc)}</td>
                          <td className="p-3 text-right font-black text-slate-800">₹{fmt(log.quantity * uc)}</td>
                        </tr>
                      );
                    })
                  : <EmptyRow colSpan={9} />}
              </tbody>
              {filteredIssued.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td colSpan={6} className="p-3 font-black text-xs uppercase">Total</td>
                    <td className="p-3 text-center font-black text-xs">{totalIssuedQty}</td>
                    <td />
                    <td className="p-3 text-right font-black text-xs">₹{fmt(totalIssuedAmt)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PURCHASE REPORT
  // ══════════════════════════════════════════════════════════════════════════
  const PurchaseReport = () => {
    // Summary: group by supplier → item count, qty, value
    const bySupplier = Array.from(
      filteredOrders.reduce((m, o) => {
        const sup = o.supplier || "Unknown";
        if (!m.has(sup)) m.set(sup, { supplier: sup, orders: 0, qty: 0, amt: 0 });
        const e = m.get(sup);
        e.orders++;
        e.qty += o.quantity;
        e.amt += o.quantity * (o.pricePerUnit || 0);
        return m;
      }, new Map())
    ).map(([, v]) => v).sort((a, b) => b.amt - a.amt);

    // Status badge colour
    const statusBadge = (s) =>
      s === "Received" ? "bg-emerald-100 text-emerald-700" :
      s === "Pending"  ? "bg-yellow-100 text-yellow-700" :
                         "bg-blue-100 text-blue-700";

    return (
      <>
        <FilterBar onExport={exportPurchase} onPrint={() => window.print()}>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white cursor-pointer">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <DateBar />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Item</label>
            <div className="relative">
              <input type="text" placeholder="e.g. Phenyl…" value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 pl-8 text-sm text-slate-700
                           focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white w-44" />
              <FaSearch className="absolute left-2.5 top-3 text-slate-400 text-xs" />
            </div>
          </div>
        </FilterBar>

        <CollegeHeader />

        <div className="flex items-center justify-between mb-4">
          <StatChips chips={[
            { label: "Orders",      val: filteredOrders.length },
            { label: "Total Qty",   val: fmt(totalOrderedQty) + " units" },
            { label: "Total Value", val: "₹" + fmt(totalOrderedAmt) },
          ]} />
          <ViewToggle mode={viewMode} setMode={setViewMode} />
        </div>

        {viewMode === "summary" ? (
          /* ─ SUMMARY: supplier-wise totals ─ */
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-700 text-white">
                  <th className="p-3 text-left font-bold text-xs uppercase">Supplier</th>
                  <th className="p-3 text-center font-bold text-xs uppercase">Orders</th>
                  <th className="p-3 text-center font-bold text-xs uppercase">Total Qty</th>
                  <th className="p-3 text-right font-bold text-xs uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bySupplier.length === 0
                  ? <EmptyRow colSpan={4} />
                  : bySupplier.map((row, idx) => (
                    <tr key={row.supplier} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="p-3 font-semibold text-slate-800">{row.supplier}</td>
                      <td className="p-3 text-center text-slate-600">{row.orders}</td>
                      <td className="p-3 text-center font-black text-emerald-700">{row.qty}</td>
                      <td className="p-3 text-right font-black text-slate-800">₹{fmt(row.amt)}</td>
                    </tr>
                  ))}
              </tbody>
              {bySupplier.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td className="p-3 font-black text-xs uppercase">Total</td>
                    <td className="p-3 text-center font-black text-xs">{filteredOrders.length}</td>
                    <td className="p-3 text-center font-black text-xs">{totalOrderedQty}</td>
                    <td className="p-3 text-right font-black text-xs">₹{fmt(totalOrderedAmt)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : (
          /* ─ FULL LIST ─ */
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-emerald-700 text-white">
                  {["#", "Order Date", "Receive Date", "Item", "Type", "Supplier", "Category", "Qty", "Unit Price", "Total", "Status"].map(h => (
                    <th key={h} className="p-3 text-left font-bold text-xs uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length > 0
                  ? filteredOrders.map((o, idx) => (
                    <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3 text-xs font-bold text-slate-700 font-mono whitespace-nowrap">{dFmt(o.orderDate)}</td>
                      <td className="p-3 text-xs text-slate-500 font-mono whitespace-nowrap">{dFmt(o.receiveDate) || "—"}</td>
                      <td className="p-3 font-semibold text-slate-800">{o.item}</td>
                      <td className="p-3 text-xs text-slate-500">{o.type}</td>
                      <td className="p-3 text-xs text-slate-500">{o.supplier}</td>
                      <td className="p-3 text-xs text-slate-500">{o.category}</td>
                      <td className="p-3 text-center font-black text-slate-800">{o.quantity}</td>
                      <td className="p-3 text-right text-xs text-slate-600">₹{fmt(o.pricePerUnit)}</td>
                      <td className="p-3 text-right font-black text-slate-800">₹{fmt(o.quantity * (o.pricePerUnit || 0))}</td>
                      <td className="p-3">
                        <span className={"px-2 py-0.5 rounded-full text-[10px] font-black " + statusBadge(o.status)}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                  : <EmptyRow colSpan={11} />}
              </tbody>
              {filteredOrders.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 text-white">
                    <td colSpan={7} className="p-3 font-black text-xs uppercase">Total</td>
                    <td className="p-3 text-center font-black text-xs">{totalOrderedQty}</td>
                    <td />
                    <td className="p-3 text-right font-black text-xs">₹{fmt(totalOrderedAmt)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PRINT PORTAL
  // ══════════════════════════════════════════════════════════════════════════
  const PrintPortal = () => (
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
            Period: <strong>
              {startDate && endDate
                ? `${startDate} to ${endDate}`
                : startDate ? `From ${startDate}` : endDate ? `Up to ${endDate}` : "All Records"}
            </strong>
          </p>
          <p className="text-xs text-slate-400">Generated: {new Date().toLocaleString("en-IN")}</p>
        </div>
      </div>
      <h2 className="text-lg font-black mb-4 text-blue-900">{activeCard?.title}</h2>

      {(activeReport === "department" || activeReport === "issue") && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white">
              {["#", "Date", "Item", "Category", "Department", "Faculty/Staff", "Qty", "Unit Rate", "Total"].map(h => (
                <th key={h} className="border border-slate-600 p-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredIssued.map((log, idx) => {
              const uc = getIssuedItemPrice(log);
              return (
                <tr key={log.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="border border-slate-200 p-2">{idx + 1}</td>
                  <td className="border border-slate-200 p-2 font-mono">{dFmt(log.date)}</td>
                  <td className="border border-slate-200 p-2 font-semibold">{log.item}</td>
                  <td className="border border-slate-200 p-2">{log.category}</td>
                  <td className="border border-slate-200 p-2 font-bold">{log.department}</td>
                  <td className="border border-slate-200 p-2">{log.faculty}</td>
                  <td className="border border-slate-200 p-2 text-center font-bold">{log.quantity}</td>
                  <td className="border border-slate-200 p-2 text-right">₹{fmt(uc)}</td>
                  <td className="border border-slate-200 p-2 text-right font-bold">₹{fmt(log.quantity * uc)}</td>
                </tr>
              );
            })}
            <tr className="bg-slate-800 text-white font-bold">
              <td colSpan={6} className="border border-slate-600 p-2">Total</td>
              <td className="border border-slate-600 p-2 text-center">{totalIssuedQty}</td>
              <td />
              <td className="border border-slate-600 p-2 text-right">₹{fmt(totalIssuedAmt)}</td>
            </tr>
          </tbody>
        </table>
      )}

      {activeReport === "purchase" && (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white">
              {["#", "Order Date", "Item", "Type", "Supplier", "Category", "Qty", "Unit Price", "Total", "Status"].map(h => (
                <th key={h} className="border border-slate-600 p-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o, idx) => (
              <tr key={o.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="border border-slate-200 p-2">{idx + 1}</td>
                <td className="border border-slate-200 p-2 font-mono">{dFmt(o.orderDate)}</td>
                <td className="border border-slate-200 p-2 font-semibold">{o.item}</td>
                <td className="border border-slate-200 p-2">{o.type}</td>
                <td className="border border-slate-200 p-2">{o.supplier}</td>
                <td className="border border-slate-200 p-2">{o.category}</td>
                <td className="border border-slate-200 p-2 text-center font-bold">{o.quantity}</td>
                <td className="border border-slate-200 p-2 text-right">₹{fmt(o.pricePerUnit)}</td>
                <td className="border border-slate-200 p-2 text-right font-bold">₹{fmt(o.quantity * (o.pricePerUnit || 0))}</td>
                <td className="border border-slate-200 p-2">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  setViewMode("summary");
                  setSelectedDepartment("all");
                  setSelectedCategory("all");
                  setItemSearchQuery("");
                  setExpandedDept(null);
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
              <button onClick={() => setActiveReport(null)}
                className="text-white/80 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg
                           hover:bg-white/10 transition cursor-pointer flex items-center gap-1.5">
                <FaTimes /> Close
              </button>
            </div>

            <div className="p-6">
              {activeReport === "department" && <DepartmentReport />}
              {activeReport === "issue"      && <IssueReport />}
              {activeReport === "purchase"   && <PurchaseReport />}
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
              Click one of the 3 cards above. Each report lets you toggle between
              a <strong>Summary view</strong> (totals only) and a <strong>Full List</strong> (every record).
            </p>
          </div>
        )}
      </div>

      {/* Print portal */}
      {activeReport && createPortal(<PrintPortal />, document.body)}
    </div>
  );
}
