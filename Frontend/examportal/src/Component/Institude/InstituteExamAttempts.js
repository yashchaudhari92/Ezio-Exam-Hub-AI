import React, { useEffect, useState } from "react";
import $ from "jquery";
import html2canvas from "html2canvas";
import API_BASE_URL from "../../helper";
import logo from "../assets/Images/logo.png";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function InstituteExamAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [resultInstitute, setResultInstitute] = useState(null);
  const allAttemptsRef = React.useRef([]);

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");

  const [downloadData, setDownloadData] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [attemptDetails, setAttemptDetails] = useState(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const [expandedAttempt, setExpandedAttempt] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  // =========================================================
  // LOAD INSTITUTE
  // =========================================================

  useEffect(() => {
    const data = localStorage.getItem("loggedInstitute");

    if (data) {
      const inst = JSON.parse(data);

      setInstitute(inst);
      loadInstituteAttempts(inst.instituteName);

      $.get(
        `${API_BASE_URL}/api/test/by-institute/${inst.instituteName}`,
        (res) => {
          setTests(res);
        }
      );
    }
  }, []);

  // =========================================================
  // FILTER BY TEST
  // =========================================================

  useEffect(() => {
    if (!selectedTest) {
      setAttempts(allAttemptsRef.current);
    } else {
      const filtered = allAttemptsRef.current.filter(
        (a) => a.test?.id === Number(selectedTest)
      );

      setAttempts(filtered);
    }
  }, [selectedTest]);

  // =========================================================
  // SUCCESS
  // =========================================================

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  };

  // =========================================================
  // LOAD ATTEMPTS
  // =========================================================

  function loadInstituteAttempts(instituteName) {
    $.ajax({
      url: `${API_BASE_URL}/api/exam/by-institute/${instituteName}`,
      type: "GET",

      success: (data) => {
        const reversedData = [...data].reverse();

        setAttempts(reversedData);
        allAttemptsRef.current = reversedData;
      },

      error: (err) => {
        console.error("Failed to fetch attempts", err);
      },
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    setSearchEmail(keyword);

    if (keyword === "") {
      setAttempts(allAttemptsRef.current);
      return;
    }

    const filtered = allAttemptsRef.current.filter(
      (a) =>
        a.userName?.toLowerCase().includes(keyword) ||
        a.userEmail?.toLowerCase().includes(keyword) ||
        a.test?.topicName?.toLowerCase().includes(keyword)
    );

    setAttempts(filtered);
  }

  // =========================================================
  // VIEW ATTEMPT
  // =========================================================

  function viewAttempt(id) {
    $.get(`${API_BASE_URL}/api/exam/attempt/${id}`, (data) => {
      setAttemptDetails(data);
      setShowAttemptModal(true);
    });
  }

  // =========================================================
  // DELETE ATTEMPT
  // =========================================================

  function deleteAttempt(id) {
    if (!window.confirm("Are you sure you want to delete this exam attempt?")) {
      return;
    }

    $.ajax({
      url: `${API_BASE_URL}/api/exam/delete/${id}/${institute.instituteName}`,
      type: "DELETE",

      success: () => {
        showSuccess("Exam attempt deleted successfully!");
        loadInstituteAttempts(institute.instituteName);
      },

      error: () => {
        alert("Failed to delete exam attempt");
      },
    });
  }

  // =========================================================
  // PREPARE RESULT DOWNLOAD
  // =========================================================

  function prepareDownload(attempt) {
    const instituteName = attempt.instituteName;

    $.get(
      `${API_BASE_URL}/api/institute/by-name/${instituteName}`,
      (inst) => {
        setResultInstitute(inst);
        setDownloadData(attempt);

        setTimeout(() => {
          waitForImageAndDownload();
        }, 800);

        console.log("Institute Logo:", inst.intituteLogo);
      }
    );
  }

  // =========================================================
  // PDF REPORT
  // =========================================================

  function downloadFullReport() {
    if (!attempts || attempts.length === 0) {
      alert("No exam attempts to download");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    doc.text(institute.instituteName, 105, 15, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");

    doc.text("Exam Report", 105, 25, {
      align: "center",
    });

    const tableColumn = [
      "User Name",
      "User Email",
      "Test Name",
      "Exam Type",
      "Total Marks",
      "Result",
      "Date",
    ];

    const tableRows = attempts.map((a) => [
      a.userName,
      a.userEmail,
      a.test?.topicName,
      a.test?.examType,
      a.totalMarks,
      a.result,
      new Date(a.attemptedAt).toLocaleDateString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,

      theme: "grid",

      styles: {
        fontSize: 9,
        halign: "center",
      },

      headStyles: {
        fillColor: [0, 0, 0],
        textColor: 255,
      },

      didParseCell(data) {
        if (data.section === "body") {
          const resultValue = data.row.raw[5];

          if (resultValue === "PASS") {
            data.cell.styles.fillColor = [200, 255, 200];
          }
        }
      },
    });

    doc.save(`${institute.instituteName}_Exam_Report.pdf`);
  }

  // =========================================================
  // RESULT IMAGE
  // =========================================================

  function waitForImageAndDownload() {
    const img = document.getElementById("instituteLogoImg");

    if (!img) {
      console.log("Image element not found");
      return;
    }

    if (img.complete) {
      downloadResultImage();
    } else {
      img.onload = () => {
        downloadResultImage();
      };
    }
  }

  function downloadResultImage() {
    if (!downloadData) return;

    const element = document.getElementById("userResult");

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const link = document.createElement("a");

      const fileName =
        `${downloadData.userName}_${downloadData.test.topicName}`
          .replace(/\s+/g, "_");

      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  // =========================================================
  // MOBILE ATTEMPT ROW
  // =========================================================

  const toggleAttemptRow = (id) => {
    setExpandedAttempt(
      expandedAttempt === id ? null : id
    );
  };

  // =========================================================
  // MOBILE QUESTION ROW
  // =========================================================

  const toggleRow = (index) => {
    setExpandedRow(
      expandedRow === index ? null : index
    );
  };

  // =========================================================
  // EXCEL
  // =========================================================

  function downloadExcel() {
    if (!attempts || attempts.length === 0) {
      alert("No data available to download");
      return;
    }

    const formattedData = attempts.map((a, i) => ({
      "Sr No": i + 1,
      "Candidate Name": a.userName,
      "Test Name": a.test?.topicName,
      "Exam Type": a.test?.examType,
      "Total Marks": a.totalMarks,
      Result: a.result,
      Percentage: a.percentage + "%",
      "Date & Time": new Date(
        a.attemptedAt
      ).toLocaleString(),
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(formattedData);

    const range =
      XLSX.utils.decode_range(worksheet["!ref"]);

    for (
      let col = range.s.c;
      col <= range.e.c;
      col++
    ) {
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

    worksheet["!cols"] = Object.keys(
      formattedData[0]
    ).map(() => ({
      wch: 16,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Exam Attempts"
    );

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
      `${institute?.instituteName}_Exam_Attempts.xlsx`
    );
  }

  // =========================================================
  // EVALUATE TEST
  // =========================================================

  function handleCheckTest() {
    if (!selectedTest) {
      alert("Please select a test");
      return;
    }

    $.ajax({
      url: `${API_BASE_URL}/api/exam/evaluate-test/${selectedTest}/${institute.instituteName}`,
      type: "POST",

      success: () => {
        showSuccess("Evaluation Completed!");
        loadInstituteAttempts(
          institute.instituteName
        );
      },

      error: () => {
        alert("Evaluation failed");
      },
    });
  }

  // =========================================================
  // STYLES
  // =========================================================

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  const buttonPrimary =
    "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700";

  const buttonSecondary =
    "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col gap-4 px-5 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-7">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              Institute Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Exam Attempts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review candidate attempts, evaluate tests and download reports.
            </p>
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Institute
            </p>

            <p className="mt-1 max-w-[220px] truncate text-sm font-bold text-slate-800">
              {institute?.instituteName || "Institute"}
            </p>
          </div>

        </div>
      </header>

      <main className="space-y-5 px-5 py-6 lg:px-7">

        {/* ===================================================
            SUMMARY / SEARCH
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl text-indigo-600">
                  📊
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    All Exam Attempts
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {attempts.length}{" "}
                    {attempts.length === 1
                      ? "attempt"
                      : "attempts"}{" "}
                    displayed
                  </p>
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={downloadFullReport}
                className={buttonSecondary}
              >
                ↓ Download Report
              </button>

              <button
                type="button"
                onClick={downloadExcel}
                className={buttonPrimary}
              >
                ↓ Download Excel
              </button>

            </div>

          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px_150px]">

            {/* Search */}

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              </span>

              <input
                type="text"
                value={searchEmail}
                onChange={handleSearch}
                placeholder="Search candidate, email or test name..."
                className={`${inputClass} pl-11`}
              />

            </div>

            {/* Test */}

            <select
              value={selectedTest}
              onChange={(e) =>
                setSelectedTest(e.target.value)
              }
              className={inputClass}
            >
              <option value="">
                -- All Tests --
              </option>

              {[...tests]
                .reverse()
                .map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                  >
                    {t.topicName}
                  </option>
                ))}
            </select>

            {/* Check */}

            <button
              type="button"
              onClick={handleCheckTest}
              className={buttonPrimary}
            >
              Check Test
            </button>

          </div>

        </section>

        {/* ===================================================
            ATTEMPTS TABLE
        =================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-[1250px] w-full border-collapse">

              <thead>
                <tr className="bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-300">

                  <th className="w-12 px-4 py-4 text-center">
                    #
                  </th>

                  <th className="px-4 py-4">
                    Candidate
                  </th>

                  <th className="px-4 py-4">
                    Email
                  </th>

                  <th className="px-4 py-4">
                    Test
                  </th>

                  <th className="px-4 py-4">
                    Type
                  </th>

                  <th className="px-4 py-4 text-center">
                    Result
                  </th>

                  <th className="px-4 py-4 text-center">
                    Marks
                  </th>

                  <th className="px-4 py-4 text-center">
                    Alert Status
                  </th>

                  <th className="px-4 py-4">
                    Date & Time
                  </th>

                  <th className="px-4 py-4 text-center">
                    Review
                  </th>

                  <th className="px-4 py-4 text-center">
                    Result
                  </th>

                  <th className="px-4 py-4 text-center">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {attempts.length === 0 ? (

                  <tr>
                    <td
                      colSpan="12"
                      className="px-6 py-16 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                        📊
                      </div>

                      <h3 className="mt-4 text-lg font-bold text-slate-800">
                        No exam attempts found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Candidate attempts will appear here.
                      </p>

                    </td>
                  </tr>

                ) : (

                  attempts.map((a, i) => (

                    <React.Fragment key={a.id}>

                      <tr className="transition hover:bg-slate-50">

                        <td className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                          {i + 1}
                        </td>

                        <td className="px-4 py-4">

                          <p className="font-semibold text-slate-800">
                            {a.userName}
                          </p>

                        </td>

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {a.userEmail}
                        </td>

                        <td className="px-4 py-4">

                          <p className="max-w-[180px] truncate text-sm font-semibold text-slate-700">
                            {a.test?.topicName}
                          </p>

                        </td>

                        <td className="px-4 py-4">

                          <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {a.test?.examType}
                          </span>

                        </td>

                        <td className="px-4 py-4 text-center">

                          {a.result === "PASS" ? (

                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                              PASS
                            </span>

                          ) : a.result === "FAIL" ? (

                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                              FAIL
                            </span>

                          ) : (

                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              PENDING
                            </span>

                          )}

                        </td>

                        <td className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                          {a.totalMarks}
                        </td>

                        <td className="px-4 py-4 text-center">

                          <span
                            className={`text-xs font-medium ${
                              a.tabSwitchCount <= 3
                                ? "text-slate-500"
                                : "font-semibold text-red-600"
                            }`}
                          >
                            {a.tabSwitchCount <= 3
                              ? `${a.tabSwitchCount} tab switches`
                              : `${a.tabSwitchCount} tab switches (Auto Submitted)`}
                          </span>

                        </td>

                        <td className="px-4 py-4 text-sm text-slate-500">
                          {new Date(
                            a.attemptedAt
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              viewAttempt(a.id)
                            }
                            className="rounded-lg bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                          >
                            View Test
                          </button>

                        </td>

                        <td className="px-4 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              prepareDownload(a)
                            }
                            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Download
                          </button>

                        </td>

                        <td className="px-4 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              deleteAttempt(a.id)
                            }
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                      {/* MOBILE DETAILS */}

                      {expandedAttempt === a.id && (
                        <tr className="bg-slate-50">

                          <td
                            colSpan="12"
                            className="px-5 py-5"
                          >

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                              <p className="text-sm">
                                <b>Candidate:</b>{" "}
                                {a.userName}
                              </p>

                              <p className="text-sm">
                                <b>Email:</b>{" "}
                                {a.userEmail}
                              </p>

                              <p className="text-sm">
                                <b>Test:</b>{" "}
                                {a.test?.topicName}
                              </p>

                              <p className="text-sm">
                                <b>Exam Type:</b>{" "}
                                {a.test?.examType}
                              </p>

                              <p className="text-sm">
                                <b>Total Marks:</b>{" "}
                                {a.totalMarks}
                              </p>

                              <p className="text-sm">
                                <b>Date:</b>{" "}
                                {new Date(
                                  a.attemptedAt
                                ).toLocaleString()}
                              </p>

                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  viewAttempt(a.id)
                                }
                                className={buttonSecondary}
                              >
                                View Test
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  prepareDownload(a)
                                }
                                className={buttonPrimary}
                              >
                                Download Result
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteAttempt(a.id)
                                }
                                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      )}

                    </React.Fragment>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* =====================================================
          EXAM REVIEW MODAL
      ===================================================== */}

      {showAttemptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between bg-indigo-600 px-6 py-4 text-white">

              <div>
                <p className="text-xs text-indigo-200">
                  Candidate Examination
                </p>

                <h2 className="text-lg font-bold">
                  Exam Review
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAttemptModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl hover:bg-white/20"
              >
                ×
              </button>

            </div>

            <div className="flex-1 overflow-auto">

              <table className="min-w-[900px] w-full border-collapse">

                <thead className="sticky top-0 z-10 bg-slate-900 text-xs uppercase tracking-wide text-slate-300">

                  <tr>

                    <th className="px-4 py-4 text-center">
                      #
                    </th>

                    <th className="px-4 py-4 text-left">
                      Question
                    </th>

                    {attemptDetails?.test?.examType === "MCQ" && (
                      <th className="px-4 py-4 text-left">
                        Options
                      </th>
                    )}

                    <th className="px-4 py-4 text-left">
                      Student Answer
                    </th>

                    {attemptDetails?.test?.examType === "MCQ" && (
                      <th className="px-4 py-4 text-left">
                        Correct Answer
                      </th>
                    )}

                    <th className="px-4 py-4 text-center">
                      Marks
                    </th>

                    {attemptDetails?.test?.examType === "MCQ" && (
                      <th className="px-4 py-4 text-center">
                        Result
                      </th>
                    )}

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {attemptDetails?.answers?.map(
                    (a, i) => (

                      <React.Fragment key={i}>

                        <tr className="hover:bg-slate-50">

                          <td className="px-4 py-4 text-center text-sm font-bold text-slate-500">
                            {i + 1}
                          </td>

                          <td className="min-w-[260px] px-4 py-4 text-sm leading-6 text-slate-700">
                            {a.questionText}
                          </td>

                          {attemptDetails?.test?.examType === "MCQ" && (

                            <td className="min-w-[250px] px-4 py-4">

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
                                    className={`text-sm ${
                                      isCorrect
                                        ? "font-semibold text-emerald-600"
                                        : isWrong
                                          ? "font-semibold text-red-600"
                                          : "text-slate-600"
                                    }`}
                                  >
                                    <b>
                                      {String.fromCharCode(
                                        65 + idx
                                      )}.
                                    </b>{" "}
                                    {op}
                                  </div>
                                );
                              })}

                            </td>

                          )}

                          <td className="min-w-[180px] px-4 py-4 text-sm">

                            {a.selectedAnswer ? (

                              <pre className="m-0 whitespace-pre-wrap font-sans text-slate-700">
                                {a.selectedAnswer}
                              </pre>

                            ) : (

                              <span className="font-medium text-amber-600">
                                Not Answered
                              </span>

                            )}

                          </td>

                          {attemptDetails?.test?.examType === "MCQ" && (

                            <td className="px-4 py-4 text-sm font-semibold text-emerald-600">
                              {a.correctAnswer}
                            </td>

                          )}

                          <td className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                            {a.marksObtained ?? 0} /{" "}
                            {a.maxMarks ?? 0}
                          </td>

                          {attemptDetails?.test?.examType === "MCQ" && (

                            <td className="px-4 py-4 text-center">

                              {a.correct ? (

                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                  Correct
                                </span>

                              ) : (

                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                                  Wrong
                                </span>

                              )}

                            </td>

                          )}

                        </tr>

                        {/* Mobile question details */}

                        {expandedRow === i && (

                          <tr className="bg-slate-50">

                            <td
                              colSpan="7"
                              className="px-5 py-5"
                            >

                              {attemptDetails?.test?.examType === "MCQ" && (

                                <div>

                                  <h4 className="mb-3 text-sm font-bold text-slate-800">
                                    Options
                                  </h4>

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
                                      <p
                                        key={idx}
                                        className={`mb-1 text-sm ${
                                          isCorrect
                                            ? "font-semibold text-emerald-600"
                                            : isWrong
                                              ? "font-semibold text-red-600"
                                              : "text-slate-600"
                                        }`}
                                      >
                                        <b>
                                          {String.fromCharCode(
                                            65 + idx
                                          )}.
                                        </b>{" "}
                                        {op}
                                      </p>
                                    );
                                  })}

                                </div>

                              )}

                              <div className="mt-4 border-t border-slate-200 pt-4">

                                <p className="text-sm">
                                  <b>Student Answer:</b>{" "}

                                  {a.selectedAnswer ||
                                    "Not Answered"}
                                </p>

                                {attemptDetails?.test?.examType === "MCQ" && (

                                  <p className="mt-2 text-sm">
                                    <b>Correct Answer:</b>{" "}
                                    <span className="font-semibold text-emerald-600">
                                      {a.correctAnswer}
                                    </span>
                                  </p>

                                )}

                              </div>

                            </td>

                          </tr>

                        )}

                      </React.Fragment>

                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowAttemptModal(false)
                }
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          HIDDEN RESULT FOR IMAGE DOWNLOAD
      ===================================================== */}

      <div
        id="userResult"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "0",
          background: "#fff",
          width: "800px",
          padding: "20px",
        }}
      >

        {downloadData && (

          <div>

            <div className="border-2 border-slate-900 bg-white">

              {/* HEADER */}

              <div className="flex items-center gap-4 p-4">

                <div className="w-24 text-center">

                  <img
                    id="instituteLogoImg"
                    src={
                      resultInstitute?.intituteLogo
                        ? `${API_BASE_URL}${resultInstitute.intituteLogo}`
                        : logo
                    }
                    alt="Institute Logo"
                    crossOrigin="anonymous"
                    className="mx-auto h-20 object-contain"
                    onError={(e) => {
                      e.target.src = logo;
                    }}
                  />

                </div>

                <div className="flex-1">

                  <h2 className="text-center text-xl font-bold uppercase text-amber-600">
                    {resultInstitute?.instituteName}
                  </h2>

                  <div className="mt-2 flex justify-between text-sm">

                    <p className="m-0">
                      <b>Email:</b>{" "}
                      {resultInstitute?.email}
                    </p>

                    <p className="m-0">
                      <b>Phone:</b>{" "}
                      {resultInstitute?.phoneNo}
                    </p>

                  </div>

                  <p className="m-0 mt-1 text-sm">
                    <b>Address:</b>{" "}
                    {resultInstitute?.address}
                  </p>

                </div>

              </div>

              <div className="border-t-2 border-slate-900" />

              {/* TEST */}

              <h3 className="py-3 text-center text-lg font-bold uppercase">
                {downloadData.test.topicName}
              </h3>

              {/* USER */}

              <div className="px-5">

                <div className="flex justify-between text-sm">

                  <p>
                    <b>User Name:</b>{" "}
                    {downloadData.userName}
                  </p>

                  <p>
                    <b>Date:</b>{" "}
                    {new Date(
                      downloadData.attemptedAt
                    ).toLocaleDateString()}
                  </p>

                </div>

                <p className="text-sm">
                  <b>Email:</b>{" "}
                  {downloadData.userEmail}
                </p>

              </div>

              {/* RESULT */}

              <div className="px-5">

                <table className="w-full border-collapse border border-slate-300 text-sm">

                  <thead>

                    <tr className="bg-slate-900 text-white">

                      <th className="border border-slate-300 p-2">
                        Test
                      </th>

                      <th className="border border-slate-300 p-2">
                        Language
                      </th>

                      <th className="border border-slate-300 p-2">
                        Total Marks
                      </th>

                      <th className="border border-slate-300 p-2">
                        Obtained
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    <tr className="text-center">

                      <td className="border border-slate-300 p-2">
                        {downloadData.test.topicName}
                      </td>

                      <td className="border border-slate-300 p-2">
                        {downloadData.test.language}
                      </td>

                      <td className="border border-slate-300 p-2">
                        {downloadData.test.testTotalMarks}
                      </td>

                      <td className="border border-slate-300 p-2">
                        {downloadData.totalMarks}
                      </td>

                    </tr>

                  </tbody>

                </table>

                <p className="mt-3 text-sm">
                  <b>Result:</b>{" "}
                  {downloadData.result}
                </p>

                <p className="text-sm">
                  <b>Percentage:</b>{" "}
                  {downloadData.percentage}%
                </p>

              </div>

              <div className="pb-6 pr-8 pt-8 text-right">

                <h6 className="font-bold uppercase">
                  {institute?.instituteName}
                </h6>

              </div>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          SUCCESS MODAL
      ===================================================== */}

      {showSuccessModal && (

        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="bg-emerald-600 px-6 py-5 text-center text-white">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-3xl">
                ✓
              </div>

              <h2 className="mt-3 text-xl font-bold">
                Success
              </h2>

            </div>

            <div className="px-6 py-6 text-center">

              <p className="text-sm text-slate-600">
                {successMessage}
              </p>

            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowSuccessModal(false)
                }
                className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
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

export default InstituteExamAttempts;