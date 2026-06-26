import { useState, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector
} from "recharts";
import { FaBoxes, FaTruck, FaChartLine, FaArrowUp, FaStar, FaFire, FaBolt } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";

// Baseline mappings to carry over initial mock data offsets
const baseDepartmentData = {
  Stationary: 280, Sanitory: 120, Electrical: 150, Electronics: 320,
  Sports: 210, Furniture: 190, "IT,CSE": 580, laboratory: 450
};

const baseCategoryData = {
  Furniture: { availableOffset: 0, usedOffset: 45 },
  Electronics: { availableOffset: 0, usedOffset: 35 },
  Stationery: { availableOffset: 0, usedOffset: 120 },
  Sports: { availableOffset: 0, usedOffset: 25 },
  Cleaning: { availableOffset: 0, usedOffset: 60 },
  Equipment: { availableOffset: 0, usedOffset: 15 }
};

const baseFrequentItems = {
  "A4 Sheets": 180, "Markers": 120, "Mouse": 90, "Printer Ink": 70
};

const DEPARTMENT_COLORS = [
  "url(#gradientStationary)", "url(#gradientHostel)", "url(#gradientSports)",
  "url(#gradientLab)", "url(#gradientIT)", "url(#gradientLibrary)",
  "url(#gradientOffice)", "url(#gradientMedical)"
];

const DOT_COLORS = ["#00ffff", "#3b82f6", "#10b981", "#ff6b6b", "#a78bfa", "#f59e0b", "#14b8a6", "#ec4899"];

