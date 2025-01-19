const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

// Enable CORS
app.use(cors());

// Create an HTTP server for socket.io
const server = http.createServer(app);

// Initialize socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Client origin (React app)
    methods: ["GET", "POST"]
  }
});

// Handling socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Broadcast when a user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
  // Listen for code changes and broadcast to other users
  socket.on("codeChange", (newCode) => {
    socket.broadcast.emit("codeChange", newCode);
  });

  // Handle text updates (message sent from client)
  socket.on("update-text", (data) => {
    socket.broadcast.emit("text-updated", data); // Broadcast the updated text to other clients
  });
});

// Start the server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
