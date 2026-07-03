import React from "react";
import { useStore } from "../context/StoreContext";
import { FaMoneyBillWave, FaBolt, FaDesktop, FaChair, FaBroom, FaPen, FaFlask, FaRunning, FaBoxOpen } from "react-icons/fa";

export default function ValuationBreakdown() {
  const { inventory } = useStore();

  // 1. Calculate values per category
  const categories = {};
  let totalSum = 0;

  inventory.forEach((item) => {
    const cat = item.category || "Miscellaneous";
    const value = (item.stock || 0) * (item.price || 0);
    categories[cat] = (categories[cat] || 0) + value;
    totalSum += value;
  });

  const getIcon = (catName) => {
    switch (catName.toLowerCase()) {
      case "electrical":
        return <FaBolt className="text-amber-500" />;
      case "electronics":
        return <FaDesktop className="text-cyan-500" />;
      case "furniture":
        return <FaChair className="text-amber-700" />;
      case "sanitory":
      case "sanitary":
      case "cleaning":
        return <FaBroom className="text-emerald-500" />;
      case "stationary":
      case "stationery":
        return <FaPen className="text-blue-500" />;
      case "equipment":
      case "laboratory":
        return <FaFlask className="text-purple-500" />;
      case "sports":
        return <FaRunning className="text-orange-500" />;
      default:
        return <FaBoxOpen className="text-slate-500" />;
    }
  };

  const getProgressColor = (catName) => {
    switch (catName.toLowerCase()) {
      case "electrical":
        return "bg-amber-500";
      case "electronics":
        return "bg-cyan-500";
      case "furniture":
        return "bg-amber-700";
      case "sanitory":
      case "sanitary":
      case "cleaning":
        return "bg-emerald-500";
      case "stationary":
      case "stationery":
        return "bg-blue-500";
      case "equipment":
      case "laboratory":
        return "bg-purple-500";
      case "sports":
        return "bg-orange-500";
      default:
        return "bg-slate-500";
    }
  };

  // Convert categories object to sorted array
  const breakdownList = Object.entries(categories)
    .map(([name, val]) => ({
      name,
      value: val,
      percentage: totalSum > 0 ? (val / totalSum) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (val) => {
    if (val >= 10000000) {
      return `₹${parseFloat((val / 10000000).toFixed(2))} Cr`;
    }
    if (val >= 100000) {
      return `₹${parseFloat((val / 100000).toFixed(2))} L`;
    }
    return `₹${parseFloat(val.toFixed(2)).toLocaleString("en-IN")}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaMoneyBillWave className="text-emerald-500" />
          <span>Valuation Breakdown</span>
        </h2>
        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">
          By Category
        </span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-[350px]">
        {breakdownList.length > 0 ? (
          breakdownList.map((item, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  {getIcon(item.name)}
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-800">{formatCurrency(item.value)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">({item.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(item.name)}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 py-8 text-sm font-medium border border-dashed rounded-xl border-slate-200">
            No stock records found to calculate valuation.
          </div>
        )}
      </div>
    </div>
  );
}
