"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import io from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-2tr2.onrender.com";

export default function Riders({ isDark = false }) {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // Socket connection for sending messages
  const socketRef = useRef(null);

  // State for individual message modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedRiderForMessage, setSelectedRiderForMessage] = useState(null);
  const [messageText, setMessageText] = useState("");

  // State for announcement modal (to all riders)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  // Fetch riders from backend
  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(`${API_URL}/api/riders`, { headers });
        const riderData = Array.isArray(data) ? data : data.riders || [];
        setRiders(riderData);
      } catch (err) {
        console.error("Error fetching riders:", err);
        setError("Error fetching riders");
      } finally {
        setLoading(false);
      }
    };
    fetchRiders();
  }, [router]);

  // Establish socket connection
  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
      socket.emit("register-admin", "adminIdentifier");
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleViewRider = (id) => {
    router.push(`/admin/riders/${id}`);
  };

  const handleDeleteRider = async (id) => {
    if (confirm("Are you sure you want to delete this rider?")) {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`${API_URL}/api/riders/${id}`, { headers });
        setRiders(riders.filter((rider) => rider._id !== id));
      } catch (err) {
        console.error("Error deleting rider:", err);
        setError("Error deleting rider");
      }
    }
  };

  // ---------------------------
  // Individual Message Modal Handlers
  // ---------------------------
  const handleSendMessage = (riderId) => {
    setSelectedRiderForMessage(riderId);
    setMessageText("");
    setShowMessageModal(true);
  };

  const handleSendMessageSubmit = () => {
    if (socketRef.current && selectedRiderForMessage && messageText) {
      socketRef.current.emit("admin-message", {
        riderId: selectedRiderForMessage,
        message: messageText,
      });
      console.log(`Message sent to rider ${selectedRiderForMessage}: ${messageText}`);
      setShowMessageModal(false);
      setSelectedRiderForMessage(null);
      setMessageText("");
    }
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setSelectedRiderForMessage(null);
    setMessageText("");
  };

  // ---------------------------
  // Announcement Modal Handlers (to all riders)
  // ---------------------------
  const handleOpenAnnouncementModal = () => {
    setAnnouncementText("");
    setShowAnnouncementModal(true);
  };

  const handleSendAnnouncementSubmit = () => {
    if (socketRef.current && announcementText) {
      socketRef.current.emit("admin-message-all", {
        message: announcementText,
      });
      console.log(`Announcement sent to all riders: ${announcementText}`);
      setShowAnnouncementModal(false);
      setAnnouncementText("");
    }
  };

  const handleCloseAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setAnnouncementText("");
  };

  if (loading) {
    return <div className="p-5 text-center">Loading riders...</div>;
  }

  if (error) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Riders List</h2>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => router.push("/admin/riders")}
        >
          Refresh List
        </button>
        <button
          onClick={handleOpenAnnouncementModal}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Announce to All Riders
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className={`min-w-full border-collapse ${isDark ? "text-white" : "text-black"}`}>
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
              <th className="p-2 border">Send Message</th>
            </tr>
          </thead>
          <tbody>
            {riders.length > 0 ? (
              riders.map((rider) => (
                <tr key={rider._id} className="border hover:bg-gray-100 transition">
                  <td className="p-2 border">{rider.name}</td>
                  <td className="p-2 border">{rider.email}</td>
                  <td className="p-2 border">{rider.status || "N/A"}</td>
                  <td className="p-2 border">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewRider(rider._id)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRider(rider._id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleSendMessage(rider._id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Send Message
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No riders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Individual Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80">
            <h2 className="text-xl font-bold mb-4">Message to Rider</h2>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="border p-2 w-full h-24 mb-4"
              placeholder="Type your message..."
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleSendMessageSubmit}
                className="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Send
              </button>
              <button
                onClick={handleCloseMessageModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal for All Riders */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80">
            <h2 className="text-xl font-bold mb-4">Announcement to All Riders</h2>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="border p-2 w-full h-24 mb-4"
              placeholder="Type your announcement..."
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleSendAnnouncementSubmit}
                className="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Send
              </button>
              <button
                onClick={handleCloseAnnouncementModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
