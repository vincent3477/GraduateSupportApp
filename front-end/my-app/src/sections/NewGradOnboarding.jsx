import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Rocket, Quote, MessageSquareText, Users, Target, Heart, Sparkles } from "lucide-react";

// ----------------------------- Utility: localStorage keys
const LS_KEYS = {
  user: "ng_user_profile",
  prefs: "ng_user_prefs",
  recs: "ng_user_recs",
  chat: "ng_demo_chat",
};

// ----------------------------- Mock API
const mockApi = {
  async createAccount(profile) {
    // Simulate an ID and persistence
    const user = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...profile };
    localStorage.setItem(LS_KEYS.user, JSON.stringify(user));
    await new Promise((r) => setTimeout(r, 300));
    return user;
  },
  async savePreferences(userId, prefs) {
    const stored = { userId, savedAt: new Date().toISOString(), ...prefs };
    localStorage.setItem(LS_KEYS.prefs, JSON.stringify(stored));
    await new Promise((r) => setTimeout(r, 250));
    return stored;
  },
  async saveRecommendations(userId, recs) {
    const payload = { userId, generatedAt: new Date().toISOString(), items: recs };
    localStorage.setItem(LS_KEYS.recs, JSON.stringify(payload));
    return payload;
  },
  loadAll() {
    return {
      user: JSON.parse(localStorage.getItem(LS_KEYS.user) || "null"),
      prefs: JSON.parse(localStorage.getItem(LS_KEYS.prefs) || "null"),
      recs: JSON.parse(localStorage.getItem(LS_KEYS.recs) || "null"),
      chat: JSON.parse(localStorage.getItem(LS_KEYS.chat) || "[]"),
    };
  },
};

// ----------------------------- Simple recommendation/LLM-ish generator
function generateRecommendations({ name, major, location }, favorites, goals) {
  const quotes = [
    "Small steps compound into big wins.",
    "Done is better than perfect.",
    "Your future self is watching. Make them proud.",
    "Consistency beats intensity.",
  ];

  const selfCare = [
    "Pause for a 5‑minute walk and 3 deep breaths.",
    "Hydrate and stretch your neck/shoulders.",
    "Write one thing you're grateful for today.",
    "Block 15 minutes for quiet focus.",
  ];

  const tips = [
    `Leverage your ${major || "core"} background to stand out in projects and interviews.`,
    `Showcase location‑specific impact: find ${location || "local"} meetups and volunteer gigs.`,
    "Document learning publicly (LinkedIn/Twitter) weekly.",
    "Batch tasks: job apps, outreach, and learning in focused blocks.",
  ];

  // Activity -> next steps
  const nextSteps = favorites.filter(Boolean).flatMap((act) => {
    const key = act.toLowerCase();
    if (key.includes("coding") || key.includes("program")) {
      return [
        {
          type: "next",
          title: "Ship a Mini App",
          detail:
            "Build and deploy a 1‑weekend project (e.g., API + tiny frontend). Post a 2‑minute demo.",
          action: "Create repo + write a README roadmap.",
        },
      ];
    }
    if (key.includes("reading")) {
      return [
        {
          type: "next",
          title: "30‑30 Reading Sprint",
          detail: "30 minutes/day for 2 weeks. Summarize learnings in a note and share.",
          action: "Pick 2 books or 6 articles and schedule sessions.",
        },
      ];
    }
    if (key.includes("gym") || key.includes("workout") || key.includes("run")) {
      return [
        {
          type: "next",
          title: "Fitness Habit Ladder",
          detail: "Define a 3‑tier routine (tiny/standard/ambitious) and track for 14 days.",
          action: "Set alarms and prep gear the night before.",
        },
      ];
    }
    // default generic step
    return [
      {
        type: "next",
        title: `Deep‑dive: ${act}`,
        detail: `Research a community or event near ${location || "you"} to practice ${act}.`,
        action: "Find 1 meetup and RSVP by Friday.",
      },
    ];
  });

  const goalPlans = goals.filter(Boolean).map((g, i) => ({
    type: "goal",
    title: `Goal ${i + 1}`,
    detail: g,
    action: "Break into 3 milestones; schedule the first milestone for this week.",
  }));

  const items = [
    ...nextSteps,
    ...goalPlans,
    { type: "tip", title: "Pro Tip", detail: tips[Math.floor(Math.random() * tips.length)] },
    { type: "quote", title: "Motivational Quote", detail: quotes[Math.floor(Math.random() * quotes.length)] },
    { type: "selfcare", title: "Self‑Care", detail: selfCare[Math.floor(Math.random() * selfCare.length)] },
    { type: "community", title: "Community Chat", detail: "Say hi and share a tiny win today!" },
  ];

  return items;
}

