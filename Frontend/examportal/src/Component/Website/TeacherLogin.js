import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API_BASE_URL from "../../helper";

function TeacherLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const validate = () => {
    if (!form.email.includes("@")) {
      setError("Enter valid email");
      return false;
    }

    return true;
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/teacher/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data);
        setLoading(false);
        return;
      }

      localStorage.setItem("loggedTeacher", JSON.stringify(data));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 px-5 py-14 lg:px-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-white backdrop-blur">
            EZIO EXAM HUB
          </span>

          <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">
            Teacher Portal
          </h1>

          <p className="mt-3 text-sm text-indigo-100 sm:text-base">
            Secure access to your teaching and examination dashboard.
          </p>

          <div className="mt-5 text-sm text-indigo-200">
            <Link
              to="/"
              className="text-white no-underline hover:text-indigo-300"
            >
              Home
            </Link>
            <span className="mx-2">/</span>
            Teacher Login
          </div>
        </div>
      </section>

      {/* LOGIN */}
      <section className="px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">

          {/* LEFT */}
          <div className="hidden lg:block">
            <span className="text-sm font-bold tracking-[0.18em] text-indigo-600">
              TEACHER ACCESS
            </span>

            <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">
              Manage your
              <span className="text-indigo-600"> examinations.</span>
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-slate-500">
              Sign in to access your teacher dashboard, manage examinations
              and work with your assigned academic activities.
            </p>

            <div className="mt-8 space-y-4">
              {[
                ["🔐", "Secure teacher authentication"],
                ["📝", "Manage examination activities"],
                ["📊", "Access your teacher dashboard"]
              ].map(([icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                    {icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD */}
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl sm:p-9">

            <div className="mb-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                👨‍🏫
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-900">
                Teacher Login
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to continue.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Email Address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    @
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="teacher@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    •
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <br/>

              {/* LOGIN */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login →"}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <Link
                to="/"
                className="text-sm font-semibold text-indigo-600 no-underline hover:text-indigo-700"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default TeacherLogin;