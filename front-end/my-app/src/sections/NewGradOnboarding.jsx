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



export async function generateRecommendations(profile, favorites = [], goals = [], opts = {}) {
  // Remove the full URL, just use the path
  const { signal, baseURL = "/api/recommendations" } = opts;  // ← Changed here
  
  const params = new URLSearchParams();
  if (profile.name) params.set("name", profile.name);
  if (profile.major) params.set("major", profile.major);
  if (profile.location) params.set("location", profile.location);
  favorites.forEach(f => params.append("favorites", f));
  goals.forEach(g => params.append("goals", g));

  const url = `${baseURL}?${params.toString()}`;
  
  console.log("🔍 Calling URL:", url);
  
  try {
    const res = await fetch(url, { method: "GET", signal });
    
    console.log("📡 Response status:", res.status);
    console.log("📋 Content-Type:", res.headers.get("content-type"));
    
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Response:", text);
      throw new Error(`Fetch failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log("✅ Got data:", data);
    return data;
  } catch (error) {
    console.error("💥 Error:", error);
    throw error;
  }
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
          className="rounded-xl bg-[#2F4D6A] px-3 py-1 text-sm text-[#FFFDF6] transition hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#2F4D6A]"
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
                  ? "bg-[#2F4D6A] text-[#FFFDF6]"
                  : completed
                  ? "bg-[#8FB3BF] text-[#1f3a3f]"
                  : "bg-[#f4efe2] text-slate-600"
              }`}
            >
              {completed ? <Check size={16} /> : <span className="font-semibold">{idx}</span>}
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className="mx-2 h-px flex-1 bg-[#eadfca]" />}
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
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/80 p-6 shadow-sm backdrop-blur">
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
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2F4D6A] px-5 py-2 text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#2F4D6A]"
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

// The format from generateRecommendations() function: [{"name": "Master your field", "desc": "Deep dive into fundamentals and advanced concepts", "completed": false}]
// The "completed" field should be indicated by a checkmark.

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
      const recs = await generateRecommendations(user, favorites, goals)
      
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
      <div className="rounded-3xl border border-[#e4dcc4] bg-white/80 p-6 shadow-sm backdrop-blur">
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
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2F4D6A] px-5 py-2 text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#2F4D6A]"
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
    <div className="flex h-80 flex-col rounded-2xl border border-[#e4dcc4] bg-white/80 p-4 shadow-sm shadow-[#2F4D6A]/5">
      <div className="mb-2 flex items-center gap-2 text-slate-700"><Users size={18} /><span className="font-semibold">Community — real‑time (demo)</span></div>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-[#f9f6ec] p-3 text-sm">
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
          className="rounded-xl bg-[#2F4D6A] px-4 py-2 text-[#FFFDF6] transition hover:bg-[#375d80]"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ----------------------------- Dashboard
// ----------------------------- Dashboard
function Dashboard({ user, prefs, recs }) {
  const { favorites = [], goals = [] } = prefs || {};
  
  // Debug logging
  console.log("📊 Dashboard recs:", recs);
  console.log("📊 Recs length:", recs?.length);
  if (recs?.[0]) {
    console.log("📊 First rec:", recs[0]);
  }
  
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
            <span key={i} className="rounded-full border border-[#8FB3BF] bg-[#8FB3BF]/20 px-3 py-1">🎯 {g}</span>
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
            className={`rounded-2xl border p-5 shadow-sm backdrop-blur ${
              r.completed 
                ? 'border-green-300 bg-green-50/80 shadow-green-200/20' 
                : 'border-[#e4dcc4] bg-white/80 shadow-[#2F4D6A]/5'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Target size={18} />
                <h3 className="font-semibold">{r.name}</h3>
              </div>
              {r.completed && (
                <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                  <Check size={14} />
                  <span>Done</span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-700">{r.desc}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-[#f6efdc] to-[#e2edfb] px-4 py-10">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2F4D6A] text-[#FFFDF6]">NG</div>
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
            className="rounded-xl border border-[#ded6c0] bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-[#f7f2e4]"
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
