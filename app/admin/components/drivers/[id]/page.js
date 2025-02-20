"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function DriverDetailPage() {
  const { id } = useParams(); // Dynamic route parameter
  const router = useRouter();
  const [driver, setDriver] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Driver ID not provided");
      setLoading(false);
      return;
    }

    const fetchDriverDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`https://backend-2tr2.onrender.com/api/drivers/${id}`, { headers });
        setDriver(res.data);
      } catch (err) {
        console.error("Error fetching driver details:", err);
        setError("Error fetching driver details");
      }
    };

    const fetchDriverApplication = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`https://backend-2tr2.onrender.com/api/drivers/application/${id}`, { headers });
        setApplication(res.data.application);
      } catch (err) {
        console.warn("No application found for this driver.");
        // If not found, we don't consider it an error.
      }
    };

    Promise.all([fetchDriverDetails(), fetchDriverApplication()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-5 text-center">Loading driver details...</div>;
  if (error) return <div className="p-5 text-center text-red-500">{error}</div>;

  return (
    <div className="p-5">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back
      </button>
      <h1 className="text-3xl font-bold mb-4">Driver Details</h1>
      {driver ? (
        <div className="mb-6">
          <img
            src={driver.image || "/placeholder.jpg"}
            alt="Driver Profile"
            className="w-32 h-32 rounded-full border"
          />
          <h2 className="text-2xl font-bold mt-4">{driver.name}</h2>
          <p className="mt-2">Email: {driver.email}</p>
          <p className="mt-2">Driver Code: {driver.driverCode || "N/A"}</p>
          <p className="mt-2">Status: {driver.status || "N/A"}</p>
        </div>
      ) : (
        <p>Driver not found.</p>
      )}

      <h2 className="text-2xl font-bold mb-4">Application Details</h2>
      {application ? (
        <div className="border p-4 rounded">
          <p className="mb-2">
            <span className="font-bold">Application Status:</span> {application.status}
          </p>
          <p className="mb-2">
            <span className="font-bold">Full Name:</span> {application.personalInformation.fullName}
          </p>
          <p className="mb-2">
            <span className="font-bold">Email:</span> {application.personalInformation.email}
          </p>
          {/* Add more application fields as needed */}
        </div>
      ) : (
        <div className="p-4 bg-gray-200 rounded">
          <p>No application found for this driver.</p>
        </div>
      )}
    </div>
  );
}
