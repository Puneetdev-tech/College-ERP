import { FaLock, FaHome, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function AccessDenied() {
  const navigate = useNavigate();
  const { logout } = useStore();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="bg-slate-100 min-h-screen flex justify-center items-center p-4">
      <div className="bg-white/80 backdrop-blur-md max-w-md w-full border border-slate-200 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-fadeIn">
        {/* Animated Warning Icon */}
        <div className="inline-flex p-5 bg-red-100 text-red-600 rounded-full animate-bounce shadow-inner">
          <FaLock size={45} />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Access Denied
          </h1>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">
            You do not have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer transition shadow-lg active:scale-95"
          >
            <FaHome />
            Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-semibold px-6 py-3 rounded-xl cursor-pointer transition active:scale-95"
          >
            <FaSignOutAlt />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
