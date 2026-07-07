import { motion } from "framer-motion";
import { 
  FaBoxes, 
  FaRupeeSign, 
  FaHourglassHalf, 
  FaExclamationTriangle 
} from "react-icons/fa";

export default function StatCard({ title, value }) {
  // Map title to visual configurations
  const getCardMeta = () => {
    switch (title) {
      case "Total Assets":
        return {
          icon: <FaBoxes size={20} />,
          bgColor: "bg-blue-50 dark:bg-blue-950/20",
          iconColor: "text-blue-600 dark:text-blue-400",
          accentLine: "bg-blue-600 dark:bg-blue-500"
        };
      case "Inventory Value":
        return {
          icon: <FaRupeeSign size={20} />,
          bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          accentLine: "bg-emerald-600 dark:bg-emerald-500"
        };
      case "Pending Orders":
        return {
          icon: <FaHourglassHalf size={20} />,
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          iconColor: "text-amber-600 dark:text-amber-400",
          accentLine: "bg-amber-600 dark:bg-amber-500"
        };
      case "Low Stock":
        return {
          icon: <FaExclamationTriangle size={20} />,
          bgColor: "bg-rose-50 dark:bg-rose-950/20",
          iconColor: "text-rose-600 dark:text-rose-400",
          accentLine: "bg-rose-600 dark:bg-rose-500"
        };
      default:
        return {
          icon: <FaBoxes size={20} />,
          bgColor: "bg-slate-50 dark:bg-slate-900/20",
          iconColor: "text-slate-600 dark:text-slate-400",
          accentLine: "bg-slate-600"
        };
    }
  };

  const meta = getCardMeta();

  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        y: -4,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-white border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm flex items-center gap-3 sm:gap-4 relative overflow-hidden cursor-pointer"
    >
      <div className={`absolute top-0 left-0 w-2 h-full ${meta.accentLine}`} />
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 ${meta.bgColor} ${meta.iconColor}`}>
        {meta.icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-bold text-slate-455 uppercase tracking-wider truncate">{title}</p>
        <h3 className="text-base sm:text-lg lg:text-2xl font-black text-slate-800 dark:text-white mt-0.5 truncate">{value}</h3>
      </div>
    </motion.div>
  );
}