// ----------------------------- Form helpers
function TextField({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-2xl border border-slate-300 bg-white/70 px-4 py-2 outline-none ring-0 focus:border-slate-400 focus:bg-white focus:shadow-sm"
      />
    </label>
  );
}

function ChipsInput({ label, values, setValues, max = 3, placeholder }) {
  const [input, setInput] = useState("");
  const canAdd = input.trim() && values.length < max;
  const add = () => {
    if (!canAdd) return;
    setValues([...values, input.trim()]);
    setInput("");
  };
  const remove = (i) => setValues(values.filter((_, idx) => idx !== i));
  return (
    <div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-300 bg-white/70 p-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm"
          >
            {v}
            <button
              onClick={() => remove(i)}
              className="rounded-full p-1 hover:bg-slate-100"
              aria-label={`Remove ${v}`}
            >
              
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 min-w-[120px] bg-transparent px-2 py-1 outline-none"
        />
        <button
          onClick={add}
          disabled={!canAdd}
          className="rounded-xl bg-slate-900 px-3 py-1 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{values.length}/{max}</p>
    </div>
  );
}

// ----------------------------- Stepper UI
function Stepper({ step }) {
  const steps = ["Create Account", "Your Interests & Goals", "Your Dashboard"];
  return (
    <div className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-between">
      {steps.map((s, i) => {
        const idx = i + 1;
        const active = step === idx;
        const completed = idx < step;
        return (
          <div key={s} className="flex flex-1 items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
                active
                  ? "bg-slate-900 text-white"
                  : completed
                  ? "bg-green-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {completed ? <Check size={16} /> : <span className="font-semibold">{idx}</span>}
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-slate-200" />}
          </div>
        );
      })}
    </div>
  );
}

// ----------------------------- Pages
function AccountForm({ onComplete }) {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [major, setMajor] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!name || !email) throw new Error("Name and Email are required.");
      const user = await mockApi.createAccount({ name, birthday, major, location, email });
      onComplete(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form layout onSubmit={submit} className="mx-auto max-w-xl space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Rocket className="inline" size={20} />
          <h2 className="text-xl font-semibold">Create your account</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Full Name" value={name} onChange={setName} placeholder="Alex Kim" required />
          <TextField label="Email" value={email} onChange={setEmail} placeholder="alex@email.com" required type="email" />
          <TextField label="Birthday" value={birthday} onChange={setBirthday} placeholder="YYYY-MM-DD" type="date" />
          <TextField label="Major" value={major} onChange={setMajor} placeholder="Computer Science" />
          <TextField label="Location" value={location} onChange={setLocation} placeholder="San Diego, CA" />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-white shadow hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">By continuing you agree to our Terms and Privacy Policy.</p>
    </motion.form>
  );
}

function PreferencesForm({ user, onComplete }) {
  const [favorites, setFavorites] = useState([]); // up to 3
  const [goals, setGoals] = useState([]); // up to 3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (favorites.length === 0 || goals.length === 0) throw new Error("Add at least one favorite and one goal.");
      const prefs = await mockApi.savePreferences(user.id, { favorites, goals });
      const recs = generateRecommendations(user, favorites, goals);
      await mockApi.saveRecommendations(user.id, recs);
      onComplete({ user, prefs, recs });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form layout onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Target className="inline" size={20} />
          <h2 className="text-xl font-semibold">Your interests & goals</h2>
        </div>
        <div className="space-y-6">
          <ChipsInput
            label="Top 3 favorite things to do in your free time"
            values={favorites}
            setValues={setFavorites}
            placeholder="e.g., Coding side projects, Reading sci‑fi, Gym"
            max={3}
          />
          <ChipsInput
            label="Top 3 goals you want to achieve"
            values={goals}
            setValues={setGoals}
            placeholder="e.g., Land a SWE role, Improve DSA, Publish a blog"
            max={3}
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-between text-sm text-slate-600">
          <div>
            <p><span className="font-semibold">Why we ask:</span> We personalize your dashboard, match communities, and plan next steps.</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2 text-white shadow hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            Build my dashboard <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.form>
  );
}

