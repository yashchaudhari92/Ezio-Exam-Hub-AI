import { useState } from "react";
import { Link } from "react-router-dom";
import vector from "../assets/Images/vector.png";
import aboutUs from "../assets/Images/about_Us.jpg";

// SVG Icons for features
const Icons = {
  Building: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ClipboardDocument: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  ChartBar: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ArrowDownTray: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Check: () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
};

function About() {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: <Icons.Building />,
      title: "Easy Organization Registration",
      text: "Simple registration process for organizations to get started quickly."
    },
    {
      icon: <Icons.ShieldCheck />,
      title: "Secure Login & Dashboard",
      text: "Secure authentication with dedicated dashboards for platform users."
    },
    {
      icon: <Icons.ClipboardDocument />,
      title: "Online Test & Exam Management",
      text: "Create, manage and conduct online tests and examinations efficiently."
    },
    {
      icon: <Icons.ChartBar />,
      title: "Real-time Result Generation",
      text: "Results are generated automatically after examination completion."
    },
    {
      icon: <Icons.ArrowDownTray />,
      title: "Downloadable Result Reports",
      text: "Organizations can view and download examination result reports."
    },
    {
      icon: <Icons.Sparkles />,
      title: "User-friendly Interface",
      text: "A clean and intuitive experience for organizations and students."
    }
  ];

  const faqs = [
    {
      question: "What is the Organization registration process?",
      answer:
        "Organizations can register by filling out the Organization Registration form on our website. After registration, the Organization account goes through admin approval. Once approved, the Organization can log in and start creating exams."
    },
    {
      question: "Can an Organization create multiple tests?",
      answer:
        "Yes, an Organization can create multiple tests and exams from its dashboard. Each test can have its own questions, duration, and passing marks."
    },
    {
      question: "How are results provided after the exam?",
      answer:
        "Results are automatically generated after exam completion. Organizations can view and download results in PDF or report format."
    },
    {
      question: "Is this platform secure?",
      answer:
        "Yes, Ezio Exam Hub uses a secure authentication system. Only authorized users can access exams and dashboards."
    },
    {
      question: "How can an Organization get support?",
      answer:
        "Organizations can contact our support team via email or the contact form. We ensure quick issue resolution."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">

      {/* ABOUT / GOALS SECTION */}
      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Who We Are
            </span>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Modern examinations, <br />
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                simplified.
              </span>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Ezio Exam Hub is a modern and reliable online examination
              platform designed to empower organizations to seamlessly conduct
              online tests, exams, and candidate assessments with precision.
            </p>

            <div className="mt-8 border-t border-slate-200/80 pt-6">
              <h3 className="text-base font-bold uppercase tracking-wide text-slate-800">
                Our Main Goals
              </h3>

              <div className="mt-4 space-y-3.5">
                {[
                  "Make the examination process fast, secure, and transparent.",
                  "Reduce the time, effort, and cost involved in traditional manual examinations.",
                  "Provide organizations with an all-in-one digital solution for managing online exams efficiently."
                ].map((goal, index) => (
                  <div key={index} className="flex items-start gap-3.5">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Icons.Check />
                    </div>
                    <p className="m-0 text-sm leading-relaxed text-slate-600 font-medium">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image & Card Overlay */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-indigo-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 shadow-2xl transition hover:shadow-indigo-500/10">
              <img
                src={aboutUs}
                alt="Ezio Exam Hub Banner"
                className="h-[400px] w-full rounded-2xl object-cover"
              />

              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-slate-950/80 p-5 text-white backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Online Examination Platform
                </p>
                <p className="mt-1 text-base font-bold text-slate-100">
                  Built for modern organizations and ambitious students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS HIGHLIGHT BAR */}
      <section className="border-y border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y-0 divide-slate-100 lg:grid-cols-4">
          {[
            ["01", "Digital Platform"],
            ["24/7", "Online Access"],
            ["100%", "Web Based"],
            ["∞", "Scalable Exams"]
          ].map(([value, label]) => (
            <div key={label} className="px-6 py-8 text-center transition hover:bg-slate-50/50">
              <div className="text-3xl font-extrabold tracking-tight text-indigo-600 sm:text-4xl">{value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Platform Features
            </span>

            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Why Choose Ezio Exam Hub?
            </h2>

            <p className="mt-3 text-base text-slate-600">
              Everything you need to organize, conduct, and manage modern online examinations effortlessly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.text}
                </p>

                <div className="mt-4 h-1 w-8 rounded-full bg-indigo-500 transition-all duration-300 group-hover:w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-slate-900 px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Need Help?
            </span>

            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-slate-400">
              Find answers to common questions about using Ezio Exam Hub.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border transition duration-200 ${
                    isOpen
                      ? "border-indigo-500/80 bg-indigo-950/30"
                      : "border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800/70"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-slate-100 sm:text-lg">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        isOpen
                          ? "rotate-180 bg-indigo-600 text-white"
                          : "bg-slate-700/60 text-slate-300"
                      }`}
                    >
                      <Icons.ChevronDown />
                    </span>
                  </button>

                  {/* Smooth Collapse Animation */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-slate-800 px-6 pb-5 pt-3">
                        <p className="m-0 text-sm leading-relaxed text-slate-300">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="px-5 py-16 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-8 py-14 text-center shadow-2xl sm:px-12">
          {/* Subtle background glow circle */}
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-xl" />

          <h2 className="relative z-10 text-3xl font-extrabold text-white sm:text-4xl">
            Ready to experience modern online examinations?
          </h2>

          <p className="relative z-10 mx-auto mt-3 max-w-2xl text-indigo-100">
            Explore Ezio Exam Hub and discover a smarter way to conduct and
            participate in online examinations.
          </p>

          <div className="relative z-10 mt-8">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 no-underline shadow-lg transition duration-200 hover:bg-indigo-50 hover:shadow-xl active:scale-95"
            >
              Explore Exams
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default About;