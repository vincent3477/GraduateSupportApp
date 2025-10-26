import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import moment from "moment";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { userJoin, getCurrentUser, userLeave, getRoomUsers } from "./utils/users.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

const app = express();
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGIN, credentials: true },
});

const ROOM_DEFINITIONS = {
  "engineering": {
    label: "College of Engineering",
    description: "Product builds, lab projects, and career discussions for engineers",
  },
  "liberal-arts": {
    label: "College of Liberal Arts",
    description: "Storytelling, research, and community-focused conversations",
  },
  "architecture": {
    label: "College of Architecture",
    description: "Design critiques, portfolio feedback, and studio survival tips",
  },
  "business": {
    label: "College of Business",
    description: "Recruiting updates, case interview prep, and leadership insights",
  },
  "science": {
    label: "College of Science",
    description: "Experiments, grad school advice, and STEM career discussions",
  },
};

const roomMessages = new Map(
  Object.keys(ROOM_DEFINITIONS).map((roomId) => [roomId, []])
);

io.on("connection", (socket) => {
  socket.on("join_room", ({ room, name }) => {
    if (!roomMessages.has(room)) {
      socket.emit("system_message", {
        message: "That room is not available right now.",
        timestamp: moment().toISOString(),
      });
      return;
    }

    const trimmedName = name?.trim() || "Friend";
    socket.join(room);
    const { isNewJoin } = userJoin(socket.id, trimmedName, room);

    socket.emit("chat_history", roomMessages.get(room) ?? []);
    io.to(room).emit("room_users", serializeUsers(room));
    if (isNewJoin) {
      io.to(room).emit("system_message", {
        message: `${trimmedName} just joined ${ROOM_DEFINITIONS[room].label}.`,
        timestamp: moment().toISOString(),
      });
    }
  });

  socket.on("chat_message", ({ room, message }) => {
    const current = getCurrentUser(socket.id);
    if (!current || current.room !== room || !roomMessages.has(room)) return;
    const trimmedMessage = message?.trim();
    if (!trimmedMessage) return;

    const timestamp = moment().toISOString();
    const entry = {
      id: `${socket.id}-${timestamp}`,
      name: current.username,
      message: trimmedMessage,
      timestamp,
    };

    const log = roomMessages.get(room);
    log.push(entry);
    if (log.length > 200) {
      log.shift();
    }

    io.to(room).emit("chat_message", entry);
  });

  socket.on("leave_room", () => {
    const current = userLeave(socket.id);
    if (!current) return;
    const { room, username } = current;
    socket.leave(room);
    io.to(room).emit("room_users", serializeUsers(room));
    io.to(room).emit("system_message", {
      message: `${username} left the room.`,
      timestamp: moment().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    const current = userLeave(socket.id);
    if (!current) return;
    const { room, username } = current;
    io.to(room).emit("room_users", serializeUsers(room));
    io.to(room).emit("system_message", {
      message: `${username} left the chat.`,
      timestamp: moment().toISOString(),
    });
  });
});

app.get("/summary/:room", async (req, res) => {
  const { room } = req.params;
  if (!roomMessages.has(room)) {
    return res.status(404).json({ summary: "Room not found." });
  }

  const summary = await summarizeRoom(room);
  res.json({ summary });
});

server.listen(PORT, () => {
  console.log(`Community chat server listening on port ${PORT}`);
});

function serializeUsers(room) {
  return getRoomUsers(room).map((user) => ({
    id: user.id,
    name: user.username,
    username: user.username,
  }));
}

async function summarizeRoom(room) {
  const messages = roomMessages.get(room) ?? [];
  if (messages.length === 0) {
    return "No conversation yet. Start the chat to build the highlight reel.";
  }

  const transcript = messages
    .slice(-40)
    .map((msg) => `${msg.name}: ${msg.message}`)
    .join("\n");

  
}
