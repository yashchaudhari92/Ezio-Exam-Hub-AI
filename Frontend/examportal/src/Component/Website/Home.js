import React, { useEffect, useState } from "react";
import vector from "../assets/Images/vector.png";
import aboutUs from "../assets/Images/about_Us.jpg";
import API_BASE_URL from "../../helper.js";

const SLIDES = [
  {
    image: vector,
    badge: "SMART • SECURE • SIMPLE",
    title: "Your Exam. Your Future.",
    text: "A modern online examination platform built for confident preparation and seamless assessments."
  },
  {
    image: aboutUs,
    badge: "ONLINE EXAMINATION",
    title: "Prepare. Perform. Succeed.",
    text: "Practice smarter, take assessments confidently and track your examination journey."
  },
  {
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=2000&q=85",
    badge: "FOCUSED PREPARATION",
    title: "Turn Preparation Into Progress.",
    text: "Access structured examinations designed to help students improve their knowledge and performance."
  },
  {
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85",
    badge: "STUDENT EXPERIENCE",
    title: "Learn. Test. Improve.",
    text: "Experience a clean, organized and distraction-free examination environment."
  },
  {
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2000&q=85",
    badge: "DIGITAL EXAMINATION",
    title: "Examinations, Reimagined.",
    text: "Everything you need for modern online assessments in one powerful platform."
  }
];

