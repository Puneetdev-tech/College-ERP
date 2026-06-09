import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

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
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password!");
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setError("");
    const res = await login(quickEmail, quickPassword);
    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.message);
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

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none border border-transparent focus:border-white/40 transition-colors"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            Login
          </button>

          {/* Quick Login Section */}
          <div className="mt-6 border-t border-white/15 pt-5">
            <p className="text-center text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">
              Quick Login Demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("rahul@rjit.edu.in", "admin")}
                className="bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30 text-white text-xs py-2 rounded-xl transition cursor-pointer font-medium text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("priya@rjit.edu.in", "manager")}
                className="bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30 text-white text-xs py-2 rounded-xl transition cursor-pointer font-medium text-center"
              >
                Store Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("amit@rjit.edu.in", "officer")}
                className="bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30 text-white text-xs py-2 rounded-xl transition cursor-pointer font-medium text-center"
              >
                Purchase Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("principal@rjit.edu.in", "principal")}
                className="bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/30 text-white text-xs py-2 rounded-xl transition cursor-pointer font-medium text-center"
              >
                Principal
              </button>
            </div>
          </div>

          <div className="text-center mt-5">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-cyan-300 hover:text-white hover:underline text-sm transition-all duration-300 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}