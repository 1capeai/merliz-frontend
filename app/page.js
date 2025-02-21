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
  const [isDark, setIsDark] = useState(true); // Dark mode (black background)
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  const toggleTheme = () => setIsDark((prev) => !prev);
  const toggleMobileNav = () => setMobileNavOpen((prev) => !prev);

  const gold = "#D4AF37";

  // Handle contact form submission and auto-close on success
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
        // Auto-close modal after 2 seconds on success
        setTimeout(() => {
          setContactModalOpen(false);
          setContactSuccess("");
        }, 2000);
      } else {
        setContactError(data.error || "Failed to send message");
      }
    } catch (err) {
      setContactError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-black text-white text-lg sm:text-xl">
      {/* Navigation Bar */}
      <header className="w-full px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between border-b border-gray-700">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Image
            src="/logo.jpg"
            alt="MerLiz Holdings Logo"
            width={46}  // Increased by ~15% (from 40 to 46)
            height={46}
            className="rounded-full border transition-colors duration-500"
            style={{ borderColor: gold }}
          />
          <div>
            <h1 className="text-xl sm:text-3xl font-bold" style={{ color: gold }}>
              MerLiz Holdings (PTY) Ltd
            </h1>
            <p className="text-sm sm:text-base" style={{ color: gold }}>
              REG. Nr 2023/527022/07
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 font-semibold">
          {[
           { href: "/rider", label: "Rider", icon: <User size={20} style={{ color: gold }} /> },

            { href: "/driver", label: "Driver", icon: <Truck size={20} style={{ color: gold }} /> },
            { href: "/product", label: "Food", icon: <ShoppingCart size={20} style={{ color: gold }} /> },
            { href: "/merlizsellers/login", label: "Sellers", icon: <User size={20} style={{ color: gold }} /> },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ scale: 1.05 }} className="relative group">
              <Link href={item.href} className="flex items-center gap-1 text-white">
                {item.icon} {item.label}
              </Link>
              <span
                className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gold group-hover:w-full transition-all duration-300"
                style={{ backgroundColor: gold }}
              ></span>
            </motion.div>
          ))}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-pointer"
            onClick={() => setContactModalOpen(true)}
          >
            <div className="flex items-center gap-1 text-white">
              <Mail size={20} style={{ color: gold }} /> Contact
            </div>
            <span
              className="absolute left-0 -bottom-1 h-0.5 w-0 bg-gold group-hover:w-full transition-all duration-300"
              style={{ backgroundColor: gold }}
            ></span>
          </motion.div>
        </nav>

        {/* Mobile Menu & Theme Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileNav}
            className="mr-2 p-1 border rounded"
            style={{ borderColor: gold }}
          >
            {mobileNavOpen ? (
              <X size={24} style={{ color: gold }} />
            ) : (
              <Menu size={24} style={{ color: gold }} />
            )}
          </button>
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full border"
            style={{ borderColor: gold }}
          >
            {isDark ? <Sun size={24} style={{ color: gold }} /> : <Moon size={24} style={{ color: gold }} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileNavOpen && (
        <nav className="md:hidden bg-black border-b border-gray-700 transition-colors duration-500 p-4">
          <div className="flex flex-col items-center space-y-3">
            <Link href="/" className="text-white hover:text-gold">
              Home
            </Link>
            <Link href="/driver" className="text-white hover:text-gold">
              Driver
            </Link>
            <Link href="/product" className="text-white hover:text-gold">
              Food
            </Link>
            <Link href="/sellers" className="text-white hover:text-gold">
              Sellers
            </Link>
            <div
              className="text-white hover:text-gold cursor-pointer"
              onClick={() => {
                setContactModalOpen(true);
                setMobileNavOpen(false);
              }}
            >
              Contact
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8 sm:py-16 text-center">
        <p className="uppercase tracking-widest mb-2" style={{ color: gold }}>
          45 Edge Road, Weltevreden Valley, Mitchell's Plain
        </p>
        <h2 className="text-3xl sm:text-5xl font-bold mb-4">
          Simplicity at Your Convenience
        </h2>
        <p className="mb-6 text-gray-300">
          Experience premium e-hailing services and fast food orders.
        </p>
        {/* Call to Action Buttons with creative hover effects */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/rider">
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: `0px 0px 8px ${gold}`,
                transition: { duration: 0.3 },
              }}
              className="px-4 py-2 border rounded-full font-medium relative overflow-hidden"
              style={{ borderColor: gold, color: gold, backgroundColor: "transparent" }}
            >
              Book Trip With Us
              <motion.div
                className="absolute inset-0 bg-gold opacity-0"
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </motion.button>
          </Link>
          <Link href="/product">
            <motion.button
              whileHover={{
                scale: 1.1,
                boxShadow: `0px 0px 8px ${gold}`,
                transition: { duration: 0.3 },
              }}
              className="px-4 py-2 border rounded-full font-medium relative overflow-hidden"
              style={{ backgroundColor: gold, color: "#000", borderColor: gold }}
            >
              Food Orders
              <motion.div
                className="absolute inset-0 bg-black opacity-0"
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              ></motion.div>
            </motion.button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-4 border-t border-gray-700 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-400">+27 66 375 8904 • info@merlizholdings.com</p>
          <p className="text-gray-500">
            © {new Date().getFullYear()} MerLiz Holdings (PTY) Ltd. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Contact Us Modal */}
      <AnimatePresence>
        {contactModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-6 sm:p-8 rounded-lg shadow-lg w-11/12 sm:w-96 ${
                isDark
                  ? "bg-black text-white border border-gray-700"
                  : "bg-white text-black border border-gray-300"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Mail size={24} style={{ color: gold }} className="mr-2" />
                  <h3 className="text-xl font-bold">Contact Us</h3>
                </div>
                <button onClick={() => setContactModalOpen(false)} className="text-gray-500 hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              {/* Contact Form */}
              <form onSubmit={handleContactSubmit} className="space-y-3">
  <input
    type="text"
    placeholder="Your Name"
    value={contactName}
    onChange={(e) => setContactName(e.target.value)}
    className="w-full p-2 border border-gray-500 rounded focus:ring-2 focus:ring-gold bg-black text-white"
    required
  />
  <input
    type="email"
    placeholder="Your Email"
    value={contactEmail}
    onChange={(e) => setContactEmail(e.target.value)}
    className="w-full p-2 border border-gray-500 rounded focus:ring-2 focus:ring-gold bg-black text-white"
    required
  />
  <textarea
    placeholder="Your Message"
    value={contactMessage}
    onChange={(e) => setContactMessage(e.target.value)}
    className="w-full p-2 border border-gray-500 rounded focus:ring-2 focus:ring-gold bg-black text-white"
    rows="4"
    required
  />
  <motion.button
    type="submit"
    whileHover={{ scale: 1.05, boxShadow: `0px 0px 8px ${gold}` }}
    className="w-full py-2 rounded-lg font-bold hover:opacity-90 transition"
    style={{ backgroundColor: gold, color: "#000" }}
  >
    Send Message
  </motion.button>
</form>

              {/* Error or Success Messages */}
              {contactError && <p className="mt-2 text-red-500 text-center">{contactError}</p>}
              {contactSuccess && <p className="mt-2 text-green-500 text-center">{contactSuccess}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
