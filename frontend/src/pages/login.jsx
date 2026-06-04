import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import campus1 from "../../images/campus1.jpg"; 

import campus2 from "../../images/campus2.jpg";

import campus4 from "../../images/campus4.jpg";

const images = [campus1, campus2, campus4];

export default function Login() {
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Split Slideshow with Up-Down Transition */}
      {images.map((img, index) => {
        const isActive = index === currentImage;
        const isBefore = index < currentImage;

        return (
          <div key={index} className="absolute inset-0 pointer-events-none">
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
      <div className="relative z-10 h-full bg-black/50 flex justify-center items-center">

        <div className="w-[420px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">

          <h1 className="text-white text-4xl font-bold mb-2">
            RJIT Inventory
          </h1>

          <p className="text-gray-200 mb-8">
            Management System
          </p>

          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 p-3 rounded-xl bg-white/20 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-3 rounded-xl bg-white/20 text-white outline-none"
          />

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Login
          </button>

          <div className="text-center mt-5">
            <button className="text-cyan-300 hover:text-white">
              Forgot Password?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}