// ----------------------------- Community Chat (demo, local only)
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
    <div className="flex h-80 flex-col rounded-2xl border border-slate-200 bg-white/80 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-700"><Users size={18} /><span className="font-semibold">Community — real‑time (demo)</span></div>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-slate-500">No messages yet. Be the first to share a tiny win! 🎉</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="w-fit max-w-[80%] rounded-xl bg-white px-3 py-2 shadow">
            <p>{m.text}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{new Date(m.at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder="Share a tip, ask a question, or celebrate a win…"
          className="flex-1 rounded-xl border border-slate-300 bg-white/70 px-3 py-2 outline-none focus:border-slate-400"
        />
        <button
          onClick={send}
          className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:opacity-95"
        >Send</button>
      </div>
    </div>
  );
}

// ----------------------------- Dashboard
function Dashboard({ user, prefs, recs }) {
  const { favorites = [], goals = [] } = prefs || {};
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Welcome back, {user?.name?.split(" ")[0] || "friend"} 👋</h2>
          <p className="text-slate-600">We've tailored your dashboard from your interests and goals.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-slate-600">
          {favorites.map((f, i) => (
            <span key={i} className="rounded-full border border-slate-300 px-3 py-1">{f}</span>
          ))}
          {goals.map((g, i) => (
            <span key={i} className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1">🎯 {g}</span>
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
            className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              {r.type === "next" && <Sparkles size={18} />}
              {r.type === "goal" && <Target size={18} />}
              {r.type === "tip" && <MessageSquareText size={18} />}
              {r.type === "quote" && <Quote size={18} />}
              {r.type === "selfcare" && <Heart size={18} />}
              {r.type === "community" && <Users size={18} />}
              <h3 className="font-semibold">{r.title}</h3>
            </div>
            <p className="text-sm text-slate-700">{r.detail}</p>
            {r.action && (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-medium">Next step:</span> {r.action}
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
}

// ----------------------------- Root
export default function NewGradOnboarding() {
  const [step, setStep] = useState(1); // 1 account, 2 prefs, 3 dashboard
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState(null);
  const [recs, setRecs] = useState([]);

  // Bootstrap from localStorage (resume session)
  useEffect(() => {
    const { user: u, prefs: p, recs: r } = mockApi.loadAll();
    if (u) setUser(u);
    if (p) setPrefs(p);
    if (r?.items) setRecs(r.items);
    if (u && p && r?.items) setStep(3);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 px-4 py-10">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">NG</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">NewGradSupport</h1>
            <p className="text-xs text-slate-500">Personalized path to your next step</p>
          </div>
        </div>
        {step === 3 && (
          <button
            onClick={() => {
              localStorage.removeItem(LS_KEYS.user);
              localStorage.removeItem(LS_KEYS.prefs);
              localStorage.removeItem(LS_KEYS.recs);
              setUser(null);
              setPrefs(null);
              setRecs([]);
              setStep(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Reset Demo
          </button>
        )}
      </header>

      <main>
        <Stepper step={step} />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <AccountForm
                onComplete={(u) => {
                  setUser(u);
                  setStep(2);
                }}
              />
            </motion.div>
          )}

          {step === 2 && user && (
            <motion.div key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <PreferencesForm
                user={user}
                onComplete={({ prefs: p, recs: r }) => {
                  setPrefs(p);
                  setRecs(r);
                  setStep(3);
                }}
              />
            </motion.div>
          )}

          {step === 3 && user && (
            <motion.div key="step3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Dashboard user={user} prefs={prefs} recs={recs} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto mt-12 max-w-6xl text-center text-xs text-slate-500">
        Built with ❤️ for new grads. This is a local demo — wire to your backend for production.
      </footer>
    </div>
  );
}
