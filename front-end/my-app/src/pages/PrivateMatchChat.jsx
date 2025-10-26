import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, MapPin, MessageCircleHeart, Sparkles } from "lucide-react";
import moment from "moment";
import { LS_KEYS, loadSupportData } from "../utils/supportStorage.js";
import PageBackButton from "../components/PageBackButton.jsx";

const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const responseLibrary = [
  "Love how you’re approaching this. What feels like the next micro-step?",
  "Appreciate the share. What support would make this feel lighter?",
  "Thanks for looping me in. Want to try a five-minute brainstorm together?",
  "Hearing you. What’s one signal that will tell us the new approach is working?",
  "Let’s capture this as a win. Anything you want me to hold you accountable for?"
];

const quickPrompts = [
  "Here’s a win from this week I’m proud of...",
  "Something that still feels heavy right now is...",
  "Could you sense-check this outreach note with me?",
  "What would you focus on if you were in my shoes next?"
];

const normalizeMessages = (list) => {
  if (!Array.isArray(list)) return null;
  return list
    .filter((entry) => entry && entry.text)
    .map((entry) => ({
      id: entry.id || createId(),
      sender:
        entry.sender === "partner" || entry.sender === "you"
          ? entry.sender
          : entry.sender === "mentor"
          ? "partner"
          : "you",
      text: entry.text,
      timestamp: entry.timestamp || entry.time || moment().format("h:mm a")
    }));
};

