"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Settings, BarChart, Shield } from "lucide-react";

export default function AdminLogin() {
  const gold = "#D4AF37";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/admin/login", {
        email,
        password,
      });
      localStorage.setItem("adminToken", data.token);
      router.push("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Admin Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-4 bg-white">
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
            Admin Login
          </h1>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black p-3 mt-4 w-full rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-black p-3 mt-4 w-full rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded font-bold transition-colors mt-6"
            style={{
              backgroundColor: gold,
              color: "black",
            }}
          >
            Login
          </button>
          <div className="mt-4 text-center">
            <p>
              Forgot password?{" "}
              <Link href="/admin/forgot-password" className="hover:underline text-black">
                Reset here
              </Link>
            </p>
            <p className="mt-2">
              Don't have an account?{" "}
              <Link href="/admin/register" className="hover:underline text-black">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Half: Admin Benefits & Message */}
      <div className="md:w-1/2 flex items-center justify-center p-4 bg-black">
        <motion.div
          className="text-center space-y-4 px-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold" style={{ color: gold }}>
            Empower Your Admin Panel
          </h2>
          <p className="text-base text-white">
            Manage users, configure settings, and monitor performance—all in one place.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Users size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Manage Users</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Settings size={20} style={{ color: gold }} />
              <span className="text-sm text-white">System Settings</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <BarChart size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Performance Metrics</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Security & Control</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
