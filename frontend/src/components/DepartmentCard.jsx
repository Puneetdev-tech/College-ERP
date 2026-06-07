import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function DepartmentCard({ name, icon, desc, color }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -4
      }}
      onClick={() => navigate(`/inventory/${name}`)}
      className={`cursor-pointer bg-gradient-to-br ${
        color || "from-blue-600 to-indigo-700"
      } text-white rounded-2xl p-6 shadow-lg relative overflow-hidden transition-all flex flex-col justify-between min-h-[180px] border border-white/5 hover:border-white/10`}
    >
      <div>
        <div className="text-3xl bg-white/15 w-fit p-3 rounded-xl mb-4 border border-white/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-bold tracking-tight">{name}</h2>
        <p className="text-xs text-white/70 leading-relaxed mt-1">{desc}</p>
      </div>

      <div className="mt-4">
        <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/20 px-3 py-1.5 rounded-lg">
          Open Registry
        </span>
      </div>
    </motion.div>
  );
}