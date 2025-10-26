import { useCallback, useEffect, useState } from "react";
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
import MatchedPeersWidget from "./MatchedPeersWidget.jsx";

const SupportDashboard = ({ user, prefs, recs }) => {
  const { favorites = [], goals = [] } = prefs || {};
  // Limit to top 8 recommendations for cleaner layout
  const [items, setItems] = useState(() => normaliseRecs(recs).slice(0, 8));

  useEffect(() => {
    setItems(normaliseRecs(recs).slice(0, 8));
  }, [recs]);

  const toggleCompleted = useCallback((index) => {
    setItems((prev) => {
      const next = prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      );
      return reorderRecs(next);
    });
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header Section */}
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

      {/* Two-column layout: Main content + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* LEFT COLUMN: Recommendation cards only */}
        <div>
          {/* Recommendation Cards Grid - Top 8 only */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {items.map((r, i) => {
              const iconColor = r.completed ? "mt-0.5 flex-shrink-0 text-[#F6F8FF]" : "mt-0.5 flex-shrink-0 text-[#2F4D6A]";
              const titleColor = r.completed ? "text-[#F5F7FB]" : "text-slate-800";
              const detailColor = r.completed ? "text-[#D9E1F6]" : "text-slate-700";
              const mutedColor = r.completed ? "text-[#CED8F0]" : "text-slate-600";
              const actionStyles = r.completed
                ? "mb-3 rounded-xl bg-[#1f3550] p-3 text-sm text-[#D9E1F6]"
                : "mb-3 rounded-xl bg-[#f9f6ec] p-3 text-sm text-slate-600";

              return (
                <motion.div
                  key={r.id ?? `rec-${i}`}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className={`flex flex-col rounded-2xl border p-5 shadow-sm shadow-[#2F4D6A]/5 backdrop-blur transition-colors ${
                    r.completed
                      ? "border-[#1f3550] bg-[#2F4D6A] text-[#F5F7FB]"
                      : "border-[#e4dcc4] bg-white/80 text-slate-700"
                  }`}
                >
                  {/* Header with icon and title */}
                  <div className={`mb-3 flex items-start gap-2 ${detailColor}`}>
                    {r.name && <Sparkles size={18} className={iconColor} />}
                    {r.type === "next" && <Sparkles size={18} className={iconColor} />}
                    {r.type === "goal" && <Target size={18} className={iconColor} />}
                    {r.type === "tip" && <MessageSquareText size={18} className={iconColor} />}
                    {r.type === "quote" && <Quote size={18} className={iconColor} />}
                    {r.type === "selfcare" && <Heart size={18} className={iconColor} />}
                    {r.type === "community" && <UsersIcon size={18} className={iconColor} />}

                    <div className="flex-1">
                      <h3 className={`font-semibold ${titleColor}`}>{r.name}</h3>
                      {r.desc && <h4 className={`font-normal ${mutedColor}`}>{r.desc}</h4>}
                    </div>
                  </div>

                  {/* Detail text */}
                  <p className={`mb-3 text-sm ${detailColor}`}>{r.detail}</p>

                  {/* Action callout */}
                  {r.action && (
                    <div className={actionStyles}>
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
                        className={`h-4 w-4 cursor-pointer ${r.completed ? "accent-[#F5F7FB]" : "accent-green-600"}`}
                      />
                      {r.completed && (
                        <span className="text-xs text-[#E4ECFF]">Done</span>
                      )}
                    </label>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Matched Peers Widget */}
        <aside className="hidden lg:block">
          <MatchedPeersWidget userId={user?.id} />
        </aside>
      </div>

      {/* Community and Private chat links - Full width below */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
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
                Your Personalized Match
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Continue your one-on-one momentum</h3>
              <p className="text-sm text-slate-600">
                Step into a private space curated by the profile matching prototype. Ask for advice, and co-design your next move together.
              </p>
              <div className="mt-auto inline-flex items-center justify-between rounded-2xl bg-[#2F4D6A] px-4 py-2 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition group-hover:bg-[#375d80]">
                <span>Chat with your peer</span>
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

function reorderRecs(list = []) {
  const pending = [];
  const done = [];
  list.forEach((item) => {
    if (item?.completed) {
      done.push(item);
    } else {
      pending.push(item);
    }
  });
  return [...pending, ...done];
}

function normaliseRecs(recs = []) {
  if (!Array.isArray(recs)) return [];
  return reorderRecs(
    recs.map((item) => ({
      ...item,
      completed: Boolean(item?.completed),
    }))
  );
}
