"use client";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <nav className="bg-black text-white p-4 flex justify-between">
      <h3>🚀 Admin Panel</h3>
      <button onClick={logout} className="bg-red-500 px-4 py-2">Logout</button>
    </nav>
  );
}
