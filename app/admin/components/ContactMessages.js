"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Helper function to get a local date string in the format YYYY-MM-DD
function getLocalDateString(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ContactMessages({ isDark }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Store filter date as a Date object (or null)
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get("https://backend-2tr2.onrender.com/api/contact", { headers });
        // Sort messages so the most recent come first
        const sortedMessages = (data.messages || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setMessages(sortedMessages);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        setError("Failed to load messages");
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Filter messages by selected date using local date strings
  const filteredMessages = filterDate
    ? messages.filter((msg) => {
        const msgDate = getLocalDateString(new Date(msg.createdAt));
        const selectedDate = getLocalDateString(filterDate);
        return msgDate === selectedDate;
      })
    : messages;

  if (loading) {
    return <div className="p-4">Loading contact messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-5">
      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Contact Messages
      </motion.h2>

      {/* Date Filter using react-datepicker with modern styling */}
      <motion.div
        className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <DatePicker
          selected={filterDate}
          onChange={(date) => setFilterDate(date)}
          placeholderText="Select a date"
          className="custom-datepicker-input p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-transparent text-white"
          calendarClassName="rounded-lg bg-white text-black"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate(null)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            Clear Filter
          </button>
        )}
      </motion.div>

      {filteredMessages.length === 0 ? (
        <p>
          No contact messages available for{" "}
          {filterDate ? getLocalDateString(filterDate) : "all dates"}.
        </p>
      ) : (
        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {filteredMessages.map((msg) => (
            <motion.div
              key={msg._id}
              className={`p-6 rounded-lg shadow-lg border transition-transform duration-200 ${
                isDark
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-black border-gray-300"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="text-xl font-bold">{msg.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(msg.createdAt).toLocaleDateString()}{" "}
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Email: </span>
                {msg.email}
              </div>
              <div>
                <span className="font-semibold">Message: </span>
                {msg.message}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Global styles for the datepicker input placeholder */}
      <style jsx global>{`
        .custom-datepicker-input::placeholder {
          color: black !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
