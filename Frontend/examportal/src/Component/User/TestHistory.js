import { useEffect, useRef, useState } from "react";
import API_BASE_URL from "../../helper";

function TestHistory() {
  const [history, setHistory] = useState([]);
  const [loggedUser, setLoggedUser] = useState(null);
  const [attemptAnswers, setAttemptAnswers] = useState([]);

  const allHistoryRef = useRef([]);

  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const [selectedExamType, setSelectedExamType] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingReview, setIsLoadingReview] = useState(false);

  /* -----------------------------
     Load logged user
  ----------------------------- */
  useEffect(() => {
    const user = localStorage.getItem("loggedUser");

    if (user) {
      const u = JSON.parse(user);

      setLoggedUser(u);
      loadHistory(u.email);
    } else {
      setIsLoadingHistory(false);
    }
  }, []);

  /* -----------------------------
     Load exam history
  ----------------------------- */
  async function loadHistory(email) {
    try {
      setIsLoadingHistory(true);

      const response = await fetch(
        `${API_BASE_URL}/api/exam/history/${email}`
      );

      if (!response.ok) {
        throw new Error("Failed to load exam history");
      }

      const data = await response.json();

      const reversed = [...data].reverse();

      setHistory(reversed);
      allHistoryRef.current = reversed;
    } catch (error) {
      console.error("History load failed", error);
      setHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  /* -----------------------------
     Search
  ----------------------------- */
  function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    if (keyword === "") {
      setHistory(allHistoryRef.current);
      return;
    }

    const filtered = allHistoryRef.current.filter((h) =>
      h.test?.topicName?.toLowerCase().includes(keyword)
    );

    setHistory(filtered);
  }

  /* -----------------------------
     Mobile attempt row
  ----------------------------- */
  function toggleRow(id) {
    setExpandedRow((current) => (current === id ? null : id));
  }

  /* -----------------------------
     Mobile question row
  ----------------------------- */
  function toggleQuestion(index) {
    setExpandedQuestion((current) =>
      current === index ? null : index
    );
  }

  /* -----------------------------
     View exam review
  ----------------------------- */
  async function viewAttempt(attemptId, examType) {
    try {
      setSelectedExamType(examType);
      setSelectedAttempt(attemptId);
      setIsReviewOpen(true);
      setIsLoadingReview(true);
      setAttemptAnswers([]);
      setExpandedQuestion(null);

      const response = await fetch(
        `${API_BASE_URL}/api/attempt-answer/by-attempt/${attemptId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load exam review");
      }

      const data = await response.json();

      setAttemptAnswers(data);
    } catch (error) {
      console.error("Failed to load exam review", error);
      alert("Failed to load exam review.");
      setIsReviewOpen(false);
    } finally {
      setIsLoadingReview(false);
    }
  }

  function closeReview() {
    setIsReviewOpen(false);
    setSelectedAttempt(null);
    setAttemptAnswers([]);
    setSelectedExamType(null);
    setExpandedQuestion(null);
  }

  /* -----------------------------
     Helpers
  ----------------------------- */
  function getResultBadge(historyItem) {
    if (
      historyItem.evaluated &&
      historyItem.test?.resultTime === "Immediately"
    ) {
      if (historyItem.result === "PASS") {
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            PASS
          </span>
        );
      }

      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
          FAIL
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
        Pending
      </span>
    );
  }

  function isResultAvailable(historyItem) {
    return (
      historyItem.evaluated &&
      historyItem.test?.resultTime === "Immediately"
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================
    COMPACT PAGE HEADER
================================= */}
      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-5 px-5 py-5 sm:px-7 lg:px-8">

          {/* Left */}
          <div className="min-w-0">

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Exam History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review your previous examination attempts and results.
            </p>

          </div>

          {/* Student */}
          {loggedUser && (
            <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600">
                {loggedUser.name?.charAt(0)?.toUpperCase() || "S"}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Student
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-700">
                  {loggedUser.name}
                </p>
              </div>

            </div>
          )}

        </div>

      </header>

      {/* --------------------------------
          Main
      -------------------------------- */}
      <main className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-7 lg:px-8">

        {/* =================================
    HISTORY TOOLBAR
================================= */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              My Attempts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {history.length} examination
              {history.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="relative w-full sm:w-[300px]">

            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              🔍
            </span>

            <input
              type="text"
              onChange={handleSearch}
              placeholder="Search test name..."
              className="
        w-full rounded-xl
        border border-slate-200
        bg-white
        py-2.5 pl-10 pr-4
        text-sm text-slate-700
        shadow-sm outline-none
        transition
        placeholder:text-slate-400
        focus:border-indigo-500
        focus:ring-4
        focus:ring-indigo-100
      "
            />

          </div>

        </div>

        {/* --------------------------------
            History Table
        -------------------------------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Loading */}
          {isLoadingHistory ? (
            <div className="flex min-h-72 items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading exam history...
                </p>

              </div>

            </div>
          ) : history.length === 0 ? (

            /* Empty */
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📋
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                No exam attempts found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Your completed examination attempts will appear here.
              </p>

            </div>
          ) : (

            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[900px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Test Name
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Language
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Exam Type
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Marks
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Result
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Percentage
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {history.map((h) => {

                      const resultAvailable = isResultAvailable(h);

                      return (
                        <tr
                          key={h.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Test */}
                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                                📄
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-bold text-slate-800">
                                  {h.test?.topicName || "Untitled Test"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Attempt #{h.id}
                                </p>
                              </div>

                            </div>

                          </td>

                          {/* Language */}
                          <td className="px-4 py-4 text-center text-sm font-medium text-slate-600">
                            {h.test?.language || "-"}
                          </td>

                          {/* Exam Type */}
                          <td className="px-4 py-4 text-center">

                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {h.test?.examType || "-"}
                            </span>

                          </td>

                          {/* Marks */}
                          <td className="px-4 py-4 text-center text-sm font-semibold text-slate-700">

                            {resultAvailable
                              ? h.totalMarks
                              : (
                                <span className="text-xs font-semibold text-slate-400">
                                  Pending
                                </span>
                              )}

                          </td>

                          {/* Result */}
                          <td className="px-4 py-4 text-center">
                            {getResultBadge(h)}
                          </td>

                          {/* Percentage */}
                          <td className="px-4 py-4 text-center text-sm font-bold text-slate-700">

                            {resultAvailable
                              ? `${h.percentage}%`
                              : (
                                <span className="text-xs font-semibold text-slate-400">
                                  Pending
                                </span>
                              )}

                          </td>

                          {/* Date */}
                          <td className="px-4 py-4 text-center text-xs text-slate-500">
                            {new Date(h.attemptedAt).toLocaleString()}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-4 text-center">

                            {resultAvailable ? (
                              <button
                                type="button"
                                onClick={() =>
                                  viewAttempt(
                                    h.id,
                                    h.test?.examType
                                  )
                                }
                                className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-600 hover:text-white"
                              >
                                View Review
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-slate-400">
                                Result Pending
                              </span>
                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

              {/* --------------------------------
                  Mobile Cards
              -------------------------------- */}
              <div className="divide-y divide-slate-100 md:hidden">

                {history.map((h) => {

                  const resultAvailable = isResultAvailable(h);
                  const isExpanded = expandedRow === h.id;

                  return (
                    <div key={h.id}>

                      <button
                        type="button"
                        onClick={() => toggleRow(h.id)}
                        className="w-full px-5 py-4 text-left transition hover:bg-slate-50"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              📄
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-bold text-slate-800">
                                {h.test?.topicName || "Untitled Test"}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {h.test?.examType || "-"} •{" "}
                                {h.test?.language || "-"}
                              </p>

                            </div>

                          </div>

                          <span className="shrink-0 text-slate-400">
                            {isExpanded ? "⌃" : "⌄"}
                          </span>

                        </div>

                      </button>

                      {isExpanded && (
                        <div className="bg-slate-50 px-5 pb-5">

                          <div className="grid grid-cols-2 gap-3 pt-2">

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Marks
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-700">
                                {resultAvailable
                                  ? h.totalMarks
                                  : "Pending"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Percentage
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-700">
                                {resultAvailable
                                  ? `${h.percentage}%`
                                  : "Pending"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Result
                              </p>

                              <div className="mt-1">
                                {getResultBadge(h)}
                              </div>
                            </div>

                            <div className="rounded-xl bg-white p-3">
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Date
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-600">
                                {new Date(
                                  h.attemptedAt
                                ).toLocaleString()}
                              </p>
                            </div>

                          </div>

                          {resultAvailable && (
                            <button
                              type="button"
                              onClick={() =>
                                viewAttempt(
                                  h.id,
                                  h.test?.examType
                                )
                              }
                              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                              View Exam Review
                            </button>
                          )}

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </div>
      </main>

      {/* =====================================
          EXAM REVIEW MODAL
      ===================================== */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-3 py-5 backdrop-blur-sm">

          <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white sm:px-6">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                  Examination Review
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Attempt #{selectedAttempt}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeReview}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl text-white transition hover:bg-white/20"
              >
                ×
              </button>

            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-auto">

              {isLoadingReview ? (
                <div className="flex min-h-72 items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                    <p className="mt-4 text-sm font-medium text-slate-500">
                      Loading exam review...
                    </p>

                  </div>

                </div>
              ) : attemptAnswers.length === 0 ? (

                <div className="flex min-h-72 items-center justify-center text-center">

                  <div>
                    <div className="text-3xl">
                      📋
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-600">
                      No answer details found.
                    </p>
                  </div>

                </div>
              ) : (

                <div className="p-4 sm:p-6">

                  {/* Review Summary */}
                  <div className="mb-5 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Exam Type
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {selectedExamType || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Questions
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {attemptAnswers.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Review
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-600">
                        Completed
                      </p>
                    </div>

                  </div>

                  {/* Desktop Review Table */}
                  <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">

                    <table className="w-full min-w-[950px]">

                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-900 text-white">

                          <th className="w-16 px-4 py-3 text-center text-xs font-bold">
                            #
                          </th>

                          <th className="px-4 py-3 text-left text-xs font-bold">
                            Question
                          </th>

                          {selectedExamType === "MCQ" && (
                            <th className="px-4 py-3 text-left text-xs font-bold">
                              Options
                            </th>
                          )}

                          {selectedExamType === "MCQ" && (
                            <th className="px-4 py-3 text-left text-xs font-bold">
                              Correct Answer
                            </th>
                          )}

                          <th className="px-4 py-3 text-left text-xs font-bold">
                            Your Answer
                          </th>

                          <th className="px-4 py-3 text-center text-xs font-bold">
                            Marks
                          </th>

                          {selectedExamType === "MCQ" && (
                            <th className="px-4 py-3 text-center text-xs font-bold">
                              Result
                            </th>
                          )}

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {attemptAnswers.map((a, i) => (

                          <tr
                            key={i}
                            className="transition hover:bg-slate-50"
                          >

                            <td className="px-4 py-4 text-center text-sm font-bold text-slate-500">
                              {i + 1}
                            </td>

                            <td className="max-w-[280px] px-4 py-4 text-sm leading-6 text-slate-700">
                              {a.questionText}
                            </td>

                            {/* Options */}
                            {selectedExamType === "MCQ" && (
                              <td className="px-4 py-4 text-sm">

                                <div className="space-y-1.5">

                                  {[
                                    a.option1,
                                    a.option2,
                                    a.option3,
                                    a.option4,
                                  ].map((op, idx) => {

                                    const isCorrect =
                                      op === a.correctAnswer;

                                    const isWrong =
                                      op === a.selectedAnswer &&
                                      !a.correct;

                                    return (
                                      <div
                                        key={idx}
                                        className={
                                          isCorrect
                                            ? "font-semibold text-emerald-600"
                                            : isWrong
                                              ? "font-semibold text-red-600"
                                              : "text-slate-600"
                                        }
                                      >
                                        <span className="mr-1 font-bold">
                                          {String.fromCharCode(65 + idx)}.
                                        </span>

                                        {op}
                                      </div>
                                    );
                                  })}

                                </div>

                              </td>
                            )}

                            {/* Correct Answer */}
                            {selectedExamType === "MCQ" && (
                              <td className="px-4 py-4 text-sm font-semibold text-emerald-600">
                                {a.correctAnswer}
                              </td>
                            )}

                            {/* Your Answer */}
                            <td className="px-4 py-4 text-sm">

                              {a.selectedAnswer ? (
                                a.correct ? (
                                  <span className="font-semibold text-emerald-600">
                                    {a.selectedAnswer}
                                  </span>
                                ) : (
                                  <span className="font-semibold text-red-600">
                                    {a.selectedAnswer}
                                  </span>
                                )
                              ) : (
                                <span className="font-medium text-amber-600">
                                  Not Answered
                                </span>
                              )}

                            </td>

                            {/* Marks */}
                            <td className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                              {a.marksObtained ?? 0} / {a.maxMarks ?? 0}
                            </td>

                            {/* Result */}
                            {selectedExamType === "MCQ" && (
                              <td className="px-4 py-4 text-center">

                                {a.correct ? (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                    Correct
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                    Wrong
                                  </span>
                                )}

                              </td>
                            )}

                          </tr>
                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* Mobile Review */}
                  <div className="space-y-3 md:hidden">

                    {attemptAnswers.map((a, i) => {

                      const expanded = expandedQuestion === i;

                      return (
                        <div
                          key={i}
                          className="overflow-hidden rounded-xl border border-slate-200"
                        >

                          <button
                            type="button"
                            onClick={() => toggleQuestion(i)}
                            className="w-full bg-white p-4 text-left"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div className="flex gap-3">

                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
                                  {i + 1}
                                </span>

                                <p className="text-sm font-semibold leading-6 text-slate-700">
                                  {a.questionText}
                                </p>

                              </div>

                              <span className="shrink-0 text-slate-400">
                                {expanded ? "⌃" : "⌄"}
                              </span>

                            </div>

                          </button>

                          {expanded && (
                            <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-4">

                              {/* Answer */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Your Answer
                                </p>

                                <p className="mt-1 text-sm font-semibold">

                                  {a.selectedAnswer ? (
                                    a.correct ? (
                                      <span className="text-emerald-600">
                                        {a.selectedAnswer}
                                      </span>
                                    ) : (
                                      <span className="text-red-600">
                                        {a.selectedAnswer}
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-amber-600">
                                      Not Answered
                                    </span>
                                  )}

                                </p>
                              </div>

                              {/* MCQ Options */}
                              {selectedExamType === "MCQ" && (
                                <div>

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Options
                                  </p>

                                  <div className="mt-2 space-y-2">

                                    {[
                                      a.option1,
                                      a.option2,
                                      a.option3,
                                      a.option4,
                                    ].map((op, idx) => {

                                      const isCorrect =
                                        op === a.correctAnswer;

                                      const isWrong =
                                        op === a.selectedAnswer &&
                                        !a.correct;

                                      return (
                                        <div
                                          key={idx}
                                          className={
                                            `rounded-lg bg-white px-3 py-2 text-sm ` +
                                            (isCorrect
                                              ? "font-semibold text-emerald-600"
                                              : isWrong
                                                ? "font-semibold text-red-600"
                                                : "text-slate-600")
                                          }
                                        >
                                          <b>
                                            {String.fromCharCode(65 + idx)}.
                                          </b>{" "}
                                          {op}
                                        </div>
                                      );
                                    })}

                                  </div>

                                </div>
                              )}

                              {/* Correct Answer */}
                              {selectedExamType === "MCQ" && (
                                <div className="rounded-lg bg-emerald-50 p-3">

                                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                    Correct Answer
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-emerald-700">
                                    {a.correctAnswer}
                                  </p>

                                </div>
                              )}

                              {/* Marks */}
                              <div className="flex items-center justify-between rounded-lg bg-white p-3">

                                <span className="text-xs font-semibold text-slate-500">
                                  Marks
                                </span>

                                <span className="text-sm font-bold text-slate-800">
                                  {a.marksObtained ?? 0} /{" "}
                                  {a.maxMarks ?? 0}
                                </span>

                              </div>

                              {/* Result */}
                              {selectedExamType === "MCQ" && (
                                <div>

                                  {a.correct ? (
                                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                      Correct
                                    </span>
                                  ) : (
                                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                                      Wrong
                                    </span>
                                  )}

                                </div>
                              )}

                            </div>
                          )}

                        </div>
                      );
                    })}

                  </div>

                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">

              <button
                type="button"
                onClick={closeReview}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                Close Review
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default TestHistory;