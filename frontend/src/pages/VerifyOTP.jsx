import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
      <div className="w-[450px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-white">
        <h1 className="text-3xl font-bold text-center mb-2">
          Verify OTP
        </h1>
        <p className="text-center text-gray-200 text-sm mb-6">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-8">
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
                className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-white/20 border border-white/10 text-white outline-none focus:border-white/40 focus:bg-white/30 transition-all duration-200"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            Verify OTP
          </button>
        </form>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-cyan-300 hover:text-white hover:underline text-sm transition-all duration-300"
          >
            Back to Login
          </button>
          <button
            onClick={() => alert("OTP Resent successfully!")}
            className="text-cyan-300 hover:text-white hover:underline text-sm transition-all duration-300"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
