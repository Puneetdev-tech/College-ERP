import { motion } from "framer-motion";

export default function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -5,
      }}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
    >
      <h3 className="text-slate-500">
        {title}
      </h3>

      <p className="text-3xl font-bold text-blue-700 mt-2">
        {value}
      </p>
    </motion.div>
  );
}