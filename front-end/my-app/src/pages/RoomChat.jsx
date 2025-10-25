import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { getRoomById } from "../data/rooms.js";

const CHAT_SERVER_URL = import.meta.env.VITE_CHAT_SERVER_URL ?? "http://localhost:4000";
const NAME_STORAGE_KEY = "gradpath_chat_display_name";

const RoomChat = () => {
  const { roomId } = useParams();
  const room = getRoomById(roomId);
  const location = useLocation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState(() => location.state?.name || localStorage.getItem(NAME_STORAGE_KEY) || "");
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const messageListRef = useRef(null);

  useEffect(() => {
    if (!room) {
      navigate('/community-chat', { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    if (userName.trim()) {
      localStorage.setItem(NAME_STORAGE_KEY, userName.trim());
    }
  }, [userName]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat_message', (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    socket.on('system_message', (payload) => {
      setMessages((prev) => [...prev, { ...payload, system: true }]);
    });

    socket.on('room_users', (payload) => {
      setMembers(payload);
    });

    socket.on('chat_history', (payload) => {
      setMessages(payload);
    });

    return () => {
      socket.off('chat_message');
      socket.off('system_message');
      socket.off('room_users');
      socket.off('chat_history');
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch(`${CHAT_SERVER_URL}/summary/${roomId}`);
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
      setSummary("We couldn't fetch a summary yet. Start the conversation and we'll keep track of the highlights.");
    } finally {
      setSummaryLoading(false);
    }
  }, [roomId]);

  const joinRoom = useCallback(() => {
    const trimmed = userName.trim();
    if (!trimmed) {
      setStatusMessage('Add your name so grads know who just joined.');
      return;
    }
    loadSocketClient()
      .then((io) => {
        const client = io(CHAT_SERVER_URL, { transports: ['websocket'], autoConnect: true });
        setSocket(client);
        client.emit('join_room', { room: roomId, name: trimmed });
        setIsJoined(true);
        setStatusMessage('');
        setSummary('');
        fetchSummary();
      })
      .catch(() => {
        setStatusMessage('We could not connect to the chat server. Try again in a moment.');
      });
  }, [fetchSummary, roomId, userName]);

  useEffect(() => {
    if (room && userName.trim()) {
      joinRoom();
    }
  }, [joinRoom, room, userName]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit('leave_room');
      socket.disconnect();
    }
    setSocket(null);
    setIsJoined(false);
    setMembers([]);
    setMessages([]);
    setSummary('');
  }, [socket]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!socket) return;
    const message = event.target.elements.message.value.trim();
    if (!message) return;
    socket.emit('chat_message', { room: roomId, message });
    event.target.reset();
  };

  const formattedMessages = useMemo(() =>
    messages.map((msg) => ({
      ...msg,
      timestamp: moment(msg.timestamp).format('h:mm A'),
    })),
    [messages]
  );

  useEffect(() => {
    messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
  }, [formattedMessages]);

  if (!room) {
    return null;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em] text-slate-600 shadow-sm">
              Live room: {room.label}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Stay in sync with your {room.label.toLowerCase()}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              {room.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/community-chat')}
            className="interactive self-center rounded-full border border-[#d8d2c0] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
          >
            Explore other colleges
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr,320px]">
          <aside className="space-y-6 rounded-3xl border border-[#e4dcc4] bg-white/80 p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">Room stats</h2>
              <p className="text-xs text-slate-500">Updated {moment().format('LLLL')}</p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">Display name</label>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g., Morgan (Arch '24)"
                className="w-full rounded-full border border-[#d8d2c0] bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#2F4D6A]"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = userName.trim();
                  if (trimmed) {
                    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
                    setStatusMessage('Name saved.');
                  } else {
                    setStatusMessage('Name cleared. Add one before chatting.');
                  }
                }}
                className="interactive w-full rounded-full border border-[#d8d2c0] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
              >
                Save name
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-[#e4dcc4] bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">In the room</h3>
              {members.length === 0 ? (
                <p className="text-xs text-slate-500">No one here yet—be the first to say hi!</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-700">
                  {members.map((member) => (
                    <li key={member.id} className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      {member.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <div className="flex flex-col rounded-3xl border border-[#e4dcc4] bg-white/80 p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                {room.description}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {!isJoined ? (
                  <button
                    type="button"
                    onClick={joinRoom}
                    className="interactive rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
                  >
                    Join room
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={leaveRoom}
                    className="interactive rounded-full border border-[#d8d2c0] px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
                  >
                    Leave room
                  </button>
                )}
              </div>
            </div>

            {statusMessage && <p className="text-sm text-red-500">{statusMessage}</p>}

            <div ref={messageListRef} className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[#e4dcc4] bg-white/70 p-4 text-sm text-slate-700">
              {formattedMessages.length === 0 ? (
                <p className="text-slate-500">Messages will appear here once the conversation gets going.</p>
              ) : (
                formattedMessages.map((msg, idx) => (
                  <div key={`${msg.timestamp}-${idx}`} className="space-y-1">
                    <div className="flex items-center gap-2">
                      {!msg.system && <span className="text-xs font-semibold text-[#2F4D6A]">{msg.name}</span>}
                      <span className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <p className={`rounded-2xl px-3 py-2 ${msg.system ? 'bg-[#f9f6ec] text-slate-500' : 'bg-white shadow'}`}>
                      {msg.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {isJoined && (
              <form onSubmit={sendMessage} className="mt-4 flex gap-3">
                <input
                  name="message"
                  placeholder="Share a thought, question, or win…"
                  className="flex-1 rounded-full border border-[#d8d2c0] bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#2F4D6A]"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="interactive rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
                >
                  Send
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-4 rounded-3xl border border-[#e4dcc4] bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Highlights so far</h3>
            <p className="text-sm text-slate-600">
              We summarise key points so you can catch up fast. Summaries are refreshed whenever you join.
            </p>
            <div className="rounded-2xl border border-[#e4dcc4] bg-white p-4 text-sm text-slate-700">
              {summaryLoading ? 'Pulling the latest highlights…' : summary || 'No summary yet. Start the chat to build one!'}
            </div>
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
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
    script.async = true;
    script.onload = () => {
      if (window.io) {
        resolve(window.io);
      } else {
        reject(new Error('Socket.IO client failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Socket.IO client'));
    document.body.appendChild(script);
  });
}
