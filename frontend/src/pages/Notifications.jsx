import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  FaTrashAlt,
  FaEye,
  FaTimes,
  FaArrowRight,
  FaCalendarAlt,
  FaUser
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";
import { useStore } from "../context/StoreContext";
import { playUISound } from "../components/useSpeech";

export default function Notifications() {
  const { notifications, markAllRead, markAsRead, deleteNotification, clearAllNotifications, issuedStock } = useStore();
  const [activeTab, setActiveTab] = useState("unread"); // "unread" or "past"
  const [selectedNotification, setSelectedNotification] = useState(null);
  const navigate = useNavigate();

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

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return "Recent";
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return createdAt;

    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);
    if (diffSecs < 60) return "Just now";
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    if (diffSecs < 172800) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const parseNotificationDetails = (n) => {
    if (!n) return null;
    const msg = n.message || "";
    let details = {};

    // Extract date if embedded in message (e.g., "... on 2020-03-17 ...")
    const dateMatch = msg.match(/on\s+(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?)/i);
    if (dateMatch) {
      details.embeddedDate = dateMatch[1].trim();
    }

    if (n.iconType === "issued" || n.type?.toLowerCase().includes("issue")) {
      // Example: "1 × Cleaning (Standard) issued to A P J Kalam Boys Hostel — Unit cost: ₹29"
      const match = msg.match(/^(.+?)\s+issued to\s+(.+?)(?:\s+(?:on\s+[\d-:\s]+)?—\s+Unit cost:\s*(.+))?$/i);
      if (match) {
        details.item = match[1]?.trim();
        details.department = match[2]?.trim();
        details.cost = match[3]?.trim();
      }
    } else if (n.iconType === "low-stock" || n.type?.toLowerCase().includes("low stock")) {
      // Example: "Item (Type) is below threshold! Remaining: 5"
      const match = msg.match(/^(.+?)\s+is below threshold!\s+Remaining:\s*(\d+)/i);
      if (match) {
        details.item = match[1]?.trim();
        details.remaining = match[2]?.trim();
      }
    }
    return details;
  };

  // Cross-reference with issuedStock to find the original transaction date & recipient
  const findMatchingIssue = (notification) => {
    if (!notification || !issuedStock || issuedStock.length === 0) return null;
    const details = parseNotificationDetails(notification);
    if (!details) return null;

    const matched = issuedStock.find((log) => {
      const deptMatch =
        log.department &&
        details.department &&
        log.department.trim().toLowerCase() === details.department.trim().toLowerCase();

      const costMatch =
        details.cost &&
        (details.cost.includes(String(log.unitCost)) ||
          details.cost.replace(/[^\d.]/g, "") === String(log.unitCost));

      return deptMatch && costMatch;
    }) || issuedStock.find((log) => {
      return (
        log.department &&
        details.department &&
        log.department.trim().toLowerCase() === details.department.trim().toLowerCase()
      );
    });

    return matched;
  };

  const getNotificationAction = (n) => {
    if (!n) return null;
    const type = (n.type || "").toLowerCase();
    const icon = n.iconType || "";

    if (icon === "issued" || type.includes("issue")) {
      return { label: "Go to Issue Stock", path: "/issue-stock" };
    }
    if (icon === "low-stock" || type.includes("low stock") || type.includes("inventory")) {
      return { label: "View in Inventory", path: "/inventory" };
    }
    if (icon === "received" || type.includes("received")) {
      return { label: "Go to Receive Order", path: "/receive-order" };
    }
    if (icon === "order" || type.includes("order")) {
      return { label: "View Orders", path: "/place-order" };
    }
    return null;
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      playUISound("toggle");
      markAsRead(notification.id);
    }
  };

  const unreadNotifications = (notifications || []).filter((n) => !n.read);
  const pastNotifications = (notifications || []).filter((n) => n.read);

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
                  className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer transition shadow-md border border-rose-200/50 active:scale-95 flex-shrink-0"
                >
                  <FaTrashAlt className="text-[10px]" />
                  <span>Clear all active</span>
                </button>
              </>
            )}

            {activeTab === "past" && pastNotifications.length > 0 && (
              <button
                onClick={() => { playUISound("delete"); clearAllNotifications("read"); }}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer transition shadow-md border border-rose-200/50 active:scale-95 flex-shrink-0"
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
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
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
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
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
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {(activeTab === "unread" ? unreadNotifications : pastNotifications).length > 0 ? (
                (activeTab === "unread" ? unreadNotifications : pastNotifications).map((notification) => {
                  const matchedIssue = findMatchingIssue(notification);
                  const displayDate = matchedIssue?.date || parseNotificationDetails(notification)?.embeddedDate;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      key={notification.id}
                      onClick={() => handleViewDetails(notification)}
                      className={`${notification.color} shadow-sm border border-indigo-150/40 relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 ${
                        notification.read ? "before:bg-slate-300 opacity-80" : "before:bg-indigo-600"
                      } cursor-pointer hover:scale-[1.008] active:scale-[0.995] rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group`}
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="text-xl bg-white/70 p-3 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100">
                          {getIcon(notification.iconType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-800">
                              {notification.type}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block animate-pulse" title="Unread" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed break-words font-medium">
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center flex-shrink-0">
                        {displayDate ? (
                          <div
                            className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50/80 font-bold text-[11px] whitespace-nowrap px-2.5 py-1.5 rounded-xl border border-indigo-200/60"
                            title={`Issue Date: ${displayDate} | System Logged: ${notification.createdAt || ""}`}
                          >
                            <FaCalendarAlt className="text-[10px]" />
                            <span>{displayDate.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px] whitespace-nowrap bg-white/70 px-2.5 py-1.5 rounded-xl border border-slate-200/50"
                            title={notification.createdAt}
                          >
                            <FaClock className="text-[10px]" />
                            <span>{formatNotificationTime(notification.createdAt)}</span>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(notification);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200/80 shadow-sm transition cursor-pointer active:scale-95"
                          title="View Details"
                        >
                          <FaEye className="text-[11px]" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playUISound("delete");
                            deleteNotification(notification.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 bg-white/70 hover:bg-rose-50 border border-slate-200/50 hover:border-rose-200 transition cursor-pointer shadow-sm"
                          title="Delete notification"
                        >
                          <FaTrash className="text-[11px]" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-4 border border-slate-100">
                    <FaBell size={24} className="opacity-50" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    {activeTab === "unread" ? "All caught up!" : "No archive logs"}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-sm">
                    {activeTab === "unread"
                      ? "No system alerts, updates, or low stock alerts are active at this time."
                      : "Your history is empty. When notifications are read, they'll show up here."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* View Details Modal */}
        <AnimatePresence>
          {selectedNotification && (() => {
            const matchedIssue = findMatchingIssue(selectedNotification);
            const details = parseNotificationDetails(selectedNotification);
            const issueDate = matchedIssue?.date || details?.embeddedDate;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        {getIcon(selectedNotification.iconType)}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                          Alert Details
                        </span>
                        <h2 className="text-lg font-black text-slate-800">
                          {selectedNotification.type}
                        </h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNotification(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition cursor-pointer"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 space-y-4">
                    <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Summary Message
                      </p>
                      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {selectedNotification.message}
                      </p>
                    </div>

                    {/* Extracted Details Breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      {issueDate && (
                        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 shadow-xs col-span-2">
                          <p className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1.5">
                            <FaCalendarAlt className="text-[10px]" />
                            Actual Transaction / Issue Date
                          </p>
                          <p className="text-sm font-black text-indigo-950 mt-0.5">
                            {issueDate}
                          </p>
                        </div>
                      )}

                      {details?.item && (
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Item Issued</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{details.item}</p>
                        </div>
                      )}

                      {details?.department && (
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Issued To</p>
                          <p className="text-xs font-black text-indigo-700 mt-0.5">{details.department}</p>
                        </div>
                      )}

                      {matchedIssue?.faculty && (
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                          <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <FaUser className="text-[9px]" />
                            Received By (Staff)
                          </p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{matchedIssue.faculty}</p>
                        </div>
                      )}

                      {details?.cost && (
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Unit Cost</p>
                          <p className="text-xs font-black text-emerald-700 mt-0.5">{details.cost}</p>
                        </div>
                      )}

                      {details?.remaining && (
                        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Stock Remaining</p>
                          <p className="text-xs font-black text-rose-600 mt-0.5">{details.remaining} units</p>
                        </div>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
                      <div className="space-y-0.5">
                        {issueDate && (
                          <p className="flex items-center gap-1.5 font-bold text-indigo-700 text-xs">
                            <FaCalendarAlt className="text-indigo-500 text-[11px]" />
                            <span>Issue Date: {issueDate}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 font-medium text-slate-400 text-[11px]">
                          <FaClock className="text-slate-400 text-[10px]" />
                          <span>System Logged: {selectedNotification.createdAt || "Just now"}</span>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 self-start sm:self-center">
                        {selectedNotification.read ? "Archived (Read)" : "Active Alert"}
                      </span>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        deleteNotification(selectedNotification.id);
                        setSelectedNotification(null);
                        playUISound("delete");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100/60 transition cursor-pointer"
                    >
                      <FaTrash className="text-[10px]" />
                      <span>Delete Alert</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedNotification(null)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                      >
                        Close
                      </button>

                      {(() => {
                        const action = getNotificationAction(selectedNotification);
                        if (!action) return null;
                        return (
                          <button
                            onClick={() => {
                              setSelectedNotification(null);
                              navigate(action.path);
                            }}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                          >
                            <span>{action.label}</span>
                            <FaArrowRight className="text-[10px]" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

      </div>
    </div>
  );
}