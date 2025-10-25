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

      <div className="mt-10 rounded-3xl border border-[#e4dcc4] bg-white p-6 shadow-sm shadow-[#2F4D6A]/10">
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">Ready for real-time community support?</h3>
            <p className="text-sm text-slate-600">
              Join the live chat rooms to connect with grads from your college, swap wins, and stay in the loop.
            </p>
          </div>
          <Link
            to="/community-chat"
            className="interactive inline-flex items-center justify-center rounded-full bg-[#2F4D6A] px-5 py-3 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
          >
            Click here to join a community chat room
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupportDashboard;
