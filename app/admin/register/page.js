"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Settings, BarChart, Shield } from "lucide-react";
import { io } from "socket.io-client";

export default function AdminRegister() {
  const gold = "#D4AF37";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/admin/register", {
        name,
        email,
        password,
        secretCode,
      });
      alert("Admin registered successfully!");
      localStorage.setItem("adminToken", data.token);

      // Create a socket connection and register the admin (if needed)
      const socket = io("https://backend-2tr2.onrender.com");
      socket.emit("register-admin", data.admin?._id || email);
      socket.on("driver-location-update", (update) => {
        console.log("Admin received driver location update:", update);
      });

      router.push("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Registration Form */}
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
            Admin Registration
          </h1>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
          />
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
          />
          <input
            type="text"
            placeholder="Secret Code"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
            className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
          />
          <button
            onClick={handleRegister}
            className="w-full py-2 rounded font-bold transition-colors mt-4"
            style={{
              backgroundColor: gold,
              color: "black",
            }}
          >
            Register
          </button>
          <p className="mt-2 text-center text-sm">
            Already have an account?{" "}
            <Link href="/admin/login" className="hover:underline text-black">
              Login here
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Half: Benefits & Message */}
      <div className="md:w-1/2 flex items-center justify-center p-2 bg-black">
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
