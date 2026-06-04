import Sidebar from "../components/sidebar";
import DepartmentCard from "../components/DepartmentCard";

export default function Inventory() {

  const departments = [
    "Hostel",
    "Sports",
    "Laboratory",
    "IT Department",
    "Library",
    "Office",
    "Maintenance",
    "Medical"
  ];

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Inventory Departments
      </h1>

      <div className="grid grid-cols-4 gap-6">

        {departments.map((dept, index) => (
          <DepartmentCard
            key={index}
            name={dept}
          />
        ))}

      </div>

      </div>
    </div>
  );
}