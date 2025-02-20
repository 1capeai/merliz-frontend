"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Truck, Banknote, Headphones, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function DriverRegistration() {
  const gold = "#D4AF37";
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    driverCode: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes for text fields and file upload
  const handleChange = (e) => {
    if (e.target.name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
  };

  // Submit registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build FormData for multipart/form-data
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", "driver");
    data.append("driverCode", formData.driverCode);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Save the driver ID and token to localStorage
      const { user, token } = response.data;
      localStorage.setItem("driverId", user.id);
      localStorage.setItem("token", token);

      // Redirect to the driver dashboard
      router.push("/driver-dashboard");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err);
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
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
            Driver Registration
          </h1>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-black">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="driverCode" className="block text-sm font-medium text-black">
                Driver Code
              </label>
              <input
                type="text"
                name="driverCode"
                placeholder="Driver Code"
                value={formData.driverCode}
                onChange={handleChange}
                required
                className="w-full p-2 border border-black rounded bg-white text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-black">
                Upload Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                required
                className="w-full"
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
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="mt-2 text-center text-sm">
            Already have an account?{" "}
            <Link href="/driver/login" className="hover:underline text-black">
              Login here
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Half: Benefits & Icons */}
      <div className="md:w-1/2 flex items-center justify-center p-2 bg-black">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: gold }}>
            Join the Best
          </h2>
          <p className="text-base mb-4 text-white">
            Sign up to drive with us and enjoy:
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Truck size={20} style={{ color: gold }} />
              <span className="text-sm text-white">Seamless Trips</span>
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
