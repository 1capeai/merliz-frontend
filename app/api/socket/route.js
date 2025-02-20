import { Server } from "socket.io";

let io;

export function GET(req, res) {
  if (!io) {
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    let tripRequests = [];

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // Rider books a trip
      socket.on("book-trip", (tripData) => {
        console.log("New Trip Request:", tripData);
        tripRequests.push({ ...tripData, id: socket.id });

        // Notify drivers about the trip
        io.emit("new-trip", tripData);
      });

      // Driver accepts a trip
      socket.on("accept-trip", (tripId) => {
        console.log("Trip accepted:", tripId);
        const trip = tripRequests.find((t) => t.id === tripId);

        if (trip) {
          io.to(trip.id).emit("trip-accepted", { driverId: socket.id });
        }
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
