"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Circle, PlusCircle, XCircle } from "lucide-react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-2tr2.onrender.com";

export default function DriverDashboard() {
  const router = useRouter();
  const [driverInfo, setDriverInfo] = useState(null);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch driver details and application on mount
  useEffect(() => {
    const driverId = localStorage.getItem("driverId");
    if (!driverId) {
      router.push("/driver/login");
      return;
    }

    // Fetch driver details
    axios
      .get(`${API_URL}/api/drivers/${driverId}`)
      .then((response) => {
        setDriverInfo(response.data);
      })
      .catch((err) => {
        console.error("Error fetching driver details:", err);
      });

    // Fetch driver application (if any)
    axios
      .get(`${API_URL}/api/drivers/application/${driverId}`)
      .then((response) => {
        console.log("Fetched application:", response.data.application);
        setCurrentApplication(response.data.application);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setCurrentApplication(null);
        } else {
          console.error("Error fetching driver application:", err);
        }
      });
  }, [router]);

  // Debug: Log current application status
  useEffect(() => {
    console.log("Current Application Status:", currentApplication?.status);
  }, [currentApplication]);

  // Build dynamic statuses based on current application status
  let dynamicStatuses = [];
  if (currentApplication) {
    if (currentApplication.status === "Submitted") {
      dynamicStatuses = ["Submitted", "Processing", "Approved"];
    } else if (currentApplication.status === "Processing") {
      dynamicStatuses = ["Processing", "Approved"];
    } else if (currentApplication.status === "Approved") {
      dynamicStatuses = ["Approved"];
    }
  } else {
    dynamicStatuses = ["Submitted", "Processing", "Approved"];
  }

  // Handle logout (remove localStorage items and redirect)
  const handleLogout = () => {
    localStorage.removeItem("driverId");
    localStorage.removeItem("driverToken"); // If storing token
    router.push("/driver/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
        {driverInfo && (
          <>
            <img
              src={driverInfo.image || "/placeholder.jpg"}
              alt="Driver Profile"
              className="w-24 h-24 rounded-full mx-auto border border-gray-300 shadow-md"
            />
            <h1 className="text-3xl font-bold mt-4">{driverInfo.name}</h1>
            <p className="mt-2 text-gray-600">{driverInfo.email}</p>
          </>
        )}

        {/* LOGOUT BUTTON */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Application Status</h2>
          <div className="flex justify-around items-center">
            {dynamicStatuses.map((status) => {
              const isCurrent =
                currentApplication && currentApplication.status === status;
              return (
                <div key={status} className="flex flex-col items-center">
                  {isCurrent ? (
                    <CheckCircle size={32} className="text-green-500" />
                  ) : (
                    <Circle size={32} className="text-gray-400" />
                  )}
                  <span className="mt-2 font-medium">{status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? (
              <>
                <XCircle size={20} className="mr-2" /> Close Application Form
              </>
            ) : (
              <>
                <PlusCircle size={20} className="mr-2" /> Add More on Application
              </>
            )}
          </button>
        </div>

        {showForm && (
          <DriverApplicationForm
            onSuccess={(app) => {
              setCurrentApplication(app);
              setShowForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Driver Application Form Component
function DriverApplicationForm({ onSuccess }) {
  const initialState = {
    personalInformation: {
      fullName: "",
      dateOfBirth: "",
      contactNumber: "",
      email: "",
      homeAddress: "",
      city: "",
      postalCode: "",
      nationality: "",
      idNumber: "",
      emergencyContact: {
        name: "",
        relationship: "",
        contactNumber: "",
      },
      uploads: {
        idDocument: null,
        profilePhoto: null,
      },
    },
    driverLicenseDetails: {
      licenseNumber: "",
      licenseType: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      prdpNumber: "",
      uploads: {
        driverLicenseFront: null,
        driverLicenseBack: null,
        prdpDocument: null,
      },
    },
    vehicleInformation: {
      ownsVehicle: false,
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColor: "",
      vehicleRegistrationNumber: "",
      roadworthyCertificate: false,
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceExpiryDate: "",
      uploads: {
        vehicleRegistration: null,
        vehicleInsurance: null,
        roadworthyCertificate: null,
        vehicleInspectionReport: null,
      },
    },
    drivingExperience: {
      yearsOfExperience: 0,
      previousDrivingJobs: [],
      vehicleTypesDriven: [],
      eHailingExperience: false,
    },
    backgroundCheck: {
      criminalRecord: false,
      trafficOffenses: false,
      offenseDetails: "",
      drugAlcoholTestConsent: false,
      uploads: {
        criminalRecordCheck: null,
        trafficOffenseReport: null,
      },
    },
    workPreferences: {
      fullTime: false,
      preferredWorkingHours: "",
      willingToWorkWeekends: false,
      preferredWorkLocation: "",
      availableStartDate: "",
    },
    bankingDetails: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      branchCode: "",
      uploads: {
        bankStatement: null,
      },
    },
    agreements: {
      termsAndConditionsAccepted: false,
      gpsTrackingConsent: false,
      dataSharingConsent: false,
      medicalFitnessCertificateProvided: false,
      uploads: {
        signedAgreement: null,
        medicalFitnessCertificate: null,
      },
    },
  };

  const [application, setApplication] = useState(initialState);
  const [submissionStatus, setSubmissionStatus] = useState(""); // e.g., "Submitted", "Processing"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler for top-level fields
  const handleInputChange = (section, field, value) => {
    setApplication((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // For nested objects (e.g., emergencyContact)
  const handleNestedChange = (section, nestedSection, field, value) => {
    setApplication((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value,
        },
      },
    }));
  };

  // Handler for file uploads
  const handleFileChange = (section, field, file) => {
    setApplication((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        uploads: {
          ...prev[section].uploads,
          [field]: file,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSubmissionStatus("Processing");

    try {
      const formData = new FormData();
      // Append the JSON-stringified application data
      formData.append("application", JSON.stringify(application));

      // Append the driver ID (from localStorage)
      const driverId = localStorage.getItem("driverId");
      if (!driverId) {
        throw new Error("Driver ID not found in localStorage.");
      }
      formData.append("driver", driverId);

      // Append file fields if available
      // Personal Information
      if (application.personalInformation.uploads.profilePhoto) {
        formData.append(
          "profilePhoto",
          application.personalInformation.uploads.profilePhoto
        );
      }
      if (application.personalInformation.uploads.idDocument) {
        formData.append(
          "idDocument",
          application.personalInformation.uploads.idDocument
        );
      }
      // Driver License
      if (application.driverLicenseDetails.uploads.driverLicenseFront) {
        formData.append(
          "driverLicenseFront",
          application.driverLicenseDetails.uploads.driverLicenseFront
        );
      }
      if (application.driverLicenseDetails.uploads.driverLicenseBack) {
        formData.append(
          "driverLicenseBack",
          application.driverLicenseDetails.uploads.driverLicenseBack
        );
      }
      if (application.driverLicenseDetails.uploads.prdpDocument) {
        formData.append(
          "prdpDocument",
          application.driverLicenseDetails.uploads.prdpDocument
        );
      }
      // Vehicle Information
      if (application.vehicleInformation.uploads.vehicleRegistration) {
        formData.append(
          "vehicleRegistration",
          application.vehicleInformation.uploads.vehicleRegistration
        );
      }
      if (application.vehicleInformation.uploads.vehicleInsurance) {
        formData.append(
          "vehicleInsurance",
          application.vehicleInformation.uploads.vehicleInsurance
        );
      }
      if (application.vehicleInformation.uploads.roadworthyCertificate) {
        formData.append(
          "roadworthyCertificate",
          application.vehicleInformation.uploads.roadworthyCertificate
        );
      }
      if (application.vehicleInformation.uploads.vehicleInspectionReport) {
        formData.append(
          "vehicleInspectionReport",
          application.vehicleInformation.uploads.vehicleInspectionReport
        );
      }
      // Background Check
      if (application.backgroundCheck.uploads.criminalRecordCheck) {
        formData.append(
          "criminalRecordCheck",
          application.backgroundCheck.uploads.criminalRecordCheck
        );
      }
      if (application.backgroundCheck.uploads.trafficOffenseReport) {
        formData.append(
          "trafficOffenseReport",
          application.backgroundCheck.uploads.trafficOffenseReport
        );
      }
      // Banking
      if (application.bankingDetails.uploads.bankStatement) {
        formData.append(
          "bankStatement",
          application.bankingDetails.uploads.bankStatement
        );
      }
      // Agreements
      if (application.agreements.uploads.signedAgreement) {
        formData.append(
          "signedAgreement",
          application.agreements.uploads.signedAgreement
        );
      }
      if (application.agreements.uploads.medicalFitnessCertificate) {
        formData.append(
          "medicalFitnessCertificate",
          application.agreements.uploads.medicalFitnessCertificate
        );
      }

      // Post formData to backend
      const response = await axios.post(`${API_URL}/api/drivers/application`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        setSubmissionStatus("Submitted");
        if (onSuccess) onSuccess(response.data.application);
      }
    } catch (err) {
      console.error("Error submitting application:", err.response?.data || err);
      setError(err.response?.data?.message || "Error submitting application.");
      setSubmissionStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Driver Application Form</h1>
        {submissionStatus && (
          <div
            className={`mb-4 p-4 text-center text-white font-medium rounded-md ${
              submissionStatus === "Submitted"
                ? "bg-green-500"
                : submissionStatus === "Processing"
                ? "bg-blue-500"
                : "bg-gray-500"
            }`}
          >
            {submissionStatus}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 text-center text-red-500 font-medium rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PERSONAL INFORMATION */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={application.personalInformation.fullName}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "fullName", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium">Date of Birth</label>
                <input
                  type="date"
                  value={application.personalInformation.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "dateOfBirth", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium">Contact Number</label>
                <input
                  type="text"
                  value={application.personalInformation.contactNumber}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "contactNumber", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={application.personalInformation.email}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "email", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* Home Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Home Address</label>
                <input
                  type="text"
                  value={application.personalInformation.homeAddress}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "homeAddress", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  type="text"
                  value={application.personalInformation.city}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "city", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-medium">Postal Code</label>
                <input
                  type="text"
                  value={application.personalInformation.postalCode}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "postalCode", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium">Nationality</label>
                <input
                  type="text"
                  value={application.personalInformation.nationality}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "nationality", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium">ID Number</label>
                <input
                  type="text"
                  value={application.personalInformation.idNumber}
                  onChange={(e) =>
                    handleInputChange("personalInformation", "idNumber", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              {/* File Uploads */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Upload ID Document</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("personalInformation", "idDocument", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Upload Profile Photo</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("personalInformation", "profilePhoto", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* DRIVER LICENSE DETAILS */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Driver License Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">License Number</label>
                <input
                  type="text"
                  value={application.driverLicenseDetails.licenseNumber}
                  onChange={(e) =>
                    handleInputChange("driverLicenseDetails", "licenseNumber", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">License Type</label>
                <input
                  type="text"
                  value={application.driverLicenseDetails.licenseType}
                  onChange={(e) =>
                    handleInputChange("driverLicenseDetails", "licenseType", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Issue Date</label>
                <input
                  type="date"
                  value={application.driverLicenseDetails.issueDate}
                  onChange={(e) =>
                    handleInputChange("driverLicenseDetails", "issueDate", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={application.driverLicenseDetails.expiryDate}
                  onChange={(e) =>
                    handleInputChange("driverLicenseDetails", "expiryDate", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Issuing Authority</label>
                <input
                  type="text"
                  value={application.driverLicenseDetails.issuingAuthority}
                  onChange={(e) =>
                    handleInputChange("driverLicenseDetails", "issuingAuthority", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">PRDP Number</label>
                <input
                  type="text"
                  value={application.driverLicenseDetails.prdpNumber}
                  onChange={(e) =>
                    handleInputChange("driverLicenseDetails", "prdpNumber", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* File Uploads */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Upload Driver License Front</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("driverLicenseDetails", "driverLicenseFront", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Upload Driver License Back</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("driverLicenseDetails", "driverLicenseBack", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Upload PRDP Document</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("driverLicenseDetails", "prdpDocument", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* VEHICLE INFORMATION */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Vehicle Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Do you own a vehicle?</label>
                <select
                  value={application.vehicleInformation.ownsVehicle ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "vehicleInformation",
                      "ownsVehicle",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Vehicle Make</label>
                <input
                  type="text"
                  value={application.vehicleInformation.vehicleMake}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "vehicleMake", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Vehicle Model</label>
                <input
                  type="text"
                  value={application.vehicleInformation.vehicleModel}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "vehicleModel", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Vehicle Year</label>
                <input
                  type="number"
                  value={application.vehicleInformation.vehicleYear}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "vehicleYear", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Vehicle Color</label>
                <input
                  type="text"
                  value={application.vehicleInformation.vehicleColor}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "vehicleColor", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  value={application.vehicleInformation.vehicleRegistrationNumber}
                  onChange={(e) =>
                    handleInputChange(
                      "vehicleInformation",
                      "vehicleRegistrationNumber",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Roadworthy Certificate Available?
                </label>
                <select
                  value={application.vehicleInformation.roadworthyCertificate ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "vehicleInformation",
                      "roadworthyCertificate",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Insurance Provider</label>
                <input
                  type="text"
                  value={application.vehicleInformation.insuranceProvider}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "insuranceProvider", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Insurance Policy Number</label>
                <input
                  type="text"
                  value={application.vehicleInformation.insurancePolicyNumber}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "insurancePolicyNumber", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Insurance Expiry Date</label>
                <input
                  type="date"
                  value={application.vehicleInformation.insuranceExpiryDate}
                  onChange={(e) =>
                    handleInputChange("vehicleInformation", "insuranceExpiryDate", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>

              {/* File Uploads */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Upload Vehicle Registration Document
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("vehicleInformation", "vehicleRegistration", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Upload Vehicle Insurance Document
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("vehicleInformation", "vehicleInsurance", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Upload Roadworthy Certificate
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(
                      "vehicleInformation",
                      "roadworthyCertificate",
                      e.target.files[0]
                    )
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Upload Vehicle Inspection Report
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(
                      "vehicleInformation",
                      "vehicleInspectionReport",
                      e.target.files[0]
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* DRIVING EXPERIENCE */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Driving Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={application.drivingExperience.yearsOfExperience}
                  onChange={(e) =>
                    handleInputChange(
                      "drivingExperience",
                      "yearsOfExperience",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Vehicle Types Driven (comma separated)
                </label>
                <input
                  type="text"
                  value={application.drivingExperience.vehicleTypesDriven.join(", ")}
                  onChange={(e) =>
                    handleInputChange(
                      "drivingExperience",
                      "vehicleTypesDriven",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">eHailing Experience</label>
                <select
                  value={application.drivingExperience.eHailingExperience ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "drivingExperience",
                      "eHailingExperience",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* BACKGROUND CHECK */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Background Check</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Criminal Record</label>
                <select
                  value={application.backgroundCheck.criminalRecord ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "backgroundCheck",
                      "criminalRecord",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Traffic Offenses</label>
                <select
                  value={application.backgroundCheck.trafficOffenses ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "backgroundCheck",
                      "trafficOffenses",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Offense Details</label>
                <textarea
                  value={application.backgroundCheck.offenseDetails}
                  onChange={(e) =>
                    handleInputChange(
                      "backgroundCheck",
                      "offenseDetails",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                ></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Drug & Alcohol Test Consent</label>
                <select
                  value={application.backgroundCheck.drugAlcoholTestConsent ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "backgroundCheck",
                      "drugAlcoholTestConsent",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              {/* File Uploads */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Upload Criminal Record Check
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(
                      "backgroundCheck",
                      "criminalRecordCheck",
                      e.target.files[0]
                    )
                  }
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">
                  Upload Traffic Offense Report
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange(
                      "backgroundCheck",
                      "trafficOffenseReport",
                      e.target.files[0]
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* WORK PREFERENCES */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Work Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Full Time</label>
                <select
                  value={application.workPreferences.fullTime ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange("workPreferences", "fullTime", e.target.value === "yes")
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Preferred Working Hours</label>
                <input
                  type="text"
                  value={application.workPreferences.preferredWorkingHours}
                  onChange={(e) =>
                    handleInputChange(
                      "workPreferences",
                      "preferredWorkingHours",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Willing to Work Weekends</label>
                <select
                  value={application.workPreferences.willingToWorkWeekends ? "yes" : "no"}
                  onChange={(e) =>
                    handleInputChange(
                      "workPreferences",
                      "willingToWorkWeekends",
                      e.target.value === "yes"
                    )
                  }
                  className="w-full border p-2 rounded"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Preferred Work Location</label>
                <input
                  type="text"
                  value={application.workPreferences.preferredWorkLocation}
                  onChange={(e) =>
                    handleInputChange(
                      "workPreferences",
                      "preferredWorkLocation",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Available Start Date</label>
                <input
                  type="date"
                  value={application.workPreferences.availableStartDate}
                  onChange={(e) =>
                    handleInputChange(
                      "workPreferences",
                      "availableStartDate",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>

          {/* BANKING DETAILS */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Banking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Bank Name</label>
                <input
                  type="text"
                  value={application.bankingDetails.bankName}
                  onChange={(e) =>
                    handleInputChange("bankingDetails", "bankName", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Account Number</label>
                <input
                  type="text"
                  value={application.bankingDetails.accountNumber}
                  onChange={(e) =>
                    handleInputChange("bankingDetails", "accountNumber", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Account Holder Name</label>
                <input
                  type="text"
                  value={application.bankingDetails.accountHolderName}
                  onChange={(e) =>
                    handleInputChange("bankingDetails", "accountHolderName", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Branch Code</label>
                <input
                  type="text"
                  value={application.bankingDetails.branchCode}
                  onChange={(e) =>
                    handleInputChange("bankingDetails", "branchCode", e.target.value)
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              {/* File Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Upload Bank Statement</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("bankingDetails", "bankStatement", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* AGREEMENTS */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Agreements</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={application.agreements.termsAndConditionsAccepted}
                  onChange={(e) =>
                    handleInputChange(
                      "agreements",
                      "termsAndConditionsAccepted",
                      e.target.checked
                    )
                  }
                  className="mr-2"
                />
                <label className="text-sm">I accept the terms and conditions.</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={application.agreements.gpsTrackingConsent}
                  onChange={(e) =>
                    handleInputChange("agreements", "gpsTrackingConsent", e.target.checked)
                  }
                  className="mr-2"
                />
                <label className="text-sm">I consent to GPS tracking.</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={application.agreements.dataSharingConsent}
                  onChange={(e) =>
                    handleInputChange("agreements", "dataSharingConsent", e.target.checked)
                  }
                  className="mr-2"
                />
                <label className="text-sm">I consent to data sharing.</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={application.agreements.medicalFitnessCertificateProvided}
                  onChange={(e) =>
                    handleInputChange(
                      "agreements",
                      "medicalFitnessCertificateProvided",
                      e.target.checked
                    )
                  }
                  className="mr-2"
                />
                <label className="text-sm">
                  I have provided a medical fitness certificate.
                </label>
              </div>
              {/* File Uploads */}
              <div>
                <label className="block text-sm font-medium">Upload Signed Agreement</label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("agreements", "signedAgreement", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Upload Medical Fitness Certificate
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileChange("agreements", "medicalFitnessCertificate", e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
