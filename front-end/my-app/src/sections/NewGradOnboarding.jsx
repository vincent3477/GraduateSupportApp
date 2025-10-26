import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Rocket, Target, Heart, Sparkles, ArrowLeft } from "lucide-react";
import { LS_KEYS, loadSupportData } from "../utils/supportStorage.js";
import SupportDashboard from "../components/SupportDashboard.jsx";

// ----------------------------- Real API (Connected to ChromaDB)
const api = {
  async createAccount(profile) {
    console.log("📤 Creating user in ChromaDB...", profile);

    try {
      // Call backend to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          birthday: profile.birthday || '',
          major: profile.major || '',
          location: profile.location || ''
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ User created in backend:", data);

      // Extract user from response
      const user = data.user;

      // Also save to localStorage for quick access
      localStorage.setItem(LS_KEYS.user, JSON.stringify(user));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("gradpath:user-updated"));
      }

      return user;
    } catch (error) {
      console.error("❌ Failed to create user:", error);
      // Fallback to localStorage-only mode
      const user = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...profile };
      localStorage.setItem(LS_KEYS.user, JSON.stringify(user));
      return user;
    }
  },

  async savePreferences(userId, prefs) {
    console.log("📤 Saving preferences to ChromaDB...", { userId, prefs });

    try {
      // Call backend to save preferences and generate embedding
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favorites: prefs.favorites || [],
          goals: prefs.goals || []
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save preferences: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Preferences saved, embedding generated:", data);

      // Save to localStorage
      const stored = { userId, savedAt: new Date().toISOString(), ...prefs };
      localStorage.setItem(LS_KEYS.prefs, JSON.stringify(stored));

      return stored;
    } catch (error) {
      console.error("❌ Failed to save preferences:", error);
      // Fallback to localStorage only
      const stored = { userId, savedAt: new Date().toISOString(), ...prefs };
      localStorage.setItem(LS_KEYS.prefs, JSON.stringify(stored));
      return stored;
    }
  },

  async saveRecommendations(userId, recs) {
    // Keep this localStorage-only for now (recommendations not persisted to backend yet)
    const payload = { userId, generatedAt: new Date().toISOString(), items: recs };
    localStorage.setItem(LS_KEYS.recs, JSON.stringify(payload));
    return payload;
  },

  loadAll: loadSupportData,
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
            className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"
          >
            {v}
            <button
              onClick={() => remove(i)}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#2F4D6A] text-xs font-bold text-[#2F4D6A] transition hover:bg-[#2F4D6A] hover:text-[#FFFDF6]"
              aria-label={`Remove ${v}`}
            >
              ×
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
          className="interactive rounded-xl bg-[#2F4D6A] px-3 py-1 text-sm text-[#FFFDF6] transition hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#2F4D6A]"
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
  const steps = ["Create Your Space", "Share What You Need", "Your Support Board"];
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
function AccountForm({ onComplete, initialUser }) {
  const [name, setName] = useState(initialUser?.name ?? "");
  const [birthday, setBirthday] = useState(initialUser?.birthday ?? "");
  const [major, setMajor] = useState(initialUser?.major ?? "");
  const [location, setLocation] = useState(initialUser?.location ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialUser) return;
    setName(initialUser.name ?? "");
    setBirthday(initialUser.birthday ?? "");
    setMajor(initialUser.major ?? "");
    setLocation(initialUser.location ?? "");
    setEmail(initialUser.email ?? "");
  }, [initialUser]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!name || !email) throw new Error("Name and Email are required.");
      let user;
      if (initialUser?.id) {
        user = {
          ...initialUser,
          name,
          birthday,
          major,
          location,
          email,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(LS_KEYS.user, JSON.stringify(user));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("gradpath:user-updated"));
        }
      } else {
        user = await api.createAccount({ name, birthday, major, location, email });
      }
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
          <h2 className="text-xl font-semibold">Create your support profile</h2>
        </div>
        <p className="mb-6 text-sm text-slate-600">
          This helps us greet you by name, send encouragement to the right spot, and weave you into the GradPath circle.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Full Name" value={name} onChange={setName} placeholder="Alex Kim" required />
          <TextField label="Email" value={email} onChange={setEmail} placeholder="alex@email.com" required type="email" />
          <TextField label="Birthday" value={birthday} onChange={setBirthday} placeholder="YYYY-MM-DD" type="date" />
          <TextField label="Focus or field (optional)" value={major} onChange={setMajor} placeholder="e.g., Product design" />
          <TextField label="Where you're based" value={location} onChange={setLocation} placeholder="e.g., San Diego, CA" />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end">
          <button
            className="interactive inline-flex items-center gap-2 rounded-2xl bg-[#2F4D6A] px-5 py-2 text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#2F4D6A]"
            disabled={loading}
          >
            Save & continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">By continuing you agree to our Terms and Privacy Policy.</p>
    </motion.form>
  );
}

