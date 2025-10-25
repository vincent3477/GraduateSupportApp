import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NAV_LEFT, NAV_RIGHT, ROOMS } from "../data/rooms.js";

const NAME_STORAGE_KEY = "gradpath_chat_display_name";

const CommunityChat = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(() => localStorage.getItem(NAME_STORAGE_KEY) || "");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (userName.trim()) {
      localStorage.setItem(NAME_STORAGE_KEY, userName.trim());
    }
  }, [userName]);

  const handleScrollTo = (roomId) => {
    const el = document.getElementById(`room-section-${roomId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleJoin = (roomId) => {
    const trimmed = userName.trim();
    if (!trimmed) {
      setStatusMessage("Add your name so grads know who just joined the room.");
      return;
    }
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setStatusMessage("");
    navigate(`/community-chat/${roomId}`, { state: { name: trimmed } });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="text-center space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            GradPath Live Community
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Choose your college and drop into the live chat
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            Each room keeps a running summary so you never miss the vibe. Add your name, pick your college, and go from observing to contributing in a heartbeat.
          </p>
        </header>

        <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-3xl border border-[#e4dcc4] bg-white/80 px-6 py-5 shadow-sm shadow-[#2F4D6A]/15 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 text-left">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">Your display name</h2>
            <p className="text-sm text-slate-600">Let others know who just joined the circle. You can edit this anytime.</p>
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g., Morgan (Architecture '24)"
              className="w-full rounded-full border border-[#d8d2c0] bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#2F4D6A] sm:max-w-xs"
            />
            <button
              type="button"
              onClick={() => userName.trim() && setStatusMessage("Name saved. Pick a chat below.")}
              className="interactive rounded-full border border-[#d8d2c0] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
            >
              Save
            </button>
          </div>
        </div>
        {statusMessage && (
          <p className="text-center text-sm text-red-500">{statusMessage}</p>
        )}

        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-full border border-[#e4dcc4] bg-white/80 px-6 py-3 text-sm font-medium text-slate-600 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {NAV_LEFT.map((room) => (
              <button
                key={room.id}
                type="button"
                className="interactive rounded-full border border-[#d8d2c0] bg-white px-4 py-2 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
                onClick={() => handleScrollTo(room.id)}
              >
                {room.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {NAV_RIGHT.map((room) => (
              <button
                key={room.id}
                type="button"
                className="interactive rounded-full border border-[#d8d2c0] bg-white px-4 py-2 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
                onClick={() => handleScrollTo(room.id)}
              >
                {room.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="space-y-12">
          {ROOMS.map((room, index) => {
            const isEven = index % 2 === 0;
            const sectionBg = isEven ? "bg-white" : "bg-[#f7f2e4]";
            const layout = isEven ? "lg:flex-row" : "lg:flex-row-reverse";
            return (
              <section
                id={`room-section-${room.id}`}
                key={room.id}
                className={`${sectionBg} rounded-3xl border border-[#e4dcc4] p-6 shadow-sm shadow-[#2F4D6A]/10 lg:p-10`}
              >
                <div className={`flex flex-col items-center gap-8 ${layout}`}>
                  <div className="w-full lg:w-1/2">
                    <img
                      src={room.image}
                      alt={room.label}
                      className="h-64 w-full rounded-3xl object-cover shadow-lg lg:h-72"
                    />
                  </div>
                  <div className="w-full space-y-4 text-center lg:w-1/2 lg:text-left">
                    <p className="text-xs uppercase tracking-[0.35em] text-[#2F4D6A]">Live chat room</p>
                    <h2 className="text-2xl font-semibold text-slate-900">{room.label}</h2>
                    <p className="text-sm text-slate-600">{room.description}</p>
                    <button
                      type="button"
                      className="interactive inline-flex items-center justify-center rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
                      onClick={() => handleJoin(room.id)}
                    >
                      Enter {room.label} chat room
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommunityChat;