const PrivateMatchChat = () => {
  const supportData = useMemo(() => loadSupportData(), []);
  const user = supportData.user || {};
  const firstName = user?.name?.split(" ")[0] || "friend";

  const fallbackPeer = {
    name: "Alex Rivera",
    role: "UX Research Mentor · Class of 2021",
    location: "Seattle, WA",
    sharedFocus: ["Imposter syndrome resets", "Story-first applications", "Gentle accountability"],
    responseTime: "Usually replies within a few hours",
    currentGoal: "Refining story arcs for fellowship interviews"
  };

  const rawPeer = user?.matchedPeer || {};
  const matchedPeer = {
    ...fallbackPeer,
    ...rawPeer,
    sharedFocus:
      Array.isArray(rawPeer.sharedFocus) && rawPeer.sharedFocus.length
        ? rawPeer.sharedFocus
        : fallbackPeer.sharedFocus,
    responseTime: rawPeer.responseTime || fallbackPeer.responseTime,
    currentGoal: rawPeer.currentGoal || fallbackPeer.currentGoal
  };
  const partnerFirstName = matchedPeer.name?.split(" ")[0] || "Partner";

  const initialMessages = useMemo(() => {
    const saved = normalizeMessages(supportData.chat);
    if (saved && saved.length) {
      return saved;
    }
    return [
      {
        id: createId(),
        sender: "partner",
        text: `Hey ${firstName}! The matching prototype paired us because we share a focus on thoughtful pivots. Ready when you are.`,
        timestamp: moment().subtract(2, "hours").format("h:mm a")
      },
      {
        id: createId(),
        sender: "you",
        text: "Hi Alex! Thanks for reaching out — would love to keep you in the loop as I test my narrative for product roles.",
        timestamp: moment().subtract(1, "hours").format("h:mm a")
      },
      {
        id: createId(),
        sender: "partner",
        text: "Amazing. Drop a note anytime you want feedback or a pep talk. I’ll keep an eye on your updates here.",
        timestamp: moment().subtract(58, "minutes").format("h:mm a")
      }
    ];
  }, [supportData.chat, firstName]);

  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LS_KEYS.chat, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  const buildResponse = () => {
    const index = Math.floor(Math.random() * responseLibrary.length);
    return responseLibrary[index];
  };

  const handleSend = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const outgoing = {
      id: createId(),
      sender: "you",
      text,
      timestamp: moment().format("h:mm a")
    };

    setMessages((prev) => [...prev, outgoing]);
    setDraft("");

    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      const response = {
        id: createId(),
        sender: "partner",
        text: buildResponse(),
        timestamp: moment().format("h:mm a")
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1400);
  };

  const handlePrompt = (prompt) => {
    setDraft(prompt);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <PageBackButton fallback="/support" />
          <span className="rounded-full bg-[#2F4D6A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">
            Private Match
          </span>
        </div>

        <header className="space-y-3 rounded-3xl border border-[#d9d1bc] bg-white/90 px-6 py-5 shadow-sm">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">
            <Sparkles className="h-4 w-4" /> Matched just for you
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {matchedPeer.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{matchedPeer.role}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2F4D6A]/10 px-3 py-1">
                <MapPin className="h-4 w-4 text-[#2F4D6A]" /> {matchedPeer.location}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2F4D6A]/10 px-3 py-1">
                <Clock className="h-4 w-4 text-[#2F4D6A]" /> {matchedPeer.responseTime}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Keep this channel for deep check-ins, mutual accountability, and narrative-building. We’ll save your thread so you can pick up right where you left off.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr_1fr]">
          <aside className="flex h-full flex-col gap-6 rounded-3xl border border-[#e4dcc4] bg-white/85 p-6 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">Shared focus</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {matchedPeer.sharedFocus.map((item, index) => (
                  <span key={index} className="rounded-full bg-[#2F4D6A]/10 px-3 py-1 text-xs font-semibold text-[#2F4D6A]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">Current intention</h3>
              <p className="mt-2 text-sm text-slate-700">
                {matchedPeer.currentGoal}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f3f4ff] p-4 text-sm text-slate-700">
              <p className="font-semibold text-[#2F4D6A]">You &amp; {partnerFirstName}</p>
              <p className="mt-1 text-xs text-slate-600">
                Matched via the profile prototype using career goals, preferred accountability rhythm, and interest tags.
              </p>
            </div>
          </aside>

          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#e4dcc4] bg-white/85 p-6 shadow-sm">
            <div ref={messageListRef} className="chat-messages flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.sender === "you"
                        ? "bg-[#2F4D6A] text-[#FFFDF6]"
                        : "bg-[#f3f4ff] text-slate-700"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-inherit opacity-70">
                      {msg.sender === "you" ? firstName : partnerFirstName}
                    </p>
                    <p className="mt-1 whitespace-pre-line">{msg.text}</p>
                    <p
                      className={`mt-2 text-[10px] uppercase tracking-[0.3em] ${
                        msg.sender === "you" ? "text-[#d8e2f0]" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[65%] rounded-2xl bg-[#f3f4ff] px-4 py-3 text-sm text-slate-600 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2F4D6A] opacity-70">
                      {partnerFirstName}
                    </p>
                    <p className="mt-1 italic text-slate-500">typing…</p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                name="message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Share an update with ${partnerFirstName}`}
                className="flex-1 rounded-full border border-[#d8d2c0] bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-[#2F4D6A]"
                autoComplete="off"
              />
              <button
                type="submit"
                className="interactive inline-flex items-center justify-center gap-2 rounded-full bg-[#2F4D6A] px-5 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
              >
                <MessageCircleHeart className="h-4 w-4" /> Send
              </button>
            </form>
          </div>

          <aside className="flex h-full flex-col gap-5 rounded-3xl border border-[#e4dcc4] bg-white/85 p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2F4D6A]">Quick prompts</h3>
              <div className="mt-3 space-y-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handlePrompt(prompt)}
                    className="interactive w-full rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-[#f7f2e4] p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Shared reflections</p>
              <p className="mt-1 text-xs text-slate-600">
                Capture agreements or next steps after each exchange so the profile prototype can keep nudging both of you in the right direction.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-[#d9d1bc] p-4 text-center text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Need a reset?</p>
              <p className="mt-1 text-xs text-slate-500">
                Send a summary request and we’ll compile highlights from the last few check-ins once the AI summariser is connected.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default PrivateMatchChat;
