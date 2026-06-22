import { useState } from "react";
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
import { FaBoxes, FaTruck, FaChartLine, FaArrowUp } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

import { useStore } from "../context/StoreContext";

// Baseline mappings to carry over initial mock data offsets
const baseDepartmentData = {
  Stationary: 280,
  Sanitory: 120,
  Electrical: 150,
  Electronics: 320,
  Sports: 210,
  Furniture: 190,
  "IT,CSE": 580,
  laboratory: 450
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
  "A4 Sheets": 180,
  "Markers": 120,
  "Mouse": 90,
  "Printer Ink": 70
};

// Gradients mappings for the 8 departments
const DEPARTMENT_COLORS = [
  "url(#gradientStationary)",
  "url(#gradientHostel)",
  "url(#gradientSports)",
  "url(#gradientLab)",
  "url(#gradientIT)",
  "url(#gradientLibrary)",
  "url(#gradientOffice)",
  "url(#gradientMedical)"
];

// Custom Active Shape rendering for Pie Chart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 25) * cos;
  const my = cy + (outerRadius + 25) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#1e293b" className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 14}
        fill={fill}
        opacity={0.6}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} strokeWidth={2} fill="none" />
      <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#334155" className="font-bold text-sm">
        {`Issued: ${value}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#64748b" className="text-xs font-semibold">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// Custom interactive Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl transition-all duration-300">
        <p className="font-bold text-slate-800 mb-2 border-b pb-1 border-slate-100">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 text-sm my-1.5">
            <div className="w-3.5 h-3.5 rounded-md" style={{ background: entry.fill || entry.color }} />
            <span className="text-slate-600 font-medium">{entry.name}:</span>
            <span className="font-bold text-slate-900 ml-auto">{entry.value} units</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { inventory, issuedStock, inventoryCategories, getRegisterForCategory } = useStore();
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // 1. Dynamic Department Usage (base mock values + dynamically issued quantities)
  const departmentData = (inventoryCategories || []).map((cat) => {
    const dept = cat.name;
    const baseOffset = baseDepartmentData[dept] || 0;

    const issuedQty = issuedStock
      .filter((log) => {
        const logReg = getRegisterForCategory(log.category || log.department);
        return logReg.toLowerCase() === dept.toLowerCase();
      })
      .reduce((sum, log) => sum + log.quantity, 0);

    return { name: dept, value: baseOffset + issuedQty };
  });

  // 2. Dynamic Category Stock Double Bar Levels
  const categoryData = (inventoryCategories || []).map((catObj) => {
    const cat = catObj.name;
    const baseOffset = baseCategoryData[cat] || { availableOffset: 0, usedOffset: 0 };

    const available = inventory
      .filter((item) => getRegisterForCategory(item.category).toLowerCase() === cat.toLowerCase())
      .reduce((sum, item) => sum + item.stock, 0);

    const used = issuedStock
      .filter((log) => getRegisterForCategory(log.category || log.department).toLowerCase() === cat.toLowerCase())
      .reduce((sum, log) => sum + log.quantity, 0);

    return {
      category: cat,
      available: available + baseOffset.availableOffset,
      used: used + baseOffset.usedOffset
    };
  });

  // 3. Dynamic Frequent Items Calculation
  const frequentItemsMap = { ...baseFrequentItems };
  issuedStock.forEach((log) => {
    const name = log.subcategory || log.item;
    if (frequentItemsMap[name] !== undefined) {
      frequentItemsMap[name] += log.quantity;
    } else {
      frequentItemsMap[name] = log.quantity;
    }
  });
  const frequentItems = Object.keys(frequentItemsMap)
    .map((key) => ({
      item: key,
      count: frequentItemsMap[key]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // 4. Dynamic KPI Calculations
  const totalAvailableStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalIssuedStock = issuedStock.reduce((sum, log) => sum + log.quantity, 0) + 300;

  // Find most active department dynamically
  const sortedDepartments = [...departmentData].sort((a, b) => b.value - a.value);
  const mostActiveDept = sortedDepartments[0]?.name || "IT Department";
  const mostActiveDeptQty = sortedDepartments[0]?.value || 580;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Sidebar />
      <div className="ml-64 p-8">
        <Navbar />
        
        {/* Header */}
        <div className="mb-8 mt-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 mt-1">Real-time stock levels, department requests and audit reports.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaBoxes className="text-2xl" />
              </div>
              <div>
                <h3 className="text-slate-400 font-medium text-sm">Total Available Stock</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalAvailableStock}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-green-600 font-semibold text-sm">
              <FaArrowUp />
              <span>12% Increase from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <FaTruck className="text-2xl" />
              </div>
              <div>
                <h3 className="text-slate-400 font-medium text-sm">Total Stock Issued (Month)</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{totalIssuedStock}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-indigo-600 font-semibold text-sm">
              <FaChartLine />
              <span>Active request fulfillment</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition duration-300" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <FaChartLine className="text-2xl" />
              </div>
              <div>
                <h3 className="text-slate-400 font-medium text-sm">Most Active Department</h3>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{mostActiveDept}</p>
              </div>
            </div>
            <div className="mt-4 text-emerald-600 font-semibold text-sm">
              <span>{mostActiveDeptQty} items issued total</span>
            </div>
          </div>

        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Department Usage Pie Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Department-wise Usage
              </h2>
              <p className="text-slate-400 text-sm">Active items allocated across the 8 college departments.</p>
            </div>

            <div className="h-[380px] w-full flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left Column: Pie Chart */}
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    
                    {/* SVG gradients for 3D depth styling */}
                    <defs>
                      <linearGradient id="gradientStationary" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#4338ca" />
                      </linearGradient>
                      <linearGradient id="gradientHostel" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                      <linearGradient id="gradientSports" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                      <linearGradient id="gradientLab" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>
                      <linearGradient id="gradientIT" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                      </linearGradient>
                      <linearGradient id="gradientLibrary" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <linearGradient id="gradientOffice" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#0f766e" />
                      </linearGradient>
                      <linearGradient id="gradientMedical" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#be185d" />
                      </linearGradient>
                    </defs>

                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={departmentData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                      paddingAngle={3}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]}
                          style={{ filter: "drop-shadow(0px 6px 10px rgba(0, 0, 0, 0.06))" }}
                        />
                      ))}
                    </Pie>
                    
                    {activeIndex === -1 && (
                      <>
                        <text
                          x="50%"
                          y="47%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#94a3b8"
                          className="font-bold text-[9px] uppercase tracking-wider"
                        >
                          Total Issued
                        </text>
                        <text
                          x="50%"
                          y="54%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#1e293b"
                          className="font-black text-xl"
                        >
                          {departmentData.reduce((sum, item) => sum + item.value, 0)}
                        </text>
                      </>
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Right Column: Detailed interactive list to fill the card layout space */}
              <div className="w-full md:w-1/2 space-y-2 max-h-[340px] overflow-y-auto pr-2">
                {departmentData.map((item, index) => {
                  const total = departmentData.reduce((sum, d) => sum + d.value, 0);
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                  const dotColors = ["#4f46e5", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#14b8a6", "#ec4899"];

                  return (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-200 ${
                        activeIndex === index 
                          ? "bg-slate-50 border-slate-200/80 shadow-sm scale-[1.02]" 
                          : "border-transparent hover:bg-slate-50/50"
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={onPieLeave}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: dotColors[index % dotColors.length] }}
                        />
                        <span className="text-xs font-semibold text-slate-700 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-right flex-shrink-0 ml-2">
                        <span className="text-xs font-bold text-slate-800">{item.value} units</span>
                        <span className="text-[10px] text-slate-450 font-bold">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Wise Stock Available vs Used Double Bar Graph */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                Category Stock Levels
              </h2>
              <p className="text-slate-400 text-sm">Comparison of available items vs. total requests issued this month.</p>
            </div>

            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 10, left: -15, bottom: 5 }}>
                  
                  {/* SVG gradients for 3D Bar fills */}
                  <defs>
                    <linearGradient id="colorAvailable" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="colorUsed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fb923c" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(226, 232, 240, 0.4)" }} />
                  
                  <Legend 
                    verticalAlign="top" 
                    align="center"
                    iconType="rect"
                    iconSize={12}
                    wrapperStyle={{ paddingBottom: "25px" }}
                  />

                  {/* Available Stock bar with slight rounded corners and drop shadow */}
                  <Bar 
                    dataKey="available" 
                    fill="url(#colorAvailable)" 
                    name="Available Stock" 
                    radius={[6, 6, 0, 0]}
                    style={{ filter: "drop-shadow(0px 4px 6px rgba(59, 130, 246, 0.15))" }}
                  />
                  
                  {/* Used Stock bar with slight rounded corners and drop shadow */}
                  <Bar 
                    dataKey="used" 
                    fill="url(#colorUsed)" 
                    name="Stock Used (Month)" 
                    radius={[6, 6, 0, 0]}
                    style={{ filter: "drop-shadow(0px 4px 6px rgba(234, 88, 12, 0.15))" }}
                  />

                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Most Frequently Ordered Items Chart */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Most Frequently Requested Items
              </h2>
              <p className="text-slate-400 text-sm">Fulfillment rate tracker for high demand assets.</p>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequentItems} margin={{ top: 20, right: 10, left: -15, bottom: 5 }} barSize={50}>
                
                <defs>
                  <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#4c1d95" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="item" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(226, 232, 240, 0.4)" }} />
                
                <Bar 
                  dataKey="count" 
                  fill="url(#colorFreq)" 
                  name="Requested Count" 
                  radius={[8, 8, 0, 0]}
                  style={{ filter: "drop-shadow(0px 6px 8px rgba(139, 92, 246, 0.2))" }}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}