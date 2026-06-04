import {
  FaExclamationTriangle,
  FaBoxOpen,
  FaClipboardCheck,
  FaShoppingCart
} from "react-icons/fa";
import Sidebar from "../components/sidebar";

export default function Notifications() {

  const notifications = [
    {
      id: 1,
      type: "Low Stock",
      message: "A4 Sheets stock below minimum level",
      time: "10 minutes ago",
      color: "bg-red-100 text-red-800",
      icon: <FaExclamationTriangle />
    },
    {
      id: 2,
      type: "Stock Received",
      message: "20 Desktop Computers received",
      time: "1 hour ago",
      color: "bg-green-100 text-green-800",
      icon: <FaBoxOpen />
    },
    {
      id: 3,
      type: "Stock Issued",
      message: "5 Projectors issued to Laboratory",
      time: "3 hours ago",
      color: "bg-blue-100 text-blue-800",
      icon: <FaClipboardCheck />
    },
    {
      id: 4,
      type: "Purchase Order",
      message: "New Purchase Order PO-005 created",
      time: "Yesterday",
      color: "bg-yellow-100 text-yellow-800",
      icon: <FaShoppingCart />
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Notifications
          </h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition duration-200 cursor-pointer shadow-md">
            Mark All Read
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${notification.color} rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300 flex justify-between items-center`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {notification.icon}
                </div>
                <div>
                  <h3 className="font-bold">
                    {notification.type}
                  </h3>
                  <p className="text-sm opacity-90 mt-0.5">
                    {notification.message}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold opacity-75">
                {notification.time}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}