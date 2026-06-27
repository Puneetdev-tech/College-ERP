import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { speak, playBeep } from "../components/useSpeech";

import campus1 from "../../images/campus1.jpg"; 
import campus2 from "../../images/campus2.jpg";
import campus4 from "../../images/campus4.jpg";

const images = [campus1, campus2, campus4];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStore();

  const [currentImage, setCurrentImage] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");

  // Welcome voice on page load
  useEffect(() => {
    const speakTimeout = setTimeout(() => {
      speak("Welcome to R J I T Inventory. Please fill the required details for authentication.", { rate: 0.92, pitch: 1.08 });
    }, 50);
    return () => clearTimeout(speakTimeout);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password!");
      return;
    }

    const res = login(email.trim(), password);
    if (res.success) {
      playBeep("success");
      navigate("/dashboard");
    } else {
      if (res.message && res.message.includes("Your password was changed by")) {
        setPasswordChangeMessage(res.message);
        setShowPasswordChangeModal(true);
      } else {
        setError(res.message);
      }
    }
  };


  return (
    <div className="relative h-screen w-screen">
      {/* Split Slideshow with Up-Down Transition */}
      {images.map((img, index) => {
        const isActive = index === currentImage;
        const isBefore = index < currentImage;

        return (
          <div key={index} className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Left Half - Slides Up/Down */}
            <div
              className={`absolute left-0 top-0 w-1/2 h-full overflow-hidden transition-all duration-1000 ease-in-out ${
                isActive
                  ? "translate-y-0 opacity-100 z-10"
                  : isBefore
                  ? "-translate-y-full opacity-0 z-0"
                  : "translate-y-full opacity-0 z-0"
              }`}
            >
              <div
                className="absolute left-0 top-0 w-[100vw] h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              />
            </div>

            {/* Right Half - Slides Counter-Directionally (Down/Up) */}
            <div
              className={`absolute right-0 top-0 w-1/2 h-full overflow-hidden transition-all duration-1000 ease-in-out ${
                isActive
                  ? "translate-y-0 opacity-100 z-10"
                  : isBefore
                  ? "translate-y-full opacity-0 z-0"
                  : "-translate-y-full opacity-0 z-0"
              }`}
            >
              <div
                className="absolute right-0 top-0 w-[100vw] h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
              />
            </div>
          </div>
        );
      })}

      {/* Dark overlay and login form */}
      <div className="absolute inset-0 z-30 bg-black/50 flex justify-center items-center">
        <form 
          onSubmit={handleLoginSubmit}
          className="w-[420px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="text-white text-4xl font-bold mb-2">
            RJIT Inventory
          </h1>

          <p className="text-gray-200 mb-6">
            Management System
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded-xl text-sm font-semibold text-center">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none border border-transparent focus:border-white/40 transition-colors"
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-10 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none border border-transparent focus:border-white/40 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-300 hover:text-white transition duration-150 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Login
          </button>
        </form>
      </div>

      {/* Password Changed Alert Modal */}
      <AnimatePresence>
        {showPasswordChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordChangeModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-white/10 z-50 p-7 flex flex-col items-center text-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPasswordChangeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 hover:bg-slate-105 dark:hover:bg-white/5 p-2 rounded-xl transition duration-150 cursor-pointer"
              >
                <FaTimes className="text-sm" />
              </button>

              {/* Icon Banner */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 border bg-amber-50 dark:bg-amber-950/30 text-amber-500 border-amber-100 dark:border-amber-900/30">
                <FaLock className="animate-pulse" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                Security Update
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-white/5 rounded-2xl p-4 mb-6 text-left w-full">
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-semibold">
                  {passwordChangeMessage}
                </p>
              </div>

              {/* Actions */}
              <div className="flex w-full gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-98 transition cursor-pointer text-center"
                >
                  Okay, Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}