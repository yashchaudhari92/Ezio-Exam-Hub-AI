import { useState } from "react";
import API_BASE_URL from "../../helper";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch(API_BASE_URL + "/api/admin/login", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((data) => {
        if (data === "SUCCESS") {
          localStorage.setItem("adminLogin", "true");
          setShowSuccessModal(true);

          setTimeout(() => {
            setShowSuccessModal(false);
            navigate("/admin/dashboard");
          }, 2000);
        } else {
          alert("Invalid Credentials!");
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-700 to-violet-600 px-4 py-10">
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur">
              🔐
            </div>
            <h1 className="m-0 text-3xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-indigo-100">
              Ezio Exam Hub Administration
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="rounded-3xl border border-white/20 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter admin email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="mb-6">
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
              Login to Admin Panel
            </button>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">SECURE ACCESS</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600">
              ✓
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Success
            </h2>

            <p className="mt-2 text-slate-600">
              Login Successfully!
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Redirecting to admin dashboard...
            </p>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/admin/dashboard");
              }}
              className="mt-6 rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLogin;