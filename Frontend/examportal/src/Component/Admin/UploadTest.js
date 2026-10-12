import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import API_BASE_URL from "../../helper";

function UploadTest() {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filteredTests, setFilteredTests] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState("");

  // Success Modal
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Search
  const [searchEmail, setSearchEmail] = useState("");

  const [filterType, setFilterType] = useState("ALL");

  /* =========================================================
     LOAD ALL TESTS
  ========================================================= */

  const loadTests = () => {
    fetch(`${API_BASE_URL}/api/test/all`)
      .then((res) => res.json())
      .then((data) => {
        const reversed = data.reverse();
        setTests(reversed);
        setFilteredTests(reversed);
      })
      .catch(() => alert("Failed to load tests"));
  };

  useEffect(() => {
    loadTests();
  }, []);

  /* =========================================================
     SUCCESS MESSAGE
  ========================================================= */

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  /* =========================================================
     VIEW QUESTIONS
  ========================================================= */

  const viewQuestions = (testId, examType) => {
    setSelectedExamType(examType);

    fetch(`${API_BASE_URL}/api/test/questions/${testId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setShowQuestionsModal(true);
      })
      .catch(() => alert("Failed to load questions"));
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  useEffect(() => {
    if (searchEmail.trim() === "") {
      setFilteredTests(tests);
      return;
    }

    const keyword = searchEmail.toLowerCase();

    const filtered = tests.filter(
      (t) =>
        t.institude?.toLowerCase().includes(keyword) ||
        t.institudeEmail?.toLowerCase().includes(keyword) ||
        t.topicName?.toLowerCase().includes(keyword)
    );

    setFilteredTests(filtered);
  }, [searchEmail, tests]);

  /* =========================================================
     DOWNLOAD EXCEL
  ========================================================= */

  const downloadExcel = () => {
    if (!filteredTests || filteredTests.length === 0) {
      alert("No test data available to download");
      return;
    }

    const formattedData = filteredTests.map((t, i) => ({
      "Sr. No": i + 1,
      "Organization Name": t.institude,
      Email: t.institudeEmail,
      Topic: t.topicName,
      "Exam Type": t.examType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = XLSX.utils.encode_cell({
        r: 0,
        c: col,
      });

      if (!worksheet[cell]) continue;

      worksheet[cell].s = {
        font: {
          bold: true,
          color: {
            rgb: "FFFFFF",
          },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
        fill: {
          fgColor: {
            rgb: "4F81BD",
          },
        },
      };
    }

    worksheet["!cols"] = Object.keys(formattedData[0]).map(() => ({
      wch: 20,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Tests"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Tests.xlsx");
  };

  /* =========================================================
     FILTER TESTS
  ========================================================= */

  const filterTests = (type) => {
    setFilterType(type);

    if (type === "ALL") {
      setFilteredTests(tests);
    } else if (type === "PENDING") {
      setFilteredTests(
        tests.filter((t) => t.status !== "APPROVED")
      );
    } else if (type === "APPROVED") {
      setFilteredTests(
        tests.filter((t) => t.status === "APPROVED")
      );
    }
  };

  /* =========================================================
     COUNTS
  ========================================================= */

  const totalTests = tests.length;

  const pendingTests = tests.filter(
    (t) => t.status !== "APPROVED"
  ).length;

  const approvedTests = tests.filter(
    (t) => t.status === "APPROVED"
  ).length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-6">

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
              Test Management
            </p>

            <h1 className="mt-0.5 text-[23px] font-bold tracking-tight text-slate-900">
              All Tests
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              View and manage organization test submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadExcel}
            className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14"
              />
            </svg>

            Download Excel
          </button>

        </div>

      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="space-y-4 px-4 py-4 lg:px-6">

        {/* ===================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Total Tests
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {totalTests}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6M9 8h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                  />
                </svg>
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                  Pending
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {pendingTests}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

            </div>

          </div>

          {/* APPROVED */}

          <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                  Approved
                </p>

                <p className="mt-1 text-xl font-bold text-slate-900">
                  {approvedTests}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            SEARCH + ACTIONS
        ==================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

            {/* SEARCH */}

            <div className="relative w-full xl:max-w-md">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search institute, email or topic..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* FILTER + APPROVE */}

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() => filterTests("ALL")}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  filterType === "ALL"
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => filterTests("PENDING")}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  filterType === "PENDING"
                    ? "bg-amber-500 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Pending
              </button>

              <button
                type="button"
                onClick={() => filterTests("APPROVED")}
                className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  filterType === "APPROVED"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Approved
              </button>

            </div>

          </div>

        </div>

        {/* ===================================================
            TEST TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Test Submissions
              </h2>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Review test submissions and their current status.
              </p>
            </div>

            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
              {filteredTests.length} RESULTS
            </span>

          </div>

          {/* RESPONSIVE TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-3 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Sr. No
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Organization
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Topic
                  </th>

                  <th className="px-3 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Exam Type
                  </th>

                  <th className="px-3 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Questions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredTests.length > 0 ? (
                  filteredTests.map((t, i) => (

                    <tr
                      key={t.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* NUMBER */}

                      <td className="px-3 py-3 text-center text-xs font-semibold text-slate-500">
                        {i + 1}
                      </td>

                      {/* ORGANIZATION */}

                      <td className="px-3 py-3">

                        <div className="flex items-center gap-2">

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600">
                            {(t.institude || "O")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="max-w-[180px] truncate text-xs font-semibold text-slate-800">
                            {t.institude}
                          </span>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-3 py-3 text-xs text-slate-500">
                        <span className="max-w-[210px] truncate block">
                          {t.institudeEmail}
                        </span>
                      </td>

                      {/* TOPIC */}

                      <td className="px-3 py-3">

                        <span className="text-xs font-medium text-slate-700">
                          {t.topicName}
                        </span>

                      </td>

                      {/* EXAM TYPE */}

                      <td className="px-3 py-3 text-center">

                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                          {t.examType}
                        </span>

                      </td>

                      {/* QUESTIONS */}

                      <td className="px-3 py-3 text-center">

                        {t.status === "APPROVED" ? (

                          <button
                            type="button"
                            onClick={() =>
                              viewQuestions(
                                t.id,
                                t.examType
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold text-indigo-600 transition hover:bg-indigo-100"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.64 0 8.577 2.51 9.964 6.678.071.21.071.434 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>

                            View
                          </button>

                        ) : (

                          <span className="inline-flex rounded-md bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-600">
                            Pending
                          </span>

                        )}

                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6M9 8h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                          />
                        </svg>

                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No tests found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          VIEW QUESTIONS MODAL
      ====================================================== */}

      {showQuestionsModal && (

        <div className="fixed inset-0 z-[1055] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">

          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 bg-indigo-600 px-5 py-3.5 text-white">

              <div>

                <h2 className="text-sm font-semibold">
                  Test Questions
                </h2>

                <p className="mt-0.5 text-[10px] text-indigo-100">
                  Review questions configured for this test.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowQuestionsModal(false)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-indigo-100 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="min-h-0 flex-1 overflow-auto">

              {questions.length > 0 ? (

                <table className="w-full min-w-[850px]">

                  <thead className="sticky top-0 z-10 bg-slate-50">

                    <tr className="border-b border-slate-200">

                      <th className="w-[35%] px-4 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Question
                      </th>

                      {selectedExamType === "MCQ" && (
                        <>
                          <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            1
                          </th>

                          <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            2
                          </th>

                          <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            3
                          </th>

                          <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            4
                          </th>

                          <th className="px-3 py-3 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Answer
                          </th>
                        </>
                      )}

                      <th className="w-20 px-3 py-3 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Marks
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {questions.map((q, index) => (

                      <tr
                        key={q.queId}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-4 py-3 align-top">

                          <div className="flex gap-2">

                            <span className="shrink-0 text-[10px] font-bold text-indigo-600">
                              Q{index + 1}
                            </span>

                            <span className="text-xs leading-5 text-slate-700">
                              {q.questions}
                            </span>

                          </div>

                        </td>

                        {selectedExamType === "MCQ" && (
                          <>
                            <td className="px-3 py-3 align-top text-xs text-slate-600">
                              {q.option1}
                            </td>

                            <td className="px-3 py-3 align-top text-xs text-slate-600">
                              {q.option2}
                            </td>

                            <td className="px-3 py-3 align-top text-xs text-slate-600">
                              {q.option3}
                            </td>

                            <td className="px-3 py-3 align-top text-xs text-slate-600">
                              {q.option4}
                            </td>

                            <td className="px-3 py-3 align-top">

                              <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                                {q.answer}
                              </span>

                            </td>
                          </>
                        )}

                        <td className="px-3 py-3 text-center align-top">

                          <span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-600">
                            {q.marks}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              ) : (

                <div className="flex min-h-[250px] items-center justify-center">

                  <div className="text-center">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h6m-6 4h6M9 8h6M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
                        />
                      </svg>
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No questions available
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">

              <button
                type="button"
                onClick={() =>
                  setShowQuestionsModal(false)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}

      {showSuccessModal && (

        <div className="fixed inset-0 z-[1060] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between bg-emerald-600 px-5 py-3.5 text-white">

              <h2 className="text-sm font-semibold">
                Success
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowSuccessModal(false)
                }
                className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-100 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

            </div>

            {/* BODY */}

            <div className="px-5 py-7 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
                </svg>

              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                {successMessage}
              </h3>

            </div>

            {/* FOOTER */}

            <div className="flex justify-center border-t border-slate-100 bg-slate-50 px-5 py-3">

              <button
                type="button"
                onClick={() =>
                  setShowSuccessModal(false)
                }
                className="rounded-lg bg-emerald-600 px-6 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                OK
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default UploadTest;
