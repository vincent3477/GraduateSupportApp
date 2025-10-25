import { ArrowRight, CalendarCheck, Compass, GraduationCap, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: GraduationCap,
    title: "Personalized Launch Plan",
    description:
      "Clarify your goals, surface hidden strengths, and map the next steps that move the needle for your career.",
  },
  {
    icon: Compass,
    title: "Guided Milestones",
    description:
      "Break the journey into manageable wins with reminders, templates, and gentle nudges when you need them.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Meet other grads, swap resources, and share progress in a space designed for accountability without pressure.",
  },
];

const roadmap = [
  {
    title: "Get grounded",
    detail: "Capture your interests, values, and constraints so the plan starts with who you are today.",
  },
  {
    title: "Experiment & iterate",
    detail: "Try small, low-risk experiments that build evidence and confidence before big commitments.",
  },
  {
    title: "Stay in motion",
    detail: "Track momentum with peers, reflections, and automated check-ins that celebrate every win.",
  },
];

const Home = () => {
  return (
    <div className="relative isolate overflow-hidden bg-[#FFFDF6] text-slate-900">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-x-0 top-[-12rem] z-0 flex justify-center blur-3xl">
        <div className="h-64 w-[36rem] -rotate-12 bg-gradient-to-br from-[#2F4D6A]/25 via-[#EBAF5F]/20 to-[#8FB3BF]/25 opacity-80" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-24 lg:px-12">
        <header className="grid gap-12 lg:grid-cols-[3fr,2fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c0] bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <CalendarCheck className="h-4 w-4" />
              Your next chapter, supported
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Build a career launch plan that honors your pace, energy, and ambition.
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              GradPath blends structured onboarding with on-demand encouragement so new graduates can make confident,
              values-aligned moves. Think of it as your accountability partner, strategy coach, and cheer squad,
              combined.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-6 py-3 text-base font-medium text-[#FFFDF6] shadow-lg shadow-[#2F4D6A]/30 transition hover:bg-[#375d80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4D6A]/60"
              >
                Start onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-sm text-slate-500">
                Takes about 4 minutes · saves you countless hours of uncertainty
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-[#e4dcc4] bg-white/80 p-6 shadow-2xl shadow-[#2F4D6A]/10 backdrop-blur"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2F4D6A]/10 via-white/40 to-[#EBAF5F]/10" />
            <div className="relative space-y-6">
              <p className="text-lg font-medium text-slate-900">“GradPath helped me stop guessing.”</p>
              <p className="text-sm text-slate-600">
                “Within a week I had a clear plan, real accountability, and a community cheering me on. It turned the
                post-grad fog into focused experiments.”
              </p>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <div className="h-10 w-10 rounded-full bg-[#2F4D6A]/15" />
                <div>
                  <p className="font-medium text-slate-900">Maya, Product New Grad</p>
                  <p>First role at a mission-driven startup</p>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <section className="grid gap-8 lg:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group flex flex-col gap-4 rounded-3xl border border-[#e4dcc4] bg-white p-6 transition hover:border-[#2F4D6A]/40 hover:shadow-lg hover:shadow-[#2F4D6A]/15"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F4D6A]/10 text-[#2F4D6A]">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-[#e4dcc4] bg-gradient-to-br from-white via-[#FFFDF6] to-[#f0ede2] p-8 lg:p-12 shadow-sm">
          <div className="grid gap-12 lg:grid-cols-[1.2fr,1fr] lg:items-start">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2F4D6A]">How it works</p>
              <h2 className="text-3xl font-semibold text-slate-900">A grounded path that adapts with you</h2>
              <p className="text-base text-slate-600">
                We pair reflection prompts with draft scripts, outreach templates, and self-care check-ins. Every step
                is lightweight, actionable, and designed for real humans juggling life and possibility.
              </p>
            </div>
            <div className="space-y-6">
              {roadmap.map(({ title, detail }, index) => (
                <div key={title} className="rounded-2xl border border-[#e8e1cd] bg-white p-5 shadow-sm shadow-[#2F4D6A]/5">
                  <span className="text-sm font-medium text-[#2F4D6A]">Step {index + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-6 rounded-3xl border border-[#e4dcc4] bg-white p-8 text-center shadow-lg shadow-[#2F4D6A]/10 lg:p-12">
          <h2 className="text-3xl font-semibold text-slate-900">Ready to feel supported in the transition?</h2>
          <p className="mx-auto max-w-2xl text-base text-slate-600">
            Join the guided onboarding to unlock tailored prompts, resource recommendations, and progress tracking made
            for new graduates navigating the first career leap.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-6 py-3 text-base font-medium text-[#FFFDF6] shadow-lg shadow-[#2F4D6A]/30 transition hover:bg-[#375d80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4D6A]/60"
            >
              Start onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-sm text-slate-500">No spam. No overwhelm. Just support.</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
