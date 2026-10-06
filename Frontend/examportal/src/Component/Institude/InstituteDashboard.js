import { useCallback, useEffect, useState } from "react";
import API_BASE_URL from "../../helper";

function InstituteDashboard() {
  const [institute, setInstitute] = useState(null);

  const [stats, setStats] = useState({
    students: 0,
    tests: 0,
    attempts: 0,
    approvedTests: 0,
    passed: 0,
    failed: 0,
  });

  const [recentTests, setRecentTests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (instituteName, firstLoad = false) => {
    try {
      if (firstLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [testsResponse, studentsResponse, attemptsResponse] =
        await Promise.all([
          fetch(
            `${API_BASE_URL}/api/test/by-institute/${encodeURIComponent(
              instituteName
            )}`
          ),
          fetch(
            `${API_BASE_URL}/api/user/by-institute/${encodeURIComponent(
              instituteName
            )}`
          ),
          fetch(
            `${API_BASE_URL}/api/exam/by-institute/${encodeURIComponent(
              instituteName
            )}`
          ),
        ]);

      if (
        !testsResponse.ok ||
        !studentsResponse.ok ||
        !attemptsResponse.ok
      ) {
        throw new Error("Failed to load dashboard data.");
      }

      const [tests, students, attempts] = await Promise.all([
        testsResponse.json(),
        studentsResponse.json(),
        attemptsResponse.json(),
      ]);

      const testList = Array.isArray(tests) ? tests : [];
      const studentList = Array.isArray(students) ? students : [];
      const attemptList = Array.isArray(attempts) ? attempts : [];

      const approvedTests = testList.filter(
        (test) =>
          String(test.status || "").toUpperCase() === "APPROVED"
      ).length;

      const passed = attemptList.filter(
        (attempt) =>
          String(attempt.result || attempt.status || "")
            .toUpperCase()
            .includes("PASS")
      ).length;

      const failed = attemptList.filter(
        (attempt) =>
          String(attempt.result || attempt.status || "")
            .toUpperCase()
            .includes("FAIL")
      ).length;

      setStats({
        students: studentList.length,
        tests: testList.length,
        attempts: attemptList.length,
        approvedTests,
        passed,
        failed,
      });

      setRecentTests([...testList].reverse().slice(0, 5));
    } catch (err) {
      console.error("Institute dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("loggedInstitute");

    if (!data) {
      setLoading(false);
      return;
    }

    const loggedInstitute = JSON.parse(data);

    setInstitute(loggedInstitute);

    loadDashboard(loggedInstitute.instituteName, true);

    // Refresh dashboard every 30 seconds
    const interval = setInterval(() => {
      loadDashboard(loggedInstitute.instituteName);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const handleRefresh = () => {
    if (institute?.instituteName) {
      loadDashboard(institute.instituteName);
    }
  };

  const cards = [
    {
      title: "Total Students",
      value: stats.students,
      description: "Registered candidates",
      icon: "◉",
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
    },
    {
      title: "Total Tests",
      value: stats.tests,
      description: "Tests created",
      icon: "✓",
      iconBg: "bg-indigo-50",
      iconText: "text-indigo-600",
    },
    {
      title: "Exam Attempts",
      value: stats.attempts,
      description: "Total attempts",
      icon: "▤",
      iconBg: "bg-violet-50",
      iconText: "text-violet-600",
    },
    {
      title: "Approved Tests",
      value: stats.approvedTests,
      description: "Available tests",
      icon: "◆",
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 pt-20 sm:p-6 sm:pt-20 md:p-8 md:pt-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            Institute Dashboard
          </p>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back,{" "}
            {institute?.instituteName || "Institute"} 👋
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your students, tests and examination activity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={refreshing ? "animate-spin" : ""}>↻</span>
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? (
                    <span className="inline-block h-9 w-14 animate-pulse rounded bg-slate-200" />
                  ) : (
                    card.value
                  )}
                </h2>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.iconText}`}
              >
                <span className="text-lg font-bold">
                  {card.icon}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-xs font-medium text-slate-500">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lower Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Tests */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Tests
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Recently created examinations
              </p>
            </div>

            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
              {stats.tests} Total
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-6 text-sm text-slate-500">
                Loading tests...
              </div>
            ) : recentTests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No tests created yet.
              </div>
            ) : (
              recentTests.map((test, index) => (
                <div
                  key={test.id || index}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {test.topicName || "Untitled Test"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {test.examType || "Examination"}{" "}
                        {test.language
                          ? `• ${test.language}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      String(test.status || "").toUpperCase() ===
                      "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {test.status || "ACTIVE"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Exam Performance
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Based on recorded attempts
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700">
                  Passed
                </p>
                <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                  {loading ? "..." : stats.passed}
                </p>
              </div>

              <span className="text-xl text-emerald-600">✓</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-red-50 p-4">
              <div>
                <p className="text-xs font-semibold text-red-700">
                  Failed
                </p>
                <p className="mt-1 text-2xl font-extrabold text-red-700">
                  {loading ? "..." : stats.failed}
                </p>
              </div>

              <span className="text-xl text-red-600">×</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-xs font-semibold text-slate-600">
                  Other / Pending
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-700">
                  {loading
                    ? "..."
                    : Math.max(
                        stats.attempts -
                          stats.passed -
                          stats.failed,
                        0
                      )}
                </p>
              </div>

              <span className="text-xl text-slate-500">•</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status */}
      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

          <span className="text-sm font-semibold text-emerald-800">
            Dashboard data is live
          </span>
        </div>

        <span className="text-xs font-medium text-emerald-700">
          Automatically refreshed every 30 seconds
        </span>
      </div>
    </div>
  );
}

export default InstituteDashboard;



// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// function InstituteDashboard() {
//   const [inst, setInst] = useState(null);

//   useEffect(() => {
//     const data = localStorage.getItem("loggedInstitute");

//     if (data) {
//       try {
//         setInst(JSON.parse(data));
//       } catch (error) {
//         console.error("Invalid institute data", error);
//       }
//     }
//   }, []);

//   const instituteName = inst?.instituteName || "Institute";

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {/* =================================
//           PAGE HEADER
//       ================================= */}
//       <header className="border-b border-slate-200 bg-white">

//         <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-2 sm:px-7 lg:px-8">

//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
//               Institute Portal
//             </p>

//             <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//               Dashboard
//             </h1>

//             <p className="mt-1 text-sm text-slate-500">
//               Manage your examination activities from one place.
//             </p>
//           </div>

//           <Link
//             to="/"
//             className="
//               hidden shrink-0 items-center gap-2
//               rounded-xl border border-slate-200
//               bg-white px-4 py-2.5
//               text-sm font-semibold text-slate-700
//               shadow-sm transition
//               hover:border-indigo-200
//               hover:bg-indigo-50
//               hover:text-indigo-600
//               sm:flex
//             "
//           >
//             <span>←</span>
//             Go to Website
//           </Link>

//         </div>

//       </header>

//       {/* =================================
//           CONTENT
//       ================================= */}
//       <main className="mx-auto w-full max-w-[1400px] px-5 py-7 sm:px-7 lg:px-8">

//         {/* =================================
//             WELCOME CARD
//         ================================= */}
//         <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 shadow-lg sm:p-8">

//           {/* Decorative circles */}
//           <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

//           <div className="absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-white/5" />

//           <div className="relative">

//             <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-100">
//               Welcome Back
//             </span>

//             <h2 className="mt-4 max-w-3xl text-2xl font-bold text-white sm:text-3xl">
//               Hello, {instituteName}
//             </h2>

//             <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
//               Manage your tests, candidates, examination attempts and
//               subscription information from your institute portal.
//             </p>

//             <div className="mt-6 flex flex-wrap gap-3">

//               <Link
//                 to="/institute/addTest"
//                 className="
//                   inline-flex items-center gap-2
//                   rounded-xl bg-white
//                   px-5 py-2.5
//                   text-sm font-semibold text-indigo-700
//                   shadow-sm transition
//                   hover:bg-indigo-50
//                 "
//               >
//                 <span>＋</span>
//                 Create Test
//               </Link>

//               <Link
//                 to="/institute/userRegistration"
//                 className="
//                   inline-flex items-center gap-2
//                   rounded-xl border border-white/30
//                   bg-white/10
//                   px-5 py-2.5
//                   text-sm font-semibold text-white
//                   transition
//                   hover:bg-white/20
//                 "
//               >
//                 <span>◉</span>
//                 Candidates
//               </Link>

//             </div>

//           </div>

//         </section>

//         {/* =================================
//             QUICK ACCESS
//         ================================= */}
//         <section className="mt-8">

//           <div className="mb-4">
//             <h2 className="text-xl font-bold text-slate-900">
//               Quick Access
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Access the most frequently used institute functions.
//             </p>
//           </div>

//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

//             {/* Add Test */}
//             <Link
//               to="/institute/addTest"
//               className="
//                 group rounded-2xl border border-slate-200
//                 bg-white p-5 shadow-sm
//                 transition duration-200
//                 hover:-translate-y-1
//                 hover:border-indigo-200
//                 hover:shadow-md
//               "
//             >
//               <div className="flex items-start justify-between">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
//                   ＋
//                 </div>

//                 <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500">
//                   →
//                 </span>

//               </div>

//               <h3 className="mt-5 text-base font-bold text-slate-900">
//                 Tests
//               </h3>

//               <p className="mt-1 text-sm leading-5 text-slate-500">
//                 Create and manage examination tests.
//               </p>
//             </Link>

//             {/* Candidates */}
//             <Link
//               to="/institute/userRegistration"
//               className="
//                 group rounded-2xl border border-slate-200
//                 bg-white p-5 shadow-sm
//                 transition duration-200
//                 hover:-translate-y-1
//                 hover:border-emerald-200
//                 hover:shadow-md
//               "
//             >
//               <div className="flex items-start justify-between">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
//                   ◉
//                 </div>

//                 <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500">
//                   →
//                 </span>

//               </div>

//               <h3 className="mt-5 text-base font-bold text-slate-900">
//                 Candidates
//               </h3>

//               <p className="mt-1 text-sm leading-5 text-slate-500">
//                 View and manage registered candidates.
//               </p>
//             </Link>

//             {/* Exam Attempts */}
//             <Link
//               to="/institute/userExamAttempts"
//               className="
//                 group rounded-2xl border border-slate-200
//                 bg-white p-5 shadow-sm
//                 transition duration-200
//                 hover:-translate-y-1
//                 hover:border-amber-200
//                 hover:shadow-md
//               "
//             >
//               <div className="flex items-start justify-between">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
//                   ▤
//                 </div>

//                 <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-500">
//                   →
//                 </span>

//               </div>

//               <h3 className="mt-5 text-base font-bold text-slate-900">
//                 Exam Attempts
//               </h3>

//               <p className="mt-1 text-sm leading-5 text-slate-500">
//                 Review candidate examination attempts.
//               </p>
//             </Link>

//             {/* Plan History */}
//             <Link
//               to="/institute/planpurchases"
//               className="
//                 group rounded-2xl border border-slate-200
//                 bg-white p-5 shadow-sm
//                 transition duration-200
//                 hover:-translate-y-1
//                 hover:border-purple-200
//                 hover:shadow-md
//               "
//             >
//               <div className="flex items-start justify-between">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl text-purple-600">
//                   ◈
//                 </div>

//                 <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-purple-500">
//                   →
//                 </span>

//               </div>

//               <h3 className="mt-5 text-base font-bold text-slate-900">
//                 Plan History
//               </h3>

//               <p className="mt-1 text-sm leading-5 text-slate-500">
//                 View your subscription and plan history.
//               </p>
//             </Link>

//           </div>

//         </section>

//         {/* =================================
//             MOBILE WEBSITE BUTTON
//         ================================= */}
//         <div className="mt-7 sm:hidden">

//           <Link
//             to="/"
//             className="
//               flex w-full items-center
//               justify-center gap-2
//               rounded-xl border border-slate-200
//               bg-white px-4 py-3
//               text-sm font-semibold text-slate-700
//               shadow-sm
//             "
//           >
//             ← Go to Website
//           </Link>

//         </div>

//       </main>
//     </div>
//   );
// }

// export default InstituteDashboard;
