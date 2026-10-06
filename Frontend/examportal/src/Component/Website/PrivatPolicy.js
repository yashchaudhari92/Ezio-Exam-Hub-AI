import { Link } from "react-router-dom";
import vector from "../assets/Images/vector.png";

function PrivatPolicy() {
  const policies = [
    {
      title: "Information We Collect",
      items: [
        "Organization name, email address, phone number, and address.",
        "Login credentials.",
        "Plan and payment-related details.",
        "Exam, test, and result data.",
      ],
    },
    {
      title: "Use of Information",
      items: [
        "Provide and manage platform services.",
        "Authenticate users.",
        "Process subscriptions and payments.",
        "Send important notifications and reminders.",
        "Improve platform performance and user experience.",
      ],
    },
    {
      title: "Data Security",
      text: "We implement appropriate security measures to protect user data against unauthorized access, alteration, or disclosure.",
    },
    {
      title: "Data Sharing",
      items: [
        "User data is never sold or shared with third parties for marketing purposes.",
        "Information may be shared only when required by law or legal authorities.",
      ],
    },
    {
      title: "Cookies",
      text: "Our website may use cookies to enhance user experience and improve functionality.",
    },
    {
      title: "Email Communication",
      items: [
        "Account status.",
        "Plan expiry reminders.",
        "Important system updates.",
      ],
    },
    {
      title: "User Responsibility",
      text: "Users are responsible for ensuring the accuracy of the information provided to us.",
    },
    {
      title: "Policy Updates",
      text: "Ezio Exam Hub reserves the right to update this Privacy Policy at any time. Changes will be reflected on this page.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${vector})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-slate-950/85 to-blue-950/90" />

        <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-center justify-center px-5 py-16 text-center lg:px-8">
          <div>
            <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-indigo-200 backdrop-blur">
              Privacy & Security
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Privacy Policy
            </h1>

            <p className="mt-4 text-sm text-slate-300 sm:text-base">
              <Link to="/" className="font-semibold text-white !no-underline hover:text-indigo-300">
                Home
              </Link>
              <span className="mx-2 text-slate-500">/</span>
              Private Policy
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="px-5 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Ezio Exam Hub
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Private Policy
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Ezio Exam Hub respects your privacy and is committed to protecting
              your personal information.
            </p>
          </div>

          <div className="space-y-5">
            {policies.map((policy, index) => (
              <article
                key={policy.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:p-8"
              >
                <div className="flex gap-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {policy.title}
                    </h3>

                    {policy.text && (
                      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                        {policy.text}
                      </p>
                    )}

                    {policy.items && (
                      <ul className="mt-4 space-y-3">
                        {policy.items.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 text-sm leading-6 text-slate-600 sm:text-base"
                          >
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Acknowledgement */}
          <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                ✓
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Your Privacy Matters
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  By using Ezio Exam Hub, you acknowledge that you have read
                  and understood this Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PrivatPolicy;