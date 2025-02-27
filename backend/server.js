import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import shareCode from "./routes/shareCodes.routes.js";
import codeSnippets, { cleanupExpiredRooms } from "./controller/shareCodes.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // Restrict CORS to frontend origin
app.use(express.json());

// Serve static files from the "dist" folder
app.use(express.static(path.join(__dirname, "dist")));

// API routes
app.use("/", shareCode); // Use "/api" prefix for backend routes

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Restrict Socket.IO connections to frontend origin
    methods: ["GET", "POST"],
  },
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (codeSnippets.has(room)) {
      socket.emit("codeUpdate", codeSnippets.get(room).code);
    }
  });

  socket.on("codeUpdate", ({ room, code }) => {
    if (codeSnippets.has(room)) {
      codeSnippets.get(room).code = code;
    }
    socket.to(room).emit("codeUpdate", code);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

// Cleanup expired rooms every hour
setInterval(cleanupExpiredRooms, 60 * 60 * 1000);

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});