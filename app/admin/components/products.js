"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, XCircle, Eye, Trash2 } from "lucide-react";

// Helper function to compute unique product names from fetched products
function uniqueProductNames(products) {
  return Array.from(new Set(products.map((prod) => prod.name))).sort();
}

const defaultProductNames = [
  "5KG MIXED CHICKEN PORTIONS",
  "2KG MIXED CHICKEN PORTIONS",
  "1KG CHICKEN SCHNITZEL (CHEESY)",
  "1KG CHICKEN SCHNITZEL (ORIGINAL)",
  "CRUMBED CHICKEN BURGER (CHEESY)",
  "CRUMBED CHICKEN BURGER (CHILLI CHEESE)",
  "1.15KG MEGA CRUMBED CHICKEN BURGERS (ORIGINAL)",
  "CRUMBED CHICKEN BURGERS (ORIGINAL)",
  "1KG BREAST FILLETS",
  "1KG BUFFALO WINGS (HOT & SPICY)",
  "BUFFALO WINGS (ORIGINAL)",
  "1KG CHICKEN NUGGETS",
  "1KG CHICKEN POPS (HOT & SPICY)",
  "1KG CHICKEN POPS (ORIGINAL)",
  "1KG CHICKEN STRIPS (CHILLI CHEESE)",
  "1KG CRUMBED CHICKEN STRIPS (CHEESY)",
  "1KG CHICKEN STRIPS (HOT & SPICY)",
  "1KG CHICKEN STRIPS (ORIGINAL)",
  "FROZEN FRIES",
  "MEGA BISCUITS TUB",
  "FAMILY TREAT BISCUIT TUB",
  "Eggs (Tray of 30)",
];

