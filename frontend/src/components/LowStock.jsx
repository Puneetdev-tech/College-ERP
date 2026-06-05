import { useStore } from "../context/StoreContext";

export default function LowStock() {
  const { inventory, systemSettings } = useStore();
  const threshold = systemSettings?.lowStockThreshold || 10;
  
  const lowStockItems = inventory.filter((item) => item.stock <= threshold);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-red-650 flex items-center gap-2">
        <span>Low Stock Alerts</span>
        {lowStockItems.length > 0 && (
          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
            {lowStockItems.length}
          </span>
        )}
      </h2>

      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {lowStockItems.length > 0 ? (
          lowStockItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-red-50/50 border border-red-200/60 flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-slate-800">{item.item}</span>
                <span className="text-[10px] text-slate-450">{item.subcategory} • {item.type}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-red-600 block">{item.stock} left</span>
                <span className="block text-[9px] text-slate-400 font-medium">threshold: {threshold}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-450 py-8 text-sm font-medium border border-dashed rounded-xl border-slate-200">
            ✓ All inventory items have healthy stock levels.
          </div>
        )}
      </div>
    </div>
  );
}