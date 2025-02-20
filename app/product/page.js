"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";

export default function ProductsPage() {
  // Theme
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);

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

  // Fixed categories for filtering
  const categories = ["All", "PROTEIN FOODS", "CONFECTIONERY", "FROZEN FOODS", "BURGERS"];

  // Colors & theme classes
  const gold = "#D4AF37";
  const bgClass = isDark ? "bg-black" : "bg-white";
  const textClass = isDark ? "text-white" : "text-black";
  // For sidebar we use:
  const sidebarClass = isDark
    ? "bg-black text-white border-r border-gray-700"
    : "bg-gray-100 text-black border-r border-gray-300";
  // Product card styling: apply a white border in dark mode
  const productCardClass = isDark ? "bg-black text-white" : "bg-white text-black";

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("https://backend-2tr2.onrender.com/api/products");
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

  // Submit order using product's image URL from the UI
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
      // Guest order: user is null and isGuest true
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
      // Append quantity and status
      formData.append("quantity", orderQuantity);
      formData.append("status", "Pending");
      // Append the product's image URL as a JSON string
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
    return <div className="p-10 text-center text-2xl text-red-600">{error}</div>;
  }

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-500`}>
      {/* Top theme toggle */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className="p-2 border rounded transition-colors duration-500"
          style={{ borderColor: gold }}
        >
          {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>
      <div className="flex">
        {/* Sidebar Filter */}
        <aside className={`w-64 fixed top-0 left-0 h-full p-6 ${sidebarClass}`}>
          <h3 className="text-xl font-bold mb-4" style={{ color: gold }}>
            Filter by Category
          </h3>
          <ul className="space-y-4">
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-4 py-2 rounded transition-colors duration-300 ${
                    selectedCategory === cat ? "bg-yellow-300 text-black" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  } ${textClass}`}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Products Grid */}
        <main className="flex-1 ml-72 p-6">
          <header className="mb-8 text-center">
            <h1 className={`text-4xl font-bold ${isDark ? "text-white" : "text-black"}`}>
              Our Food Orders
            </h1>
            <p className={`mt-4 text-xl ${isDark ? "text-white" : "text-black"}`}>
              Experience premium e‑hailing services and fast food orders.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                className={`${productCardClass} ${isDark ? "border border-white" : "border border-gray-300"} shadow-md rounded-lg overflow-hidden flex flex-col max-w-sm mx-auto`}
                whileHover={{ scale: 1.05 }}
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                  />
                )}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                    <p className="mb-4">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">R {product.price}</span>
                    <button
                      onClick={() => handleOrderClick(product)}
                      className="px-4 py-2 rounded font-bold transition duration-300"
                      style={{ backgroundColor: "#fff", color: "#000", border: `2px solid ${gold}` }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
      {/* Order Modal */}
      <AnimatePresence>
        {orderModalOpen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative"
            >
              <button
                onClick={() => {
                  setOrderModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                <XCircle size={28} />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center">Order {selectedProduct.name}</h3>
              <div className="mb-4">
                <p className="text-lg">Price: R {selectedProduct.price}</p>
                <p className="text-lg">Available: {selectedProduct.quantity}</p>
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">Quantity to Order</label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="w-full border p-2 rounded"
                  min="1"
                  max={selectedProduct.quantity}
                />
              </div>
              {/* Guest details */}
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">Phone Number</label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">Address (optional)</label>
                <input
                  type="text"
                  value={guestAddress}
                  onChange={(e) => setGuestAddress(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Enter your address"
                />
              </div>
              {/* Display product image */}
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">Using Product Image</label>
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <button
                onClick={handleOrderSubmit}
                className="w-full font-bold px-4 py-2 rounded transition duration-300"
                style={{ backgroundColor: gold, color: "#000" }}
              >
                Confirm Order
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        className="px-8 py-6 border-t transition-colors duration-500 text-center text-2xl"
        style={{ borderColor: isDark ? gold : "#333", color: isDark ? "#fff" : "#000" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-8">
            <span>+27 66 375 8904</span>
            <span>info@merlizholdings.com</span>
          </div>
          <p className="mt-2">
            © {new Date().getFullYear()} MerLiz Holdings (PTY) Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
