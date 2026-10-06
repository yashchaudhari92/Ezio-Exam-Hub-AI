import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import API_BASE_URL from "../../helper";

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // ================= LOAD ALL USERS =================
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/user/all`)
      .then((res) => res.json())
      .then((data) => {
        const reversed = data.reverse();
        setUsers(reversed);
        setFilteredUsers(reversed);
      })
      .catch((err) => console.error(err));
  }, []);

  // ================= SEARCH =================
  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();

    if (keyword.length === 0) {
      setFilteredUsers(users);
      return;
    }

    const result = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phoneNo?.toLowerCase().includes(keyword) ||
        user.institute?.toLowerCase().includes(keyword)
    );

    setFilteredUsers(result);
  };

  // ================= DOWNLOAD EXCEL =================
  const downloadExcel = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      alert("No user data available to download");
      return;
    }

    const formattedData = filteredUsers.map((user, index) => ({
      "Sr No.": index + 1,
      "Candidate Name": user.name,
      Email: user.email,
      Password: user.password,
      "Organization Name": user.institute,
      "Phone No": user.phoneNo,
      Status: user.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    const range = XLSX.utils.decode_range(worksheet["!ref"]);

    // Header styling
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
      wch: 20,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Users"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "All_Users.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= PAGE HEADER ================= */}
      <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Candidate Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              All Candidates
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View registered candidates and manage candidate records.
            </p>
          </div>

          {/* Total candidates */}
          <div className="flex w-fit items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600">
              {filteredUsers.length}
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">
                Showing
              </p>
              <p className="text-sm font-semibold text-slate-800">
                Candidates
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= TOOLBAR ================= */}
      <div className="px-4 py-5 sm:px-6 lg:px-7">

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}
            <div className="relative w-full lg:max-w-xl">

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <i className="fa-solid fa-magnifying-glass text-sm"></i>
              </span>

              <input
                type="text"
                placeholder="Search by candidate, email, phone or organization..."
                onChange={handleSearch}
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* Download */}
            <button
              type="button"
              onClick={downloadExcel}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              <i className="fa-solid fa-download text-sm"></i>
              Download Excel
            </button>

          </div>

        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* Card Header */}
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Candidate Records
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Registered users available in the system.
              </p>
            </div>

            <div className="w-fit rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {filteredUsers.length} Records
            </div>

          </div>

          {/* ================= TABLE ================= */}
          <div className="overflow-x-auto">

            <table className="min-w-[1050px] w-full border-collapse">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Sr No.
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Candidate
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Organization
                  </th>

                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </th>

                  <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (

                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Sr No */}
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-slate-500">
                        {index + 1}
                      </td>

                      {/* Candidate */}
                      <td className="px-4 py-3">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {user.name || "-"}
                            </p>

                            <p className="text-xs text-slate-400">
                              Candidate
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {user.email || "-"}
                      </td>

                      {/* Password */}
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                          {user.password || "-"}
                        </span>
                      </td>

                      {/* Organization */}
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {user.institute || "-"}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {user.phoneNo || "-"}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.status || "-"}
                        </span>

                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-14 text-center"
                    >

                      <div className="mx-auto flex max-w-sm flex-col items-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <i className="fa-solid fa-users text-lg"></i>
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-slate-700">
                          No candidates found
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          No users match your current search.
                        </p>

                      </div>

                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Users;