export default function Products({ isDark }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // We'll store an "existingImage" URL when editing a product.
  const [existingImage, setExistingImage] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    newName: "",
    category: "",
    customCategory: "",
    subcategory: "",
    description: "",
    price: "",
    quantity: "",
    image: null, // this will be a File if changed
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get("https://backend-2tr2.onrender.com/api/products", { headers });
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const names = uniqueProductNames(products);
  const productNameOptions = names.length > 0 ? names : defaultProductNames;

  const getQuantityStatus = (quantity) => {
    const qty = Number(quantity);
    const averageQuantity =
      Array.isArray(products) && products.length > 0
        ? products.reduce((acc, prod) => acc + Number(prod.quantity || 0), 0) / products.length
        : 0;
    if (averageQuantity === 0) return "N/A";
    if (qty < averageQuantity * 0.5) return "Too Low";
    if (qty < averageQuantity) return "Low";
    if (qty > averageQuantity * 1.5) return "Too High";
    if (qty > averageQuantity) return "High";
    return "Average";
  };

  const handleInputChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProductForm({ ...productForm, image: file });
  };

  // Submit handler for creating/updating a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    const formData = new FormData();
    const productName = productForm.name === "new" ? productForm.newName : productForm.name;
    formData.append("name", productName);
    const categoryToSend = productForm.category === "Other" ? productForm.customCategory : productForm.category;
    formData.append("category", categoryToSend);
    formData.append("subcategory", productForm.subcategory);
    formData.append("description", productForm.description);
    formData.append("price", productForm.price);
    formData.append("quantity", productForm.quantity);
    if (productForm.image) {
      formData.append("image", productForm.image);
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Unauthorized: No admin token found.");
        setIsSubmitting(false);
        return;
      }
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      };

      if (isEditMode && selectedProduct) {
        await axios.put(`https://backend-2tr2.onrender.com/api/products/${selectedProduct._id}`, formData, { headers });
        setMessage("Product updated successfully!");
      } else {
        await axios.post("https://backend-2tr2.onrender.com/api/products", formData, { headers });
        setMessage("Product created successfully!");
      }
      setProductForm({
        name: "",
        newName: "",
        category: "",
        customCategory: "",
        subcategory: "",
        description: "",
        price: "",
        quantity: "",
        image: null,
      });
      setExistingImage("");
      fetchProducts();
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error("Error creating/updating product:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Error creating/updating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };
        await axios.delete(`https://backend-2tr2.onrender.com/api/products/${productId}`, { headers });
        setMessage("Product deleted successfully!");
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Error deleting product");
      }
    }
  };

  // When "View" is clicked, populate the form with the product data and store the existing image URL
  const openEditModal = (prod) => {
    setSelectedProduct(prod);
    setIsEditMode(true);
    setProductForm({
      name: prod.name,
      newName: "",
      category: prod.category,
      customCategory: "",
      subcategory: prod.subcategory,
      description: prod.description,
      price: prod.price,
      quantity: prod.quantity,
      image: null, // new image file can be selected; if none, existing image will be shown
    });
    setExistingImage(prod.image || "");
    setIsModalOpen(true);
  };

  return (
    <div className="p-5">
      {/* Header & Add Product Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={() => {
            setIsEditMode(false);
            setSelectedProduct(null);
            setExistingImage("");
            setIsModalOpen(true);
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={20} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto shadow rounded mb-6">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Subcategory</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map((prod) => (
                <tr key={prod._id} className="border hover:bg-gray-100 transition">
                  <td className="p-2 border">{prod.name}</td>
                  <td className="p-2 border">{prod.category}</td>
                  <td className="p-2 border">{prod.subcategory}</td>
                  <td className="p-2 border">{prod.price}</td>
                  <td className="p-2 border">{prod.quantity}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        getQuantityStatus(prod.quantity) === "Too Low"
                          ? "bg-red-600"
                          : getQuantityStatus(prod.quantity) === "Low"
                          ? "bg-red-400"
                          : getQuantityStatus(prod.quantity) === "Too High"
                          ? "bg-green-700"
                          : getQuantityStatus(prod.quantity) === "High"
                          ? "bg-green-500"
                          : "bg-blue-500"
                      }`}
                    >
                      {getQuantityStatus(prod.quantity)}
                    </span>
                  </td>
                  <td className="p-2 border">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="p-2 border">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Animated Modal for Create/View (Edit) Product */}
      <AnimatePresence>
        {isModalOpen && (
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
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setSelectedProduct(null);
                  setExistingImage("");
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <XCircle size={28} />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center">
                {isEditMode ? "Edit Product" : "Create New Product"}
              </h3>
              {message && <div className="mb-4 text-green-600 text-center">{message}</div>}
              {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block font-semibold mb-1">Product Name</label>
                  <select
                    name="name"
                    value={productForm.name}
                    onChange={handleInputChange}
                    className="block w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select a product name</option>
                    {productNameOptions.map((prodName, index) => (
                      <option key={index} value={prodName}>
                        {prodName}
                      </option>
                    ))}
                    <option value="new">New Product</option>
                  </select>
                </div>
                {productForm.name === "new" && (
                  <div>
                    <label className="block font-semibold mb-1">Enter New Product Name</label>
                    <input
                      type="text"
                      name="newName"
                      value={productForm.newName}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded"
                      required
                    />
                  </div>
                )}
                {/* Category */}
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleInputChange}
                    className="block w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="PROTEIN FOODS">PROTEIN FOODS</option>
                    <option value="CONFECTIONERY">CONFECTIONERY</option>
                    <option value="FROZEN FOODS">FROZEN FOODS</option>
                    <option value="BURGERS">BURGERS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {productForm.category === "Other" && (
                  <div>
                    <label className="block font-semibold mb-1">Custom Category</label>
                    <input
                      type="text"
                      name="customCategory"
                      value={productForm.customCategory}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded"
                      placeholder="Enter custom category"
                      required
                    />
                  </div>
                )}
                {/* Subcategory */}
                <div>
                  <label className="block font-semibold mb-1">Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={productForm.subcategory}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                {/* Description */}
                <div>
                  <label className="block font-semibold mb-1">Description</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                  ></textarea>
                </div>
                {/* Price */}
                <div>
                  <label className="block font-semibold mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                {/* Quantity */}
                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={productForm.quantity}
                    onChange={handleInputChange}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                {/* Product Image */}
                <div className="flex flex-col items-center">
                  <label className="block font-semibold mb-1">Product Image</label>
                  {productForm.image ? (
                    <img
                      src={URL.createObjectURL(productForm.image)}
                      alt="Product Preview"
                      className="w-20 h-20 object-cover rounded mb-2"
                    />
                  ) : existingImage ? (
                    <img
                      src={existingImage}
                      alt="Existing Product"
                      className="w-20 h-20 object-cover rounded mb-2"
                    />
                  ) : null}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
                >
                  {isSubmitting ? "Submitting..." : isEditMode ? "Update Product" : "Submit"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
