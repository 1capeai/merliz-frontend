"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function MerlizSellersSettingsPage() {
  // State for form inputs. Text fields will be prefilled from DB.
  const [settings, setSettings] = useState({
    name: "",
    phone: "",
    address: "",
    profileImage: null,
    idProof: null,
    addressProof: null,
  });
  // State for displaying submitted (or fetched) settings from the backend
  const [submittedData, setSubmittedData] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // For previewing newly selected files (optional)
  const [previews, setPreviews] = useState({
    profileImage: null,
    idProof: null,
    addressProof: null,
  });

  // Fetch current settings when the component mounts (or refreshes)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("merlizsellersToken");
        if (!token) return;
        const { data } = await axios.get(
            "https://backend-2tr2.onrender.com/api/merlizsellers/settings",
            { headers: { Authorization: `Bearer ${token}` } }
          );
        // Update both submittedData and text fields in settings
        setSettings((prev) => ({
          ...prev,
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
        }));
        setSubmittedData(data.user);
      } catch (err) {
        console.error(
          "Error fetching settings:",
          err.response?.data?.message || err.message
        );
        setError(err.response?.data?.message || "Error fetching settings");
      }
    };

    fetchSettings();
  }, []);

  // Handle file input changes and generate preview URL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const { name } = e.target;
    setSettings({ ...settings, [name]: file });
    // Set a preview URL so you can display the selected file immediately
    setPreviews({ ...previews, [name]: file ? URL.createObjectURL(file) : null });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", settings.name);
      formData.append("phone", settings.phone);
      formData.append("address", settings.address);
      if (settings.profileImage)
        formData.append("profileImage", settings.profileImage);
      if (settings.idProof) formData.append("idProof", settings.idProof);
      if (settings.addressProof)
        formData.append("addressProof", settings.addressProof);

      const token = localStorage.getItem("merlizsellersToken");


      const response = await axios.put(
        "https://backend-2tr2.onrender.com/api/merlizsellers/settings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );


      console.log("Settings updated:", response.data);
      // Optionally update local storage
      localStorage.setItem("merlizsellersUser", JSON.stringify(response.data.user));
      setMessage(
        "Your settings have been updated successfully! Great job keeping your profile up-to-date."
      );
      // Update the display state with the latest data from the backend.
      setSubmittedData(response.data.user);
      // Clear file previews after a successful submission.
      setPreviews({
        profileImage: null,
        idProof: null,
        addressProof: null,
      });
    } catch (err) {
      console.error(
        "Error updating settings:",
        err.response?.data?.message || err.message
      );
      setError(err.response?.data?.message || "Error updating settings");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <h2 className="text-4xl font-bold text-center mb-8">MerlizSellers Settings</h2>
      {message && <p className="text-green-500 mb-4 text-center text-lg">{message}</p>}
      {error && <p className="text-red-500 mb-4 text-center text-lg">{error}</p>}
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Left card - Display Submitted Data */}
        <div className="flex-1 bg-gray-50 p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-4">Submitted Data</h3>
          {submittedData ? (
            <>
              <p>
                <strong>Name:</strong> {submittedData.name}
              </p>
              <p>
                <strong>Phone:</strong> {submittedData.phone}
              </p>
              <p>
                <strong>Address:</strong> {submittedData.address}
              </p>
              {submittedData.profileImage && (
                <div className="mt-4">
                  <strong>Profile Image:</strong>
                  <img
                    src={submittedData.profileImage}
                    alt="Profile"
                    className="w-32 h-32 object-cover mt-2"
                  />
                </div>
              )}
              {submittedData.idProof && (
                <div className="mt-4">
                  <strong>ID Proof:</strong>
                  <img
                    src={submittedData.idProof}
                    alt="ID Proof"
                    className="w-32 h-32 object-cover mt-2"
                  />
                </div>
              )}
              {submittedData.addressProof && (
                <div className="mt-4">
                  <strong>Address Proof:</strong>
                  <img
                    src={submittedData.addressProof}
                    alt="Address Proof"
                    className="w-32 h-32 object-cover mt-2"
                  />
                </div>
              )}
            </>
          ) : (
            <p>No data submitted yet.</p>
          )}
        </div>

        {/* Right card - Edit Form */}
        <div className="flex-1 bg-white p-8 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-2">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-2">Phone</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-2">Address</label>
              <input
                type="text"
                placeholder="Enter your address"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Profile Picture */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-2">Profile Picture</label>
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
              {/* Show the newly selected file preview if exists; otherwise show the current DB image */}
              {previews.profileImage ? (
                <img
                  src={previews.profileImage}
                  alt="Selected Profile"
                  className="w-32 h-32 object-cover mt-2"
                />
              ) : submittedData && submittedData.profileImage ? (
                <img
                  src={submittedData.profileImage}
                  alt="Current Profile"
                  className="w-32 h-32 object-cover mt-2"
                />
              ) : null}
            </div>

            {/* ID Proof */}
            <div className="mb-6">
              <label className="block text-xl font-semibold mb-2">ID Proof</label>
              <input
                type="file"
                name="idProof"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
              {previews.idProof ? (
                <img
                  src={previews.idProof}
                  alt="Selected ID Proof"
                  className="w-32 h-32 object-cover mt-2"
                />
              ) : submittedData && submittedData.idProof ? (
                <img
                  src={submittedData.idProof}
                  alt="Current ID Proof"
                  className="w-32 h-32 object-cover mt-2"
                />
              ) : null}
            </div>

            {/* Address Proof */}
            <div className="mb-8">
              <label className="block text-xl font-semibold mb-2">Proof of Address</label>
              <input
                type="file"
                name="addressProof"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
              {previews.addressProof ? (
                <img
                  src={previews.addressProof}
                  alt="Selected Address Proof"
                  className="w-32 h-32 object-cover mt-2"
                />
              ) : submittedData && submittedData.addressProof ? (
                <img
                  src={submittedData.addressProof}
                  alt="Current Address Proof"
                  className="w-32 h-32 object-cover mt-2"
                />
              ) : null}
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 text-black font-bold py-3 px-4 rounded hover:bg-yellow-500 transition-colors duration-300"
            >
              Update Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
