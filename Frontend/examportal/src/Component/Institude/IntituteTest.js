import React, { useEffect, useState } from "react";
import mcqTemplate from "../assets/Images/template.xlsx";
import theoryTemplate from "../assets/Images/Question-Template.xlsx";
import API_BASE_URL from "../../helper";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

function IntituteTest() {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [filteredTests, setFilteredTests] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [loggedInstitute, setLoggedInstitute] = useState(null);
  const [approvingTestId, setApprovingTestId] = useState(null);
  const [selectedExamType, setSelectedExamType] = useState("");

  const [expandedTest, setExpandedTest] = useState(null);
  const [expandedQuestionRow, setExpandedQuestionRow] = useState(null);

  const [form, setForm] = useState({
    institude: "",
    institudeEmail: "",
    topicName: "",
    examType: "",
    language: "",
    duration: "",
    testTotalQuestion: "",
    testTotalMarks: "",
    passingMarks: "",
    resultTime: "",
    quetionsFile: null,
  });

  const [editForm, setEditForm] = useState({
    institude: "",
    institudeEmail: "",
    topicName: "",
    examType: "",
    language: "",
    duration: "",
    testTotalQuestion: "",
    testTotalMarks: "",
    passingMarks: "",
    resultTime: "",
    quetionsFile: null,
  });

  /* =========================================
     LOAD LOGGED INSTITUTE + TESTS
  ========================================= */

  useEffect(() => {
    const data = localStorage.getItem("loggedInstitute");

    if (data) {
      const inst = JSON.parse(data);

      setLoggedInstitute(inst);

      setForm((f) => ({
        ...f,
        institude: inst.instituteName,
        institudeEmail: inst.email,
      }));

      loadTests(inst.instituteName);
    }
  }, []);

  /* =========================================
     LOAD TESTS
  ========================================= */

  const loadTests = (instituteName) => {
    fetch(`${API_BASE_URL}/api/test/by-institute/${instituteName}`)
      .then((res) => res.json())
      .then((data) => {
        const reversed = data.reverse();

        setTests(reversed);
        setFilteredTests(reversed);
      });
  };

  /* =========================================
     SEARCH
  ========================================= */

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase().trim();
    const normalizedKeyword = keyword.replace(/\s+/g, "");

    if (!normalizedKeyword) {
      setFilteredTests(tests);
      return;
    }

    const result = tests.filter((t) => {
      const topicName = (t.topicName || "")
        .toLowerCase()
        .replace(/\s+/g, "");

      const examType = (t.examType || "")
        .toLowerCase()
        .replace(/\s+/g, "");

      const language = (t.language || "")
        .toLowerCase()
        .replace(/\s+/g, "");

      const duration = (t.duration || "")
        .toLowerCase()
        .replace(/\s+/g, "");

      const totalMarks = t.testTotalMarks?.toString() || "";
      const totalQuestion = t.testTotalQuestion?.toString() || "";
      const passingMarks = t.passingMarks?.toString() || "";

      return (
        topicName.includes(normalizedKeyword) ||
        examType.includes(normalizedKeyword) ||
        language.includes(normalizedKeyword) ||
        duration.includes(normalizedKeyword) ||
        totalMarks.includes(normalizedKeyword) ||
        totalQuestion.includes(normalizedKeyword) ||
        passingMarks.includes(normalizedKeyword)
      );
    });

    setFilteredTests(result);
  };

  /* =========================================
     SUCCESS MESSAGE
  ========================================= */

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  };

  /* =========================================
     FORM HANDLERS
  ========================================= */

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    setEditForm({
      ...editForm,
      [name]: files ? files[0] : value,
    });
  };

  /* =========================================
     ADD TEST
  ========================================= */

  const addTest = (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("institude", form.institude);
    fd.append("institudeEmail", form.institudeEmail);
    fd.append("topicName", form.topicName);
    fd.append("examType", form.examType);
    fd.append("language", form.language);
    fd.append("duration", form.duration);
    fd.append("testTotalQuestion", form.testTotalQuestion);
    fd.append("testTotalMarks", form.testTotalMarks);
    fd.append("passingMarks", form.passingMarks);
    fd.append("resultTime", form.resultTime);
    fd.append("quetionsFile", form.quetionsFile);

    fetch(`${API_BASE_URL}/api/test/add`, {
      method: "POST",
      body: fd,
    })
      .then((res) => res.json())
      .then(() => {
        setShowAddModal(false);

        loadTests(loggedInstitute.instituteName);

        showSuccess("Test Added Successfully!");
      })
      .catch(() => alert("Error saving test"));
  };

  /* =========================================
     LOAD TEST FOR EDIT
  ========================================= */

  const loadTestForEdit = (id) => {
    fetch(`${API_BASE_URL}/api/test/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEditForm({
          institude: data.institude,
          topicName: data.topicName,
          examType: data.examType,
          language: data.language,
          duration: data.duration,
          testTotalQuestion: data.testTotalQuestion,
          testTotalMarks: data.testTotalMarks,
          passingMarks: data.passingMarks,
          resultTime: data.resultTime,
          quetionsFile: null,
        });

        setEditId(id);
        setShowEditModal(true);
      });
  };

  /* =========================================
     UPDATE TEST
  ========================================= */

  const updateTest = (e) => {
    e.preventDefault();

    const fd = new FormData();

    Object.keys(editForm).forEach((k) => {
      if (k === "quetionsFile" && !editForm[k]) return;

      fd.append(k, editForm[k]);
    });

    fetch(`${API_BASE_URL}/api/test/update/${editId}`, {
      method: "PUT",
      body: fd,
    }).then(() => {
      setShowEditModal(false);

      loadTests(loggedInstitute.instituteName);

      showSuccess("Test Updated Successfully!");
    });
  };

  /* =========================================
     DELETE TEST
  ========================================= */

  const deleteTest = () => {
    fetch(`${API_BASE_URL}/api/test/delete/${deleteId}`, {
      method: "DELETE",
    }).then(() => {
      setShowDeleteModal(false);

      loadTests(loggedInstitute.instituteName);

      showSuccess("Test Deleted Successfully!");
    });
  };

  /* =========================================
   APPROVE TEST
========================================= */

  const approveTest = async (testId) => {
    if (!loggedInstitute?.email) {
      alert("Institute login details not found. Please log in again.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to approve this test? Once approved, it will be available for students."
    );

    if (!confirmed) return;

    setApprovingTestId(testId);

    try {
      const params = new URLSearchParams({
        instituteEmail: loggedInstitute.email,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/test/approve-institute/${testId}?${params.toString()}`,
        { method: "POST" }
      );

      const message = await response.text();

      if (!response.ok) {
        throw new Error(message || "Failed to approve test.");
      }

      await loadTests(loggedInstitute.instituteName);
      showSuccess("Test approved successfully!");
    } catch (error) {
      alert(error.message || "Error approving test.");
    } finally {
      setApprovingTestId(null);
    }
  };

  /* =========================================
     VIEW QUESTIONS
  ========================================= */

  const viewQuestions = (id, examType) => {
    setSelectedExamType(examType);

    fetch(`${API_BASE_URL}/api/test/questions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setShowQuestionsModal(true);
      });
  };

  /* =========================================
     MOBILE ROW TOGGLES
  ========================================= */

  const toggleTestRow = (id) => {
    setExpandedTest(expandedTest === id ? null : id);
  };

  const toggleRow = (id) => {
    setExpandedQuestionRow(
      expandedQuestionRow === id ? null : id
    );
  };

  /* =========================================
     DOWNLOAD EXCEL
  ========================================= */

  const downloadExcel = async () => {
    if (!loggedInstitute) return;

    try {
      const testRes = await fetch(
        `${API_BASE_URL}/api/test/by-institute/${loggedInstitute.instituteName}`
      );

      const tests = await testRes.json();

      if (!tests || tests.length === 0) {
        alert("No Tests Found!");
        return;
      }

      const workbook = XLSX.utils.book_new();

      const applyHeaderStyle = (worksheet) => {
        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: 0,
            c: col,
          });

          if (!worksheet[cellAddress]) continue;

          worksheet[cellAddress].s = {
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

        worksheet["!cols"] = Array(range.e.c + 1).fill({
          wch: 22,
        });
      };

      const testData = tests.map((t, i) => ({
        "Sr No": i + 1,
        "Topic Name": t.topicName,
        "Exam Type": t.examType,
        Language: t.language,
        Duration: t.duration,
        "Total Question": t.testTotalQuestion,
        "Total Marks": t.testTotalMarks,
        "Passing Marks": t.passingMarks,
        "Result Time": t.resultTime,
      }));

      const testSheet = XLSX.utils.json_to_sheet(testData);

      applyHeaderStyle(testSheet);

      XLSX.utils.book_append_sheet(
        workbook,
        testSheet,
        "Tests"
      );

      for (let test of tests) {
        const res = await fetch(
          `${API_BASE_URL}/api/test/questions/${test.id}`
        );

        const questions = await res.json();

        if (!questions || questions.length === 0) continue;

        const questionData = questions.map((q, index) => ({
          "Sr No": index + 1,
          Question: q.questions,
          "Option 1": q.option1,
          "Option 2": q.option2,
          "Option 3": q.option3,
          "Option 4": q.option4,
          Answer: q.answer,
          Marks: q.marks,
        }));

        const questionSheet =
          XLSX.utils.json_to_sheet(questionData);

        applyHeaderStyle(questionSheet);

        let safeSheetName =
          test.topicName.substring(0, 28);

        XLSX.utils.book_append_sheet(
          workbook,
          questionSheet,
          safeSheetName
        );
      }

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(
        blob,
        `${loggedInstitute.instituteName}_Tests.xlsx`
      );
    } catch (error) {
      alert("Error downloading file!");
    }
  };

  /* =========================================
     INPUT COMPONENT
  ========================================= */

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  const labelClass =
    "text-sm font-semibold text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-[1500px] px-5 py-3 sm:px-7 lg:px-8">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                Institute Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Test Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create, manage and review your examination tests.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Institute
              </p>

              <p className="mt-0.5 max-w-[250px] truncate text-sm font-bold text-slate-800">
                {loggedInstitute?.instituteName || "Institute"}
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-8">

        {/* =========================================
            ACTION BAR
        ========================================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Tests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredTests.length} test
                {filteredTests.length !== 1 ? "s" : ""} available
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <a
                href={theoryTemplate}
                download="Question-Template.xlsx"
                className="
                  inline-flex items-center gap-2
                  rounded-xl border border-amber-200
                  bg-amber-50 px-4 py-2.5
                  text-sm font-semibold text-amber-700
                  transition hover:bg-amber-100
                "
              >
                <span>↓</span>
                Question Template
              </a>

              <button
                type="button"
                onClick={downloadExcel}
                className="
                  inline-flex items-center gap-2
                  rounded-xl border border-indigo-200
                  bg-indigo-50 px-4 py-2.5
                  text-sm font-semibold text-indigo-700
                  transition hover:bg-indigo-100
                "
              >
                <span>▣</span>
                Download Excel
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="
                  inline-flex items-center gap-2
                  rounded-xl bg-indigo-600
                  px-5 py-2.5
                  text-sm font-semibold text-white
                  shadow-sm transition
                  hover:bg-indigo-700
                "
              >
                <span className="text-lg leading-none">＋</span>
                Add Test
              </button>

            </div>

          </div>

          {/* SEARCH */}

          <div className="mt-5 border-t border-slate-100 pt-5">

            <div className="relative max-w-xl">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              </span>

              <input
                type="text"
                onChange={handleSearch}
                placeholder="Search by topic, exam type, language, duration, marks..."
                className={`${inputClass} pl-11`}
              />

            </div>

          </div>

        </section>

        {/* =========================================
            TEST LIST
        ========================================= */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto lg:block">


            <div className="w-full overflow-x-auto rounded-xl">
              <table className="w-full min-w-[1400px] table-auto text-left">
                <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-300">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-4">#</th>
                    <th className="whitespace-nowrap px-4 py-4">Topic</th>
                    <th className="whitespace-nowrap px-4 py-4">Exam Type</th>
                    <th className="whitespace-nowrap px-4 py-4">Language</th>
                    <th className="whitespace-nowrap px-4 py-4">Duration</th>
                    <th className="whitespace-nowrap px-4 py-4">Questions</th>
                    <th className="whitespace-nowrap px-4 py-4">Marks</th>
                    <th className="whitespace-nowrap px-4 py-4">Passing</th>
                    <th className="whitespace-nowrap px-4 py-4">Result</th>
                    <th className="whitespace-nowrap px-4 py-4 text-center">Question Paper</th>
                    <th className="min-w-[280px] whitespace-nowrap px-4 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                          ▤
                        </div>

                        <h3 className="mt-4 font-bold text-slate-800">
                          No tests found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Create your first examination test to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((t, i) => (
                      <tr key={t.id} className="transition hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-500">
                          {i + 1}
                        </td>

                        <td className="px-4 py-4">
                          <p className="max-w-[190px] truncate text-sm font-bold text-slate-900">
                            {t.topicName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {t.institude}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {t.examType}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {t.language}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {t.duration}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                          {t.testTotalQuestion}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                          {t.testTotalMarks}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700">
                          {t.passingMarks}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                          {t.resultTime}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-center">
                          {t.status === "APPROVED" ? (
                            <button
                              type="button"
                              onClick={() => viewQuestions(t.id, t.examType)}
                              className="inline-flex h-9 items-center justify-center rounded-lg bg-cyan-50 px-4 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100"
                            >
                              View
                            </button>
                          ) : (
                            <span className="inline-flex h-9 items-center justify-center rounded-lg bg-amber-50 px-3 text-xs font-bold text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex min-w-[260px] items-center justify-center gap-2 whitespace-nowrap">
                            {t.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => approveTest(t.id)}
                                disabled={approvingTestId === t.id}
                                className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {approvingTestId === t.id ? "Approving..." : "Approve"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => loadTestForEdit(t.id)}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteId(t.id);
                                setShowDeleteModal(true);
                              }}
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>


          </div>

          {/* MOBILE / TABLET CARDS */}


          <div className="divide-y divide-slate-100 lg:hidden">
            {filteredTests.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                  ▤
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  No tests found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create your first examination test to get started.
                </p>
              </div>
            ) : (
              filteredTests.map((t, i) => (
                <div key={t.id} className="p-4 transition hover:bg-slate-50/70">
                  {/* Test Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400">
                        Test #{i + 1}
                      </p>

                      <h3 className="mt-1 break-words text-base font-bold text-slate-900">
                        {t.topicName}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {t.examType}
                        </span>

                        <span className="text-xs text-slate-500">
                          {t.language}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                            }`}
                        >
                          {t.status === "APPROVED" ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleTestRow(t.id)}
                      aria-label={
                        expandedTest === t.id ? "Collapse test details" : "Expand test details"
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
                    >
                      {expandedTest === t.id ? "−" : "+"}
                    </button>
                  </div>

                  {/* Test Summary */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Questions
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {t.testTotalQuestion}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Total Marks
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {t.testTotalMarks}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Duration
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-800">
                        {t.duration}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTest === t.id && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="mb-3 text-sm font-bold text-slate-800">
                        Test Details
                      </h4>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">Organization</p>
                          <p className="mt-1 break-words font-semibold text-slate-700">
                            {t.institude}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Exam Type</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {t.examType}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Language</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {t.language}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Passing Marks</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {t.passingMarks}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Result Time</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {t.resultTime || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Status</p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {t.status || "PENDING"}
                          </p>
                        </div>
                      </div>

                      {/* Question Paper */}
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Question Paper
                        </p>

                        {t.status === "APPROVED" ? (
                          <button
                            type="button"
                            onClick={() => viewQuestions(t.id, t.examType)}
                            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            View Questions
                          </button>
                        ) : (
                          <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-center text-sm font-semibold text-amber-700">
                            Available after approval
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Actions
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {t.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => approveTest(t.id)}
                              disabled={approvingTestId === t.id}
                              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {approvingTestId === t.id ? (
                                <>
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                  Approving...
                                </>
                              ) : (
                                "✓ Approve Test"
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => loadTestForEdit(t.id)}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Edit Test
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(t.id);
                              setShowDeleteModal(true);
                            }}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete Test
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>


        </section>

      </main>

      {/* =========================================================
          ADD TEST MODAL
      ========================================================= */}

      {showAddModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Test Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Create New Test
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={addTest}
              className="max-h-[calc(92vh-80px)] overflow-y-auto"
            >

              <div className="grid gap-5 p-5 sm:grid-cols-2">

                <div>
                  <label className={labelClass}>
                    Organization Name
                  </label>

                  <input
                    type="text"
                    name="institude"
                    value={form.institude}
                    readOnly
                    className={`${inputClass} bg-slate-50`}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Topic Name
                  </label>

                  <input
                    type="text"
                    name="topicName"
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="e.g. Java Fundamentals"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Exam Type
                  </label>

                  <select
                    name="examType"
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- Select --</option>
                    <option value="Theory">Theory</option>
                    <option value="MCQ">MCQ</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Language
                  </label>

                  <select
                    name="language"
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- Select --</option>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="hh:mm:ss"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Total Questions
                  </label>

                  <input
                    type="number"
                    name="testTotalQuestion"
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Total Marks
                  </label>

                  <input
                    type="number"
                    name="testTotalMarks"
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Passing Marks
                  </label>

                  <input
                    type="number"
                    name="passingMarks"
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Result Show
                  </label>

                  <select
                    name="resultTime"
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">-- Select --</option>
                    <option>Immediately</option>
                    <option>Pending</option>
                  </select>
                </div>

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    Questions File
                  </label>

                  <input
                    type="file"
                    name="quetionsFile"
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Upload the question file using the supported template.
                  </p>

                </div>

              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Save Test
                </button>

              </div>
              <br />
              <br />

            </form>

          </div>

        </div>

      )}

      {/* =========================================================
          EDIT TEST MODAL
      ========================================================= */}

      {showEditModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Test Management
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Edit Test
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={updateTest}
              className="max-h-[calc(92vh-80px)] overflow-y-auto"
            >

              <div className="grid gap-5 p-5 sm:grid-cols-2">

                <div>
                  <label className={labelClass}>
                    Institute
                  </label>

                  <input
                    type="text"
                    name="institude"
                    value={editForm.institude}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Topic Name
                  </label>

                  <input
                    type="text"
                    name="topicName"
                    value={editForm.topicName}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Exam Type
                  </label>

                  <select
                    name="examType"
                    value={editForm.examType}
                    onChange={handleEditChange}
                    className={inputClass}
                  >
                    <option>Theory</option>
                    <option>MCQ</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Language
                  </label>

                  <select
                    name="language"
                    value={editForm.language}
                    onChange={handleEditChange}
                    className={inputClass}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    value={editForm.duration}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Total Questions
                  </label>

                  <input
                    type="text"
                    name="testTotalQuestion"
                    value={editForm.testTotalQuestion}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Total Marks
                  </label>

                  <input
                    type="text"
                    name="testTotalMarks"
                    value={editForm.testTotalMarks}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Passing Marks
                  </label>

                  <input
                    type="text"
                    name="passingMarks"
                    value={editForm.passingMarks}
                    onChange={handleEditChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Result Show
                  </label>

                  <select
                    name="resultTime"
                    value={editForm.resultTime}
                    onChange={handleEditChange}
                    className={inputClass}
                  >
                    <option value="">-- Select --</option>
                    <option>Immediately</option>
                    <option>Pending</option>
                  </select>
                </div>

                <div className="sm:col-span-2">

                  <label className={labelClass}>
                    Update Questions File
                  </label>

                  <input
                    type="file"
                    name="quetionsFile"
                    onChange={handleEditChange}
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Leave empty if you don't want to update the file.
                  </p>

                </div>

              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">

                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Update Test
                </button>

              </div>
              <br />
              <br />


            </form>

          </div>

        </div>

      )}

      {/* =========================================================
          QUESTIONS MODAL
      ========================================================= */}

      {showQuestionsModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                  Question Paper
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Questions
                </h2>

              </div>

              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>

            </div>

            <div className="overflow-auto">

              <table className="w-full min-w-[700px] text-left">

                <thead className="sticky top-0 bg-slate-900 text-xs uppercase tracking-wider text-slate-300">

                  <tr>

                    <th className="px-4 py-4">#</th>

                    <th className="px-4 py-4">
                      Question
                    </th>

                    {selectedExamType === "MCQ" && (
                      <>
                        <th className="px-4 py-4">Option 1</th>
                        <th className="px-4 py-4">Option 2</th>
                        <th className="px-4 py-4">Option 3</th>
                        <th className="px-4 py-4">Option 4</th>
                        <th className="px-4 py-4">Answer</th>
                      </>
                    )}

                    <th className="px-4 py-4">
                      Marks
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {questions.map((q, i) => (

                    <React.Fragment key={q.queId}>

                      <tr className="hover:bg-slate-50">

                        <td className="px-4 py-4 text-sm font-semibold text-slate-500">
                          {i + 1}
                        </td>

                        <td className="max-w-[300px] px-4 py-4 text-sm font-medium text-slate-800">
                          {q.questions}
                        </td>

                        {selectedExamType === "MCQ" && (
                          <>
                            <td className="px-4 py-4 text-sm text-slate-600">
                              {q.option1}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {q.option2}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {q.option3}
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-600">
                              {q.option4}
                            </td>

                            <td className="px-4 py-4 text-sm font-semibold text-emerald-600">
                              {q.answer || "-"}
                            </td>
                          </>
                        )}

                        <td className="px-4 py-4 text-sm font-bold text-slate-700">
                          {q.marks ?? "-"}
                        </td>

                      </tr>

                    </React.Fragment>

                  ))}

                </tbody>

              </table>

            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-4">

              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================================
          DELETE MODAL
      ========================================================= */}

      {showDeleteModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
              !
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Delete Test?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete this test?
            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteTest}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =========================================================
          SUCCESS MODAL
      ========================================================= */}

      {showSuccessModal && (

        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
              ✓
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Success
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              OK
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default IntituteTest;