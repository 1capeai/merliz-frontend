"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, PlusCircle, Upload, Bell, Edit2 } from "lucide-react";
import axios from "axios";

// Static list of products for product selection modal
const staticProducts = [
  {
    category: "Frozen Foods",
    subcategory: "Frozen Fries",
    name: "1KG 10mm Frozen Fries",
    price: 55,
    image: "/FROZEN FRIES.jpg",
  },
  {
    category: "Frozen Foods",
    subcategory: "Chicken Strips",
    name: "1KG Chicken Strips (Original)",
    price: 110,
    image: "/ORIGINAL CHICKEN STRIPS.jpg",
  },
  {
    category: "Frozen Foods",
    subcategory: "Chicken Strips",
    name: "1KG Chicken Strips (Hot & Spicy)",
    price: 110,
    image: "/1KG CHICKEN STRIPS (HOT & SPICY).jpg",
  },
  {
    category: "Frozen Foods",
    subcategory: "Chicken Strips",
    name: "1KG Crumbed Chicken Strips (Cheesy)",
    price: 110,
    soldOut: true,
    image: "/LEKKA CRUMBED CHICKEN STRIPS.jpg",
  },
  {
    category: "Burgers",
    subcategory: "Chicken Burgers & Schnitzels",
    name: "Crumbed Chicken Burgers (Original)",
    price: 90,
    soldOut: true,
    image: "/MEGA CHICKEN BURGERS.jpg",
  },
  {
    category: "Burgers",
    subcategory: "Chicken Burgers & Schnitzels",
    name: "1.15KG Mega Crumbed Chicken Burgers (Original)",
    price: 110,
    image: "/MEGA CHICKEN BURGERS.jpg",
  },
  {
    category: "Burgers",
    subcategory: "Chicken Burgers & Schnitzels",
    name: "Crumbed Chicken Burger (Chilli Cheese)",
    price: 90,
    soldOut: true,
    image: "/Crumbed Chicken Burger (Chilli Cheese).jpg",
  },
  {
    category: "Burgers",
    subcategory: "Chicken Burgers & Schnitzels",
    name: "Crumbed Chicken Burger (Cheesy)",
    price: 90,
    image: "/Crumbed Chicken Burger (Cheesy).jpg",
  },
  {
    category: "Burgers",
    subcategory: "Chicken Burgers & Schnitzels",
    name: "1KG Chicken Schnitzel (Original)",
    price: 110,
    image: "/ORIGINAL CHICKEN SCHNITZEL.jpg",
  },
  {
    category: "Burgers",
    subcategory: "Chicken Burgers & Schnitzels",
    name: "1KG Chicken Schnitzel (Cheesy)",
    price: 110,
    image: "/ORIGINAL CHICKEN SCHNITZEL.jpg",
  },
  {
    category: "Protein Foods",
    name: "Eggs (Tray of 30)",
    price: 100,
    image: "/Eggs (Tray of 30).jpg",
  },
  {
    category: "Confectionery",
    subcategory: "Biscuit Tubs",
    name: "Family Treat Biscuit Tub",
    description: "1KG tub of Lekka biscuits (bucket included)",
    price: 140,
    image: "/FAMILY TREAT BISCUIT TUB.jpg",
  },
  {
    category: "Confectionery",
    subcategory: "Biscuit Tubs",
    name: "Mega Biscuits Tub",
    description: "1KG tub of mixed chocolate butter biscuits (tub included for storage)",
    price: 140,
    image: "/MEGA BISCUITS TUB.jpg",
  },
];

// Group products by category/subcategory for selection modal
const groupedProducts = staticProducts.reduce((acc, product) => {
  const { category, subcategory = "Others" } = product;
  if (!acc[category]) acc[category] = {};
  if (!acc[category][subcategory]) acc[category][subcategory] = [];
  acc[category][subcategory].push(product);
  return acc;
}, {});