// The format from generateRecommendations() function: [{"name": "Master your field", "desc": "Deep dive into fundamentals and advanced concepts", "completed": false}]
// The "completed" field should be indicated by a checkmark.

function PreferencesForm({ user, onComplete, initialFavorites = [], initialGoals = [] }) {
  const [favorites, setFavorites] = useState(initialFavorites); // up to 3
  const [goals, setGoals] = useState(initialGoals); // up to 3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  useEffect(() => {
    setGoals(initialGoals);
  }, [initialGoals]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (favorites.length === 0 || goals.length === 0) throw new Error("Add at least one favorite and one goal.");
      const prefs = await api.savePreferences(user.id, { favorites, goals });
      const recs = await generateRecommendations(user, favorites, goals)

      await api.saveRecommendations(user.id, recs);
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
          <h2 className="text-xl font-semibold">Share what lifts and worries you</h2>
        </div>
        <p className="mb-6 text-sm text-slate-600">
          Tell us what’s keeping you grounded and where you could use some community care. We’ll reflect it back as
          gentle prompts, affirmations, and doable actions.
        </p>
        <div className="space-y-6">
          <ChipsInput
            label="What restores or energizes you right now?"
            values={favorites}
            setValues={setFavorites}
            placeholder="e.g., Morning walks, journaling, co-working with friends"
            max={3}
          />
          <ChipsInput
            label="What support or progress would feel meaningful next?"
            values={goals}
            setValues={setGoals}
            placeholder="e.g., Stay consistent with job search, find community, set healthier boundaries"
            max={3}
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>
              <span className="font-semibold">Why we ask:</span> Knowing your needs lets us suggest personalized
              community spaces, and next steps that truly fit.
            </p>
          </div>
          <button
            className="interactive inline-flex items-center gap-2 rounded-2xl bg-[#2F4D6A] px-5 py-2 text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#2F4D6A]"
            disabled={loading}
          >
            Show my support board <ChevronRight size={18} />
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

