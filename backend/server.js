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
const allowedOrigins = [
  "http://localhost:5173", // Local development (frontend)
  "http://localhost:5000", // Local development (backend, if needed)
  "https://code-share-clone.vercel.app", // Deployed frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the request
      } else {
        callback(new Error("Not allowed by CORS")); // Block the request
      }
    },
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true,
    transports: ["websocket", "polling"], // Allow cookies and credentials
  })
);
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
    origin: allowedOrigins, // Allow Socket.IO connections from frontend origins
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});