"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp } from "lucide-react";

export default function TrendingProducts({ isDark = false }) {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const { data } = await axios.get("https://backend-2tr2.onrender.com/api/products/trending");
        setTrending(data);
      } catch (error) {
        console.error("🚨 Error fetching trending products:", error);
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <aside
      className={`w-64 p-5 h-screen shadow-md fixed top-0 right-0 ${isDark ? "bg-[#1b1c1e] text-white" : "bg-white text-black"}`}
    >
      <h3 className="text-lg font-bold mb-4">🔥 Trending Products</h3>
      <ul className="space-y-3">
        {trending.length > 0 ? (
          trending.map((product) => (
            <li
              key={product._id}
              className={`flex items-center justify-between p-3 rounded-md ${
                isDark ? "bg-gray-700" : "bg-yellow-100"
              }`}
            >
              <div className="flex items-center space-x-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <span className="font-semibold">{product.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{product.orderCount} Orders</span>
                <TrendingUp size={20} className={isDark ? "text-green-400" : "text-green-600"} />
              </div>
            </li>
          ))
        ) : (
          <p>No trending products yet.</p>
        )}
      </ul>
    </aside>
  );
}
