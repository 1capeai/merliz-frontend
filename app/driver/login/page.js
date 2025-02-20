"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Truck, Banknote, Headphones, Calendar } from "lucide-react";

export default function DriverLogin() {
  const gold = "#D4AF37";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/login", {
        email,
        password,
      });
      // Store token and driverId
      localStorage.setItem("driverToken", data.token);
      localStorage.setItem("driverId", data.user.id);
      router.push("/driver-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Compact Login Form */}
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
            Driver Login
          </h1>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="driver@example.com"
                className="border border-black p-2 w-full rounded bg-white text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="border border-black p-2 w-full rounded bg-white text-black placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded font-bold transition-colors mt-2"
              style={{
                backgroundColor: gold,
                color: "black",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-2 text-center">
            <Link href="/driver/forgot-password" className="hover:underline text-black">
              Forgot Password?
            </Link>
          </div>
          <div className="mt-2 text-center">
            Don't have an account?{" "}
            <Link href="http://localhost:3000/driver" className="hover:underline text-black">
              Register here
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Half: Benefits & Icons with Increased Spacing */}
      <div className="md:w-1/2 flex items-center justify-center p-4 bg-black">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: gold }}>
            Hit the Road with Confidence
          </h2>
          <p className="text-base mb-4 text-white">
            Join our network of professional drivers and enjoy:
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Truck size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Quick & Seamless Trips</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Banknote size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Competitive Earnings</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Headphones size={20} style={{ color: gold }} />
              <span className="text-sm text-white">24/7 Support</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Calendar size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Flexible Schedules</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
