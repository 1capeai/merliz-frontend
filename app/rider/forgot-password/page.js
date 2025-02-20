"use client";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Car, Clock, MapPin, Smile } from "lucide-react";

export default function RiderForgotPassword() {
  const gold = "#D4AF37";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/users/forgot-password", { email });
      setMessage(data.message || "Check your email for reset instructions.");
    } catch (err) {
      setError(err.response?.data?.message || "Error requesting password reset");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Forgot Password Form */}
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
          <h1 className="text-xl font-bold text-black text-center mb-2">
            Rider Forgot Password
          </h1>
          <form onSubmit={handleForgotPassword} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your rider email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-black p-2 w-full rounded bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              className="w-full py-2 rounded font-bold transition-colors mt-2"
              style={{ backgroundColor: gold, color: "black" }}
            >
              Send Reset Link
            </button>
          </form>
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          {message && <p className="text-green-500 mt-2 text-center">{message}</p>}
          <p className="mt-2 text-center text-sm">
            Back to <Link href="/rider" className="hover:underline text-black">Login</Link>
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
            Ride with Confidence
          </h2>
          <p className="text-base text-white">
            Reset your password and get back on the road with seamless service and unbeatable reliability.
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
