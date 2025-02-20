"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Lock, User, Bell, Moon, Sun } from "lucide-react";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Handle Save Settings
  const handleSave = () => {
    console.log("Saving Settings:", { username, password, darkMode, notifications });
    alert("✅ Settings Saved Successfully!");
  };

  return (
    <div className={`p-6 shadow-lg rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <h2 className="text-xl font-semibold mb-4">⚙️ Admin Settings</h2>

      {/* Change Username */}
      <div className="mb-4">
        <label className="flex items-center gap-2 font-semibold">
          <User size={18} /> Change Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter new username"
          className={`mt-2 p-2 w-full rounded-md border ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black"}`}
        />
      </div>

      {/* Change Password */}
      <div className="mb-4">
        <label className="flex items-center gap-2 font-semibold">
          <Lock size={18} /> Change Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
          className={`mt-2 p-2 w-full rounded-md border ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black"}`}
        />
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 font-semibold">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />} Enable Dark Mode
        </span>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
          className="w-5 h-5 cursor-pointer"
        />
      </div>

      {/* Notifications Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 font-semibold">
          <Bell size={18} /> Enable Notifications
        </span>
        <input
          type="checkbox"
          checked={notifications}
          onChange={() => setNotifications(!notifications)}
          className="w-5 h-5 cursor-pointer"
        />
      </div>

      {/* Save Button - in dark mode, button background stays green but text is forced to black */}
      <motion.button
        onClick={handleSave}
        className={`px-4 py-2 rounded-md flex items-center justify-center w-full mt-4 ${darkMode ? "bg-green-400 text-black" : "bg-green-500 text-white"}`}
        whileHover={{ scale: 1.05 }}
      >
        <Save size={18} className="mr-2" /> Save Settings
      </motion.button>
    </div>
  );
}
