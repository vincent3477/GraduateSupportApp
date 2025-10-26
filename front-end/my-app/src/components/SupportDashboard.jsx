import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  MessageSquareText,
  Quote,
  Heart,
  Users as UsersIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

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
          className="rounded-2xl border border-[#e4dcc4] bg-white/80 p-5 shadow-sm shadow-[#2F4D6A]/5 backdrop-blur flex flex-col"
        >
          {/* Header with icon and title */}
          <div className="mb-3 flex items-start gap-2 text-slate-700">
            {r.name && <Sparkles size={18} className="mt-0.5 flex-shrink-0" />}
            {r.type === "next" && <Sparkles size={18} className="mt-0.5 flex-shrink-0" />}
            {r.type === "goal" && <Target size={18} className="mt-0.5 flex-shrink-0" />}
            {r.type === "tip" && <MessageSquareText size={18} className="mt-0.5 flex-shrink-0" />}
            {r.type === "quote" && <Quote size={18} className="mt-0.5 flex-shrink-0" />}
            {r.type === "selfcare" && <Heart size={18} className="mt-0.5 flex-shrink-0" />}
            {r.type === "community" && <UsersIcon size={18} className="mt-0.5 flex-shrink-0" />}
            
            <div className="flex-1">
              <h3 className="font-semibold">{r.name}</h3>
              {r.desc && <h4 className="font-normal text-slate-600">{r.desc}</h4>}
            </div>
          </div>

          {/* Detail text */}
          <p className="mb-3 text-sm text-slate-700">{r.detail}</p>

          {/* Action callout */}
          {r.action && (
            <div className="mb-3 rounded-xl bg-[#f9f6ec] p-3 text-sm text-slate-600">
              <span className="font-medium">Try this gentle next step:</span> {r.action}
            </div>
          )}

          {/* Spacer to push checkbox to bottom */}
          <div className="flex-1" />

          {/* Completion checkbox - bottom right */}
          <div className="flex justify-end">
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
        </motion.div>
      ))}
    </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Link
          to="/community-chat"
          className="group flex h-full flex-col gap-4 rounded-3xl border border-[#e4dcc4] bg-white p-6 text-left shadow-sm shadow-[#2F4D6A]/10 transition hover:-translate-y-1 hover:border-[#2F4D6A] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4D6A]"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8d2c0] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#2F4D6A]">
            Live Community
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Ready for real-time community support?</h3>
          <p className="text-sm text-slate-600">
            Join the live chat rooms to connect with grads from your college, swap wins, and stay in the loop.
          </p>
          <div className="mt-auto inline-flex items-center justify-between rounded-2xl bg-[#2F4D6A] px-4 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition group-hover:bg-[#375d80]">
            <span>Enter rooms</span>
            <span
              aria-hidden="true"
              className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#FFFDF6]/70 text-base transition group-hover:border-transparent group-hover:bg-[#FFFDF6] group-hover:text-[#2F4D6A]"
            >
              →
            </span>
          </div>
        </Link>

        <Link
          to="/private-match-chat"
          className="group flex h-full flex-col gap-4 rounded-3xl border border-[#e4dcc4] bg-white p-6 text-left shadow-sm shadow-[#2F4D6A]/10 transition hover:-translate-y-1 hover:border-[#2F4D6A] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4D6A]"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d8d2c0] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#2F4D6A]">
            Matched Peer Chat
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Continue your one-on-one momentum</h3>
          <p className="text-sm text-slate-600">
            Step into a private space curated by the profile matching prototype. Share wins, ask for feedback, and co-design your next move together.
          </p>
          <div className="mt-auto inline-flex items-center justify-between rounded-2xl bg-[#2F4D6A] px-4 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition group-hover:bg-[#375d80]">
            <span>Open your matched chat</span>
            <span
              aria-hidden="true"
              className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#FFFDF6]/70 text-base transition group-hover:border-transparent group-hover:bg-[#FFFDF6] group-hover:text-[#2F4D6A]"
            >
              →
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SupportDashboard;
