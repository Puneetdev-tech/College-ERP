import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUndo } from "react-icons/fa";

import campus1 from "../../images/campus1.jpg"; 
import campus2 from "../../images/campus2.jpg";
import campus4 from "../../images/campus4.jpg";

const images = [campus1, campus2, campus4];

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input if value is entered
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const pasteArray = pasteData.split("");
    const newOtp = [...otp];
    pasteArray.forEach((char, idx) => {
      newOtp[idx] = char;
      if (inputRefs.current[idx]) {
        inputRefs.current[idx].value = char;
      }
    });
    setOtp(newOtp);

    const nextFocusIndex = Math.min(pasteArray.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) return;
    
    navigate("/reset-password");
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

      {/* Dark overlay and OTP verification form */}
      <div className="absolute inset-0 z-30 bg-black/50 flex justify-center items-center p-4">
        <div className="w-[450px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-white animate-fadeIn">
          <h1 className="text-3xl font-bold text-center mb-2">
            Verify OTP
          </h1>
          <p className="text-center text-gray-200 text-sm mb-8">
            Enter the 6-digit code sent to your email
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-white/20 border border-white/10 text-white outline-none focus:border-cyan-400 focus:bg-white/30 transition-all duration-200 focus:ring-2 focus:ring-cyan-500/20"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Verify OTP
            </button>
          </form>

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-cyan-300 hover:text-white text-sm font-semibold transition-all duration-300 hover:underline cursor-pointer"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Login</span>
            </button>
            <button
              onClick={() => alert("OTP Resent successfully!")}
              className="inline-flex items-center gap-2 text-cyan-300 hover:text-white text-sm font-semibold transition-all duration-300 hover:underline cursor-pointer"
            >
              <FaUndo className="text-xs" />
              <span>Resend OTP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
