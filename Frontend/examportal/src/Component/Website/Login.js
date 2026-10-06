import { useState } from "react";
import API_BASE_URL from "../../helper";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    setError("");

    fetch(API_BASE_URL + "/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("loggedUser", JSON.stringify(data));
        window.location.href = "/";
      })
      .catch((err) => {
        setError(err.message);
      });
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 px-4 py-12">
      <div className="mx-auto flex min-h-[75vh] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

          <div className="hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white md:flex md:flex-col md:justify-center">
            <span className="mb-4 w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              Ezio Exam Hub
            </span>

            <h1 className="text-4xl font-bold leading-tight">
              Your Exam Journey Starts Here
            </h1>

            <p className="mt-5 text-base leading-7 text-indigo-100">
              Login to access your exams, track your performance and continue
              your learning journey.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">✓</div>
                <p className="mt-1 text-sm text-indigo-100">Secure Exams</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-bold">⚡</div>
                <p className="mt-1 text-sm text-indigo-100">Instant Results</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                  🎓
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Student Login
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue to your account
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    required
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
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
                >
                  Login
                </button>
              </form>

              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?
                </p>

                <a
                  href="/registration"
                  className="mt-1 inline-block font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Create Student Account
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Login;