function Home() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [loggedInstitute, setLoggedInstitute] = useState(null);
  const [language, setLanguage] = useState("");
  const [upi, setUpi] = useState(null);
  const [plans, setPlans] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    const institute = localStorage.getItem("loggedInstitute");

    if (user) setLoggedUser(JSON.parse(user));
    if (institute) setLoggedInstitute(JSON.parse(institute));

    fetchAllPlans();

    fetch(`${API_BASE_URL}/api/qrcode/first`)
      .then((res) => res.json())
      .then((data) => setUpi(data))
      .catch((err) => console.error("QR load failed", err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const fetchAllPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plan/active`);
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Failed to load Plans", error);
    }
  };

  const findTest = async () => {
    if (!loggedUser) {
      window.location.href = "/login";
      return;
    }

    if (!language) {
      alert("Please select a language");
      return;
    }

    setLoadingTests(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/test/by-institute-language?institute=${encodeURIComponent(
          loggedUser.institute
        )}&language=${encodeURIComponent(language)}`
      );
      const tests = await res.json();
      const approvedTests = tests.filter((t) => t.status === "APPROVED");

      const checkAttempts = await Promise.all(
        approvedTests.map(async (test) => {
          try {
            const attemptRes = await fetch(
              `${API_BASE_URL}/api/exam/check-attempt?userEmail=${encodeURIComponent(
                loggedUser.email
              )}&testId=${test.id}`
            );
            const attempted = await attemptRes.json();
            return attempted ? null : test;
          } catch (err) {
            console.error("Error checking attempt", err);
            return test;
          }
        })
      );

      const unattemptedTests = checkAttempts.filter(Boolean);
      setAvailableTests(unattemptedTests);
    } catch (err) {
      console.error("Failed to load tests", err);
    } finally {
      setLoadingTests(false);
    }
  };

  const startQuiz = (testId) => {
    if (!loggedUser) {
      window.location.href = "/login";
      return;
    }
    window.location.href = `/exam?testId=${testId}`;
  };

  const choosePlan = (plan) => {
    if (!loggedInstitute) {
      window.location.href = "/instituteLogin";
      return;
    }

    if (!upi) {
      alert("Payment QR code is not configured yet.");
      return;
    }

    if (loggedInstitute.planExpiryDate) {
      const today = new Date();
      const expiry = new Date(loggedInstitute.planExpiryDate);

      if (expiry > today) {
        alert(
          "Your current active plan is still valid. You can buy a new plan after expiration."
        );
        return;
      }
    }

    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  const generateUpiQr = (upiId, upiName, amount) => {
    const payload = `upi://pay?pa=${upiId}&pn=${upiName}&am=${amount}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      payload
    )}`;
  };

  const submitPurchase = async (plan) => {
    const file = document.getElementById("paymentImg")?.files[0];

    if (!file) {
      alert("Please upload payment screenshot!");
      return;
    }

    const formData = new FormData();
    formData.append("instituteId", loggedInstitute.id);
    formData.append("planDuration", plan.duration);
    formData.append("price", plan.price);
    formData.append("paymentImg", file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/purchaseplan/buy`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setShowPurchaseModal(false);
        setSuccessMessage("Plan Purchased Successfully!");
        setShowSuccessModal(true);
        setSelectedPlan(null);
      } else {
        alert("Something went wrong while processing your purchase.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans antialiased">
      {/* HERO SECTION */}
      <section className="relative h-[550px] w-full overflow-hidden sm:h-[600px] lg:h-[650px]">
        {SLIDES.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${slide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
          >
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/80 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-200 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              {SLIDES[slide].badge}
            </span>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-none">
              {SLIDES[slide].title}
            </h1>

            <p className="mt-5 text-base text-slate-300 sm:text-lg leading-relaxed">
              {SLIDES[slide].text}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById("find-test")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/50 active:scale-[0.98]"
              >
                Find Your Test
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <button
                onClick={() => (window.location.href = "/about")}
                className="rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-[0.98]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <button
          onClick={() => setSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-3 text-white backdrop-blur-md transition hover:bg-slate-900/80 md:flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button
          onClick={() => setSlide((prev) => (prev + 1) % SLIDES.length)}
          className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-slate-900/40 p-3 text-white backdrop-blur-md transition hover:bg-slate-900/80 md:flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${slide === index ? "w-8 bg-indigo-500" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      </section>

      {/* SEARCH / FIND TEST */}
      <section id="find-test" className="relative z-20 -mt-12 px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Search System
                </span>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Find Your Examination
                </h2>
              </div>
              <span className="hidden sm:inline-flex rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                Authorized Portal
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-5 lg:items-end">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Organization / Institute
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="truncate">
                    {loggedUser?.institute || "Login to auto-select organization"}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Preferred Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-700 font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">Choose Medium Language</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>

              <div className="lg:col-span-1">
                <button
                  onClick={findTest}
                  disabled={loadingTests}
                  className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingTests ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AVAILABLE EXAMINATIONS SECTION */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Dashboard
              </span>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                Available Examinations
              </h2>
            </div>
          </div>

          {loadingTests && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
              <p className="text-sm font-medium text-slate-600">Fetching approved tests...</p>
            </div>
          )}

          {!loadingTests && hasSearched && availableTests.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Tests Found</h3>
              <p className="mt-1 text-sm text-slate-500">
                There are no active unattempted tests available for your selected options.
              </p>
            </div>
          )}

          {!loadingTests &&
            availableTests.map((test) => {
              const totalQuestions = test.questions ? test.questions.length : 0;
              const totalMarks = test.questions
                ? test.questions.reduce((sum, q) => sum + (q.marks || 0), 0)
                : 0;

              return (
                <div key={test.id} className="mb-6">
                  <div className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-xl sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
                            {test.examType || "GENERAL EXAM"}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {test.language}
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {test.topicName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {test.institude || test.institute || "Official Assessment"}
                        </p>
                      </div>

                      <button
                        onClick={() => startQuiz(test.id)}
                        className="self-start sm:self-center inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98]"
                      >
                        Start Test Now
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 border-t border-slate-100 pt-6">
                      <div className="rounded-2xl bg-slate-50/70 p-3.5 text-center">
                        <span className="block text-xs font-medium text-slate-500">Total Questions</span>
                        <span className="mt-1 block text-base font-bold text-slate-800">{totalQuestions}</span>
                      </div>
                      <div className="rounded-2xl bg-slate-50/70 p-3.5 text-center">
                        <span className="block text-xs font-medium text-slate-500">Maximum Marks</span>
                        <span className="mt-1 block text-base font-bold text-slate-800">{totalMarks}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-50/70 p-3.5 text-center">
                        <span className="block text-xs font-medium text-slate-500">Time Duration</span>
                        <span className="mt-1 block text-base font-bold text-slate-800">{test.duration || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* PLANS SECTION */}
      {plans.length > 0 && (
        <section className="bg-white border-t border-slate-200/80 px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Institutional Subscription
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Choose a Platform Plan
              </h2>
              <p className="mt-3 text-slate-500">
                Scale your institution with our digital testing tools and question engine.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const isPopular = index === 1;
                return (
                  <div
                    key={plan.id || index}
                    className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${isPopular
                        ? "border-2 border-indigo-600 bg-white shadow-2xl shadow-indigo-600/10 scale-105"
                        : "border border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-xl"
                      }`}
                  >
                    {isPopular && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {plan.duration}
                        </span>
                      </div>

                      <h3 className="mt-3 text-2xl font-black text-slate-900">
                        {plan.name || `${plan.duration} Plan`}
                      </h3>

                      <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">
                          ₹{plan.price}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">/ Period</span>
                      </div>

                      <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          Full Test Creation Tools
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          Automated Candidate Grading
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          24/7 Priority Support
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => choosePlan(plan)}
                      className={`mt-8 w-full rounded-xl py-3.5 text-sm font-bold transition active:scale-[0.98] ${isPopular
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/30"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                    >
                      Subscribe Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PURCHASE MODAL */}
      {showPurchaseModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Checkout
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedPlan.name || selectedPlan.duration}
                </h3>
              </div>

              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedPlan(null);
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-indigo-50/70 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Total Payable</p>
              <p className="mt-1 text-3xl font-extrabold text-indigo-900">
                ₹{selectedPlan.price}
              </p>
            </div>

            {upi && (
              <div className="mt-6 text-center">
                <p className="text-xs font-semibold text-slate-500 mb-3">
                  Scan QR code with any UPI App
                </p>
                <div className="inline-block rounded-2xl border border-slate-200 bg-white p-3 shadow-inner">
                  <img
                    src={generateUpiQr(upi.upiId, upi.upiName, selectedPlan.price)}
                    alt="Payment QR"
                    className="h-44 w-44 rounded-xl object-contain"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Upload Payment Screenshot
              </label>
              <input
                id="paymentImg"
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-600"
              />
            </div>

            <button
              onClick={() => submitPurchase(selectedPlan)}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              Confirm Purchase
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900">Payment Submitted</h3>

            <p className="mt-2 text-sm text-slate-500">{successMessage}</p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;