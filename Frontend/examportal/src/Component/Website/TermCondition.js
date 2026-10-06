import { Link } from "react-router-dom";
import vector from "../assets/Images/vector.png";

function TermCondition() {
  const terms = [
    {
      title: "Platform Usage",
      text: "Ezio Exam Hub provides an online examination system for organizations to conduct tests, exams, and assessments for their candidates. The platform should be used only for lawful and educational purposes."
    },
    {
      title: "Organization Registration & Approval",
      points: [
        "Organizations must complete the registration process to use the platform.",
        "Login access is granted only after admin approval.",
        "Ezio Exam Hub reserves the right to approve, reject, or deactivate any Organization account."
      ]
    },
    {
      title: "Subscription Plans",
      points: [
        "Organizations must purchase a valid subscription plan to access exam-related features.",
        "Each plan has a fixed validity period.",
        "An Organization cannot purchase another plan until the current active plan expires.",
        "Services will be suspended automatically after plan expiry."
      ]
    },
    {
      title: "Plan Expiry & Notifications",
      points: [
        "A reminder email is sent to the Organization 5 days before plan expiration.",
        "Ezio Exam Hub is not responsible for service interruption due to plan expiry if the Organization fails to renew on time."
      ]
    },
    {
      title: "Exams & Results",
      points: [
        "Organizations are responsible for the content, accuracy, and legality of exam questions.",
        "Exam results are generated automatically by the system.",
        "Ezio Exam Hub is not responsible for incorrect data entered by Organizations."
      ]
    },
    {
      title: "Support Services",
      text: "Organizations can request technical support at any time during the active plan period. Support is provided without additional charges."
    },
    {
      title: "Account Security",
      text: "Organizations are responsible for maintaining the confidentiality of their login credentials. Any activity performed through the account will be considered the responsibility of the account holder."
    },
    {
      title: "Termination of Service",
      text: "Ezio Exam Hub reserves the right to suspend or terminate accounts found violating platform policies, misusing services, or involved in suspicious activities."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* HERO */}
      <section className="relative h-[360px] overflow-hidden">
        <img
          src={vector}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-900/80 to-slate-950/60" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center justify-center px-6 text-center">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-white backdrop-blur">
              EZIO EXAM HUB
            </span>

            <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              Terms & Conditions
            </h1>

            <p className="mt-4 text-sm text-slate-200 sm:text-base">
              <Link
                to="/"
                className="font-semibold text-white no-underline hover:text-indigo-300"
              >
                Home
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              Terms & Conditions
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-indigo-600">
            PLEASE READ CAREFULLY
          </span>

          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Terms & Conditions
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600">
            Welcome to Ezio Exam Hub. By accessing or using our platform,
            you agree to comply with the following terms and conditions.
          </p>
        </div>
      </section>

      {/* TERMS */}
      <section className="px-5 pb-20 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-5">

          {terms.map((term, index) => (
            <article
              key={term.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg sm:p-7"
            >
              <div className="flex gap-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-100">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {term.title}
                  </h3>

                  {term.text && (
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {term.text}
                    </p>
                  )}

                  {term.points && (
                    <ul className="mt-4 space-y-3">
                      {term.points.map(point => (
                        <li
                          key={point}
                          className="flex gap-3 text-sm leading-6 text-slate-600"
                        >
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                            ✓
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            </article>
          ))}

        </div>
      </section>

      {/* ACKNOWLEDGEMENT */}
      <section className="px-5 pb-20 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-indigo-100 bg-indigo-50 p-7 sm:p-9">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xl text-white">
              ℹ
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Important Notice
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                By continuing to use Ezio Exam Hub, organizations acknowledge
                and agree to the terms described on this page.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default TermCondition;