import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  MessageSquareText,
  Quote,
  Heart,
  Users as UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LS_KEYS } from "../utils/supportStorage.js";

function CommunityChat() {
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem(LS_KEYS.chat) || "[]"));
  const [text, setText] = useState("");

  useEffect(() => localStorage.setItem(LS_KEYS.chat, JSON.stringify(messages)), [messages]);

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), text: text.trim(), at: new Date().toISOString() },
    ]);
    setText("");
  };

  return (
    <div className="flex h-80 flex-col rounded-2xl border border-[#e4dcc4] bg-white/80 p-4 shadow-sm shadow-[#2F4D6A]/5">
      <div className="mb-2 flex items-center gap-2 text-slate-700">
        <UsersIcon size={18} />
        <span className="font-semibold">Community check-in (demo)</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-[#f9f6ec] p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-slate-500">
            No messages yet. Drop a feeling, a tiny win, or a reminder someone else might need today. 💛
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="w-fit max-w-[80%] rounded-xl bg-white px-3 py-2 shadow">
            <p>{m.text}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
              {new Date(m.at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Share how you're feeling, a gentle reminder, or a small celebration…"
          className="flex-1 rounded-xl border border-slate-300 bg-white/70 px-3 py-2 outline-none focus:border-slate-400"
        />
        <button
          onClick={send}
          className="interactive rounded-xl bg-[#2F4D6A] px-4 py-2 text-[#FFFDF6] transition hover:bg-[#375d80]"
        >
         Send
       </button>
      </div>
    </div>
  );
}

const SupportDashboard = ({ user, prefs, recs }) => {
  const { favorites = [], goals = [] } = prefs || {};

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">
            Welcome back, {user?.name?.split(" ")[0] || "friend"} 👋
          </h2>
          <p className="text-slate-600">
            Here is a mix of encouragement, grounding reflections, and gentle next steps based on what you shared.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          {favorites.map((f, i) => (
            <span key={i} className="rounded-full border border-slate-300 px-3 py-1">
              {f}
            </span>
          ))}
          {goals.map((g, i) => (
            <span key={i} className="rounded-full border border-[#8FB3BF] bg-[#8FB3BF]/20 px-3 py-1">
              💡 {g}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recs.map((r, i) => (
          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="rounded-2xl border border-[#e4dcc4] bg-white/80 p-5 shadow-sm shadow-[#2F4D6A]/5 backdrop-blur"
          >
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              {r.name && <Sparkles size={18}/>}
              {r.type === "next" && <Sparkles size={18} />}
              {r.type === "goal" && <Target size={18} />}
              {r.type === "tip" && <MessageSquareText size={18} />}
              {r.type === "quote" && <Quote size={18} />}
              {r.type === "selfcare" && <Heart size={18} />}
              {r.type === "community" && <UsersIcon size={18} />}
              <h3 className="font-semibold">{r.name}</h3>
              <h4 className="font-regular">{r.desc}</h4>
            </div>
            <p className="text-sm text-slate-700">{r.detail}</p>
            {r.action && (
              <div className="mt-3 rounded-xl bg-[#f9f6ec] p-3 text-sm text-slate-600">
                <span className="font-medium">Try this gentle next step:</span> {r.action}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <CommunityChat />
      </div>
    </div>
  );
};

export default SupportDashboard;
