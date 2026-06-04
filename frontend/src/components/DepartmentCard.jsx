import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function DepartmentCard({ name }) {

  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        y: -5
      }}
      onClick={() =>
        navigate(`/inventory/${name}`)
      }
      className="
      cursor-pointer
      bg-gradient-to-r
      from-blue-600
      to-indigo-700
      text-white
      rounded-2xl
      p-8
      shadow-lg
      "
    >
      <h2 className="text-xl font-bold">
        {name}
      </h2>

      <p className="mt-2 text-blue-100">
        View Inventory
      </p>

    </motion.div>
  );
}