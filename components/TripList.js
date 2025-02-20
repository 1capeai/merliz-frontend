"use client";

export default function TripList({ trips }) {
  return (
    <div className="p-4 border mt-5">
      <h3 className="text-lg font-bold">🚕 Active Trips</h3>
      {trips.length === 0 ? <p>No trips available.</p> : trips.map((trip, index) => (
        <div key={index} className="border-b p-3">
          <p>📍 Pickup: {trip.pickup}</p>
          <p>🎯 Drop-off: {trip.dropoff}</p>
          <p>🛑 Status: {trip.status}</p>
        </div>
      ))}
    </div>
  );
}
