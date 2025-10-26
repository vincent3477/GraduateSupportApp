import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROOMS } from "../data/rooms.js";
import { loadSupportData } from "../utils/supportStorage.js";
import PageBackButton from "../components/PageBackButton.jsx";

const CommunityChat = () => {
  const navigate = useNavigate();
  const profile = useMemo(() => loadSupportData().user || null, []);
  const profileName = profile?.name?.trim() || "";
  const [statusMessage, setStatusMessage] = useState("");

  const handleJoin = (roomId) => {
    if (!profileName) {
      setStatusMessage("Finish onboarding so we can greet you properly in the chat rooms.");
      return;
    }
    navigate(`/community-chat/${roomId}`, { state: { profile } });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-12">
        <PageBackButton fallback="/support" className="w-fit" />

        <header className="space-y-4 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            GradPath Live Community
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Choose your college chat and drop in instantly
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            We use the name saved during onboarding so your peers recognise you the moment you enter. Pick a college below to see what graduates are sharing right now.
          </p>
        </header>

        {statusMessage && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#fbbf24] bg-[#fff8eb] px-4 py-3 text-sm text-[#92400e]">
            {statusMessage}
            <button onClick={() => navigate('/onboarding')} className="ml-2 underline transition hover:text-[#b45309]">
              Complete onboarding
            </button>
          </div>
        )}

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
                      Enter {room.label} chat
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
