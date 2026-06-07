import {
  FaExclamationTriangle,
  FaBoxOpen,
  FaClipboardCheck,
  FaShoppingCart
} from "react-icons/fa";
import Sidebar from "../components/sidebar";
import { useStore } from "../context/StoreContext";

export default function Notifications() {
  const { notifications, markAllRead } = useStore();

  const getIcon = (iconType) => {
    switch (iconType) {
      case "low-stock":
        return <FaExclamationTriangle />;
      case "received":
        return <FaBoxOpen />;
      case "issued":
        return <FaClipboardCheck />;
      case "order":
        return <FaShoppingCart />;
      default:
        return <FaBoxOpen />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <Sidebar />
      <div className="ml-64 p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Notifications
          </h1>
          <button 
            onClick={markAllRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition duration-200 cursor-pointer shadow-md font-semibold"
          >
            Mark All Read
          </button>
        </div>

        <div className="space-y-4">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${notification.color} ${notification.read ? 'opacity-60 shadow-sm' : 'shadow-md'} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex justify-between items-center`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">
                    {getIcon(notification.iconType)}
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {notification.type}
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" title="Unread" />
                      )}
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
            ))
          ) : (
            <div className="text-center p-12 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-200">
              No notifications available
            </div>
          )}
        </div>

      </div>
    </div>
  );
}