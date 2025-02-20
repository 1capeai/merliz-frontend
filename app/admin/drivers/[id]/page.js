"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export default function DriverDetailPage() {
  const { id } = useParams(); // Get driver ID from URL
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
      }
    };

    Promise.all([fetchDriverDetails(), fetchDriverApplication()]).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const handleProcessApplication = async () => {
    // Here you would send a request to update the application status to "Processing"
    // For demonstration, we'll just log to the console.
    console.log("Processing application...");
    // TODO: Implement the process logic.
  };

  const handleApproveApplication = async () => {
    // Here you would send a request to update the application status to "Approved"
    // For demonstration, we'll just log to the console.
    console.log("Approving application...");
    // TODO: Implement the approval logic.
  };

  if (loading) return <div className="p-5 text-center">Loading driver details...</div>;
  if (error) return <div className="p-5 text-center text-red-500">{error}</div>;

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Driver Details</h1>

      {/* Driver Basic Info */}
      {driver ? (
        <div className="flex flex-col md:flex-row items-center mb-8 border p-4 rounded shadow">
          <img
            src={driver.image || "/placeholder.jpg"}
            alt="Driver Profile"
            className="w-32 h-32 rounded-full border mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold">{driver.name}</h2>
            <p className="mt-2">Email: {driver.email}</p>
            <p className="mt-2">Driver Code: {driver.driverCode || "N/A"}</p>
            <p className="mt-2">Status: {driver.status || "N/A"}</p>
          </div>
        </div>
      ) : (
        <p>Driver not found.</p>
      )}

      {/* Driver Application Details */}
      <h2 className="text-3xl font-bold mb-4">Application Details</h2>
      {application ? (
        <div className="border p-6 rounded shadow bg-white">
          <p className="mb-4">
            <span className="font-bold">Application Status:</span> {application.status}
          </p>

          {/* Personal Information */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Personal Information</h3>
            <p><strong>Full Name:</strong> {application.personalInformation.fullName}</p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {new Date(application.personalInformation.dateOfBirth).toDateString()}
            </p>
            <p><strong>Contact:</strong> {application.personalInformation.contactNumber}</p>
            <p><strong>Email:</strong> {application.personalInformation.email}</p>
            <p>
              <strong>Address:</strong> {application.personalInformation.homeAddress},{" "}
              {application.personalInformation.city}
            </p>
            <p><strong>Postal Code:</strong> {application.personalInformation.postalCode}</p>
            <p><strong>Nationality:</strong> {application.personalInformation.nationality}</p>
            <p><strong>ID Number:</strong> {application.personalInformation.idNumber}</p>
          </div>

          {/* Uploaded Documents */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Uploaded Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold mb-1">ID Document:</p>
                {application.personalInformation.uploads.idDocument.map((file, index) => (
                  <img
                    key={index}
                    src={file}
                    alt="ID Document"
                    className="w-48 h-48 border rounded mb-2"
                  />
                ))}
              </div>
              <div>
                <p className="font-bold mb-1">Profile Photo:</p>
                {application.personalInformation.uploads.profilePhoto.map((file, index) => (
                  <img
                    key={index}
                    src={file}
                    alt="Profile Photo"
                    className="w-32 h-32 rounded-full border mb-2"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Driver License Details */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Driver License Details</h3>
            <p><strong>License Number:</strong> {application.driverLicenseDetails.licenseNumber}</p>
            <p><strong>License Type:</strong> {application.driverLicenseDetails.licenseType}</p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(application.driverLicenseDetails.issueDate).toDateString()}
            </p>
            <p>
              <strong>Expiry Date:</strong>{" "}
              {new Date(application.driverLicenseDetails.expiryDate).toDateString()}
            </p>
            <p><strong>Issuing Authority:</strong> {application.driverLicenseDetails.issuingAuthority}</p>
            <p><strong>PRDP Number:</strong> {application.driverLicenseDetails.prdpNumber || "N/A"}</p>
          </div>

          {/* Vehicle Information */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Vehicle Information</h3>
            <p>
              <strong>Owns Vehicle:</strong> {application.vehicleInformation.ownsVehicle ? "Yes" : "No"}
            </p>
            <p><strong>Make:</strong> {application.vehicleInformation.vehicleMake}</p>
            <p><strong>Model:</strong> {application.vehicleInformation.vehicleModel}</p>
            <p><strong>Year:</strong> {application.vehicleInformation.vehicleYear}</p>
            <p><strong>Color:</strong> {application.vehicleInformation.vehicleColor}</p>
          </div>

          {/* Background Check */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Background Check</h3>
            <p>
              <strong>Criminal Record:</strong> {application.backgroundCheck.criminalRecord ? "Yes" : "No"}
            </p>
            <p>
              <strong>Traffic Offenses:</strong> {application.backgroundCheck.trafficOffenses ? "Yes" : "No"}
            </p>
          </div>

          {/* Banking Details */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Banking Details</h3>
            <p><strong>Bank Name:</strong> {application.bankingDetails.bankName}</p>
            <p><strong>Account Number:</strong> {application.bankingDetails.accountNumber}</p>
          </div>

          {/* Agreements */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold border-b pb-2">Agreements</h3>
            <p>
              <strong>Terms & Conditions Accepted:</strong>{" "}
              {application.agreements.termsAndConditionsAccepted ? "Yes" : "No"}
            </p>
            <p>
              <strong>GPS Tracking Consent:</strong>{" "}
              {application.agreements.gpsTrackingConsent ? "Yes" : "No"}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-200 rounded">
          <p>No application found for this driver.</p>
        </div>
      )}

      {/* Approval Actions */}
      {application && application.status === "Submitted" && (
        <div className="mt-6 p-6 border rounded bg-green-50">
          <h3 className="text-xl font-bold mb-4">Application Actions</h3>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <button
              onClick={handleProcessApplication}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Process Application
            </button>
            <button
              onClick={handleApproveApplication}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Approve Application
            </button>
          </div>
        </div>
      )}

      {application && application.status === "Processing" && (
        <div className="mt-6 p-6 border rounded bg-blue-50">
          <h3 className="text-xl font-bold mb-4">Application is being processed</h3>
          <button
            onClick={handleApproveApplication}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Approve Application
          </button>
        </div>
      )}
    </div>
  );
}

function handleProcessApplication() {
  // Replace with actual API call to update status to "Processing"
  console.log("Processing application...");
}

function handleApproveApplication() {
  // Replace with actual API call to update status to "Approved"
  console.log("Approving application...");
}
