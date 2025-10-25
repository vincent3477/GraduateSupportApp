import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import NewGradOnboarding from "../sections/NewGradOnboarding.jsx";

const Onboarding = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#FFFDF6] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-[-16rem] z-0 flex justify-center blur-3xl">
        <div className="h-72 w-[38rem] -rotate-6 bg-gradient-to-br from-[#2F4D6A]/15 via-[#EBAF5F]/20 to-[#8FB3BF]/18 opacity-80" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 pb-24 pt-24 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="interactive inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm transition hover:border-[#cfc8b4] hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2F4D6A]/30 bg-[#2F4D6A]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-[#2F4D6A]">
            <Sparkles className="h-3.5 w-3.5" />
            GradPath Support
          </span>
        </div>

        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Feeling lost and alone right now? Tell us what would feel supportive.
          </h1>
          <p className="max-w-2xl text-base text-slate-600">
            Share how you are feeling, where you want encouragement, and the kinds of next steps that feel manageable
            right now. GradPath will craft a compassionate plan and community touchpoints you can lean on anytime.
          </p>
        </header>

        <aside className="rounded-3xl border border-[#e8e1cd] bg-white/90 p-5 text-sm text-slate-600 shadow-sm shadow-[#2F4D6A]/10">
          <p className="font-semibold text-slate-800">💛 Note from the GradPath circle</p>
          <p className="mt-2">
            “It’s okay if today feels messy. Share whatever you can—joy, doubt, tiredness. We’ll match you with peers,
            prompts, and gentle nudges so you feel held while figuring out the next step.”
          </p>
        </aside>

        <section className="rounded-3xl border border-[#e4dcc4] bg-white p-4 shadow-xl shadow-[#2F4D6A]/10 sm:p-8">
          <NewGradOnboarding />
        </section>
      </main>
    </div>
  );
};

export default Onboarding;
