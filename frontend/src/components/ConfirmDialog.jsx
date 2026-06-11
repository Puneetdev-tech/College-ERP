import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as FaIcons from "react-icons/fa";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "danger"
}) {
  // Handle keypresses for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      } else if (e.key === "Enter") {
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100/50 z-[10000] p-6 flex flex-col items-center text-center"
          >
            {/* Close Button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition duration-150 cursor-pointer"
            >
              <FaIcons.FaTimes className="text-sm" />
            </button>

            {/* Icon Banner */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 border ${
              type === "danger"
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
              {type === "danger" ? (
                <FaIcons.FaTrash className="animate-pulse" />
              ) : (
                <FaIcons.FaExclamationTriangle className="animate-bounce" />
              )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 px-2">
              {message}
            </p>

            {/* Actions */}
            <div className="flex w-full gap-3 text-sm font-semibold">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition active:scale-98 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 py-3.5 rounded-2xl text-white shadow-md transition active:scale-98 cursor-pointer ${
                  type === "danger"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10 hover:shadow-lg"
                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10 hover:shadow-lg"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
