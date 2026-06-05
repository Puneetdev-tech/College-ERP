import { useNavigate } from "react-router-dom";

export default function CategoryCard({ name, icon, color }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/inventory/items?category=${name}`)}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer flex items-center gap-4 border border-slate-200/50 hover:border-blue-300"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${color || "bg-blue-50 text-blue-600 border-blue-100"}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-800">{name}</h2>
        <p className="text-slate-450 text-xs mt-0.5 font-medium">Explore assets</p>
      </div>
    </div>
  );
}