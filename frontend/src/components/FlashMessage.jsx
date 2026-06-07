import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from "react-icons/fa";

const ICONS = {
  success: <FaCheckCircle className="text-xl flex-shrink-0" />,
  error: <FaTimesCircle className="text-xl flex-shrink-0" />,
  info: <FaInfoCircle className="text-xl flex-shrink-0" />,
  warning: <FaExclamationTriangle className="text-xl flex-shrink-0" />,
};

const COLORS = {
  success: {
    bg: "bg-emerald-600",
    bar: "bg-emerald-400",
    text: "text-white",
  },
  error: {
    bg: "bg-rose-600",
    bar: "bg-rose-400",
    text: "text-white",
  },
  info: {
    bg: "bg-blue-600",
    bar: "bg-blue-400",
    text: "text-white",
  },
  warning: {
    bg: "bg-amber-500",
    bar: "bg-amber-300",
    text: "text-white",
  },
};

function FlashItem({ flash, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Mount animation
    const showTimer = setTimeout(() => setVisible(true), 10);

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, flash.duration || 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [flash.id]);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => {
      onDismiss(flash.id);
    }, 350);
  };

  const c = COLORS[flash.type] || COLORS.info;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-2xl w-[360px] flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-350
        ${c.bg} ${c.text}
        ${visible && !leaving ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
      `}
      style={{
        transition: "opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        marginBottom: "10px",
      }}
      onClick={handleDismiss}
    >
      {/* Icon */}
      <span className="mt-0.5">{ICONS[flash.type] || ICONS.info}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {flash.title && (
          <p className="font-bold text-sm leading-tight">{flash.title}</p>
        )}
        <p className="text-xs opacity-90 leading-snug mt-0.5">{flash.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        className="opacity-70 hover:opacity-100 transition ml-1 flex-shrink-0"
      >
        <FaTimes className="text-xs" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-1 ${c.bar} rounded-b-2xl`}
        style={{
          width: "100%",
          animation: `shrink-bar ${flash.duration || 4000}ms linear forwards`,
        }}
      />

      <style>{`
        @keyframes shrink-bar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default function FlashMessage({ flashes, onDismiss }) {
  if (!flashes || flashes.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col items-end pointer-events-none"
      style={{ maxWidth: "380px" }}
    >
      {flashes.map((flash) => (
        <div key={flash.id} className="pointer-events-auto">
          <FlashItem flash={flash} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