// Custom Active Shape for light glassmorphism pie chart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 28) * cos;
  const my = cy + (outerRadius + 28) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#2563eb" style={{ fontWeight: 800, fontSize: 13 }}>
        {payload.name}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 17} fill={fill} opacity={0.4} />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} strokeWidth={2} fill="none" />
      <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#1e293b" style={{ fontWeight: 700, fontSize: 12 }}>
        {`Issued: ${value}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill="#64748b" style={{ fontSize: 11 }}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// Light glassmorphism tooltip
const NeonTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 16,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(99,102,241,0.1)",
        backdropFilter: "blur(12px)"
      }}>
        <p style={{ fontWeight: 800, color: "#2563eb", marginBottom: 8, fontSize: 13, borderBottom: "1px solid rgba(99,102,241,0.1)", paddingBottom: 6 }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.fill || entry.color }} />
            <span style={{ color: "#64748b" }}>{entry.name}:</span>
            <span style={{ fontWeight: 800, color: "#1e293b", marginLeft: "auto" }}>{entry.value} units</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

// Light glassmorphism KPI card
function NeonKPICard({ icon: Icon, iconColor, label, value, subtext, subtextColor = "#10b981", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const displayed = typeof value === "number" ? useCounter(value) : value;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-px transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, ${iconColor}44 0%, rgba(99,102,241,0.2) 50%, ${iconColor}22 100%)`,
        transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
        opacity: visible ? 1 : 0,
        transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <div
        className="relative rounded-2xl p-6 h-full"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.85) 100%)",
        }}
        onMouseEnter={e => {
          e.currentTarget.parentElement.style.transform = "translateY(-6px) scale(1.02)";
          e.currentTarget.parentElement.style.boxShadow = "0 12px 30px rgba(99,102,241,0.06)";
        }}
        onMouseLeave={e => {
          e.currentTarget.parentElement.style.transform = "translateY(0) scale(1)";
          e.currentTarget.parentElement.style.boxShadow = "none";
        }}
      >
        {/* Ambient corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${iconColor}12 0%, transparent 70%)` }} />

        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${iconColor}15 0%, ${iconColor}08 100%)`,
              border: `1px solid ${iconColor}30`,
              boxShadow: `0 2px 8px ${iconColor}10`
            }}>
            <Icon size={22} style={{ color: iconColor }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>{label}</p>
            <p className="text-3xl font-black mt-0.5" style={{ color: "#1e293b" }}>
              {typeof value === "number" ? displayed.toLocaleString() : value}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: subtextColor }}>
          <FaArrowUp size={10} />
          <span>{subtext}</span>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${iconColor}50, transparent)` }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const { inventory, issuedStock, inventoryCategories, getRegisterForCategory } = useStore();
  const [activeIndex, setActiveIndex] = useState(-1);

  const [filterType, setFilterType] = useState("all"); // "all", "week", "month", "prev-month", "year", "custom"
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const onPieEnter = (_, index) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(-1);

  const getFilteredIssuedStock = () => {
    return issuedStock.filter(log => {
      if (!log.date) return false;
      const logDateStr = log.date.split(" ")[0]; // YYYY-MM-DD
      const logDate = new Date(logDateStr);
      logDate.setHours(0, 0, 0, 0);

      const refDate = new Date();
      refDate.setHours(0, 0, 0, 0);

      if (filterType === "all") {
        return true;
      }
      if (filterType === "week") {
        const day = refDate.getDay();
        const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(refDate);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return logDate >= startOfWeek && logDate <= endOfWeek;
      }
      if (filterType === "month") {
        const startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
        const endOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0, 23, 59, 59, 999);
        return logDate >= startOfMonth && logDate <= endOfMonth;
      }
      if (filterType === "prev-month") {
        const startOfPrevMonth = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0, 23, 59, 59, 999);
        return logDate >= startOfPrevMonth && logDate <= endOfPrevMonth;
      }
      if (filterType === "year") {
        const startOfYear = new Date(refDate.getFullYear() - 1, 0, 1);
        const endOfYear = new Date(refDate.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return logDate >= startOfYear && logDate <= endOfYear;
      }
      if (filterType === "custom") {
        if (!customStart && !customEnd) return true;
        let start = customStart ? new Date(customStart) : null;
        let end = customEnd ? new Date(customEnd) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        if (start && end) return logDate >= start && logDate <= end;
        if (start) return logDate >= start;
        if (end) return logDate <= end;
      }
      return true;
    });
  };

  const filteredIssued = getFilteredIssuedStock();
  const isFiltered = filterType !== "all";

  // ─── Dynamic data (all unchanged logic) ────────────────────────────────
  const departmentData = (inventoryCategories || []).map((cat) => {
    const dept = cat.name;
    const baseOffset = isFiltered ? 0 : (baseDepartmentData[dept] || 0);
    const issuedQty = filteredIssued
      .filter((log) => {
        const logReg = getRegisterForCategory(log.category || log.department);
        return logReg.toLowerCase() === dept.toLowerCase();
      })
      .reduce((sum, log) => sum + log.quantity, 0);
    return { name: dept, value: baseOffset + issuedQty };
  });

  const categoryData = (inventoryCategories || []).map((catObj) => {
    const cat = catObj.name;
    const baseOffset = isFiltered ? { availableOffset: 0, usedOffset: 0 } : (baseCategoryData[cat] || { availableOffset: 0, usedOffset: 0 });
    const available = inventory
      .filter((item) => getRegisterForCategory(item.category).toLowerCase() === cat.toLowerCase())
      .reduce((sum, item) => sum + item.stock, 0);
    const used = filteredIssued
      .filter((log) => getRegisterForCategory(log.category || log.department).toLowerCase() === cat.toLowerCase())
      .reduce((sum, log) => sum + log.quantity, 0);
    return { category: cat, available: available + baseOffset.availableOffset, used: used + baseOffset.usedOffset };
  });

  const frequentItemsMap = isFiltered ? {} : { ...baseFrequentItems };
  filteredIssued.forEach((log) => {
    const name = log.subcategory || log.item;
    if (frequentItemsMap[name] !== undefined) frequentItemsMap[name] += log.quantity;
    else frequentItemsMap[name] = log.quantity;
  });
  const frequentItems = Object.keys(frequentItemsMap)
    .map((key) => ({ item: key, count: frequentItemsMap[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const totalAvailableStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalIssuedStock = filteredIssued.reduce((sum, log) => sum + log.quantity, 0) + (isFiltered ? 0 : 300);
  const sortedDepartments = [...departmentData].sort((a, b) => b.value - a.value);
  const mostActiveDept = sortedDepartments[0]?.name || "IT Department";
  const mostActiveDeptQty = sortedDepartments[0]?.value || 580;

  const CARD_STYLE = {
    background: "rgba(255, 255, 255, 0.75)",
    border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: 24,
    boxShadow: "0 10px 30px rgba(99,102,241,0.05)",
    backdropFilter: "blur(12px)",
    overflow: "hidden",
    position: "relative",
  };

  return (
    <div className="min-h-screen text-slate-800" style={{
      background: "linear-gradient(135deg, #f8fafc 0%, #ebf1fa 40%, #e2eaf8 80%, #f8fafc 100%)",
      backgroundAttachment: "fixed",
    }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "50%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "15%", left: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)" }} />
      </div>

      <Sidebar />
      <div className="ml-64 p-8 relative z-10">
        <Navbar />

        {/* Header */}
        <div className="mb-10 mt-8">
          <div className="relative inline-block">
            <h1 className="text-4xl font-black tracking-tight" style={{
              background: "linear-gradient(90deg, #1e40af 0%, #6d28d9 40%, #0369a1 80%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "holographicShimmer 4s linear infinite",
              textShadow: "none",
            }}>
              Analytics Dashboard
            </h1>
            {/* Underline */}
            <div className="mt-1.5 h-0.5 w-full rounded-full" style={{
              background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), rgba(139,92,246,0.4), transparent)",
              boxShadow: "0 0 10px rgba(37,99,235,0.15)"
            }} />
          </div>
          <p className="mt-3 text-sm font-medium" style={{ color: "#475569" }}>
            Real-time stock levels, department requests and audit reports.
          </p>
        </div>

        {/* Filter Panel */}
        <div style={{ ...CARD_STYLE, padding: "16px 24px", marginBottom: "32px" }}>
          {/* Top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, #2563eb, #8b5cf6)" }} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Time Range Filter</p>
              <h3 className="text-sm font-extrabold text-slate-700">Customise Analytics View</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All Time" },
                { id: "week", label: "Current Week" },
                { id: "month", label: "Current Month" },
                { id: "prev-month", label: "Previous Month" },
                { id: "year", label: "Last Year" },
                { id: "custom", label: "Custom Range" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterType(opt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    filterType === opt.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105"
                      : "bg-slate-200/50 text-slate-600 hover:bg-slate-200 border border-slate-200/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {filterType === "custom" && (
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200/50 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">From:</span>
                <input
                  type="date"
                  value={customStart}
                  onChange={e => setCustomStart(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white/70 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">To:</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={e => setCustomEnd(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white/70 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition"
                />
              </div>
              {(customStart || customEnd) && (
                <button
                  onClick={() => { setCustomStart(""); setCustomEnd(""); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                >
                  Clear Range
                </button>
              )}
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <NeonKPICard
            icon={FaBoxes}
            iconColor="#2563eb"
            label="Total Available Stock"
            value={totalAvailableStock}
            subtext="12% Increase from last month"
            subtextColor="#10b981"
            delay={0}
          />
          <NeonKPICard
            icon={FaTruck}
            iconColor="#8b5cf6"
            label="Total Stock Issued (Month)"
            value={totalIssuedStock}
            subtext="Active request fulfillment"
            subtextColor="#8b5cf6"
            delay={100}
          />
          <NeonKPICard
            icon={FaBolt}
            iconColor="#d97706"
            label="Most Active Department"
            value={mostActiveDept}
            subtext={`${mostActiveDeptQty} items issued total`}
            subtextColor="#d97706"
            delay={200}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Pie Chart */}
          <div style={CARD_STYLE} className="p-6 flex flex-col">
            {/* Top glow bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.4), rgba(139,92,246,0.4), transparent)" }} />

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <FaChartLine style={{ color: "#2563eb" }} />
                <h2 className="text-lg font-extrabold" style={{ color: "#1e293b" }}>Department-wise Usage</h2>
              </div>
              <p className="text-xs" style={{ color: "#475569" }}>Active items allocated across college departments.</p>
            </div>

            <div className="h-[380px] w-full flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Pie */}
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="gradientStationary" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#60a5fa" /></linearGradient>
                      <linearGradient id="gradientHostel" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#2563eb" /><stop offset="100%" stopColor="#1d4ed8" /></linearGradient>
                      <linearGradient id="gradientSports" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" /></linearGradient>
                      <linearGradient id="gradientLab" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#b91c1c" /></linearGradient>
                      <linearGradient id="gradientIT" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#5b21b6" /></linearGradient>
                      <linearGradient id="gradientLibrary" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#b45309" /></linearGradient>
                      <linearGradient id="gradientOffice" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#0891b2" /></linearGradient>
                      <linearGradient id="gradientMedical" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#be185d" /></linearGradient>
                      <filter id="neonGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    </defs>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={departmentData}
                      dataKey="value"
                      cx="50%" cy="50%"
                      innerRadius={65} outerRadius={85}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      paddingAngle={3}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} style={{ filter: "drop-shadow(0px 4px 8px rgba(99,102,241,0.08))" }} />
                      ))}
                    </Pie>
                    {activeIndex === -1 && (
                      <>
                        <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" fill="#64748b" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>TOTAL ISSUED</text>
                        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="#2563eb" style={{ fontSize: 20, fontWeight: 900 }}>
                          {departmentData.reduce((sum, item) => sum + item.value, 0)}
                        </text>
                      </>
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Department list */}
              <div className="w-full md:w-1/2 space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                {departmentData.map((item, index) => {
                  const total = departmentData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        background: activeIndex === index ? "rgba(37,99,235,0.06)" : "transparent",
                        border: activeIndex === index ? "1px solid rgba(37,99,235,0.15)" : "1px solid transparent",
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={onPieLeave}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: DOT_COLORS[index % DOT_COLORS.length] }} />
                        <span className="text-xs font-semibold truncate" style={{ color: "#475569" }}>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs font-bold" style={{ color: "#1e293b" }}>{item.value}</span>
                        <span className="text-[10px] font-bold" style={{ color: "rgba(71,85,105,0.6)" }}>({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bar Chart — Category Stock */}
          <div style={CARD_STYLE} className="p-6 flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(37,99,235,0.4), transparent)" }} />

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <FaStar style={{ color: "#8b5cf6" }} />
                <h2 className="text-lg font-extrabold" style={{ color: "#1e293b" }}>Category Stock Levels</h2>
              </div>
              <p className="text-xs" style={{ color: "#475569" }}>Available items vs. total requests issued this month.</p>
            </div>

            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#be185d" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip content={<NeonTooltip />} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                  <Legend verticalAlign="top" align="center" iconType="rect" iconSize={10} wrapperStyle={{ paddingBottom: 20 }}
                    formatter={(value) => <span style={{ color: "#475569", fontSize: 12 }}>{value}</span>} />
                  <Bar dataKey="available" fill="url(#colorAvailable)" name="Available Stock" radius={[6, 6, 0, 0]}
                    style={{ filter: "drop-shadow(0px 2px 6px rgba(37,99,235,0.15))" }} />
                  <Bar dataKey="used" fill="url(#colorUsed)" name="Stock Used (Month)" radius={[6, 6, 0, 0]}
                    style={{ filter: "drop-shadow(0px 2px 6px rgba(236,72,153,0.15))" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Most Frequent Items */}
        <div style={CARD_STYLE} className="p-6">
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), rgba(139,92,246,0.4), transparent)" }} />

          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaFire style={{ color: "#d97706" }} />
                <h2 className="text-lg font-extrabold" style={{ color: "#1e293b" }}>Most Frequently Requested Items</h2>
              </div>
              <p className="text-xs" style={{ color: "#475569" }}>Fulfillment rate tracker for high demand assets.</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequentItems} margin={{ top: 20, right: 10, left: -15, bottom: 5 }} barSize={48}>
                <defs>
                  <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.65} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="item" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<NeonTooltip />} cursor={{ fill: "rgba(139,92,246,0.04)" }} />
                <Bar dataKey="count" fill="url(#colorFreq)" name="Requested Count" radius={[8, 8, 0, 0]}
                  style={{ filter: "drop-shadow(0px 2px 8px rgba(139,92,246,0.2))" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}