"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle, Star, TrendingUp, ShieldCheck } from "lucide-react";

export default function MerlizSellersRegister() {
  const gold = "#D4AF37";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => console.error("Location error:", err)
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      // Role is set to MerlizSellers
      formData.append("role", "MerlizSellers");
      formData.append("secretCode", secretCode);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);

      const { data } = await axios.post(
        "https://backend-2tr2.onrender.com/api/auth/merlizsellers/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // Store token and user data for later use
      localStorage.setItem("merlizsellersToken", data.token);
      localStorage.setItem("merlizsellersUser", JSON.stringify(data.user));
      router.push("/merlizsellers/dashboard");
    } catch (err) {
      console.error("Registration error:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Registration Form */}
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
          <h2 className="text-4xl font-bold mb-6 text-black">
            Register as a Seller
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-black p-3 w-full mb-4 rounded-lg bg-white text-black placeholder-gray-500"
            />
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
            <input
              type="text"
              placeholder="Secret Code"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="border border-black p-3 w-full mb-4 rounded-lg bg-white text-black placeholder-gray-500"
            />
            <div className="mb-4 text-sm text-gray-600">
              {location.latitude && location.longitude
                ? `Location: ${location.latitude}, ${location.longitude}`
                : "Fetching location..."}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold transition-colors"
              style={{
                backgroundColor: gold,
                color: "black",
              }}
            >
              Register
            </button>
          </form>
          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/merlizsellers/login" className="hover:underline text-black">
              Login here
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
            We Take You There
          </h2>
          <p className="text-lg mb-6 text-white">
            People who sell on our system enjoy unparalleled benefits, including:
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
          {/* "Get Started" button removed */}
        </motion.div>
      </div>
    </div>
  );
}
