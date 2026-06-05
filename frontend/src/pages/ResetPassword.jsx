import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaArrowLeft } from "react-icons/fa";

import campus1 from "../../images/campus1.jpg"; 
import campus2 from "../../images/campus2.jpg";
import campus4 from "../../images/campus4.jpg";

const images = [campus1, campus2, campus4];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Password updated successfully!");
    navigate("/");
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
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

      {/* Dark overlay and reset password form */}
      <div className="absolute inset-0 z-30 bg-black/50 flex justify-center items-center p-4">
        <div className="w-[420px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-white animate-fadeIn">
          <h1 className="text-3xl font-bold text-center mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-200 text-sm mb-8">
            Create a new secure password for your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-300">
                <FaLock className="text-lg" />
              </span>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3.5 rounded-xl bg-white/20 border border-white/10 text-white outline-none placeholder:text-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                required
              />
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-300">
                <FaLock className="text-lg" />
              </span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3.5 rounded-xl bg-white/20 border border-white/10 text-white outline-none placeholder:text-gray-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Update Password
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-cyan-300 hover:text-white text-sm font-semibold transition-all duration-300 hover:underline cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}