"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MerlizsellersList({ isDark }) {
  const [merlizsellers, setMerlizsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMerlizsellers = async () => {
      try {
        // Use your admin token or any required token for authorization
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setError("Unauthorized: No token found.");
          setLoading(false);
          return;
        }
        const { data } = await axios.get("https://backend-2tr2.onrender.com/api/merlizsellers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming your API returns { merlizsellers: [ ... ] }
        setMerlizsellers(data.merlizsellers);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchMerlizsellers();
  }, []);

  if (loading) {
    return <p>Loading MerlizSellers...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={`min-w-full divide-y divide-gray-200 ${
          isDark ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Address
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Profile Picture
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {merlizsellers.map((seller) => (
            <tr key={seller._id}>
              <td className="px-6 py-4 whitespace-nowrap">{seller.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{seller.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">{seller.address}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {seller.profileImage ? (
                  <img
                    src={seller.profileImage}
                    alt={`${seller.name}'s profile`}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                ) : (
                  "No Image"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
