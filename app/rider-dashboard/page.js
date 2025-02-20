"use client";
import { useState, useEffect } from "react";
import { useLoadScript, GoogleMap } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Car, Clock, MapPin, Smile } from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: -33.9249,
  lng: 18.4241,
};

export default function RiderPage() {
  const gold = "#D4AF37";
  const router = useRouter();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Retrieve rider details from localStorage with fallbacks
  const [riderName, setRiderName] = useState("Valued Rider");
  const [riderEmail, setRiderEmail] = useState("your-email@example.com");
  const [profileImage, setProfileImage] = useState("/logo.jpg"); // Fallback image
  const defaultDetails =
    "Thank you for riding with us. Enjoy exclusive discounts and perks every time you book a trip!";
  const [riderDetails, setRiderDetails] = useState(defaultDetails);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("riderName");
      const storedEmail = localStorage.getItem("riderEmail");
      const storedProfile = localStorage.getItem("profileImage");
      const storedDetails = localStorage.getItem("riderDetails");
      setRiderName(storedName && storedName !== "undefined" ? storedName : "Valued Rider");
      setRiderEmail(storedEmail && storedEmail !== "undefined" ? storedEmail : "your-email@example.com");
      setProfileImage(
        storedProfile && storedProfile !== "undefined" ? storedProfile : "/logo.jpg"
      );
      setRiderDetails(storedDetails && storedDetails !== "undefined" ? storedDetails : defaultDetails);
    }
  }, []);

  const bookTrip = () => {
    window.open(
      "https://wa.me/27663758904?text=I%20would%20like%20to%20book%20a%20trip%20via%20the%20app",
      "_blank"
    );
  };

  const logout = () => {
    localStorage.removeItem("riderId");
    localStorage.removeItem("riderName");
    localStorage.removeItem("riderEmail");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("riderDetails");
    router.push("/rider");
  };

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Half: Rider Profile, Booking & Logout */}
      <div className="md:w-1/2 flex flex-col items-center justify-center p-6 bg-white">
        <motion.div
          className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Profile Image */}
          <div className="flex justify-center mb-4">
            <Image
              src={profileImage}
              alt="Rider Profile"
              width={80}
              height={80}
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-black text-center mb-2">
            Welcome Back, {riderName}!
          </h2>
          <p className="text-center text-gray-700 mb-1">Email: {riderEmail}</p>
          <p className="text-center text-gray-700 mb-4">{riderDetails}</p>
          <p className="text-center text-black mb-4">
            Book your trip now and get an app link for an exclusive discount.
          </p>
          <button
            onClick={bookTrip}
            className="w-full py-3 rounded-lg font-bold transition-colors mb-4"
            style={{ backgroundColor: gold, color: "black" }}
          >
            Book a Trip
          </button>
          <button
            onClick={logout}
            className="w-full py-2 rounded-lg font-bold transition-colors"
            style={{ backgroundColor: "black", color: "white" }}
          >
            Logout
          </button>
        </motion.div>
      </div>

      {/* Right Half: Map */}
      <div className="md:w-1/2 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={defaultCenter}
        >
          {/* Additional map elements can be added here */}
        </GoogleMap>
      </div>
    </div>
  );
}
