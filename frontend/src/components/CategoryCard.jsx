import { useNavigate } from "react-router-dom";

export default function CategoryCard({ name }) {

  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate("/inventory/items")
      }
      className="
      bg-white
      rounded-2xl
      p-6
      shadow-lg
      hover:shadow-xl
      hover:scale-105
      transition
      cursor-pointer
      "
    >
      <h2 className="text-xl font-semibold">
        {name}
      </h2>

      <p className="text-gray-500 mt-2">
        View Items
      </p>

    </div>
  );
}