import {
  FaPlus,
  FaFilePdf,
  FaBoxes,
  FaClipboardList
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function QuickActions() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const allActions = [
    {
      title: "Place Order",
      icon: <FaPlus />,
      path: "/place-order",
      permission: "Place Order"
    },
    {
      title: "Issue Stock",
      icon: <FaClipboardList />,
      path: "/issue-stock",
      permission: "Issue Stock"
    },
    {
      title: "Receive Stock",
      icon: <FaBoxes />,
      path: "/receive-order",
      permission: "Receive Order"
    },
    {
      title: "Generate Report",
      icon: <FaFilePdf />,
      path: "/reports",
      permission: "Reports"
    },
  ];

  // Filter actions based on logged in user's permissions
  const actions = allActions.filter(action => 
    currentUser?.permissions?.includes(action.permission)
  );

  if (actions.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-full flex flex-col">

      <h2 className="text-xl font-bold mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4 flex-1">

        {actions.map((action, index) => (

          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl hover:scale-105 active:scale-95 transition shadow-md cursor-pointer flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">{action.icon}</span>
              <span className="text-sm font-medium">{action.title}</span>
            </div>
          </button>

        ))}

      </div>

    </div>
  );
}