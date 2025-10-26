import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SupportDashboard from "../components/SupportDashboard.jsx";
import PageBackButton from "../components/PageBackButton.jsx";
import { loadSupportData } from "../utils/supportStorage.js";

const SupportBoard = () => {
  const [data, setData] = useState(() => loadSupportData());

  useEffect(() => {
    setData(loadSupportData());
  }, []);

  if (!data.user || !data.prefs || !data.recs || !data.recs.items) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-24 text-slate-900">
        <div className="mx-auto max-w-xl rounded-3xl border border-[#e4dcc4] bg-white/90 p-8 text-center shadow-lg shadow-[#2F4D6A]/10 backdrop-blur">
          <h1 className="text-2xl font-semibold text-slate-900">We’re still gathering your story</h1>
          <p className="mt-4 text-sm text-slate-600">
            Finish onboarding so we can craft a support board filled with reflections, next steps, and community touchpoints tailored to you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-semibold">
            <Link
              to="/onboarding"
              className="interactive rounded-full bg-[#2F4D6A] px-5 py-2 text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
            >
              Resume onboarding
            </Link>
            <Link
              to="/"
              className="interactive rounded-full border border-[#d8d2c0] px-5 py-2 text-slate-700 transition hover:border-[#2F4D6A] hover:text-[#2F4D6A]"
            >
              Return home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#FFFDF6] via-white to-[#f0ede2] px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-12">
        <PageBackButton fallback="/" className="w-fit" />
        <header className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            GradPath Support Board
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Your care hub, always within reach
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">
            Everything you saved, every nudge we suggested, and every community touchpoint — all in one steady place.
          </p>
        </header>

        <SupportDashboard user={data.user} prefs={data.prefs} recs={data.recs.items || []} />
      </div>
    </section>
  );
};

export default SupportBoard;
