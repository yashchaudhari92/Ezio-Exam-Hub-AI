import { useState } from "react";
import $ from "jquery";
import API_BASE_URL from "../../helper";

function IntituteLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function loginInstitute(e) {
    e.preventDefault();
    setError("");

    $.ajax({
      url: API_BASE_URL + "/api/institute/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email, password }),

      success: function (inst) {
        localStorage.setItem("loggedInstitute", JSON.stringify(inst));
        window.location.href = "/";
      },

      error: function (xhr) {
        if (xhr.status === 403) {
          setError(xhr.responseText);
        } else {
          setError(xhr.responseText || "Login failed!");
        }
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-lg md:grid-cols-2">

          <div className="hidden flex-col justify-center bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white md:flex">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg">
              🏢
            </div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
              Ezio Exam Hub
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Organization Login
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-indigo-100">
              Access your organization dashboard, manage students, tests,
              exams and examination activities from one place.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="m-0 text-2xl font-bold">✓</p>
                <p className="mt-1 text-xs text-indigo-100">Secure Access</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="m-0 text-2xl font-bold">⚡</p>
                <p className="mt-1 text-xs text-indigo-100">Fast Dashboard</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10">
            <div className="mb-8 text-center md:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl md:mx-0">
                🏢
              </div>

              <h2 className="m-0 text-2xl font-bold text-slate-900">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to your organization account
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={loginInstitute} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter organization email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700"
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                ORGANIZATION PORTAL
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntituteLogin;
