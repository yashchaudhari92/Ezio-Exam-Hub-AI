import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function UserDashboard() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (user?.name) {
      setUserName(user.name);
    }
  }, []);

  const displayName = userName || "Student";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Compact Page Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Dashboard
            </h1>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">
                Student Account
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8">

        {/* Welcome Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg sm:p-8">

          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative z-10">

            <div className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-100">
              Welcome Back
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Hello, {displayName} 👋
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
              Welcome to your examination portal. Manage your profile,
              review your examination history, and access your student
              account from one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                to="/user/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
              >
                <span>👤</span>
                View Profile
              </Link>

              <Link
                to="/user/history"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <span>📋</span>
                Exam History
              </Link>

            </div>
          </div>
        </section>

        {/* Quick Access */}
        <section className="mt-7">

          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900">
              Quick Access
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage your student account and examination activities.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* Profile */}
            <Link
              to="/user/profile"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                  👤
                </div>

                <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500">
                  →
                </span>

              </div>

              <h4 className="mt-5 text-lg font-bold text-slate-900">
                My Profile
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View and manage your personal account information.
              </p>
            </Link>

            {/* History */}
            <Link
              to="/user/history"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  📊
                </div>

                <span className="text-lg text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
                  →
                </span>

              </div>

              <h4 className="mt-5 text-lg font-bold text-slate-900">
                Exam History
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review your previous examinations and their results.
              </p>
            </Link>

            {/* Student Account */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl">
                🎓
              </div>

              <h4 className="mt-5 text-lg font-bold text-slate-900">
                Student Account
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your examination account is ready. Use the sidebar to
                navigate through the portal.
              </p>

            </div>

          </div>
        </section>

        {/* Back Home */}
        <section className="mt-7">

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">

            <div>
              <h3 className="font-semibold text-slate-900">
                Need to return to the main website?
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Go back to the Ezio Exam Hub homepage.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              ← Back to Home
            </a>

          </div>

        </section>

      </main>
    </div>
  );
}

export default UserDashboard;