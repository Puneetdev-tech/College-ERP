import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    navigate("/verify-otp");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
      <div className="w-[420px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-white">
        <h1 className="text-3xl font-bold text-center mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-gray-200 text-sm mb-6">
          Enter your registered email to receive an OTP
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-6 p-3 rounded-xl bg-white/20 border border-white/10 text-white outline-none placeholder:text-gray-300 focus:border-white/40 transition"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            Send OTP
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-cyan-300 hover:text-white hover:underline text-sm transition-all duration-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}