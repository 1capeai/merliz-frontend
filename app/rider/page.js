"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Car, Clock, MapPin, Smile } from "lucide-react";

export default function RiderPage() {
  const gold = "#D4AF37";
  const router = useRouter();
  const [riderId, setRiderId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auth states (used only during registration/login)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check if we already have a riderId in localStorage
    const storedRiderId = localStorage.getItem("riderId");
    if (storedRiderId) {
      setRiderId(storedRiderId);
      setIsLoggedIn(true);
      // Redirect to Rider Dashboard if already logged in
      router.push("/rider-dashboard");
    }
  }, [router]);

  const registerRider = async () => {
    if (!name || !email || !password) {
      setError("⚠️ All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/signup", {
        name,
        email,
        password,
        role: "rider", // Ensure backend sets role = "rider"
      });
      // Save rider details in localStorage
      localStorage.setItem("riderName", data.user.name);
      localStorage.setItem("riderEmail", data.user.email);
      localStorage.setItem("profileImage", data.user.profileImage);
      localStorage.setItem(
        "riderDetails",
        "Thank you for riding with us. Enjoy exclusive discounts and perks every time you book a trip!"
      );
      
      setRiderId(data.user.id || data.user._id);
      setIsLoggedIn(true);
      setLoading(false);
      router.push("/rider-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      setLoading(false);
    }
  };

  const loginRider = async () => {
    if (!email || !password) {
      setError("⚠️ Email and Password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("https://backend-2tr2.onrender.com/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("riderName", data.user.name);
      localStorage.setItem("riderEmail", data.user.email);
      localStorage.setItem("profileImage", data.user.profileImage);
      localStorage.setItem(
        "riderDetails",
        "Thank you for riding with us. Enjoy exclusive discounts and perks every time you book a trip!"
      );
      
      setRiderId(data.user.id || data.user._id);
      setIsLoggedIn(true);
      setLoading(false);
      router.push("/rider-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Half: Rider Form */}
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
          <h2 className="text-xl font-bold text-black text-center mb-2">
            {isRegistering ? "Register as a Rider" : "Rider Login"}
          </h2>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          {!isLoggedIn && (
            <div className="mt-2">
              {isRegistering && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] mt-2"
              />
              <button
                onClick={isRegistering ? registerRider : loginRider}
                disabled={loading}
                className={`w-full mt-4 px-6 py-2 text-black text-lg font-semibold rounded-lg transition ${
                  loading ? "bg-gray-300 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: gold,
                  color: "black",
                }}
              >
                {loading ? "Processing..." : isRegistering ? "Register" : "Login"}
              </button>
              {!isRegistering && (
                <div className="text-center mt-4">
                  <Link href="/rider/forgot-password" className="text-black hover:underline text-sm">
                    Forgot Password?
                  </Link>
                </div>
              )}
              <p
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-black text-center mt-4 cursor-pointer hover:underline"
              >
                {isRegistering ? "Already have an account? Login" : "New rider? Register"}
              </p>
            </div>
          )}
          {isLoggedIn && (
            <p className="text-center text-green-600 font-semibold mt-4">
              Redirecting to your dashboard...
            </p>
          )}
        </motion.div>
      </div>

      {/* Right Half: Benefits & Message */}
      <div className="md:w-1/2 flex items-center justify-center p-4 bg-black">
        <motion.div
          className="text-center space-y-4 px-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold" style={{ color: gold }}>
            Experience Seamless Rides
          </h2>
          <p className="text-base text-white">
            Enjoy quick pickups, affordable fares, and reliable service—all at your fingertips.
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
              <span className="text-sm text-white">User-Friendly Experience</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
