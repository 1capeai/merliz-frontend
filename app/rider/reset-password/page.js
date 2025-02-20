"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { Car, Clock, MapPin, Smile } from "lucide-react";

export default function RiderResetPassword() {
  const gold = "#D4AF37";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) {
      setError("Invalid token. Please check your reset link.");
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing token, please use a valid reset link.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/users/reset-password", {
        token,
        newPassword,
      });
      setMessage(data.message || "Password reset successful.");

      // Redirect based on role (for rider, redirect to the rider page)
      if (data.role === "rider") {
        setTimeout(() => router.push("/rider"), 2000);
      } else if (data.role === "driver") {
        setTimeout(() => router.push("/driver/login"), 2000);
      } else if (data.role === "MerlizSellers") {
        setTimeout(() => router.push("/merlizsellers/login"), 2000);
      } else {
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset password failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Reset Password Form */}
      <div className="md:w-1/2 flex items-center justify-center p-2 bg-white">
        <motion.div
          className="w-full max-w-xs p-4 rounded-xl shadow-lg bg-white"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold mb-2 text-black text-center">
            Reset Password
          </h1>
          <form onSubmit={handleReset} className="space-y-2">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="border border-black p-2 w-full rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border border-black p-2 w-full rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-2 rounded font-bold transition-colors mt-2"
              style={{
                backgroundColor: gold,
                color: "black",
                opacity: loading || !token ? 0.5 : 1,
                cursor: loading || !token ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          {message && <p className="text-green-500 mt-2 text-center">{message}</p>}
        </motion.div>
      </div>

      {/* Right Half: Motivational Message & Benefits */}
      <div className="md:w-1/2 flex items-center justify-center p-2 bg-black">
        <motion.div
          className="text-center space-y-4 px-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold" style={{ color: gold }}>
            Get Back on the Road
          </h2>
          <p className="text-base text-white">
            Reset your password to continue enjoying seamless rides, quick pickups, and a smooth experience.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Car size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Quick Pickups</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Clock size={20} style={{ color: gold }} />
              <span className="text-sm text-white">24/7 Availability</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <MapPin size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Easy Navigation</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Smile size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Smooth Experience</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
