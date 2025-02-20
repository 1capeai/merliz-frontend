"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import io from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-2tr2.onrender.com";

// Helper: Normalize coordinate objects (accepts { latitude, longitude } or { lat, lng })
const normalizeCoords = (coord) => {
  if (!coord) return null;
  if (typeof coord.latitude === "number" && typeof coord.longitude === "number")
    return coord;
  if (typeof coord.lat === "number" && typeof coord.lng === "number")
    return { latitude: coord.lat, longitude: coord.lng };
  return null;
};

export default function Drivers({ isDark }) {
  const [drivers, setDrivers] = useState([]);
  // We no longer wait for a live "rider-location-update"; the rider’s location comes from the trip booking data.
  const [activeTrips, setActiveTrips] = useState({}); // { tripId: { ...tripData } }
  const [driverRoutes, setDriverRoutes] = useState({}); // { driverId: [{ lat, lng, timestamp }, ...] }
  const driverRoutesRef = useRef({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [adminLocation, setAdminLocation] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const router = useRouter();

  // State for individual driver message modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedDriverForMessage, setSelectedDriverForMessage] = useState(null);
  const [messageText, setMessageText] = useState("");

  // State for announcement modal to all drivers
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  // Ref to hold the socket instance so we can emit events later
  const socketRef = useRef(null);

  // ---------------------------
  // Fetch drivers from backend
  // ---------------------------
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        const { data } = await axios.get(`${API_URL}/api/drivers`, { headers });
        console.log("Fetched drivers:", data.drivers);
        setDrivers(data.drivers || []);
      } catch (err) {
        console.error("Error fetching drivers:", err);
        setError("Error fetching drivers");
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  // ---------------------------
  // Establish socket connection for live updates
  // ---------------------------
  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket server with ID:", socket.id);
      socket.emit("register-admin", "adminIdentifier");
      console.log("Emitted register-admin event from admin client.");
    });

    // Listen for driver location updates
    socket.on("driver-location-update", (data) => {
      console.log("Admin received driver-location-update event:", data);
      const { driverId, tripId, latitude, longitude } = data;
      console.log(
        `Driver ${driverId} location update (trip: ${tripId}) => lat: ${latitude}, lng: ${longitude}`
      );
      if (!tripId || tripId === "none") return; // Process only active trips

      // Accumulate route coordinates for the driver
      driverRoutesRef.current[driverId] = [
        ...(driverRoutesRef.current[driverId] || []),
        { lat: latitude, lng: longitude, timestamp: new Date() },
      ];
      setDriverRoutes({ ...driverRoutesRef.current });

      // Update driver info in state
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) =>
          driver._id.toString() === driverId.toString()
            ? {
                ...driver,
                location: { latitude, longitude },
                lastUpdate: new Date(),
                activeTrip: tripId,
              }
            : driver
        )
      );
    });

    // Listen for trip updates (which include the booking data with pickup and dropoff coordinates)
    socket.on("trip-update", (data) => {
      console.log("Admin received trip-update event:", data);
      // Save/merge the trip data into activeTrips state
      setActiveTrips((prev) => ({ ...prev, [data.tripId]: data }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ---------------------------
  // Auto-fit map bounds when drivers or trip data update
  // ---------------------------
  useEffect(() => {
    if (isMapLoaded && mapInstance) {
      const bounds = new window.google.maps.LatLngBounds();
      drivers.forEach((driver) => {
        if (
          driver.location &&
          driver.location.latitude &&
          driver.location.longitude
        ) {
          bounds.extend(
            new window.google.maps.LatLng(
              driver.location.latitude,
              driver.location.longitude
            )
          );
        }
      });
      // Also include pickup and dropoff coordinates from active trips
      Object.values(activeTrips).forEach((trip) => {
        const pickup = normalizeCoords(trip.pickupCoords);
        const dropoff = normalizeCoords(trip.dropoffCoords);
        if (pickup) {
          bounds.extend(
            new window.google.maps.LatLng(pickup.latitude, pickup.longitude)
          );
        }
        if (dropoff) {
          bounds.extend(
            new window.google.maps.LatLng(dropoff.latitude, dropoff.longitude)
          );
        }
      });
      if (!bounds.isEmpty()) {
        mapInstance.fitBounds(bounds);
      }
    }
  }, [drivers, activeTrips, isMapLoaded, mapInstance]);

  // ---------------------------
  // onLoad callback for GoogleMap
  // ---------------------------
  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
    setIsMapLoaded(true);
  }, []);

  const handleViewDriver = (driverId) => {
    router.push(`/admin/drivers/${driverId}`);
  };

  // ---------------------------
  // Function to open the individual message modal
  // ---------------------------
  const handleSendMessage = (driverId) => {
    console.log(`Preparing to send message to driver with ID: ${driverId}`);
    setSelectedDriverForMessage(driverId);
    setMessageText(""); // clear any previous message
    setShowMessageModal(true);
  };

  // ---------------------------
  // Function to handle sending an individual message via socket emit
  // ---------------------------
  const handleSendMessageSubmit = () => {
    if (socketRef.current && selectedDriverForMessage && messageText) {
      socketRef.current.emit("admin-message", {
        driverId: selectedDriverForMessage,
        message: messageText,
      });
      console.log(
        `Message sent to driver ${selectedDriverForMessage}: ${messageText}`
      );
      setShowMessageModal(false);
      setSelectedDriverForMessage(null);
      setMessageText("");
    }
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setSelectedDriverForMessage(null);
    setMessageText("");
  };

  // ---------------------------
  // Functions for announcement to all drivers
  // ---------------------------
  const handleOpenAnnouncementModal = () => {
    setAnnouncementText("");
    setShowAnnouncementModal(true);
  };

  const handleSendAnnouncementSubmit = () => {
    if (socketRef.current && announcementText) {
      socketRef.current.emit("admin-message-all", {
        message: announcementText,
      });
      console.log(`Announcement sent to all drivers: ${announcementText}`);
      setShowAnnouncementModal(false);
      setAnnouncementText("");
    }
  };

  const handleCloseAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setAnnouncementText("");
  };

  // ---------------------------
  // Map container & dark theme style
  // ---------------------------
  const mapContainerStyle = { width: "100%", height: "500px" };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#212121" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
    { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  ];

  // ---------------------------
  // Admin's current location (optional)
  // ---------------------------
  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("Admin location:", pos);
          setAdminLocation(pos);
        },
        (error) => console.error("Error getting admin location:", error)
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  }, []);

  if (loading) {
    return <div className="p-5 text-center">Loading drivers...</div>;
  }
  if (error) {
    return <div className="p-5 text-center text-red-500">{error}</div>;
  }

  // ---------------------------
  // handleTripActive: Called when a trip is booked/activated.
  // ---------------------------
  const handleTripActive = (tripData) => {
    console.log("Trip activated:", tripData);
    setActiveTrips((prev) => ({ ...prev, [tripData.tripId]: tripData }));
    if (tripData.pickupCoords) {
      const pickup = normalizeCoords(tripData.pickupCoords);
      if (pickup) {
        console.log("Rider pickup point:", pickup);
      }
    }
  };

  // ---------------------------
  // Render the map with markers and polylines
  // ---------------------------
  const renderMap = () => (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        onLoad={handleMapLoad}
        mapContainerStyle={mapContainerStyle}
        center={adminLocation || { lat: -33.9249, lng: 18.4241 }}
        zoom={adminLocation ? 14 : 10}
        options={{ styles: isDark ? darkMapStyle : [], disableDefaultUI: false }}
      >
        {/* Render driver markers */}
        {isMapLoaded &&
          drivers.map((driver) => {
            if (
              driver.location &&
              driver.location.latitude &&
              driver.location.longitude
            ) {
              const pos = {
                lat: driver.location.latitude,
                lng: driver.location.longitude,
              };
              console.log(`Rendering driver marker for ${driver._id} at`, pos);
              return (
                <Marker
                  key={driver._id}
                  position={pos}
                  onClick={() => {
                    console.log(`Driver marker clicked for ${driver._id} at`, pos);
                    setSelectedDriver(driver);
                  }}
                  icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                    fillColor: driver.activeTrip ? "#4CAF50" : "#2196F3",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    scale: 2,
                  }}
                />
              );
            }
            return null;
          })}

        {/* Render markers for trip pickup and destination */}
        {isMapLoaded &&
          Object.values(activeTrips).map((trip) => {
            const pickup = normalizeCoords(trip.pickupCoords);
            const dropoff = normalizeCoords(trip.dropoffCoords);
            return (
              <div key={trip.tripId}>
                {pickup && (
                  <Marker
                    position={{ lat: pickup.latitude, lng: pickup.longitude }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: "#00FF00",
                      fillOpacity: 1,
                      strokeWeight: 2,
                      scale: 5,
                    }}
                  />
                )}
                {dropoff && (
                  <Marker
                    position={{ lat: dropoff.latitude, lng: dropoff.longitude }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: "#FF0000",
                      fillOpacity: 1,
                      strokeWeight: 2,
                      scale: 5,
                    }}
                  />
                )}
              </div>
            );
          })}

        {/* Render polylines for driver routes */}
        {isMapLoaded &&
          Object.entries(driverRoutes).map(([driverId, route]) => {
            console.log(`Drawing route polyline for driver ${driverId}:`, route);
            if (route.length < 2) return null;
            return (
              <Polyline
                key={driverId}
                path={route}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            );
          })}

        {/* Draw a thick blue polyline from driver's live location to pickup */}
        {isMapLoaded &&
          drivers.map((driver) => {
            if (driver.activeTrip && driver.location) {
              const trip = activeTrips[driver.activeTrip];
              if (trip && trip.pickupCoords) {
                const pickup = normalizeCoords(trip.pickupCoords);
                if (pickup) {
                  console.log(
                    `Drawing thick line from driver ${driver._id} to pickup. Driver: ${JSON.stringify(
                      driver.location
                    )} | Pickup: ${JSON.stringify(pickup)}`
                  );
                  const linePath = [
                    { lat: driver.location.latitude, lng: driver.location.longitude },
                    { lat: pickup.latitude, lng: pickup.longitude },
                  ];
                  return (
                    <Polyline
                      key={`line-driver-pickup-${driver._id}`}
                      path={linePath}
                      options={{
                        strokeColor: "#0000FF",
                        strokeOpacity: 1,
                        strokeWeight: 6,
                      }}
                    />
                  );
                }
              }
            }
            return null;
          })}

        {/* Draw a thick green polyline from pickup to destination */}
        {isMapLoaded &&
          Object.values(activeTrips).map((trip) => {
            const pickup = normalizeCoords(trip.pickupCoords);
            const dropoff = normalizeCoords(trip.dropoffCoords);
            if (pickup && dropoff) {
              console.log(
                `Drawing thick line from pickup to destination for trip ${trip.tripId}. Pickup: ${JSON.stringify(
                  pickup
                )} | Dropoff: ${JSON.stringify(dropoff)}`
              );
              const linePath = [
                { lat: pickup.latitude, lng: pickup.longitude },
                { lat: dropoff.latitude, lng: dropoff.longitude },
              ];
              return (
                <Polyline
                  key={`line-pickup-dest-${trip.tripId}`}
                  path={linePath}
                  options={{
                    strokeColor: "#00FF00",
                    strokeOpacity: 1,
                    strokeWeight: 6,
                  }}
                />
              );
            }
            return null;
          })}
      </GoogleMap>
    </LoadScript>
  );

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Drivers List</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowTable((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {showTable ? "Hide All Drivers" : "View All Drivers"}
        </button>
        <button
          onClick={handleMyLocation}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          My Location
        </button>
        <button
          onClick={handleOpenAnnouncementModal}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Announce to All Drivers
        </button>
      </div>
      {error && <div className="p-5 text-center text-red-500">{error}</div>}
      {loading && <div className="p-5 text-center">Loading drivers...</div>}
      {showTable && (
        <div className="overflow-x-auto mb-6">
          <table className={`min-w-full border-collapse ${isDark ? "text-white" : "text-black"}`}>
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Driver Code</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Action</th>
                <th className="p-2 border">Send Message</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <tr key={driver._id} className="border hover:bg-gray-100 transition">
                    <td className="p-2 border">{driver.name}</td>
                    <td className="p-2 border">{driver.email}</td>
                    <td className="p-2 border">{driver.driverCode || "-"}</td>
                    <td className="p-2 border flex items-center">
                      {driver.status === "online" ? (
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      ) : (
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      )}
                      {driver.status || "-"}
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleViewDriver(driver._id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition mr-2"
                      >
                        View
                      </button>
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleSendMessage(driver._id)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        Send Message
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center">
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Live Tracking Map</h3>
        {renderMap()}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              if (isMapLoaded && mapInstance) {
                mapInstance.google.maps.event.trigger(mapInstance, "zoom_changed");
              } else {
                console.warn("Google Maps not loaded yet.");
              }
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Zoom In
          </button>
        </div>
      </div>

      {/* Individual Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80">
            <h2 className="text-xl font-bold mb-4">Message from the Admin</h2>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="border p-2 w-full h-24 mb-4"
              placeholder="Type your message..."
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleSendMessageSubmit}
                className="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Send
              </button>
              <button
                onClick={handleCloseMessageModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal for All Drivers */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-md w-80">
            <h2 className="text-xl font-bold mb-4">Announcement to All Drivers</h2>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="border p-2 w-full h-24 mb-4"
              placeholder="Type your announcement..."
            ></textarea>
            <div className="flex justify-end">
              <button
                onClick={handleSendAnnouncementSubmit}
                className="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Send
              </button>
              <button
                onClick={handleCloseAnnouncementModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