function Dashboard({ user, prefs, recs, onUpdatePreferences }) {
  const { favorites = [], goals = [] } = prefs || {};
  const [localRecs, setLocalRecs] = useState(recs);
  const [showGoalsPopup, setShowGoalsPopup] = useState(false);
  const [editedGoals, setEditedGoals] = useState([]);
  const [updating, setUpdating] = useState(false);
  
  // Debug logging
  console.log("📊 Dashboard recs:", recs);
  console.log("📊 Recs length:", recs?.length);
  if (recs?.[0]) {
    console.log("📊 First rec:", recs[0]);
  }
  
  // Update local state when props change
  useEffect(() => {
    setLocalRecs(recs);
  }, [recs]);
  
  const toggleCompleted = (index) => {
    const rec = localRecs[index];
    
    // If checking the box (marking as complete), show popup
    if (!rec.completed) {
      setEditedGoals([...goals]);
      setShowGoalsPopup(true);
    }
    
    setLocalRecs(prevRecs => {
      const updated = [...prevRecs];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      // Optionally save to localStorage
      api.saveRecommendations(user.id, updated);
      return updated;
    });
  };
  
  const saveGoals = async () => {
    setUpdating(true);
    try {
      // Save updated preferences
      const updatedPrefs = await api.savePreferences(user.id, { favorites, goals: editedGoals });

      // Generate new recommendations based on updated goals
      const newRecs = await generateRecommendations(user, favorites, editedGoals);
      await api.saveRecommendations(user.id, newRecs);
      
      // Update parent component state if callback provided
      if (onUpdatePreferences) {
        onUpdatePreferences({ prefs: updatedPrefs, recs: newRecs });
      }
      
      setShowGoalsPopup(false);
    } catch (err) {
      console.error("Failed to update goals:", err);
      alert("Failed to update goals. Please try again.");
    } finally {
      setUpdating(false);
    }
  };
  
  const addGoal = () => {
    if (editedGoals.length < 3) {
      setEditedGoals([...editedGoals, ""]);
    }
  };
  
  const updateGoal = (index, value) => {
    const updated = [...editedGoals];
    updated[index] = value;
    setEditedGoals(updated);
  };
  
  const removeGoal = (index) => {
    setEditedGoals(editedGoals.filter((_, i) => i !== index));
  };
  
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
        {localRecs.map((r, i) => (
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
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={r.completed}
                  onChange={() => toggleCompleted(i)}
                  className="h-4 w-4 cursor-pointer accent-green-600"
                />
                {r.completed && (
                  <span className="text-xs text-green-700">Done</span>
                )}
              </label>
            </div>
            <p className="text-sm text-slate-700">{r.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <CommunityChat />
      </div>
      
      
      <AnimatePresence>
        {showGoalsPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowGoalsPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-lg rounded-3xl border border-[#e4dcc4] bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-2 text-slate-700">
                <Sparkles size={20} />
                <h3 className="text-xl font-semibold">Great progress! 🎉</h3>
              </div>
              
              <p className="mb-4 text-sm text-slate-600">
                You completed a task! Here are your current goals. Would you like to update them?
              </p>
              
              <div className="space-y-3">
                {editedGoals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={goal}
                      onChange={(e) => updateGoal(i, e.target.value)}
                      placeholder="Enter a goal"
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    />
                    <button
                      onClick={() => removeGoal(i)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Remove goal"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {editedGoals.length < 3 && (
                  <button
                    onClick={addGoal}
                    className="w-full rounded-xl border-2 border-dashed border-slate-300 py-2 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-600"
                  >
                    + Add another goal
                  </button>
                )}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowGoalsPopup(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-50"
                >
                  Keep current goals
                </button>
                <button
                  onClick={saveGoals}
                  disabled={updating}
                  className="flex-1 rounded-xl bg-[#2F4D6A] px-4 py-2 text-[#FFFDF6] transition hover:bg-[#375d80] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Update goals"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    const { user: u, prefs: p, recs: r } = api.loadAll();
    if (u) setUser(u);
    if (p) setPrefs(p);
    if (r?.items) setRecs(r.items);
    if (u && p && r?.items) setStep(3);
  }, []);

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-[#f6efdc] to-[#e2edfb] px-4 py-10">
      <header className="mx-auto mb-8 flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="interactive inline-flex items-center gap-2 rounded-xl border border-[#ded6c0] bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          <div>
            <h1 className="text-xl font-bold text-slate-900">GradPath Support Circle</h1>
            <p className="text-xs text-slate-500">A space to build supportive community and plan next steps</p>
          </div>
        </div>
      </header>

      <main>
        <Stepper step={step} />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <AccountForm
                initialUser={user}
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
                initialFavorites={prefs?.favorites ?? []}
                initialGoals={prefs?.goals ?? []}
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
              <SupportDashboard user={user} prefs={prefs} recs={recs} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto mt-12 max-w-6xl text-center text-xs text-slate-500">
        Team 206: Built with ❤️ to remind new grads they are never navigating the next chapter alone. 
      </footer>
    </div>
  );
}
