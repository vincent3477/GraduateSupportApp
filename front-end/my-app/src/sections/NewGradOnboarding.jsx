import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Rocket, Target, Heart, Sparkles } from "lucide-react";
import { LS_KEYS, loadSupportData } from "../utils/supportStorage.js";
import SupportDashboard from "../components/SupportDashboard.jsx";

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
  loadAll: loadSupportData,
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
    `Share one authentic update about your journey with someone who roots for you — they’ll love hearing from you.`,
    `Look up a ${location || "local"} community space or virtual meetup and mark one you might join when you have capacity.`,
    "Block a 'soft focus' hour this week: light a candle, play music, check in with yourself, and pick one tiny action.",
    "Write a compassionate note to yourself for tough days; tuck it somewhere visible.",
  ];

  // Activity -> next steps
  const nextSteps = favorites.filter(Boolean).flatMap((act) => {
    const key = act.toLowerCase();
    if (key.includes("coding") || key.includes("program")) {
      return [
        {
          type: "next",
          title: "Create a playful coding nook",
          detail:
            "Spin up a lightweight project that brings you joy (think: mood tracker, gratitude bot) and celebrate the process, not perfection.",
          action: "Open a new repo or sandbox and jot down two whimsical ideas you’d enjoy building.",
        },
      ];
    }
    if (key.includes("reading")) {
      return [
        {
          type: "next",
          title: "Cozy reading ritual",
          detail: "Pair your favorite drink with 20 mindful minutes of reading and note one feeling or insight that surfaced.",
          action: "Pick two pieces to explore and block a gentle reading slot this week.",
        },
      ];
    }
    if (key.includes("gym") || key.includes("workout") || key.includes("run")) {
      return [
        {
          type: "next",
          title: "Movement that meets you where you are",
          detail: "Design a flexible movement menu (stretch, walk, dance break) that adapts to low, medium, and high energy days.",
          action: "List three movement options—one for each energy level—and place them where you’ll see them.",
        },
      ];
    }
    // default generic step
    return [
      {
        type: "next",
        title: `Nurture ${act}`,
        detail: `Spend time with ${act} in a way that feels restorative, then jot how it shifted your mood.`,
        action: "Schedule a short session and invite a friend or share a reflection afterward.",
      },
    ];
  });

  const goalPlans = goals.filter(Boolean).map((g, i) => ({
    type: "goal",
    title: `Goal ${i + 1}`,
    detail: g,
    action: "Name one low-pressure first move, celebrate it, and decide how you want to be supported for the next.",
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
              <span className="font-semibold">Why we ask:</span> Knowing your needs lets us suggest caring check-ins,
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
      <header className="mx-auto mb-8 flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2F4D6A] text-[#FFFDF6]">GP</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">GradPath Support Circle</h1>
            <p className="text-xs text-slate-500">A gentle space to name feelings, gather care, and plan soft next steps</p>
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
            className="interactive self-start rounded-xl border border-[#ded6c0] bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-[#f7f2e4]"
          >
            Clear my story (demo reset)
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
              <SupportDashboard user={user} prefs={prefs} recs={recs} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mx-auto mt-12 max-w-6xl text-center text-xs text-slate-500">
        Built with ❤️ to remind new grads they are never navigating the next chapter alone. (Demo only — connect your backend to go live.)
      </footer>
    </div>
  );
}
