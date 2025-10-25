import { ArrowRight, CalendarCheck, Compass, GraduationCap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const highlights = [
  {
    icon: GraduationCap,
    title: "Whole-Self Support",
    description:
      "Name the feelings, wins, and worries of your transition so you can move forward with compassion and clarity.",
  },
  {
    icon: Compass,
    title: "Next-Step Guidance",
    description:
      "Surface gentle prompts and right-sized actions that keep momentum without overwhelming your energy.",
  },
  {
    icon: Users,
    title: "Circle of Care",
    description:
      "Lean on peers, reflective prompts, and moderated chats built to remind you that you are not doing this alone.",
  },
];

const roadmap = [
  {
    title: "Settle in & share",
    detail: "Create a profile that captures how you are feeling, what you need, and the pace that feels sustainable.",
  },
  {
    title: "Receive gentle nudges",
    detail: "Get weekly reflections, wellbeing reminders, and achievable next steps tailored to your situation.",
  },
  {
    title: "Grow with your people",
    detail: "Check in with a supportive community that celebrates small wins, normalizes setbacks, and keeps you seen.",
  },
];

const Home = () => {
  return (
    <div className="relative isolate overflow-hidden bg-[#FFFDF6] text-slate-900">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-x-0 top-[-12rem] z-0 flex justify-center blur-3xl">
        <div className="h-64 w-[36rem] -rotate-12 bg-gradient-to-br from-[#2F4D6A]/25 via-[#EBAF5F]/20 to-[#8FB3BF]/25 opacity-80" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-24 lg:px-12">
        <header className="flex min-h-[70vh] flex-col items-center justify-center gap-20 text-center">
          <div className="max-w-3xl space-y-8 mb-4">
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl font-semibold tracking-tight leading-snug text-slate-900 sm:text-5xl sm:leading-tight"
            >
              Feeling lost in the post-grad haze? 
                < div className="text-xl mt-4">
                    Find your community with GradPath.
                </div>
            </motion.h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              GradPath combines emotional check-ins, community accountability, and bite-sized guidance so you can honor
              what you are feeling while still making steady moves toward what is next.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                to="/onboarding"
                className="interactive inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-6 py-3 text-base font-medium text-[#FFFDF6] shadow-lg shadow-[#2F4D6A]/30 transition hover:bg-[#375d80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4D6A]/60"
              >
                Start onboarding
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-[#2F4D6A]/10 bg-[#20354a] px-6 py-12 text-center text-white shadow-lg shadow-[#2F4D6A]/20 lg:px-16">
          <h2 className="text-xl font-semibold tracking-tight sm:text-3xl text-center">
            Be seen and supported through your 
            <span className="text-4xl font-bold mx-4">“what now?”</span> moment.
          </h2>
          <div className="mt-10 mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80"
              alt="GradPath community sharing support"
              className="h-60 w-full object-cover sm:h-72 lg:h-80"
            />
          </div>
        </section>

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
                We pair emotional wellbeing prompts with community touchpoints and gentle planning tools. Everything is
                lightweight, human, and paced so you can breathe while you build.
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
              className="interactive inline-flex items-center gap-2 rounded-full bg-[#2F4D6A] px-6 py-3 text-base font-medium text-[#FFFDF6] shadow-lg shadow-[#2F4D6A]/30 transition hover:bg-[#375d80] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F4D6A]/60"
            >
              Start onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </footer>

        <section
          id="contact"
          className="rounded-3xl border border-[#e4dcc4] bg-white p-8 shadow-lg shadow-[#2F4D6A]/15 lg:p-12"
        >
          <h2 className="text-3xl font-semibold text-slate-900 text-center">Let’s stay in touch</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-base text-slate-600">
            Reach out if you have questions, want to collaborate, or need an extra dose of support.
          </p>
          <form className="mx-auto mt-10 max-w-3xl space-y-6 rounded-2xl border border-[#e4dcc4] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
                placeholder="you@email.com"
              />
            </div>
            <div className="flex flex-col gap-2 text-left">
              <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
                Message
              </label>
              <textarea
                id="contact-message"
                rows="4"
                className="rounded-2xl border border-[#d8d2c0] bg-white px-4 py-2 text-slate-700 outline-none focus:border-[#2F4D6A]"
                placeholder="Share what you need, and we'll get back within 24 hours."
              />
            </div>
            <button
              type="button"
              className="interactive w-full rounded-full bg-[#2F4D6A] px-6 py-3 text-sm font-semibold text-[#FFFDF6] shadow shadow-[#2F4D6A]/20 transition hover:bg-[#375d80]"
            >
              Send message
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Home;
