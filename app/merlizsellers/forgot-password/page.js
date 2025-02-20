"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MerlizSellersForgotPassword() {
  const gold = "#D4AF37";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/users/forgot-password", { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset email");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Forgot Password Form */}
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
          <h2 className="text-3xl font-bold mb-6 text-black">
            🔒 Forgot Password
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-black p-3 w-full mb-4 rounded-lg bg-white text-black placeholder-gray-500"
          />
          <button
            onClick={handleForgotPassword}
            className="w-full py-3 rounded-lg font-bold transition-colors"
            style={{ backgroundColor: gold, color: "black" }}
          >
            Send Reset Email
          </button>
          {message && <p className="text-green-500 mt-4">{message}</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}
          <p className="mt-4 text-center">
            Back to{" "}
            <Link href="/merlizsellers/login" className="hover:underline text-black">
              Login
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Half: Consistency Message */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-black">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold mb-6" style={{ color: gold }}>
            We Care About You
          </h2>
          <p className="text-lg mb-6 text-white">
            Reset your password and regain access to your benefits.
          </p>
          <p className="text-lg mb-6 text-white">
            Our platform offers seamless transactions, high earning potential, secure operations, and 24/7 support.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
