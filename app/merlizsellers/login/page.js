"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, TrendingUp, ShieldCheck, Star } from "lucide-react";

export default function MerlizSellersLogin() {
  const gold = "#D4AF37";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/auth/merlizsellers/login",
        { email, password }
      );
      localStorage.setItem("merlizsellersToken", data.token);
      localStorage.setItem("merlizsellersUser", JSON.stringify(data.user));
      router.push("/merlizsellers/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Login Form */}
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
            MerlizSellers Login
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-black p-3 w-full mb-4 rounded-lg bg-white text-black placeholder-gray-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-black p-3 w-full mb-4 rounded-lg bg-white text-black placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold transition-colors"
              style={{ backgroundColor: gold, color: "black" }}
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center">
            Don't have an account?{" "}
            <Link href="/merlizsellers/register" className="hover:underline text-black">
              Register here
            </Link>
          </p>
          <p className="mt-2 text-center">
            Forgot password?{" "}
            <Link href="/merlizsellers/forgot-password" className="hover:underline text-black">
              Reset here
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Half: Benefits & Message */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-black">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl font-bold mb-6" style={{ color: gold }}>
            Welcome Back
          </h2>
          <p className="text-lg mb-6 text-white">
            Log in to continue enjoying our unparalleled benefits:
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle size={24} style={{ color: gold }} />
              <span className="text-lg text-white">Seamless Transactions</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <TrendingUp size={24} style={{ color: gold }} />
              <span className="text-lg text-white">High Earning Potential</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <ShieldCheck size={24} style={{ color: gold }} />
              <span className="text-lg text-white">Secure & Trusted Platform</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Star size={24} style={{ color: gold }} />
              <span className="text-lg text-white">Exclusive 24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
