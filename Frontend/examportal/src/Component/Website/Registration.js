import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import API_BASE_URL from "../../helper";

function UserRegistration() {
  const [institutes, setInstitutes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
    institute: ""
  });

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    $.get(`${API_BASE_URL}/api/institute/names`, data => {
      setInstitutes(data);
    }).fail(() => {
      setError("Unable to load organizations.");
    });
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;

    if (name === "phoneNo" && !/^\d*$/.test(value)) return;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    setError("");
  };

  const isValid = () => {
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return false;
    }

    if (!form.email.trim()) {
      setError("Please enter your email.");
      return false;
    }

    if (!form.email.includes("@")) {
      setError("Please enter a valid email.");
      return false;
    }

    if (form.phoneNo.length !== 10) {
      setError("Phone number must contain 10 digits.");
      return false;
    }

    if (!form.institute) {
      setError("Please select an organization.");
      return false;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const sendOtp = e => {
    e.preventDefault();

    if (!isValid()) return;

    setLoading(true);
    setError("");

    $.ajax({
      url: `${API_BASE_URL}/api/user/send-otp`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        email: form.email
      }),
      success: () => {
        setShowOtp(true);
        setOtp("");
        setLoading(false);
      },
      error: xhr => {
        setError(xhr.responseText || "Unable to send OTP.");
        setLoading(false);
      }
    });
  };

  const verifyOtp = () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6 digit OTP.");
      return;
    }

    setOtpLoading(true);
    setError("");

    const user = {
      name: form.name,
      email: form.email,
      phoneNo: form.phoneNo,
      password: form.password,
      institute: form.institute,
      otp
    };

    $.ajax({
      url: `${API_BASE_URL}/api/user/verify-otp-register`,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(user),
      success: () => {
        setShowOtp(false);
        setSuccessMessage("Registration Successful!");
        setShowSuccess(true);
        setOtpLoading(false);

        setForm({
          name: "",
          email: "",
          phoneNo: "",
          password: "",
          confirmPassword: "",
          institute: ""
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      },
      error: xhr => {
        setError(xhr.responseText || "Invalid OTP.");
        setOtpLoading(false);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-700 px-5 py-16 lg:px-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.2em] text-white backdrop-blur">
            EZIO EXAM HUB
          </span>

          <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">
            Create Your Account
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">
            Join Ezio Exam Hub and access a modern online examination
            experience.
          </p>

          <div className="mt-5 text-sm text-indigo-200">
            <Link to="/" className="text-white no-underline hover:text-indigo-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            Registration
          </div>
        </div>
      </section>

      {/* REGISTRATION */}
      <section className="px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">

          {/* LEFT INFO */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <span className="text-sm font-bold tracking-[0.18em] text-indigo-600">
                STUDENT REGISTRATION
              </span>

              <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">
                Start your
                <span className="text-indigo-600"> examination journey.</span>
              </h2>

              <p className="mt-5 leading-7 text-slate-500">
                Create your student account and connect with your organization
                to access available online examinations.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  ["✓", "Secure student account"],
                  ["✓", "Organization based exams"],
                  ["✓", "OTP verified registration"],
                  ["✓", "Easy online examination access"]
                ].map(([icon, text]) => (
                  <div
                    key={text}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                      {icon}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8 lg:p-10">
            <div className="mb-8">
              <span className="text-xs font-bold tracking-[0.18em] text-indigo-600">
                ACCOUNT DETAILS
              </span>

              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Student Registration
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Fill in your details to create your account.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={sendOtp}>
              <div className="grid gap-5 sm:grid-cols-2">

                {/* NAME */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>

                {/* ORGANIZATION */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Organization
                  </label>
                  <select
                    name="institute"
                    value={form.institute}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  >
                    <option value="">-- Select Organization --</option>
                    {institutes.map((inst, index) => (
                      <option key={index} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    type="text"
                    maxLength={10}
                    value={form.phoneNo}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    required
                  />
                </div>

              </div>
              <br/>

              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
            </form>
            <br/>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-600 no-underline hover:text-indigo-700"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* OTP MODAL */}
      {showOtp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9">

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                ✉️
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                Verify Your Email
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter the 6 digit OTP sent to
                <br />
                <strong className="text-slate-700">{form.email}</strong>
              </p>
            </div>

            <input
              value={otp}
              onChange={e => {
                if (/^\d*$/.test(e.target.value)) {
                  setOtp(e.target.value.slice(0, 6));
                  setError("");
                }
              }}
              maxLength={6}
              placeholder="Enter 6 digit OTP"
              className="mt-7 w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-xl font-bold tracking-[0.4em] outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              autoFocus
            />

            <button
              type="button"
              onClick={verifyOtp}
              disabled={otpLoading}
              className="mt-5 w-full rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {otpLoading ? "Verifying..." : "Verify & Register"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOtp(false);
                setOtp("");
                setError("");
              }}
              className="mt-3 w-full rounded-xl px-6 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
              ✓
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-900">
              Success!
            </h3>

            <p className="mt-2 text-slate-500">
              {successMessage}
            </p>

            <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full animate-pulse rounded-full bg-green-500" />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Redirecting you to login...
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserRegistration;