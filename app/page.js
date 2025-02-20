"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home as HomeIcon,
  Truck,
  ShoppingCart,
  Sun,
  Moon,
  User,
  Menu,
  X,
  Mail,
} from "lucide-react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);

  // Define gold color
  const gold = "#D4AF37";

  // Contact form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError("");
    setContactSuccess("");
    try {
      const res = await fetch("https://backend-2tr2.onrender.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setContactSuccess(data.message || "Message sent successfully!");
        setContactName("");
        setContactEmail("");
        setContactMessage("");
      } else {
        setContactError(data.error || "Failed to send message");
      }
    } catch (err) {
      setContactError("An error occurred. Please try again later.");
    }
  };

  return (
    <div
      style={{ fontSize: "80%" }}
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isDark ? "bg-black" : "bg-white"
      } text-base`}
    >
      {/* Navigation Bar */}
      <header
        className="w-full px-8 py-4 flex items-center justify-between border-b transition-colors duration-500"
        style={{ borderColor: isDark ? gold : "#333" }}
      >
        <div className="flex items-center space-x-4">
          <Image
            src="/logo.jpg"
            alt="MerLiz Holdings Logo"
            width={60}
            height={60}
            className="rounded-full border transition-colors duration-500"
            style={{ borderColor: gold }}
          />
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: gold }}>
              MerLiz Holdings (PTY) Ltd
            </h1>
            <p className="text-xl font-semibold" style={{ color: gold }}>
              REG. Nr 2023/527022/07
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-2xl font-bold">
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
            <HomeIcon size={24} style={{ color: gold }} />
            <Link href="/" style={{ color: gold }}>
              Home
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => setContactModalOpen(true)}
          >
            <User size={24} style={{ color: gold }} />
            <span style={{ color: gold }}>Contact Us</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
            <Truck size={24} style={{ color: gold }} />
            <Link href="/driver" style={{ color: gold }}>
              Driver
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
            <ShoppingCart size={24} style={{ color: gold }} />
            <Link href="/product" style={{ color: gold }}>
              Food
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
            <User size={24} style={{ color: gold }} />
            <Link href="/merlizholdings/login" style={{ color: gold }}>
              Sellers
            </Link>
          </motion.div>
        </nav>

        {/* Mobile Navigation Toggle & Theme Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileNav}
            className="mr-4 p-2 rounded transition-colors duration-300"
            style={{ border: `2px solid ${gold}` }}
          >
            {mobileNavOpen ? (
              <X size={28} style={{ color: gold }} />
            ) : (
              <Menu size={28} style={{ color: gold }} />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all duration-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            style={{ border: "2px solid", borderColor: gold }}
          >
            {isDark ? <Sun size={28} style={{ color: gold }} /> : <Moon size={28} style={{ color: gold }} />}
          </button>
        </div>

        {/* Theme Toggle for Desktop */}
        <div className="hidden md:block">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-all duration-500 hover:bg-gray-200 dark:hover:bg-gray-700"
            style={{ border: "2px solid", borderColor: gold }}
          >
            {isDark ? <Sun size={28} style={{ color: gold }} /> : <Moon size={28} style={{ color: gold }} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileNavOpen && (
        <nav
          className="md:hidden bg-white dark:bg-black border-b transition-colors duration-500"
          style={{ borderColor: isDark ? gold : "#333" }}
        >
          <div className="flex flex-col items-center space-y-4 py-4 text-2xl font-bold">
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <HomeIcon size={24} style={{ color: gold }} />
              <Link href="/" style={{ color: gold }}>
                Home
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setContactModalOpen(true)}
            >
              <User size={24} style={{ color: gold }} />
              <span style={{ color: gold }}>Contact Us</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <Truck size={24} style={{ color: gold }} />
              <Link href="/driver" style={{ color: gold }}>
                Driver
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <ShoppingCart size={24} style={{ color: gold }} />
              <Link href="/product" style={{ color: gold }}>
                Food
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="flex items-center gap-1">
              <User size={24} style={{ color: gold }} />
              <Link href="/sellers" style={{ color: gold }}>
                Sellers
              </Link>
            </motion.div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:px-12 gap-10 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p
            className="uppercase tracking-widest text-lg mb-4"
            style={{ color: gold }}
          >
            45 Edge Road, Weltevreden Valley, Mitchell&apos;s Plain
          </p>
          <h2
            className="text-5xl sm:text-7xl font-extrabold mb-6"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            Simplicity at Your Convenience
          </h2>
          <p
            className="text-2xl sm:text-3xl mb-10"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            Experience premium e‑hailing services and fast food orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-xl ml-12" style={{ marginLeft: "50px" }}>
            {/* Book Trip With Us Button */}
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Link href="/booktrip">
                <button
                  className="w-full px-6 py-4 rounded-full transition-all duration-300 font-bold"
                  style={{
                    backgroundColor: "#fff",
                    color: "#000",
                    border: "2px solid #D4AF37",
                  }}
                >
                  Book Trip With Us
                </button>
              </Link>
            </motion.div>
            {/* Food Orders Button */}
            <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
              <Link href="/product">
                <button
                  className="w-full px-6 py-4 rounded-full transition-all duration-300 font-bold"
                  style={{
                    backgroundColor: "#000",
                    color: gold,
                    border: "2px solid #D4AF37",
                  }}
                >
                  Food Orders
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        className="px-8 py-6 border-t transition-colors duration-500 text-center text-2xl"
        style={{ borderColor: isDark ? gold : "#333", color: isDark ? "#fff" : "#000" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-8">
            <span>+27 66 375 8904</span>
            <span>info@merlizholdings.com</span>
          </div>
          <p className="mt-2">
            © {new Date().getFullYear()} MerLiz Holdings (PTY) Ltd. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Contact Us Modal */}
      <AnimatePresence>
        {contactModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 rounded-xl shadow-lg max-w-md w-full ${
                isDark
                  ? "bg-black text-white border border-white"
                  : "bg-white text-black border border-black"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center mb-4">
                <Mail size={28} style={{ color: gold }} className="mr-2" />
                <h3 className="text-2xl font-bold text-center">Contact Us</h3>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-black"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-black"
                />
                <textarea
                  placeholder="Your Message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D4AF37] bg-white text-black"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg font-bold transition-colors"
                  style={{ backgroundColor: gold, color: "black" }}
                >
                  Send Message
                </button>
              </form>
              {contactError && (
                <p className="mt-2 text-red-500 text-center">{contactError}</p>
              )}
              {contactSuccess && (
                <p className="mt-2 text-green-500 text-center">{contactSuccess}</p>
              )}
              <p className="mt-4 text-center text-sm">
                If you experience any issues, please contact support at info@merlizholdings.com.
              </p>
              <button
                onClick={() => setContactModalOpen(false)}
                className="mt-4 w-full py-2 rounded-lg font-bold border border-gray-300 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
