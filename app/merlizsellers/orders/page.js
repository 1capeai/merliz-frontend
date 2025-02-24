"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, Trash, PlusCircle, Upload, Bell, Edit2 } from "lucide-react";

export default function SellerOrdersPage() {
  const [seller, setSeller] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOrders, setShowOrders] = useState(false); // Default to closed

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [orderToUpload, setOrderToUpload] = useState(null);
  const [uploadProofFile, setUploadProofFile] = useState(null);

  const categories = ["All", "FROZEN FOODS", "BURGERS", "PROTEIN FOODS", "CONFECTIONERY"];
  const gold = "#D4AF37";

  useEffect(() => {
    const storedSeller = localStorage.getItem("merlizsellersUser");
    if (storedSeller) {
      try {
        const parsedSeller = JSON.parse(storedSeller);
        setSeller(parsedSeller);
      } catch (err) {
        console.error("Error parsing seller data:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("https://backend-2tr2.onrender.com/api/products");
        const prods = data.products || data;
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

  const fetchSellerOrders = async () => {
    try {
      const { data } = await axios.get("https://backend-2tr2.onrender.com/api/orders");
      if (!seller || !seller.id) {
        console.warn("Seller information is missing for filtering orders.");
        return;
      }
      const sellerId = seller.id.toString();
      const sellerOrders = data.filter((order) => {
        if (!order.user) return false;
        let orderUserId = "";
        if (typeof order.user === "object" && order.user !== null) {
          orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
        } else {
          orderUserId = order.user.toString();
        }
        return orderUserId === sellerId;
      });
      setOrdersList(sellerOrders);
    } catch (err) {
      console.error("Error fetching seller orders:", err);
    }
  };

  useEffect(() => {
    if (seller) {
      fetchSellerOrders();
    }
  }, [seller]);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const [invoiceMapping, setInvoiceMapping] = useState({});

  useEffect(() => {
    const updateInvoiceMapping = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        ordersList.forEach(async (order) => {
          try {
            const res = await axios.get(`https://backend-2tr2.onrender.com/api/invoices/order/${order._id}`, { headers });
            if (res.data && res.data.invoice) {
              setInvoiceMapping((prev) => ({
                ...prev,
                [order._id]: res.data.invoice.invoiceNumber,
              }));
            }
          } catch (err) {
            // No invoice exists for this order.
          }
        });
      } catch (error) {
        console.error("Error updating invoice mapping:", error);
      }
    };
    if (ordersList.length > 0) updateInvoiceMapping();
  }, [ordersList]);

  const getSenderInfo = (order) => {
    if (order.isGuest) {
      return { role: "Guest", name: order.customerDetails?.name || "Guest" };
    }
    if (order.user && typeof order.user === "object") {
      return { role: order.user.role || "Admin", name: order.user.name || "Admin" };
    }
    if (order.user && typeof order.user === "string" && seller && order.user === seller.id) {
      return { role: seller.role, name: seller.name };
    }
    return { role: "Unknown", name: "Unknown" };
  };

  const handleOrderClick = (product) => {
    setSelectedProduct(product);
    setOrderQuantity("");
    setProofFile(null);
    setOrderModalOpen(true);
  };

  const handleUploadPayment = (order) => {
    setOrderToUpload(order);
    setUploadProofFile(null);
    setUploadModalOpen(true);
  };

  const handleProofChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleUploadProofChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadProofFile(e.target.files[0]);
    }
  };

  const handleOrderSubmit = async () => {
    if (!orderQuantity || Number(orderQuantity) < 1) {
      alert("Please enter a valid order quantity.");
      return;
    }
    if (!seller || !seller.id) {
      alert("Seller information is missing. Please log in again.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("user", seller.id);
      formData.append(
        "customerDetails",
        JSON.stringify({
          name: seller.name,
          phone: seller.phone,
          address: seller.address,
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
      const paymentStatus = proofFile ? "pending" : "missing";
      formData.append("paymentStatus", paymentStatus);
      if (proofFile) {
        formData.append("proof", proofFile);
      }
      await axios.post("https://backend-2tr2.onrender.com/api/orders", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Order placed successfully!");
      fetchSellerOrders();
    } catch (error) {
      console.error("Error submitting order:", error.response?.data || error.message);
      alert("There was an error submitting your order. Please try again.");
    } finally {
      setOrderModalOpen(false);
      setSelectedProduct(null);
      setOrderQuantity("");
      setProofFile(null);
    }
  };

  const handleUploadPaymentSubmit = async () => {
    if (!uploadProofFile) {
      alert("Please select a payment slip file.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("paymentStatus", "pending");
      formData.append("proof", uploadProofFile);
      await axios.put(`https://backend-2tr2.onrender.com/api/orders/update/${orderToUpload._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Payment slip uploaded successfully!");
      fetchSellerOrders();
    } catch (error) {
      console.error("Error uploading payment slip:", error.response?.data || error.message);
      alert("There was an error uploading your payment slip. Please try again.");
    } finally {
      setUploadModalOpen(false);
      setOrderToUpload(null);
      setUploadProofFile(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`https://backend-2tr2.onrender.com/api/orders/${orderId}`);
      alert("Order deleted successfully!");
      fetchSellerOrders();
    } catch (error) {
      console.error("Error deleting order:", error.response?.data || error.message);
      alert("There was an error deleting the order. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-2xl">Loading products...</div>;
  }
  if (error) {
    return <div className="p-10 text-center text-2xl text-red-600">{error}</div>;
  }

  return (
    <div className="flex flex-col p-4 gap-4">
      {/* Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowOrders(!showOrders)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showOrders ? "Hide Orders" : "View Orders"}
        </button>
      </div>

      {/* Orders Table */}
      {showOrders && (
        <div className="mb-4 overflow-x-auto">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          {ordersList.length > 0 ? (
            <table className="w-full border-collapse min-w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Order ID</th>
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Sender Role</th>
                  <th className="p-2 border">Sender Name</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Payment</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order) => {
                  const { role: senderRole, name: senderName } = getSenderInfo(order);
                  return (
                    <tr key={order._id} className="border">
                      <td className="p-2" data-label="Order ID">{order._id}</td>
                      <td className="p-2" data-label="Product">{order.product?.name || "N/A"}</td>
                      <td className="p-2" data-label="Sender Role">{senderRole}</td>
                      <td className="p-2" data-label="Sender Name">{senderName}</td>
                      <td className="p-2" data-label="Status">{order.status}</td>
                      <td className="p-2" data-label="Payment">
                        {order.paymentStatus
                          ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                          : "Missing"}
                      </td>
                      <td className="p-2 flex gap-2" data-label="Action">
                        {order.paymentStatus === "missing" && (
                          <button
                            onClick={() => handleUploadPayment(order)}
                            className="bg-green-500 text-white px-2 py-1 rounded"
                          >
                            Upload Payment Slip
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No orders placed yet.</p>
          )}
        </div>
      )}

      {/* Place a New Order Section */}
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-4">Place a New Order</h1>
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`m-1 px-4 py-2 rounded ${
                selectedCategory === cat ? "bg-yellow-300" : "bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white shadow rounded p-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-4 cursor-pointer"
                  onClick={() => setImageModalOpen(true)}
                />
              )}
              <h2 className="text-2xl font-semibold">{product.name}</h2>
              <p className="text-lg">Price: R {product.price}</p>
              <button
                onClick={() => handleOrderClick(product)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Place Order
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Order Modal for placing a new order */}
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
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative"
            >
              <button
                onClick={() => {
                  setOrderModalOpen(false);
                  setSelectedProduct(null);
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <XCircle size={28} />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center">
                Order {selectedProduct.name}
              </h3>
              <div className="mb-4">
                <p className="text-lg">Price: R {selectedProduct.price}</p>
                <p className="text-lg">Available: {selectedProduct.quantity}</p>
              </div>
              {/* Product image preview */}
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">
                  Product Image
                </label>
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-cover rounded cursor-pointer"
                    onClick={() => setImageModalOpen(true)}
                  />
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">
                  Quantity to Order
                </label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="w-full border p-2 rounded"
                  min="1"
                  max={selectedProduct.quantity}
                />
              </div>
              {/* Proof of Payment Upload for new order */}
              <div className="mb-4">
                <label className="block text-lg font-semibold mb-2">
                  Upload Proof of Payment (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofChange}
                  className="border p-1 rounded"
                />
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

      {/* Upload Modal for existing order payment slip */}
      <AnimatePresence>
        {uploadModalOpen && orderToUpload && (
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
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative"
            >
              <button
                onClick={() => {
                  setUploadModalOpen(false);
                  setOrderToUpload(null);
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <XCircle size={28} />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center">
                Upload Payment Slip for Order {orderToUpload._id}
              </h3>
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProofChange}
                  className="border p-1 rounded"
                />
              </div>
              <button
                onClick={handleUploadPaymentSubmit}
                className="w-full font-bold px-4 py-2 rounded transition duration-300"
                style={{ backgroundColor: gold, color: "#000" }}
              >
                Submit Payment Slip
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {imageModalOpen && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="max-w-full max-h-full rounded shadow-xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
