"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, Menu, Home, ShoppingBag, Settings } from "lucide-react";

export default function MerlizSellersLayout({ children }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Retrieve user info from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("merlizsellersUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  // If on login, register, forgot-password, or reset-password pages, render children directly.
  if (
    pathname === "/merlizsellers/login" ||
    pathname === "/merlizsellers/register" ||
    pathname.startsWith("/merlizsellers/forgot-password") ||
    pathname.startsWith("/merlizsellers/reset-password")
  ) {
    return <>{children}</>;
  }

  const menuOptions = [
    { name: "Dashboard", route: "/merlizsellers/dashboard", icon: <Home size={20} /> },
    { name: "Orders", route: "/merlizsellers/orders", icon: <ShoppingBag size={20} /> },
    { name: "Settings", route: "/merlizsellers/settings", icon: <Settings size={20} /> },
  ];

  // Function to clear all cookies
  const clearAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  };

  // Logout handler: clears localStorage and cookies, then forces a page reload.
  const handleLogout = () => {
    localStorage.removeItem("merlizsellersToken");
    localStorage.removeItem("merlizsellersUser");
    clearAllCookies();
    window.location.href = "/merlizsellers/login";
  };

  return (
    <div
      className={`flex min-h-screen ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 p-2 rounded-full bg-black text-white transition-colors duration-300 z-50"
        style={{ top: "20px" }}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 p-5 shadow-md fixed top-0 left-0 h-screen transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDark ? "bg-gray-800 text-yellow-400" : "bg-white"}`}
      >
        <div className="mt-16 flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">MerlizSellers Panel</h2>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full transition-colors duration-300"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
        <ul className="space-y-4">
          {menuOptions.map((item) => (
            <li key={item.name} className="cursor-pointer font-bold hover:underline flex items-center">
              {item.icon}
              <Link href={item.route} className="ml-2">{item.name}</Link>
            </li>
          ))}
          <li className="cursor-pointer font-bold text-red-500 flex items-center" onClick={handleLogout}>
            <Settings size={20} className="mr-2" /> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarOpen ? "ml-64" : "ml-0"} p-10 transition-margin duration-300 ${isDark ? "bg-gray-900" : ""}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">MerlizSellers Dashboard</h1>
          {user && (
            <p className="mt-2 text-lg">
              Welcome, <span className="font-semibold">{user.name}</span>!
            </p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