export default function OrdersList({ isDark, showTable = false }) {
  // Dummy user id – replace with your actual authenticated user's id if needed
  const dummyUserId = "6432f7ea3b74a10f0c9f9f9a";

  // States for create order form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [useCustomProduct, setUseCustomProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [newOrder, setNewOrder] = useState({
    user: dummyUserId,
    role: "admin", // Only admin can update orders
    productName: "",
    price: "",
    customName: "",
    customDescription: "",
    quantity: 1,
    size: "",
    status: "Pending",
    images: [],
  });

  // States for orders table
  const [ordersList, setOrdersList] = useState([]);
  // States for editing an order
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("New Order State:", newOrder);
  }, [newOrder]);

  useEffect(() => {
    console.log("Selected Order for Editing:", selectedOrder);
  }, [selectedOrder]);

  // Fetch orders for table (admin only)
  const fetchOrdersList = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get("https://backend-2tr2.onrender.com/api/orders", { headers });
      console.log("Fetched Orders:", data);
      setOrdersList(data);
    } catch (error) {
      console.error("Error fetching orders list:", error);
    }
  };

  useEffect(() => {
    if (showTable) {
      fetchOrdersList();
    }
  }, [showTable]);

  // Update order status (admin only)
  const updateOrderState = async (orderId, newStatus) => {
    console.log("Updating order", orderId, "to status", newStatus);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `https://backend-2tr2.onrender.com/api/orders/update/${orderId}`,
        { status: newStatus },
        { headers }
      );
      fetchOrdersList();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  // Delete order (admin only)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`https://backend-2tr2.onrender.com/api/orders/${orderId}`, { headers });
      console.log("Order deleted successfully");
      fetchOrdersList();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  // Open edit modal (only admin can edit orders)
  const handleEditOrder = (order) => {
    console.log("Editing order:", order);
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  // Save edits from modal (admin only)
  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    console.log("Saving edits for order:", selectedOrder);
    setIsEditSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        return;
      }
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };
      const formData = new FormData();
      formData.append("status", selectedOrder.status);
      formData.append("price", selectedOrder.product?.price || selectedOrder.price);
      formData.append("size", selectedOrder.product?.size || selectedOrder.size);
      formData.append("quantity", selectedOrder.quantity);
      if (selectedOrder.customName !== undefined) {
        formData.append("customName", selectedOrder.customName);
      }
      if (selectedOrder.customDescription !== undefined) {
        formData.append("customDescription", selectedOrder.customDescription);
      }
      if (selectedOrder.newImage) {
        formData.append("image", selectedOrder.newImage);
      }
      console.log("FormData entries for edit:");
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      const response = await axios.put(
        `https://backend-2tr2.onrender.com/api/orders/update/${selectedOrder._id}`,
        formData,
        { headers }
      );
      console.log("Order updated (from modal):", response.data);
      setIsEditModalOpen(false);
      setSelectedOrder(null);
      fetchOrdersList();
    } catch (error) {
      console.error("Error saving order edit:", error);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Toggle custom product option in the create form
  const toggleCustomProduct = () => {
    setUseCustomProduct(!useCustomProduct);
    setNewOrder((prev) => ({
      ...prev,
      productName: "",
      customName: "",
      customDescription: "",
      price: "",
    }));
  };

  // When a product is selected from the product selection modal
  const handleSelectProduct = (product) => {
    if (product.soldOut) return;
    console.log("Product selected:", product);
    setNewOrder((prev) => ({
      ...prev,
      productName: product.name,
      price: product.price,
    }));
    setIsProductModalOpen(false);
  };

  // Handle image upload for create form (up to 9 images)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 9) {
      alert("You can upload up to 9 images only.");
      return;
    }
    setNewOrder((prev) => ({ ...prev, images: files }));
  };

  // Handle order creation (POST new order)
  const handleCreateOrder = async () => {
    console.log("Creating order with data:", newOrder);
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("user", newOrder.user);
      formData.append("role", newOrder.role);
      if (useCustomProduct) {
        formData.append("customName", newOrder.customName);
        formData.append("customDescription", newOrder.customDescription);
      } else {
        formData.append("productName", newOrder.productName);
      }
      formData.append("quantity", newOrder.quantity);
      formData.append("size", newOrder.size);
      formData.append("price", newOrder.price);
      formData.append("status", newOrder.status);
      newOrder.images.forEach((file) => {
        formData.append("images", file);
      });
      // Log all FormData entries
      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      const response = await axios.post("https://backend-2tr2.onrender.com/api/orders", formData);
      console.log("Order Created!", response.data);
      setOrderCreated(true);
      // ... rest of the code
    } catch (err) {
      console.error("🚨 Error creating order:", err.response?.data || err.message);
      setIsSubmitting(false);
    }
  };
  

  return (
    <div>
      {/* Create Order Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="bg-yellow-400 px-5 py-2 rounded-md font-semibold flex items-center mb-4 text-black"
      >
        <PlusCircle size={20} className="mr-2" /> Create New Order
      </button>

      {/* Create Order Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 relative">
              <h3 className="text-2xl font-bold mb-4 text-center">📝 Create New Order</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <XCircle size={28} />
              </button>
              <div className="flex items-center my-3">
                <label className="mr-2 font-bold">Role:</label>
                <select
                  value={newOrder.role}
                  onChange={(e) => setNewOrder({ ...newOrder, role: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="MerlizSellers">MerlizSellers</option>
                </select>
              </div>
              <div className="flex items-center my-3">
                <input
                  type="checkbox"
                  checked={useCustomProduct}
                  onChange={toggleCustomProduct}
                  className="mr-2"
                />
                <span className="text-lg">Add Customized Product</span>
              </div>
              {useCustomProduct ? (
                <>
                  <input
                    type="text"
                    placeholder="Custom Product Name"
                    value={newOrder.customName}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, customName: e.target.value })
                    }
                    className="border p-2 w-full my-3 rounded"
                  />
                  <textarea
                    placeholder="Custom Product Description"
                    value={newOrder.customDescription}
                    onChange={(e) =>
                      setNewOrder({ ...newOrder, customDescription: e.target.value })
                    }
                    className="border p-2 w-full my-3 rounded"
                  ></textarea>
                  <input
                    type="number"
                    placeholder="Price"
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                    className="border p-2 w-full my-3 rounded"
                  />
                </>
              ) : (
                <>
                  <div className="border p-2 w-full my-3 rounded">
                    <strong>Selected Product: </strong>
                    {newOrder.productName || "None"}
                  </div>
                  <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-3 hover:bg-blue-700"
                  >
                    Select Product
                  </button>
                  {newOrder.productName && (
                    <div className="border p-2 w-full my-3 text-gray-600 rounded">
                      <strong>Price:</strong> {newOrder.price}
                    </div>
                  )}
                </>
              )}
              <input
                type="text"
                placeholder="Size (e.g. 1KG, 500g)"
                value={newOrder.size}
                onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                className="border p-2 w-full my-3 rounded"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newOrder.quantity}
                min="1"
                onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                className="border p-2 w-full my-3 rounded"
              />
              <select
                value={newOrder.status}
                onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                className="border p-2 w-full my-3 rounded"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Finalized">Finalized</option>
              </select>
              <label className="border p-2 w-full flex items-center justify-center cursor-pointer my-3 rounded hover:bg-gray-100">
                <Upload size={20} className="mr-2" /> Upload Product Images (up to 9)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCreateOrder}
                className="bg-green-600 text-white px-4 py-2 rounded w-full mt-3 flex items-center justify-center hover:bg-green-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Order..." : "Submit Order"}
              </button>
              {orderCreated && (
                <div className="mt-4 text-center text-green-600 font-bold">
                  Order Created Successfully!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProductModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-2xl w-3/4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-center">Select a Product</h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <XCircle size={28} />
              </button>
              {Object.keys(groupedProducts).map((category) => (
                <div key={category} className="mb-6">
                  <h4 className="text-2xl font-semibold border-b pb-2">{category}</h4>
                  {Object.keys(groupedProducts[category]).map((subcategory) => (
                    <div key={subcategory} className="ml-4 mb-4">
                      <h5 className="text-xl font-medium">{subcategory}</h5>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                        {groupedProducts[category][subcategory].map((product, i) => (
                          <button
                            key={i}
                            disabled={product.soldOut}
                            onClick={() => handleSelectProduct(product)}
                            className={`border rounded-lg p-2 hover:shadow-lg transition ${
                              product.soldOut
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded mb-2"
                            />
                            <div className="font-semibold text-sm text-center">{product.name}</div>
                            <div className="text-xs text-gray-600 text-center">{product.price}</div>
                            {product.soldOut && (
                              <div className="text-xs text-red-500 mt-1 text-center">Sold Out</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showTable && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <h3 className="text-xl font-bold mb-4">All Orders</h3>
            {ordersList.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Order ID</th>
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Notify Customers</th>
                    <th className="p-2 border">Edit</th>
                    <th className="p-2 border">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order) => (
                    <motion.tr
                      key={order._id}
                      className="border cursor-pointer"
                      whileHover={{ backgroundColor: "#4a4a4a", color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleEditOrder(order)}
                    >
                      <td className="p-2">{order._id}</td>
                      <td className="p-2">
                        {order.images && order.images.length > 0 ? (
                          <img
                            src={order.images[0]}
                            alt={order.product?.name || "Product Image"}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2">
                        {order.product && order.product.name ? order.product.name : "N/A"}
                      </td>
                      <td className="p-2">{order.status}</td>
                      <td className="p-2 flex items-center justify-center gap-1">
                        <Bell size={20} />
                        <span>Send Message</span>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOrder(order);
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                      <td className="p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order._id);
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          <XCircle size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No orders available.</p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {isEditModalOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 relative">
              <h3 className="text-2xl font-bold mb-4 text-center">Edit Order</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              >
                <XCircle size={28} />
              </button>
              <div className="mb-4">
                <label className="block font-bold mb-1">Order ID:</label>
                <p>{selectedOrder._id}</p>
              </div>
              <div className="mb-4 flex items-center">
                <label className="block font-bold mr-4">Product Image:</label>
                {selectedOrder.images && selectedOrder.images.length > 0 ? (
                  <img
                    src={selectedOrder.images[0]}
                    alt={selectedOrder.product?.name || "Product Image"}
                    className="w-12 h-12 object-cover rounded mr-4"
                  />
                ) : (
                  <span className="mr-4">N/A</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedOrder({
                      ...selectedOrder,
                      newImage: e.target.files[0],
                    })
                  }
                  className="border p-1 rounded"
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block font-bold mr-4">Product:</label>
                <p>{selectedOrder.product && selectedOrder.product.name ? selectedOrder.product.name : "N/A"}</p>
              </div>
              <div className="mb-4">
                <label className="block font-bold mb-1">Price:</label>
                <input
                  type="number"
                  value={selectedOrder.product?.price || selectedOrder.price}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, price: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block font-bold mb-1">Size (e.g. 1KG, 500g):</label>
                <input
                  type="text"
                  value={selectedOrder.product?.size || selectedOrder.size}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, size: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block font-bold mb-1">Quantity:</label>
                <input
                  type="number"
                  value={selectedOrder.quantity}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, quantity: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              {selectedOrder.customName !== undefined && (
                <>
                  <div className="mb-4">
                    <label className="block font-bold mb-1">Custom Product Name:</label>
                    <input
                      type="text"
                      value={selectedOrder.customName || ""}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, customName: e.target.value })
                      }
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-bold mb-1">Custom Product Description:</label>
                    <textarea
                      value={selectedOrder.customDescription || ""}
                      onChange={(e) =>
                        setSelectedOrder({ ...selectedOrder, customDescription: e.target.value })
                      }
                      className="border p-2 rounded w-full"
                    ></textarea>
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block font-bold mb-1">Status:</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    setSelectedOrder({ ...selectedOrder, status: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Finalized">Finalized</option>
                </select>
              </div>
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700 flex items-center justify-center"
                disabled={isEditSubmitting}
              >
                {isEditSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
