"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to determine sender info
  const getSenderInfo = (order) => {
    if (order.isGuest) {
      return {
        role: "Guest",
        name: order.customerDetails?.name || "Guest",
      };
    } else {
      return {
        role: order.user?.role || "Admin",
        name: order.user?.name || "Admin",
      };
    }
  };

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Assumes your backend has a route GET /api/orders/:id
        const { data } = await axios.get(`https://backend-2tr2.onrender.com/api/orders/${id}`, { headers });
        // The backend can return either the order directly or as { order }
        setOrder(data.order || data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details.");
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading order details...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="p-6">No order details available.</div>;
  }

  const { role: senderRole, name: senderName } = getSenderInfo(order);
  const orderDate = new Date(order.createdAt).toLocaleDateString();
  const paymentStatus = order.paymentStatus
    ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
    : "Missing";

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center mb-4 text-blue-600 hover:underline"
      >
        <ArrowLeft size={24} />
        <span className="ml-2">Back</span>
      </button>
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>
      <div className="border p-6 rounded shadow-lg space-y-4">
        <p>
          <strong>Sender Role:</strong> {senderRole}
        </p>
        <p>
          <strong>Sender Name:</strong> {senderName}
        </p>
        <p>
          <strong>Order Date:</strong> {orderDate}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Payment Status:</strong> {paymentStatus}
        </p>
        <p>
          <strong>Quantity:</strong> {order.quantity}
        </p>
        <p>
          <strong>Product:</strong> {order.product?.name || "N/A"}
        </p>
        {order.images && order.images.length > 0 && (
          <div>
            <strong>Images:</strong>
            <div className="flex gap-4 mt-2">
              {order.images.map((img, index) => (
                <motion.img
                  key={index}
                  src={img}
                  alt={`Order image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                  whileHover={{ scale: 1.05 }}
                />
              ))}
            </div>
          </div>
        )}
        {order.proofOfPayment && (
          <p>
            <strong>Proof of Payment:</strong>{" "}
            <a
              href={order.proofOfPayment}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              View Proof
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
