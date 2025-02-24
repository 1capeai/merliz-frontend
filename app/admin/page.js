"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  FileText,
  TrendingUp,
  Loader,
  Sun,
  Moon,
  Truck,
  UserCheck,
  Activity,
  User,
  MessageSquare, // New icon for Contact Messages
} from "lucide-react";

// Import your custom components
import UsersList from "./components/UsersList";
import TrendingProducts from "./components/TrendingProducts";
import OrdersList from "./components/OrdersList";
import SettingsPage from "./components/Settings";
import dynamic from "next/dynamic";
import MerlizsellersList from "./components/merlizsellers"; // For listing MerlizSellers
import Products from "./components/products"; // New products component
import Drivers from "./components/drivers"; // Drivers component
import Riders from "./components/riders"; // **NEW: Import Riders component**
import ContactMessages from "./components/ContactMessages"; // NEW: Import ContactMessages component

const BarChart = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Bar),
  { ssr: false }
);
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function AdminDashboard() {
  const [view, setView] = useState("dashboard");
  const [pendingOrders, setPendingOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [finalizedOrders, setFinalizedOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (view === "dashboard") {
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem("adminToken");
          if (!token) {
            router.push("/admin/login");
            return;
          }
          const headers = { Authorization: `Bearer ${token}` };
          const { data } = await axios.get("https://backend-2tr2.onrender.com/api/orders", { headers });

          // Calculate counts based on order status
          const pending = data.filter((order) => order.status === "Pending").length;
          const processing = data.filter((order) => order.status === "Processing").length;
          const finalized = data.filter((order) => order.status === "Finalized").length;
          setNewOrders(pending);
          setPendingOrders(pending);
          setProcessingOrders(processing);
          setFinalizedOrders(finalized);
          setTotalOrders(data.length);

          // Compute revenue: use order.totalPrice if available, else compute from product price and quantity
          const totalRev = data.reduce((acc, order) => {
            let orderRevenue = 0;
            if (order.totalPrice) {
              orderRevenue = order.totalPrice;
            } else if (order.product && order.product.price) {
              orderRevenue = order.product.price * order.quantity;
            }
            return acc + orderRevenue;
          }, 0);
          setTotalRevenue(totalRev);
          setAvgOrderValue(data.length ? (totalRev / data.length).toFixed(2) : 0);
        } catch (error) {
          console.error("🚨 Error fetching orders:", error);
        }
      };
      fetchOrders();
    }
  }, [view, router]);

  // Chart data for orders
  const chartData = {
    labels: ["Pending", "Processing", "Finalized"],
    datasets: [
      {
        label: "Orders Status",
        data: [pendingOrders, processingOrders, finalizedOrders],
        backgroundColor: isDark
          ? ["#D4AF37", "#D4AF37", "#D4AF37"]
          : ["#FFB020", "#007BFF", "#28A745"],
        borderRadius: 8,
        borderWidth: 1,
      },
    ],
  };

  // Updated menu options including "Contact Messages"
  const menuOptions = [
    { name: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { name: "Users", icon: Users, key: "users" },
    { name: "Orders", icon: ShoppingCart, key: "orders" },
    { name: "Drivers", icon: Truck, key: "drivers" },
    { name: "Riders", icon: User, key: "riders" },
    { name: "Products", icon: FileText, key: "products" },
    { name: "Settings", icon: SettingsIcon, key: "settings" },
    { name: "MerlizSellers", icon: User, key: "merlizsellers" },
    { name: "Contact Messages", icon: MessageSquare, key: "contacts" },
  ];

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${isDark ? "text-[#D4AF37]" : ""}`}>
                📊 Admin Dashboard
              </h1>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full transition-all duration-500 transform hover:scale-105 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
            <OrdersList isDark={isDark} showTable={false} />
            <div className="grid grid-cols-3 gap-6 mb-6">
              {[
                { label: "Pending", value: newOrders, icon: Bell, color: "bg-yellow-500" },
                { label: "Processing", value: processingOrders, icon: Loader, color: "bg-blue-500" },
                { label: "Finalized", value: finalizedOrders, icon: TrendingUp, color: "bg-green-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  className={`p-5 shadow rounded-lg flex flex-col items-center justify-between ${color} transition-all duration-500 transform hover:scale-105`}
                >
                  <h3 className="text-lg font-bold text-black">{label}</h3>
                  <Icon size={24} className="text-black" />
                  <p className="text-3xl font-bold text-black">{value}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {[
                { label: "Total Revenue", value: `R ${totalRevenue}`, icon: TrendingUp, color: "bg-gray-900" },
                { label: "Avg Order Value", value: `R ${avgOrderValue}`, icon: TrendingUp, color: "bg-indigo-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  className={`p-5 shadow rounded-lg flex flex-col items-center justify-between ${color} transition-all duration-500 transform hover:scale-105`}
                >
                  <h3 className="text-lg font-bold text-black">{label}</h3>
                  <Icon size={24} className="text-black" />
                  <p className="text-3xl font-bold text-black">{value}</p>
                </motion.div>
              ))}
            </div>
            <div className={`bg-white dark:bg-[#2c2d2f] p-6 shadow-lg rounded-lg mb-6 ${isDark ? "text-white" : "text-black"}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? "text-[#D4AF37]" : ""}`}>📈 Order Trends</h3>
              <div className="w-full h-[400px]">
                <BarChart data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </>
        );
      case "users":
        return <UsersList isDark={isDark} />;
      case "orders":
        return <OrdersList isDark={isDark} showTable={true} />;
      case "drivers":
        return <Drivers isDark={isDark} />;
      case "riders":
        return (
          <div className="p-5">
            <Riders isDark={isDark} />
          </div>
        );
      case "products":
        return (
          <div className="p-5">
            <Products isDark={isDark} />
          </div>
        );
      case "settings":
        return <SettingsPage />;
      case "merlizsellers":
        return (
          <div className="p-5">
            <MerlizsellersList isDark={isDark} />
          </div>
        );
      case "contacts":
        return (
          <div className="p-5">
            <ContactMessages isDark={isDark} />
          </div>
        );
      default:
        return <div className="p-5">Select an option from the sidebar.</div>;
    }
  };

  return (
    <div className={`flex min-h-screen ${isDark ? "bg-[#1b1c1e] text-white" : "bg-gray-100 text-black"}`}>
      {/* Sidebar */}
      <aside className={`w-64 p-5 h-screen shadow-md fixed top-0 left-0 flex flex-col ${isDark ? "bg-[#1b1c1e] text-[#D4AF37]" : "bg-white"}`}>
        <div>
          <h2 className={`text-xl font-bold mb-6 ${isDark ? "text-[#D4AF37]" : "text-green-700"}`}>
            🍽️ Admin Panel
          </h2>
          <ul className="space-y-4">
            {menuOptions.map(({ name, icon: Icon, key }) => (
              <li
                key={key}
                className={`flex items-center p-3 cursor-pointer font-bold transition-all duration-500 transform hover:scale-105 ${
                  view === key
                    ? isDark
                      ? "bg-gray-700 text-white"
                      : "bg-yellow-300 text-black"
                    : isDark
                    ? "hover:bg-gray-600"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => setView(key)}
              >
                <Icon className="mr-2" size={18} />
                {name}
              </li>
            ))}
          </ul>
        </div>
        {/* Logout button at bottom */}
        <div className="mt-auto">
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              router.push("/admin/login");
            }}
            className="w-full p-3 flex items-center justify-center cursor-pointer font-bold transition-all duration-500 transform hover:scale-105 hover:bg-red-700 text-white bg-red-500 rounded-md"
          >
            <LogOut className="mr-2" size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-10 ml-64 mr-64 ${isDark ? "bg-[#1b1c1e]" : ""}`}>
        {renderContent()}
      </main>

      {/* Trending Products */}
      <TrendingProducts isDark={isDark} />
    </div>
  );
}
