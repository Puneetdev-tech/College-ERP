import {
  FaPlus,
  FaFilePdf,
  FaBoxes,
  FaClipboardList
} from "react-icons/fa";

export default function QuickActions() {

  const actions = [
    {
      title: "Place Order",
      icon: <FaPlus />
    },
    {
      title: "Issue Stock",
      icon: <FaClipboardList />
    },
    {
      title: "Receive Stock",
      icon: <FaBoxes />
    },
    {
      title: "Generate Report",
      icon: <FaFilePdf />
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <h2 className="text-xl font-bold mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {actions.map((action, index) => (

          <button
            key={index}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl hover:scale-105 transition"
          >
            <div className="flex flex-col items-center gap-2">
              {action.icon}
              {action.title}
            </div>
          </button>

        ))}

      </div>

    </div>
  );
}