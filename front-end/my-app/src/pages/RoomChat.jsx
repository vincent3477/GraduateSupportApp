import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { getRoomById } from "../data/rooms.js";
import { loadSupportData } from "../utils/supportStorage.js";
import PageBackButton from "../components/PageBackButton.jsx";

const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL ?? "http://localhost:4000";
const COMMUNITY_SYSTEM_NAME = "GradPath Community";
const normalizeId = (entry, timestamp) => {
  if (entry.id) return entry.id;
  const base = `${entry.message ?? entry.text ?? ""}`.trim();
  return `${timestamp}-${base}`;
};

const formatMessage = (entry, fallbackName = COMMUNITY_SYSTEM_NAME) => {
  if (!entry) return null;
  const timestamp = entry.timestamp ?? entry.time ?? new Date().toISOString();
  const text = (entry.message ?? entry.text ?? "").trim();
  if (!text) return null;
  return {
    id: normalizeId(entry, timestamp),
    username: entry.name || entry.username || fallbackName,
    text,
    time: moment(timestamp).format("h:mm A"),
    type: entry.type ?? "chat",
  };
};

const RoomChat = () => {
  const { roomId } = useParams();
  const room = getRoomById(roomId);
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useMemo(() => location.state?.profile ?? loadSupportData().user ?? null, [location.state]);
  const displayName = profile?.name?.trim() || profile?.username?.trim() || "";

  const [socket, setSocket] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const messageListRef = useRef(null);
  const addMessage = useCallback((incoming) => {
    const formatted = formatMessage(incoming);
    if (!formatted) return;
    setMessages((prev) => {
      if (prev.some((msg) => msg.id === formatted.id)) {
        return prev;
      }
      return [...prev, formatted];
    });
  }, []);

  const joinRoom = useCallback(() => {
    if (!room) return;
    if (!displayName) {
      setStatusMessage("Finish onboarding so we can introduce you in the room.");
      return;
    }

    loadSocketClient()
      .then((io) => {
        const client = io(CHAT_SERVER_URL, { transports: ["websocket"], autoConnect: true });
        setSocket(client);
        client.emit("join_room", { room: roomId, name: displayName });
        setHasJoined(true);
        setStatusMessage("");
      })
      .catch(() => {
        setStatusMessage("We couldn’t connect to the chat server. Try again shortly.");
      });
  }, [displayName, profile, room, roomId]);

  useEffect(() => {
    if (!room) {
      navigate("/community-chat", { replace: true });
      return;
    }
    if (!hasJoined) {
      joinRoom();
    }
  }, [joinRoom, hasJoined, room, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat_history", (history = []) => {
      setMessages((prev) => {
        const merged = [...prev];
        history.forEach((item) => {
          const formatted = formatMessage(item);
          if (formatted && !merged.some((msg) => msg.id === formatted.id)) {
            merged.push(formatted);
          }
        });
        return merged;
      });
    });

    socket.on("chat_message", (payload) => {
      addMessage(payload);
    });

    socket.on("system_message", (payload) => {
      addMessage({
        ...payload,
        name: COMMUNITY_SYSTEM_NAME,
        type: "system",
      });
    });

    socket.on("room_users", (users = []) => {
      const seenUsernames = new Set();
      const next = users
        .map((user) => {
          const username = user.name || user.username || "Friend";
          const normalized = username.trim().toLowerCase();
          return {
            id: user.id ?? normalized,
            username,
            normalized,
            profile: user.profile ?? {},
          };
        })
        .filter((user) => {
          if (seenUsernames.has(user.normalized)) return false;
          seenUsernames.add(user.normalized);
          return true;
        });

      setMembers((prev) => {
        if (
          prev.length === next.length &&
          prev.every((item, idx) => item.normalized === next[idx].normalized)
        ) {
          return prev;
        }
        return next.map(({ normalized, ...rest }) => rest);
      });
    });

    return () => {
      socket.off("chat_history");
      socket.off("chat_message");
      socket.off("system_message");
      socket.off("room_users");
    };
  }, [socket, addMessage]);

  useEffect(() => () => {
    if (socket) socket.disconnect();
  }, [socket]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const leaveRoom = () => {
    if (socket) {
      socket.emit("leave_room");
      socket.disconnect();
      setSocket(null);
    }
    setHasJoined(false);
    setMembers([]);
    setMessages([]);
    navigate(-1);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    if (!socket) return;
    const message = event.target.elements.message.value.trim();
    if (!message) return;
    socket.emit("chat_message", { room: roomId, message });
    event.target.reset();
  };

  if (!room) {
    return null;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <PageBackButton fallback="/community-chat" />
          {displayName && (
            <span className="rounded-full bg-[#2F4D6A]/10 px-3 py-1 text-sm font-medium text-[#2F4D6A]">
              Signed in as {displayName}
            </span>
          )}
        </div>

        <header className="space-y-2 rounded-3xl border border-[#d9d1bc] bg-white/90 px-6 py-4 text-center shadow-sm text-slate-900">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{room.label} Live Chat</h1>
          <p className="text-sm text-slate-600">{room.description}</p>
        </header>

        {statusMessage && (
          <div className="rounded-2xl border border-[#fbbf24] bg-[#fff8eb] px-4 py-3 text-sm text-[#92400e]">
            {statusMessage}
            {!displayName && (
              <button onClick={() => navigate('/onboarding')} className="ml-2 underline transition hover:text-[#b45309]">
                Complete onboarding
              </button>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr_1fr]">
          <aside className="flex h-full flex-col gap-6 rounded-3xl border border-[#e4dcc4] bg-white/85 p-6 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold uppercase text-[#2F4D6A]">Room Name</h2>
              <p className="mt-2 text-xl font-semibold text-slate-800">{room.label}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-[#2F4D6A]">Users</h3>
              {members.length === 0 ? (
                <p className="text-xs text-slate-500">No one is chatting yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-700">
                  {members.map((member) => (
                    <li key={member.id} className="rounded-full bg-[#2F4D6A]/5 px-3 py-1 text-[#2F4D6A]">
                      {member.username}
                      {member.profile?.major && (
                        <span className="ml-2 text-xs text-slate-500">· {member.profile.major}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {hasJoined && (
              <button
                type="button"
                onClick={leaveRoom}
                className="interactive rounded-full border border-[#d8d2c0] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
              >
                Leave room
              </button>
            )}
          </aside>

          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#e4dcc4] bg-white/85 p-6 shadow-sm">
            <div ref={messageListRef} className="chat-messages flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500">Messages will appear here once someone speaks up.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      msg.type === "system" ? "bg-[#fff7ed]" : "bg-[#f3f4ff]"
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#2F4D6A]">
                      {msg.username}
                      <span className="ml-2 text-[11px] text-slate-400">{msg.time}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-line">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="mt-4 flex gap-3">
              <input
                name="message"
                placeholder="Enter message"
                className="flex-1 rounded-full border border-[#d8d2c0] bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#2F4D6A]"
                autoComplete="off"
                disabled={!hasJoined}
              />
              <button
                type="submit"
                className="interactive rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
                disabled={!hasJoined}
              >
                Send
              </button>
            </form>
          </div>

          <aside className="flex h-full flex-col gap-4 rounded-3xl border border-[#e4dcc4] bg-white/85 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Room Tips</h3>
            <p className="text-sm text-slate-600">
              Share recent wins, ask thoughtful questions, and celebrate others. Keep it respectful and useful for your peers.
            </p>
            <p className="text-xs uppercase text-[#2F4D6A]">Quick etiquette</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Lead with curiosity and kindness.</li>
              <li>• Add context so everyone can learn from you.</li>
              <li>• Drop resources or links that helped you.</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default RoomChat;

function loadSocketClient() {
  if (window.io) {
    return Promise.resolve(window.io);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.socket.io/4.8.1/socket.io.min.js";
    script.async = true;
    script.onload = () => {
      if (window.io) {
        resolve(window.io);
      } else {
        reject(new Error("Socket.IO client failed to load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Socket.IO client"));
    document.body.appendChild(script);
  });
}
