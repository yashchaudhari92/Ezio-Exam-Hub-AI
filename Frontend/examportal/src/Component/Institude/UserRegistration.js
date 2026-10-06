import { useEffect, useState, useRef } from "react";
import $ from "jquery";
import * as bootstrap from "bootstrap";
import API_BASE_URL from "../../helper";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

function UserRegistration() {
  const [loggedInstitute, setLoggedInstitute] = useState(null);
  const instituteRef = useRef(null);

  const allUsersRef = useRef([]);

  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    let data = localStorage.getItem("loggedInstitute");

    if (data) {
      const inst = JSON.parse(data);
      setLoggedInstitute(inst);
      loadUsers(inst.instituteName);
    }
  }, []);

  // =========================
  // LOAD USERS
  // =========================
  function loadUsers(institute) {
    instituteRef.current = institute;

    $.get(
      `${API_BASE_URL}/api/user/by-institute/${institute}`,
      function (data) {
        const reversedUsers = data.reverse();

        allUsersRef.current = reversedUsers;
        setUsers(reversedUsers);
      }
    );
  }

  // =========================
  // SEARCH USERS
  // =========================
  function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    setSearchKeyword(keyword);

    const users = allUsersRef.current;

    if (keyword === "") {
      setUsers(users);
      return;
    }

    const filteredUsers = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(keyword) ||
        u.email?.toLowerCase().includes(keyword) ||
        u.phoneNo?.toLowerCase().includes(keyword) ||
        u.status?.toLowerCase().includes(keyword)
    );

    setUsers(filteredUsers);
  }

  // =========================
  // EDIT BUTTON
  // =========================
  useEffect(() => {
    $(document).on("click", ".editBtn", function () {
      const id = $(this).data("id");

      $.get(`${API_BASE_URL}/api/user/all`, function (users) {
        const user = users.find((u) => u.id === id);

        if (!user) {
          alert("User not found");
          return;
        }

        $("#editId").val(user.id);
        $("#editName").val(user.name);
        $("#editEmail").val(user.email);
        $("#editPhoneNo").val(user.phoneNo);
        $("#editPassword").val(user.password);
        $("#editStatus").val(user.status);

        const modalElement = document.getElementById("editUserModal");

        const modal =
          bootstrap.Modal.getInstance(modalElement) ||
          new bootstrap.Modal(modalElement);

        modal.show();
      });
    });

    // =========================
    // UPDATE USER
    // =========================
    $("#editUserForm").on("submit", function (e) {
      e.preventDefault();

      const id = $("#editId").val();

      const updatedUser = {
        name: $("#editName").val(),
        email: $("#editEmail").val(),
        phoneNo: $("#editPhoneNo").val(),
        password: $("#editPassword").val(),
        status: $("#editStatus").val(),
      };

      $.ajax({
        url: `${API_BASE_URL}/api/user/update/${id}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(updatedUser),

        success: function () {
          const modalElement = document.getElementById("editUserModal");

          const modal = bootstrap.Modal.getInstance(modalElement);

          if (modal) {
            modal.hide();
          }

          loadUsers(instituteRef.current);

          showSuccess("User Updated Successfully!");

          loadUsers();
        },
      });
    });

    // =========================
    // DELETE USER
    // =========================
    $(document).on("click", ".deleteBtn", function () {
      const id = $(this).data("id");

      if (!window.confirm("Are you sure?")) return;

      $.ajax({
        url: `${API_BASE_URL}/api/user/delete/${id}`,
        type: "DELETE",

        success: function () {
          loadUsers(instituteRef.current);

          showSuccess("User Deleted Successfully!");

          loadUsers();
        },
      });
    });

    // =========================
    // CLEANUP
    // =========================
    return () => {
      $(document).off("click", ".editBtn");
      $(document).off("click", ".deleteBtn");
      $("#editUserForm").off("submit");
    };
  }, []);

  // =========================
  // ACTIVE ALL USERS
  // =========================
  function activateAllUsers() {
    if (!loggedInstitute) return;

    const confirmActivate = window.confirm(
      "Are you sure you want to activate all inactive users?"
    );

    if (!confirmActivate) return;

    $.ajax({
      url: `${API_BASE_URL}/api/user/activate-all/${loggedInstitute.instituteName}`,
      type: "PUT",

      success: function (msg) {
        loadUsers(loggedInstitute.instituteName);
        showSuccess(msg);
      },

      error: function () {
        alert("Failed to activate users!");
      },
    });
  }

  // =========================
  // SUCCESS MODAL
  // =========================
  function showSuccess(msg) {
    $("#successMessage").text(msg);

    const modalElement = document.getElementById("successModal");

    const modal =
      bootstrap.Modal.getInstance(modalElement) ||
      new bootstrap.Modal(modalElement);

    modal.show();
  }

  // =========================
  // DOWNLOAD EXCEL
  // =========================
  function downloadExcel() {
    if (!loggedInstitute) return;

    $.get(
      `${API_BASE_URL}/api/user/by-institute/${loggedInstitute.instituteName}`,
      function (data) {
        if (!data || data.length === 0) {
          alert("No users found!");
          return;
        }

        const formattedData = data.map((u, i) => ({
          "Sr No": i + 1,
          Name: u.name,
          Email: u.email,
          "Phone No": u.phoneNo,
          Password: u.password,
          Status: u.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        // Header styling
        for (let col = range.s.c; col <= range.e.c; col++) {
          const headerCell = XLSX.utils.encode_cell({
            r: 0,
            c: col,
          });

          if (!worksheet[headerCell]) continue;

          worksheet[headerCell].s = {
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

        // Column width
        const columnWidths = Object.keys(formattedData[0]).map(() => ({
          wch: 25,
        }));

        worksheet["!cols"] = columnWidths;

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Users"
        );

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(
          blob,
          `${loggedInstitute.instituteName}_Candidates.xlsx`
        );
      }
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Candidate Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {loggedInstitute
                ? loggedInstitute.instituteName
                : "Institute"}{" "}
              - Candidates
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage registered candidates, update their details and
              monitor account status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-50 px-4 py-2 text-center">
              <p className="text-xs font-medium text-indigo-500">
                Total Candidates
              </p>

              <p className="text-xl font-bold text-indigo-700">
                {users.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================== */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>

            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearch}
              placeholder="Search by name, email, phone or status..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={activateAllUsers}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <i className="fa-solid fa-user-check"></i>
              Activate All
            </button>

            <button
              type="button"
              onClick={downloadExcel}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <i className="fa-solid fa-file-excel"></i>
              Download Excel
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          TABLE
      ========================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              All Candidates
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Registered candidates associated with this institute
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {users.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-white">
              <tr>
                <th className="whitespace-nowrap px-4 py-3.5">
                  Sr. No
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Name
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Email
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Phone
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Password
                </th>

                <th className="whitespace-nowrap px-4 py-3.5">
                  Status
                </th>

                <th className="whitespace-nowrap px-4 py-3.5 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.length > 0 ? (
                users.map((u, i) => (
                  <tr
                    key={u.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3.5 font-medium text-slate-500">
                      {i + 1}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                          {u.name
                            ? u.name.charAt(0).toUpperCase()
                            : "U"}
                        </div>

                        <span className="font-semibold text-slate-800">
                          {u.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {u.email}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {u.phoneNo}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                        {u.password}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {u.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                          {u.status}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          className="editBtn inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          data-id={u.id}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                          Edit
                        </button>

                        <button
                          type="button"
                          className="deleteBtn inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                          data-id={u.id}
                        >
                          <i className="fa-solid fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <i className="fa-solid fa-users text-xl"></i>
                      </div>

                      <h3 className="font-semibold text-slate-700">
                        No candidates found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          EDIT USER MODAL
      ========================== */}
      <div
        className="modal fade"
        id="editUserModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content overflow-hidden rounded-2xl border-0 shadow-2xl">
            <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Candidate Management
                  </p>

                  <h5 className="mt-1 text-lg font-bold">
                    Edit Candidate
                  </h5>
                </div>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
            </div>

            <form id="editUserForm" className="bg-white">
              <div className="modal-body px-5 py-5">
                <input type="hidden" id="editId" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="editName"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Name
                    </label>

                    <input
                      type="text"
                      id="editName"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="editEmail"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Email
                    </label>

                    <input
                      type="text"
                      id="editEmail"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="editPassword"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <input
                      type="text"
                      id="editPassword"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      htmlFor="editStatus"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Status
                    </label>

                    <select
                      id="editStatus"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="Active">Active</option>
                      <option value="In Active">In Active</option>
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="editPhoneNo"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Phone No.
                    </label>

                    <input
                      type="text"
                      id="editPhoneNo"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  data-bs-dismiss="modal"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <i className="fa-solid fa-check mr-2"></i>
                  Update Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* =========================
          SUCCESS MODAL
      ========================== */}
      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        aria-labelledby="successModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content overflow-hidden rounded-2xl border-0 shadow-2xl">
            <div className="bg-emerald-600 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <h5
                  className="text-lg font-bold"
                  id="successModalLabel"
                >
                  <i className="bi bi-check-circle-fill mr-2"></i>
                  Success
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <i className="fa-solid fa-check text-2xl text-emerald-600"></i>
              </div>

              <h5
                id="successMessage"
                className="text-base font-semibold text-slate-800"
              >
                Action completed successfully!
              </h5>
            </div>

            <div className="flex justify-center border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                data-bs-dismiss="modal"
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegistration;
