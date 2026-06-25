import { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaBoxOpen,
  FaClipboardCheck,
  FaShoppingCart,
  FaBell,
  FaCheckDouble,
  FaClock,
  FaRegFolderOpen,
  FaTrash,
  FaTrashAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";
import { playUISound } from "../components/useSpeech";

export default function Notifications() {
  const { notifications, markAllRead, markAsRead, deleteNotification, clearAllNotifications } = useStore();
  const [activeTab, setActiveTab] = useState("unread"); // "unread" or "past"

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case "low-stock":
        return <FaExclamationTriangle className="text-rose-500" />;
      case "received":
        return <FaBoxOpen className="text-emerald-500" />;
      case "issued":
        return <FaClipboardCheck className="text-blue-500" />;
      case "order":
        return <FaShoppingCart className="text-amber-500" />;
      default:
        return <FaBoxOpen className="text-slate-500" />;
    }
  };

  const unreadNotifications = (notifications || []).filter((n) => !n.read);
  const pastNotifications = (notifications || []).filter((n) => n.read);

  const displayNotifications = activeTab === "unread" ? unreadNotifications : pastNotifications;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 transition-colors duration-300">
      <Sidebar />
      <div className="ml-64 p-8 max-w-7xl mx-auto">
        <Navbar />

        {/* Header Section */}
        <div className="mt-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
              Notification Center
            </h1>
            <p className="text-slate-500 mt-1">
              Review and manage alerts, requests, and low stock warnings for RJIT.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "unread" && unreadNotifications.length > 0 && (
              <>
                <button
                  onClick={() => { playUISound("save"); markAllRead(); }}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer transition shadow-md shadow-indigo-600/10 active:scale-95 flex-shrink-0"
                >
                  <FaCheckDouble className="text-[10px]" />
                  <span>Mark all as read</span>
                </button>
                <button
                  onClick={() => { playUISound("delete"); clearAllNotifications("unread"); }}
                  className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer transition shadow-md border border-rose-200/50 dark:border-rose-900/50 active:scale-95 flex-shrink-0"
                >
                  <FaTrashAlt className="text-[10px]" />
                  <span>Clear all active</span>
                </button>
              </>
            )}

            {activeTab === "past" && pastNotifications.length > 0 && (
              <button
                onClick={() => { playUISound("delete"); clearAllNotifications("read"); }}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer transition shadow-md border border-rose-200/50 dark:border-rose-900/50 active:scale-95 flex-shrink-0"
              >
                <FaTrashAlt className="text-[10px]" />
                <span>Clear all past</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex gap-2 border-b border-slate-200/80 mb-6 pb-px">
          <button
            onClick={() => handleTabChange("unread")}
            className={`pb-3 text-sm font-bold border-b-2 px-2 transition-all duration-200 cursor-pointer flex items-center gap-2 relative ${
              activeTab === "unread"
                ? "border-indigo-600 text-indigo-650"
                : "border-transparent text-slate-400 hover:text-slate-650"
            }`}
          >
            <FaBell className="text-xs" />
            <span>Active Alerts</span>
            {unreadNotifications.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                {unreadNotifications.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => handleTabChange("past")}
            className={`pb-3 text-sm font-bold border-b-2 px-2 transition-all duration-200 cursor-pointer flex items-center gap-2 relative ${
              activeTab === "past"
                ? "border-indigo-600 text-indigo-650"
                : "border-transparent text-slate-400 hover:text-slate-650"
            }`}
          >
            <FaRegFolderOpen className="text-xs" />
            <span>Past Notifications</span>
            {pastNotifications.length > 0 && (
              <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                {pastNotifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications Feed list with Animations */}
        <div className="space-y-4">
          {activeTab === "unread" ? (
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notification) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      key={notification.id}
                      onClick={() => {
                        if (!notification.read) {
                          playUISound("toggle");
                          markAsRead(notification.id);
                        }
                      }}
                      className={`${notification.color} shadow-md border border-indigo-150/40 relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-600 cursor-pointer hover:scale-[1.012] active:scale-[0.995] rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex justify-between items-center group`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="text-xl bg-white/60 p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100 transition-transform duration-500 group-hover:rotate-[360deg]">
                          {getIcon(notification.iconType)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold flex items-center gap-2 text-slate-800">
                            {notification.type}
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block animate-pulse" title="Unread" />
                          </h3>
                          <p className="text-sm text-slate-650 mt-1 leading-relaxed break-words font-medium">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3.5 self-start mt-0.5 ml-4 flex-shrink-0">
                        <div className="text-right flex items-center gap-1.5 text-slate-450 font-bold text-[10px] whitespace-nowrap">
                          <FaClock className="opacity-70" />
                          <span>{notification.time}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playUISound("delete");
                            deleteNotification(notification.id);
                          }}
                          className="p-2 rounded-xl text-slate-450 hover:text-rose-600 hover:bg-white/80 dark:hover:bg-rose-950/20 transition cursor-pointer flex items-center justify-center shadow-sm border border-transparent hover:border-rose-100"
                          title="Delete notification"
                        >
                          <FaTrash className="text-[11px]" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-100">
                      <FaBell size={24} className="opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm">
                      No system alerts, updates, or low stock alerts are active at this time.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {pastNotifications.length > 0 ? (
                  pastNotifications.map((notification) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      key={notification.id}
                      className={`${notification.color} opacity-75 hover:opacity-100 shadow-sm border border-slate-200/50 bg-white/70 rounded-2xl p-5 flex justify-between items-center group transition-opacity`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="text-xl bg-white/60 p-2.5 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100 transition-transform duration-500 group-hover:rotate-[360deg]">
                          {getIcon(notification.iconType)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold flex items-center gap-2 text-slate-800">
                            {notification.type}
                          </h3>
                          <p className="text-sm text-slate-650 mt-1 leading-relaxed break-words font-medium">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3.5 self-start mt-0.5 ml-4 flex-shrink-0">
                        <div className="text-right flex items-center gap-1.5 text-slate-450 font-bold text-[10px] whitespace-nowrap">
                          <FaClock className="opacity-70" />
                          <span>{notification.time}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white/80 dark:hover:bg-rose-950/20 transition cursor-pointer flex items-center justify-center shadow-sm border border-transparent hover:border-rose-100"
                          title="Delete notification"
                        >
                          <FaTrash className="text-[11px]" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center justify-center animate-fadeIn"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-100">
                      <FaBell size={24} className="opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No archive logs</h3>
                    <p className="text-slate-400 text-sm mt-1 max-w-sm">
                      Your history is empty. When notifications are read, they'll show up here.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}