import { useStore } from "../context/StoreContext";
import { FaClock } from "react-icons/fa";

export default function RecentActivities() {
  const { notifications } = useStore();

  // Show the 5 most recent activities
  const recentItems = (notifications || []).slice(0, 5);

  const getStatusStyle = (iconType) => {
    switch (iconType) {
      case "low-stock":
        return "bg-rose-50/40 border-rose-100/80 text-rose-800";
      case "received":
        return "bg-emerald-50/40 border-emerald-100/80 text-emerald-800";
      case "issued":
        return "bg-blue-50/40 border-blue-100/80 text-blue-800";
      case "order":
        return "bg-amber-50/40 border-amber-100/80 text-amber-800";
      default:
        return "bg-slate-50 border-slate-200/85 text-slate-800";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <span>Recent Activities</span>
      </h2>

      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {recentItems.length > 0 ? (
          recentItems.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex justify-between items-center transition hover:bg-slate-100/30 ${getStatusStyle(
                item.iconType
              )}`}
            >
              <div className="flex flex-col pr-3">
                <span className="font-semibold text-sm text-slate-800">{item.type}</span>
                <span className="text-xs text-slate-500 mt-0.5">{item.message}</span>
              </div>
              <div className="text-right flex items-center gap-1.5 text-[10px] text-slate-450 font-medium whitespace-nowrap self-start mt-0.5">
                <FaClock className="opacity-60" />
                <span>{item.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 py-8 text-sm font-medium border border-dashed rounded-xl border-slate-200">
            No recent activity to display.
          </div>
        )}
      </div>
    </div>
  );
}