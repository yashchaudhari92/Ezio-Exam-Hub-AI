import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import vector from "../assets/Images/vector.png";
import API_BASE_URL from "../../helper.js";

function Quiz() {
  const navigate = useNavigate();
  const [loggedUser, setLoggedUser] = useState(null);
  const [language, setLanguage] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");
    if (user) {
      setLoggedUser(JSON.parse(user));
    }
  }, []);

  const findTest = async () => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    if (!language) {
      alert("Please select language");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // 1. Fetch tests by institute & language
      const res = await fetch(
        `${API_BASE_URL}/api/test/by-institute-language?institute=${encodeURIComponent(
          loggedUser.institute
        )}&language=${encodeURIComponent(language)}`
      );

      if (!res.ok) throw new Error("Failed to fetch tests");
      const testList = await res.json();

      if (!testList || testList.length === 0) {
        setTests([]);
        setLoading(false);
        return;
      }

      // 2. Check attempt status for all tests concurrently using Promise.all
      const attemptChecks = testList.map(async (test) => {
        try {
          const checkRes = await fetch(
            `${API_BASE_URL}/api/exam/check-attempt?userEmail=${encodeURIComponent(
              loggedUser.email
            )}&testId=${test.id}`
          );
          const attempted = await checkRes.json();
          return { test, attempted };
        } catch {
          return { test, attempted: false };
        }
      });

      const results = await Promise.all(attemptChecks);

      // Filter out attempted tests
      const unattemptedTests = results
        .filter((item) => !item.attempted)
        .map((item) => item.test);

      setTests(unattemptedTests);
    } catch (err) {
      console.error(err);
      setError("Unable to load tests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (testId) => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    navigate(`/exam?testId=${testId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HERO SECTION */}
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
              ONLINE EXAMINATION
            </span>

            <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl lg:text-6xl">
              Find Your Exam
            </h1>

            <p className="mt-4 text-sm text-slate-200 sm:text-base">
              <Link
                to="/"
                className="font-semibold text-white no-underline hover:text-indigo-300"
              >
                Home
              </Link>
              <span className="mx-2 text-slate-400">/</span>
              Quiz
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH PANEL */}
      <section className="relative z-10 -mt-12 px-5 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-7">
              <span className="text-xs font-bold tracking-[0.18em] text-indigo-600">
                EXAM SEARCH
              </span>

              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Choose your examination
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select your language to discover available tests.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              {/* ORGANIZATION */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Organization
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm text-slate-600">
                  {loggedUser?.institute || "Login to view organization"}
                </div>
              </div>

              {/* LANGUAGE */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">-- Select Language --</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                </select>
              </div>

              {/* BUTTON */}
              <button
                onClick={findTest}
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Find Test →"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TEST LIST */}
      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold tracking-[0.18em] text-indigo-600">
                AVAILABLE EXAMINATIONS
              </span>
              <h2 className="mt-2 text-3xl font-black text-slate-900">
                Explore Tests
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Select an examination to begin.
            </p>
          </div>

          {/* RENDER STATES */}
          {error && (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
              <h3 className="font-bold text-red-700">Unable to load tests</h3>
              <p className="mt-2 text-sm text-red-500">{error}</p>
            </div>
          )}

          {!error && loading && (
            <div className="py-12 text-center text-slate-500">
              Loading available examinations...
            </div>
          )}

          {!error && !loading && hasSearched && tests.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📋
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-800">
                No test available
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                No examination was found for the selected language or you have already completed all available tests.
              </p>
            </div>
          )}

          {!error && !loading && tests.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => {
                const totalQuestions = test.questions ? test.questions.length : 0;
                const totalMarks = test.questions
                  ? test.questions.reduce((sum, q) => sum + (q.marks || 0), 0)
                  : 0;

                return (
                  <div key={test.id} className="group">
                    <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
                              {test.examType || "EXAM"}
                            </span>
                            <h3 className="mt-4 text-xl font-black text-slate-900">
                              {test.topicName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {test.institude || ""}
                            </p>
                          </div>
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-lg text-white shadow-lg shadow-indigo-200">
                            📝
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <span className="block text-xs font-medium text-slate-500">
                              Questions
                            </span>
                            <strong className="mt-1 block text-lg text-slate-900">
                              {totalQuestions}
                            </strong>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <span className="block text-xs font-medium text-slate-500">
                              Total Marks
                            </span>
                            <strong className="mt-1 block text-lg text-slate-900">
                              {totalMarks}
                            </strong>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <span className="block text-xs font-medium text-slate-500">
                              Language
                            </span>
                            <strong className="mt-1 block text-lg text-slate-900">
                              {test.language}
                            </strong>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <span className="block text-xs font-medium text-slate-500">
                              Duration
                            </span>
                            <strong className="mt-1 block text-lg text-slate-900">
                              {test.duration}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                        <span className="text-xs font-semibold text-slate-500">
                          {test.examType || "Online Examination"}
                        </span>
                        <button
                          onClick={() => handleStartQuiz(test.id)}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
                        >
                          Start Quiz →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="px-5 pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-10 sm:px-12">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Ready to test your knowledge?
              </h2>
              <p className="mt-2 text-sm text-indigo-100">
                Choose an available examination and start your assessment.
              </p>
            </div>

            <button
              onClick={() =>
                window.scrollTo({ top: 400, behavior: "smooth" })
              }
              className="shrink-0 rounded-xl bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg transition hover:bg-slate-100"
            >
              View Tests
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Quiz;