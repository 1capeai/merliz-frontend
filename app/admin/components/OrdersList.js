"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, PlusCircle, Upload, Edit2, XCircle as DeleteIcon } from "lucide-react";
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
  const router = useRouter();

  // Use dynamic admin data from localStorage
  const [newOrder, setNewOrder] = useState({
    user: "", // to be populated from localStorage
    role: "Admin", // default role for orders created by admin
    productName: "",
    price: "",
    customName: "",
    customDescription: "",
    quantity: 1,
    size: "",
    status: "Pending",
    images: [],
    imageUrl: "",
  });

  // Other state variables
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [useCustomProduct, setUseCustomProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [ordersList, setOrdersList] = useState([]);
  const [invoiceMapping, setInvoiceMapping] = useState({});
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [uploadProofFile, setUploadProofFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New: State for mapping user IDs to user objects fetched from /api/admin/users
  const [usersMapping, setUsersMapping] = useState({});

  // On mount, retrieve the admin user from localStorage and update newOrder state
  useEffect(() => {
    const storedAdmin = localStorage.getItem("adminUser");
    console.log("Stored admin:", storedAdmin);
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        console.log("Parsed admin user details:", parsedAdmin);
        setNewOrder((prev) => ({
          ...prev,
          user: parsedAdmin.id,
          role: parsedAdmin.role, // Should be "Admin"
        }));
      } catch (err) {
        console.error("Error parsing admin user data:", err);
      }
    } else {
      // Instead of logging an error, log a warning and use fallback admin
      console.warn("No admin user found in localStorage; using fallback admin.");
      setNewOrder((prev) => ({ ...prev, user: "613a1f1e1f1e1f1e1f1e1f1e", role: "Admin" }));
      // Optionally, redirect to login: router.push("/admin/login");
    }
  }, [router]);

  // Fetch users mapping from /api/admin/users
  useEffect(() => {
    const fetchUsersMapping = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          console.error("No admin token found");
          return;
        }
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get("https://backend-2tr2.onrender.com/api/admin/users", { headers });
        const mapping = {};
        res.data.forEach((user) => {
          mapping[user._id] = user;
        });
        setUsersMapping(mapping);
        console.log("Fetched users mapping:", mapping);
      } catch (error) {
        console.error("Error fetching users mapping:", error);
      }
    };
    fetchUsersMapping();
  }, []);

  // Fetch orders list from backend and update invoice mapping
  const fetchOrdersList = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("Admin token:", token);
      if (!token) {
        console.error("No admin token found");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get("https://backend-2tr2.onrender.com/api/orders", { headers });
      console.log("Fetched orders from backend:", data);
      setOrdersList(data);

      // For each order, check if an invoice exists
      data.forEach(async (order) => {
        try {
          const res = await axios.get(`https://backend-2tr2.onrender.com/api/invoices/order/${order._id}`, { headers });
          if (res.data && res.data.invoice) {
            setInvoiceMapping((prev) => ({
              ...prev,
              [order._id]: res.data.invoice.invoiceNumber,
            }));
            console.log(`Invoice for order ${order._id}: ${res.data.invoice.invoiceNumber}`);
          } else {
            console.log(`No invoice for order ${order._id}`);
          }
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.log(`No invoice found for order ${order._id} (404)`);
          } else {
            console.error(`Error fetching invoice for order ${order._id}:`, err.message);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching orders list:", error);
    }
  };

  useEffect(() => {
    if (showTable) {
      fetchOrdersList();
    }
  }, [showTable]);

  // Helper: get sender info from an order.
  const getSenderInfo = (order) => {
    if (order.isGuest) {
      console.log(`Order ${order._id} is a guest order; customer name: ${order.customerDetails?.name}`);
      return { role: "Guest", name: order.customerDetails?.name || "Guest" };
    }
    if (order.user && order.user.role) {
      console.log(`Order ${order._id} populated user data: ${JSON.stringify(order.user)}`);
      return { role: order.user.role, name: order.user.name || "Unknown" };
    }
    if (order.user && usersMapping[order.user]) {
      console.log(`Order ${order._id} found user in mapping: ${JSON.stringify(usersMapping[order.user])}`);
      return { role: usersMapping[order.user].role, name: usersMapping[order.user].name || "Unknown" };
    }
    console.log(`Order ${order._id} has no user data; senderRole: ${order.senderRole}`);
    return { role: order.senderRole || "Admin", name: "Admin" };
  };

  // View order details
  const handleViewDetails = (order) => {
    console.log("Viewing details for order:", order._id);
    router.push(`/admin/orders/${order._id}`);
  };

  // Generate or view invoice for an order
  const handleGenerateInvoice = async (order) => {
    if (order.status !== "Finalized") {
      console.log(`Order ${order._id} status is not finalized: ${order.status}`);
      setWarningMessage("You must change the order status to 'Finalized' before generating or viewing an invoice.");
      setIsWarningModalOpen(true);
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      console.log("Generating invoice for order:", order._id);
      if (!token) {
        alert("No admin token found");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      if (invoiceMapping[order._id]) {
        console.log(`Invoice exists for order ${order._id}: ${invoiceMapping[order._id]}`);
        router.push(`/admin/invoices/${invoiceMapping[order._id]}`);
      } else {
        const { data } = await axios.post("https://backend-2tr2.onrender.com/api/invoices", { orderId: order._id }, { headers });
        console.log("Invoice generated for order:", order._id, "Invoice number:", data.invoice.invoiceNumber);
        setInvoiceMapping((prev) => ({
          ...prev,
          [order._id]: data.invoice.invoiceNumber,
        }));
        router.push(`/admin/invoices/${data.invoice.invoiceNumber}`);
      }
    } catch (error) {
      console.error("Error generating invoice:", error.response?.data || error.message);
      alert("Error generating invoice: " + (error.response?.data?.error || error.message));
    }
  };

  // Create Order function for Admin
  const handleCreateOrder = async () => {
    // Allow creation if a product is selected OR a manual product name is provided.
    if (!selectedProduct && !newOrder.productName) {
      console.error("No product selected and no product name provided! Cannot create order.");
      return;
    }
    // Ensure admin user is set.
    if (!newOrder.user) {
      console.error("No admin user found; cannot create order.");
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("user", newOrder.user);
      // Do not send role from the client; the backend sets senderRole.
      formData.append(
        "customerDetails",
        JSON.stringify({
          name: newOrder.name || "N/A",
          phone: newOrder.phone || "",
          address: newOrder.address || "",
        })
      );
      let productData;
      if (selectedProduct) {
        productData = {
          productId: selectedProduct._id ? selectedProduct._id : null,
          name: selectedProduct.name,
          custom: false,
          description: selectedProduct.description || "",
          price: selectedProduct.price,
          size: selectedProduct.size || "",
        };
      } else {
        productData = {
          productId: null,
          name: newOrder.productName,
          custom: false,
          description: "",
          price: newOrder.price,
          size: newOrder.size || "",
        };
      }
      formData.append("product", JSON.stringify(productData));
      formData.append("quantity", newOrder.quantity);
      formData.append("status", newOrder.status);
      if (newOrder.images && newOrder.images.length > 0) {
        newOrder.images.forEach((file) => formData.append("images", file));
      } else if (newOrder.imageUrl) {
        formData.append("images", JSON.stringify([newOrder.imageUrl]));
      }
      console.log("Creating order with newOrder:", newOrder);
      console.log("Selected product for order:", selectedProduct);
      const response = await axios.post("https://backend-2tr2.onrender.com/api/orders", formData);
      console.log("Order created successfully:", response.data);
      setOrderCreated(true);
      fetchOrdersList();
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err.message, err);
      setIsSubmitting(false);
    }
  };

  const updateOrderState = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      console.log("Updating order", orderId, "to status", newStatus);
      await axios.put(`https://backend-2tr2.onrender.com/api/orders/update/${orderId}`, { status: newStatus }, { headers });
      fetchOrdersList();
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      console.log("Deleting order:", orderId);
      await axios.delete(`https://backend-2tr2.onrender.com/api/orders/${orderId}`, { headers });
      fetchOrdersList();
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleEditOrder = (order) => {
    console.log("Editing order:", order._id);
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    setIsEditSubmitting(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" };
      const formData = new FormData();
      formData.append("status", selectedOrder.status);
      formData.append("price", selectedOrder.product?.price || selectedOrder.price);
      formData.append("size", selectedOrder.product?.size || selectedOrder.size);
      formData.append("quantity", selectedOrder.quantity);
      if (selectedOrder.customName !== undefined)
        formData.append("customName", selectedOrder.customName);
      if (selectedOrder.customDescription !== undefined)
        formData.append("customDescription", selectedOrder.customDescription);
      if (selectedOrder.newImage)
        formData.append("image", selectedOrder.newImage);
      console.log("Saving edited order:", selectedOrder._id, "with data:", selectedOrder);
      await axios.put(`https://backend-2tr2.onrender.com/api/orders/update/${selectedOrder._id}`, formData, { headers });
      setIsEditModalOpen(false);
      setSelectedOrder(null);
      fetchOrdersList();
    } catch (error) {
      console.error("Error saving order edit:", error);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const toggleCustomProduct = () => {
    setUseCustomProduct(!useCustomProduct);
    setNewOrder((prev) => ({ ...prev, productName: "", customName: "", customDescription: "", price: "" }));
  };

  const handleSelectProduct = (product) => {
    if (product.soldOut) return;
    console.log("Selected product:", product);
    setNewOrder((prev) => ({
      ...prev,
      productName: product.name,
      price: product.price,
      imageUrl: product.image,
    }));
    setIsProductModalOpen(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 9) {
      alert("You can upload up to 9 images only.");
      return;
    }
    console.log("Uploaded image files:", files);
    setNewOrder((prev) => ({ ...prev, images: files }));
  };

  const handleSearch = () => {
    // Filter orders based on search query
    const filteredOrders = ordersList.filter((order) => {
      const invoiceNumber = invoiceMapping[order._id] || "";
      const senderName = getSenderInfo(order).name || "";
      return (
        invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        senderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setOrdersList(filteredOrders);
  };

  return (
    <div>
      {/* Warning Modal */}
      <AnimatePresence>
        {isWarningModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl w-1/3 relative">
              <h3 className="text-2xl font-bold mb-4 text-center">Warning</h3>
              <p className="mb-4 text-center">{warningMessage}</p>
              <button onClick={() => setIsWarningModalOpen(false)} className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600">
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Input */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by invoice number or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 w-full rounded mr-2"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Search
        </button>
      </div>

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
              <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
                <XCircle size={28} />
              </button>
              {/* Dynamic Role Label from admin data */}
              <div className="flex items-center my-3">
                <label className="mr-2 font-bold">Role:</label>
                <span className="font-semibold">{newOrder.role}</span>
              </div>
              <div className="flex items-center my-3">
                <input type="checkbox" checked={useCustomProduct} onChange={toggleCustomProduct} className="mr-2" />
                <span className="text-lg">Add Customized Product</span>
              </div>
              {useCustomProduct ? (
                <>
                  <input
                    type="text"
                    placeholder="Custom Product Name"
                    value={newOrder.customName}
                    onChange={(e) => setNewOrder({ ...newOrder, customName: e.target.value })}
                    className="border p-2 w-full my-3 rounded"
                  />
                  <textarea
                    placeholder="Custom Product Description"
                    value={newOrder.customDescription}
                    onChange={(e) => setNewOrder({ ...newOrder, customDescription: e.target.value })}
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
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
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
              <button onClick={() => setIsProductModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
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
                            className={`border rounded-lg p-2 hover:shadow-lg transition-colors ${
                              product.soldOut ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                            }`}
                          >
                            <img src={product.image} alt={product.name} className="w-full h-32 object-cover rounded mb-2" />
                            <div className="font-semibold text-sm text-center">{product.name}</div>
                            <div className="text-xs text-gray-600 text-center">{product.price}</div>
                            {product.soldOut && (
                              <div className="text-xs text-red-500 mt-1 text-center">
                                Sold Out
                              </div>
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
                    <th className="p-2 border">Image</th>
                    <th className="p-2 border">Product</th>
                    <th className="p-2 border">Sender Role</th>
                    <th className="p-2 border">Sender Name</th>
                    <th className="p-2 border">Order Date</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Payment Status</th>
                    <th className="p-2 border">View Details</th>
                    <th className="p-2 border">Edit</th>
                    <th className="p-2 border">Delete</th>
                    <th className="p-2 border">Invoice Action</th>
                    <th className="p-2 border">Invoice Number</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order) => {
                    const { role: senderRole, name: senderName } = getSenderInfo(order);
                    const orderDate = new Date(order.createdAt).toLocaleDateString();
                    const paymentStatus = order.paymentStatus
                      ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)
                      : "Missing";
                    const invoiceExists = !!invoiceMapping[order._id];
                    console.log(`Rendering order ${order._id}: senderRole=${senderRole}, senderName=${senderName}`);
                    return (
                      <motion.tr
                        key={order._id}
                        className="border cursor-pointer"
                        whileHover={{ backgroundColor: "#4a4a4a", color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                      >
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
                        <td className="p-2">{senderRole}</td>
                        <td className="p-2">{senderName}</td>
                        <td className="p-2">{orderDate}</td>
                        <td className="p-2">{order.status}</td>
                        <td className="p-2">{paymentStatus}</td>
                        <td className="p-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order);
                            }}
                            className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
                          >
                            View Details
                          </button>
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
                            <DeleteIcon size={18} />
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateInvoice(order);
                            }}
                            className={`px-2 py-1 h-14 w-48 rounded hover:shadow transition-colors ${
                              invoiceExists
                                ? "bg-purple-500 hover:bg-purple-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                          >
                            {invoiceExists ? "View Invoice" : "Generate Invoice"}
                          </button>
                        </td>
                        <td className="p-2 text-center">
                          {invoiceExists ? invoiceMapping[order._id] : "not available"}
                        </td>
                      </motion.tr>
                    );
                  })}
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
              {/* Edit Modal Content */}
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
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, newImage: e.target.files[0] })}
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
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, price: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block font-bold mb-1">Size (e.g. 1KG, 500g):</label>
                <input
                  type="text"
                  value={selectedOrder.product?.size || selectedOrder.size}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, size: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block font-bold mb-1">Quantity:</label>
                <input
                  type="number"
                  value={selectedOrder.quantity}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, quantity: e.target.value })}
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
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, customName: e.target.value })}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block font-bold mb-1">Custom Product Description:</label>
                    <textarea
                      value={selectedOrder.customDescription || ""}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, customDescription: e.target.value })}
                      className="border p-2 rounded w-full"
                    ></textarea>
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block font-bold mb-1">Status:</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
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
