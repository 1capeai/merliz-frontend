"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersList({ isDark = false }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("https://backend-2tr2.onrender.com/api/admin/users");
        setUsers(data);
      } catch (error) {
        console.error("🚨 Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className={`p-5 shadow rounded-lg ${isDark ? "bg-[#2c2d2f] text-white" : "bg-white text-black"}`}>
      <h3 className="text-xl font-semibold mb-4">👥 User List</h3>
      <table className="w-full border-collapse border">
        <thead>
          <tr className={isDark ? "bg-gray-700" : "bg-gray-200"}>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
