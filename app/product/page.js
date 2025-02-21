"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle,
  Menu,
  Share2,
  List,
  ShoppingBag,
  IceCream,
  Snowflake,
  Pizza,
} from "lucide-react";
import axios from "axios";

export default function ProductsPage() {
  // Theme
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);

  // Mobile/tablet sidebar toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Products data
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Order modal states
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("");

  // Guest details
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestAddress, setGuestAddress] = useState("");

  // Categories
  const categories = ["All", "PROTEIN FOODS", "CONFECTIONERY", "FROZEN FOODS", "BURGERS"];
  const categoryIcons = {
    All: <List size={18} />,
    "PROTEIN FOODS": <ShoppingBag size={18} />,
    CONFECTIONERY: <IceCream size={18} />,
    "FROZEN FOODS": <Snowflake size={18} />,
    BURGERS: <Pizza size={18} />,
  };

  // Colors & theme classes
  const gold = "#D4AF37";
  const bgClass = isDark ? "bg-black" : "bg-white";
  // Sidebar: always black background with bold white text.
  const sidebarClass = "bg-black font-bold border-r border-gray-700 text-white";
  // Product card styling
  const productCardClass = isDark ? "bg-black text-white" : "bg-white text-black";

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(
          "https://backend-2tr2.onrender.com/api/products"
        );
        const prods = data.products || [];
        setProducts(prods);
        setFilteredProducts(prods);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update filtered products when category changes
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  // Open order modal
  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setOrderQuantity("");
    setGuestName("");
    setGuestPhone("");
    setGuestAddress("");
    setOrderModalOpen(true);
  };

  // Handle share
  const handleShare = async (product) => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name === "InvalidStateError") {
          const mailtoLink = `mailto:?subject=${encodeURIComponent(
            shareData.title
          )}&body=${encodeURIComponent(
            shareData.text + "\n\n" + shareData.url
          )}`;
          window.location.href = mailtoLink;
        } else {
          console.error("Error sharing:", error);
        }
      }
    } else {
      const mailtoLink = `mailto:?subject=${encodeURIComponent(
        shareData.title
      )}&body=${encodeURIComponent(
        shareData.text + "\n\n" + shareData.url
      )}`;
      window.location.href = mailtoLink;
    }
  };

  // Submit order
  const handleOrderSubmit = async () => {
    if (!orderQuantity || Number(orderQuantity) < 1) {
      alert("Please enter a valid order quantity.");
      return;
    }
    if (!guestName || !guestPhone) {
      alert("Please enter your name and phone number.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("user", "null");
      formData.append("isGuest", "true");
      formData.append(
        "customerDetails",
        JSON.stringify({
          name: guestName,
          phone: guestPhone,
          address: guestAddress,
        })
      );
      formData.append(
        "product",
        JSON.stringify({
          productId: selectedProduct._id,
          name: selectedProduct.name,
          custom: false,
          description: selectedProduct.description,
          price: selectedProduct.price,
          size: selectedProduct.size || "",
        })
      );
      formData.append("quantity", orderQuantity);
      formData.append("status", "Pending");
      formData.append("images", JSON.stringify([selectedProduct.image]));

      await axios.post("https://backend-2tr2.onrender.com/api/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error submitting order:", error.response?.data || error.message);
      alert("There was an error submitting your order. Please try again.");
    } finally {
      setOrderModalOpen(false);
      setSelectedProduct(null);
      setOrderQuantity("");
      setGuestName("");
      setGuestPhone("");
      setGuestAddress("");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-2xl">Loading products...</div>;
  }
  if (error) {
    return (
      <div className="p-10 text-center text-2xl text-red-600">{error}</div>
    );
  }

  return (
    <div
      className={`
        ${bgClass}
        min-h-screen
        transition-colors
        duration-500
        flex
        flex-col
        overflow-x-hidden
      `}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {/* Mobile/Tablet: Hamburger menu */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 border rounded"
            style={{ borderColor: gold }}
          >
            <Menu size={24} />
          </button>
          <button
            onClick={toggleTheme}
            className="ml-4 p-2 border rounded transition-colors duration-500"
            style={{ borderColor: gold }}
          >
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1">
        {/* Desktop Sidebar (shown on large screens ≥1024px) */}
        <aside className={`hidden lg:block fixed top-0 left-0 h-full p-6 ${sidebarClass}`}>
          <h3 className="text-xl mb-4" style={{ color: gold }}>
            Filter by Category
          </h3>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li key={cat} className="relative group flex items-center">
                <div
                  className={`mr-2 transition-colors duration-300 ${
                    selectedCategory === cat
                      ? "text-yellow-300"
                      : "group-hover:text-yellow-300"
                  }`}
                >
                  {categoryIcons[cat]}
                </div>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left pl-2 pr-4 py-2 rounded transition-colors duration-300 ${
                    selectedCategory === cat
                      ? "bg-yellow-300 text-black border-l-4 border-yellow-300"
                      : "text-white group-hover:bg-yellow-300 group-hover:text-black"
                  }`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Mobile/Tablet Sidebar Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className={`fixed top-0 left-0 w-64 h-full p-6 ${sidebarClass} lg:hidden z-50`}
            >
              <div className="flex justify-end">
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              <h3 className="text-xl mb-4" style={{ color: gold }}>
                Filter by Category
              </h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat} className="relative group flex items-center">
                    <div
                      className={`mr-2 transition-colors duration-300 ${
                        selectedCategory === cat
                          ? "text-yellow-300"
                          : "group-hover:text-yellow-300"
                      }`}
                    >
                      {categoryIcons[cat]}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left pl-2 pr-4 py-2 rounded transition-colors duration-300 ${
                        selectedCategory === cat
                          ? "bg-yellow-300 text-black border-l-4 border-yellow-300"
                          : "text-white group-hover:bg-yellow-300 group-hover:text-black"
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <main className="flex-1 ml-0 lg:ml-72 p-6">
          {/* Center header on small screens */}
          <header className="mb-8 text-center">
            <h1
              className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? "text-white" : "text-black"}`}
            >
              Our Food Orders
            </h1>
            <p className={`mt-4 text-lg sm:text-xl ${isDark ? "text-white" : "text-black"}`}>
              Experience premium e‑hailing services and fast food orders.
            </p>
          </header>

          {/* Responsive grid */}
          <div className="grid responsive-grid gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`
                  ${productCardClass}
                  shadow-md
                  rounded-lg
                  overflow-hidden
                  flex flex-col
                  border
                  ${isDark ? "border-white" : "border-gray-300"}
                  text-sm sm:text-base
                  mx-auto
                  relative
                `}
                style={{
                  width: "85%",
                  maxWidth: "500px",
                }}
              >
                {/* Zoom the image ONLY on hover */}
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                  />
                )}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2">
                      {product.name}
                    </h2>
                    <p className="mb-4 text-sm sm:text-base">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl font-bold">
                      R {product.price}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOrderClick(product)}
                        className="px-3 py-2 rounded font-bold transition duration-300"
                        style={{
                          backgroundColor: gold,
                          color: "#000",
                          border: `2px solid ${gold}`,
                        }}
                      >
                        Order
                      </button>
                      <Share2
                        size={20}
                        className="cursor-pointer"
                        onClick={() => handleShare(product)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {orderModalOpen && selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative bg-white dark:bg-gray-800 p-4 md:p-5 rounded-lg shadow-xl w-full max-w-md text-sm">
              <button
                onClick={() => {
                  setOrderModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                <XCircle size={24} />
              </button>

              <h3 className="text-xl font-bold mb-2 text-center">
                Order {selectedProduct.name}
              </h3>
              <div className="mb-2">
                <p className="font-semibold">Price: R {selectedProduct.price}</p>
                <p className="font-semibold">Available: {selectedProduct.quantity}</p>
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">Quantity to Order</label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="w-full border p-1 rounded"
                  min="1"
                  max={selectedProduct.quantity}
                />
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border p-1 rounded"
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-2">
                <label className="block font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full border p-1 rounded"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Address (optional)</label>
                <input
                  type="text"
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  className="w-full border p-1 rounded"
                  placeholder="Enter your address"
                />
              </div>
              <div className="mb-3">
                <label className="block font-medium mb-1">Using Product Image</label>
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <button
                onClick={handleOrderSubmit}
                className="w-full font-bold px-3 py-2 rounded transition duration-300"
                style={{ backgroundColor: gold, color: "#000" }}
              >
                Confirm Order
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer always at bottom */}
      <footer
        className="px-8 py-6 border-t transition-colors duration-500 text-center text-base lg:text-lg"
        style={{
          borderColor: isDark ? gold : "#333",
          color: isDark ? "#fff" : "#000",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-8">
            <span>+27 66 375 8904</span>
            <span>info@merlizholdings.com</span>
          </div>
          <p className="mt-1">
            © {new Date().getFullYear()} MerLiz Holdings (PTY) Ltd. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Custom styles for responsive grid */}
      <style jsx global>{`
        @media (max-width: 480px) {
          .responsive-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 481px) and (max-width: 1023px) {
          .responsive-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .responsive-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
