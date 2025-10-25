import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import moment from "moment";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "node:crypto";

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

const roomState = Object.fromEntries(
  Object.keys(ROOM_DEFINITIONS).map((roomId) => [
    roomId,
    {
      users: new Map(),
      messages: [],
    },
  ])
);

const socketRoomMap = new Map();

io.on("connection", (socket) => {
  socket.on("join_room", ({ room, name }) => {
    if (!roomState[room]) {
      socket.emit("system_message", {
        message: "That room is not available right now.",
        timestamp: moment().toISOString(),
      });
      return;
    }

    const trimmedName = name?.trim() || "Friend";
    socket.join(room);
    socketRoomMap.set(socket.id, { room, name: trimmedName });
    roomState[room].users.set(socket.id, trimmedName);

    socket.emit("chat_history", roomState[room].messages);
    io.to(room).emit("room_users", getUsers(room));
    io.to(room).emit("system_message", {
      message: `${trimmedName} just joined ${ROOM_DEFINITIONS[room].label}.`
        + " Feel free to welcome them!",
      timestamp: moment().toISOString(),
    });
  });

  socket.on("chat_message", ({ room, message }) => {
    const current = socketRoomMap.get(socket.id);
    if (!current || !roomState[room]) return;
    const trimmedMessage = message?.trim();
    if (!trimmedMessage) return;

    const timestamp = moment().toISOString();
    const entry = {
      id: crypto.randomUUID(),
      name: current.name,
      message: trimmedMessage,
      timestamp,
    };

    roomState[room].messages.push(entry);
    if (roomState[room].messages.length > 200) {
      roomState[room].messages.shift();
    }

    io.to(room).emit("chat_message", entry);
  });

  socket.on("leave_room", () => {
    const current = socketRoomMap.get(socket.id);
    if (!current) return;
    const { room, name } = current;
    socket.leave(room);
    socketRoomMap.delete(socket.id);
    roomState[room]?.users.delete(socket.id);
    io.to(room).emit("room_users", getUsers(room));
    io.to(room).emit("system_message", {
      message: `${name} left the room.`,
      timestamp: moment().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    const current = socketRoomMap.get(socket.id);
    if (!current) return;
    const { room, name } = current;
    roomState[room]?.users.delete(socket.id);
    socketRoomMap.delete(socket.id);
    io.to(room).emit("room_users", getUsers(room));
    io.to(room).emit("system_message", {
      message: `${name} lost connection.`,
      timestamp: moment().toISOString(),
    });
  });
});

app.get("/summary/:room", async (req, res) => {
  const { room } = req.params;
  if (!roomState[room]) {
    return res.status(404).json({ summary: "Room not found." });
  }

  const summary = await summarizeRoom(room);
  res.json({ summary });
});

server.listen(PORT, () => {
  console.log(`Community chat server listening on port ${PORT}`);
});

function getUsers(room) {
  return Array.from(roomState[room]?.users.entries() ?? []).map(([id, name]) => ({ id, name }));
}

async function summarizeRoom(room) {
  const messages = roomState[room]?.messages ?? [];
  if (messages.length === 0) {
    return "No conversation yet. Start the chat to build the highlight reel.";
  }

  const transcript = messages
    .slice(-40)
    .map((msg) => `${msg.name}: ${msg.message}`)
    .join("\n");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackSummary(transcript);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Summarise the key themes in this community chat:\n${transcript}\n` +
      "Highlight main topics, tone, and any action items. Keep it under 120 words.";

    const result = await model.generateContent(prompt);
    return result.response.text()?.trim() || fallbackSummary(transcript);
  } catch (error) {
    console.error("Gemini summarisation failed", error);
    return fallbackSummary(transcript);
  }
}

function fallbackSummary(transcript) {
  const lines = transcript.split("\n");
  const last = lines.slice(-3).join(" ");
  return `Conversation is warming up around: ${last}`;
}
