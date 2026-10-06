import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import $ from "jquery";
import API_BASE_URL from "../../helper";

function ExamAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    loadAllAttempts();
  }, []);

  function loadAllAttempts() {
    $.ajax({
      url: `${API_BASE_URL}/api/exam/all`,
      type: "GET",
      success: (data) => {
        const reversed = [...data].reverse();

        setAttempts(data.reverse());
        setFilteredAttempts(reversed);
      },
      error: (err) => {
        console.error("Failed to fetch attempts", err);
      },
    });
  }

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();

    setSearchKeyword(e.target.value);

    if (keyword.length === 0) {
      setFilteredAttempts(attempts);
      return;
    }

    const result = attempts.filter(
      (a) =>
        a.userName?.toLowerCase().includes(keyword) ||
        a.userEmail?.toLowerCase().includes(keyword) ||
        a.instituteName?.toLowerCase().includes(keyword) ||
        a.test?.topicName?.toLowerCase().includes(keyword)
    );

    setFilteredAttempts(result);
  };

  const downloadExcel = () => {
    if (!filteredAttempts || filteredAttempts.length === 0) {
      alert("No exam attempt data available to download");
      return;
    }

    const formattedData = filteredAttempts.map((a, index) => ({
      "Sr No.": index + 1,
      "Candidate Name": a.userName,
      "Candidate Email": a.userEmail,
      "Organization Name": a.instituteName,
      "Test Name": a.test?.topicName,
      Language: a.test?.language,
      "Total Marks": a.totalMarks,
      Result: a.result,
      "Date & Time": new Date(a.attemptedAt).toLocaleString(),
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
          color: { rgb: "FFFFFF" },
        },
        fill: {
          fgColor: { rgb: "4F81BD" },
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    worksheet["!cols"] = Object.keys(formattedData[0]).map(() => ({
      wch: 14,
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

    saveAs(blob, "User_Exam_Attempts.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Examination Management
          </p>

          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Exam Attempt History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View examination attempts submitted by all candidates.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-lg">
              <label
                htmlFor="examAttemptSearch"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Search Attempts
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  id="examAttemptSearch"
                  type="text"
                  value={searchKeyword}
                  onChange={handleSearch}
                  placeholder="Name, email, organization or test..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Stats + Export */}
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-slate-50 px-4 py-2 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Attempts
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {filteredAttempts.length}
                </p>
              </div>

              <button
                type="button"
                onClick={downloadExcel}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                ↓ Download Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1150px] w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
                <tr>
                  <th className="px-4 py-3">
                    Candidate Name
                  </th>

                  <th className="px-4 py-3">
                    Candidate Email
                  </th>

                  <th className="px-4 py-3">
                    Organization Name
                  </th>

                  <th className="px-4 py-3">
                    Test Name
                  </th>

                  <th className="px-4 py-3">
                    Language
                  </th>

                  <th className="px-4 py-3">
                    Total Marks
                  </th>

                  <th className="px-4 py-3">
                    Result
                  </th>

                  <th className="px-4 py-3">
                    Date & Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredAttempts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-14 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                          ◌
                        </div>

                        <h3 className="text-sm font-semibold text-slate-800">
                          No exam attempts found
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Try changing your search criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttempts.map((a) => (
                    <tr
                      key={a.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {a.userName || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {a.userEmail || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {a.instituteName || "—"}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-700">
                        {a.test?.topicName || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {a.test?.language || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {a.totalMarks ?? "—"}
                      </td>

                      <td className="px-4 py-3">
                        {a.result === "PASS" ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            PASS
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                            FAIL
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {a.attemptedAt
                          ? new Date(
                              a.attemptedAt
                            ).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamAttempts;
