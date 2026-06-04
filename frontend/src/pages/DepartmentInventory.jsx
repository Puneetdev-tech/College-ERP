import Sidebar from "../components/sidebar";
import CategoryCard from "../components/CategoryCard";

export default function DepartmentInventory() {

  const categories = [
    "Furniture",
    "Electrical",
    "Cleaning",
    "Stationery",
    "Equipment",
    "Miscellaneous"
  ];

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

        <h1 className="text-3xl font-bold mb-6">
          Department Inventory
        </h1>

        <div className="grid grid-cols-3 gap-6">

          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              name={cat}
            />
          ))}

        </div>

      </div>
    </div>
  );
}