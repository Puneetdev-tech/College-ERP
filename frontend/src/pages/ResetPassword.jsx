import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
      <div className="w-[420px] backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl text-white">
        <h1 className="text-3xl font-bold text-center mb-2">
          Reset Password
        </h1>
        <p className="text-center text-gray-200 text-sm mb-6">
          Create a new secure password for your account
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl bg-white/20 border border-white/10 text-white outline-none placeholder:text-gray-300 focus:border-white/40 transition"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-6 p-3 rounded-xl bg-white/20 border border-white/10 text-white outline-none placeholder:text-gray-300 focus:border-white/40 transition"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            Update Password
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