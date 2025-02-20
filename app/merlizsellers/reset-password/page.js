"use client"; // Ensure this is at the top!

export const dynamic = "force-dynamic"; // Prevents pre-rendering issues

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ResetPasswordUser() {
  const gold = "#D4AF37";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token") || "";
    setToken(tokenParam);

    if (!tokenParam) {
      setError("Invalid token. Please check your reset link.");
    }
  }, [searchParams]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Missing token, please use a valid reset link.");
      return;
    }

    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/users/reset-password", {
        token,
        newPassword: newPassword.trim(),
      });

      setMessage(data.message || "Password reset successful. Redirecting to login...");
      setTimeout(() => router.push("/merlizsellers/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset password failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Reset Password Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={100}
              height={100}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl font-semibold mb-6 text-center text-black">Reset Password</h1>
          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="New Password (min. 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-black p-3 mt-4 w-full rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              minLength={6}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-black p-3 mt-4 w-full rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              required
            />
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 rounded-lg font-bold transition-colors mt-6"
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
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
          {message && <p className="text-green-500 mt-4 text-center">{message}</p>}
        </motion.div>
      </div>

      {/* Right Half: Motivational Message */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-black">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl font-bold mb-6" style={{ color: gold }}>
            Secure Your Account
          </h2>
          <p className="text-lg mb-6 text-white">
            Reset your password to regain access to your account and continue enjoying seamless transactions,
            high earning potential, and exclusive 24/7 support.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
