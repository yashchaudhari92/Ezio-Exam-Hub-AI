import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Admin() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [editId, setEditId] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  // ================= LOAD ALL ADMINS =================
  const loadAllAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/all`);
      const data = await res.json();
      setAdmins(data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAllAdmins();
  }, []);

  // ================= SHOW SUCCESS MODAL =================
  const showSuccessModal = (message) => {
    const modalElement = document.getElementById("successModal");

    document.getElementById("successMessage").innerText = message;

    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();

    modalElement.addEventListener("hidden.bs.modal", () => {
      document.body.classList.remove("modal-open");
      document
        .querySelectorAll(".modal-backdrop")
        .forEach((el) => el.remove());
    });
  };

  // ================= ADD ADMIN =================
  const handleAddAdmin = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    await fetch(`${API_BASE_URL}/api/admin/add`, {
      method: "POST",
      body: formData,
    });

    setEmail("");
    setPassword("");

    window.bootstrap.Modal.getInstance(
      document.getElementById("adminModal")
    ).hide();

    showSuccessModal("Admin Added Successfully!");
    loadAllAdmins();
  };

  // ================= DELETE ADMIN =================
  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure want to delete this Admin?")) return;

    await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, {
      method: "DELETE",
    });

    showSuccessModal("Admin Deleted Successfully!");
    loadAllAdmins();
  };

  // ================= OPEN EDIT =================
  const openEditModal = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/get/${id}`);
    const data = await res.json();

    setEditId(data.id);
    setEditEmail(data.email);
    setEditPassword(data.password);

    new window.bootstrap.Modal(
      document.getElementById("editAdminModal")
    ).show();
  };

  // ================= UPDATE ADMIN =================
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", editEmail);
    formData.append("password", editPassword);

    await fetch(`${API_BASE_URL}/api/admin/update/${editId}`, {
      method: "POST",
      body: formData,
    });

    window.bootstrap.Modal.getInstance(
      document.getElementById("editAdminModal")
    ).hide();

    showSuccessModal("Admin Updated Successfully!");
    loadAllAdmins();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= PAGE HEADER ================= */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              All Admins
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage administrator accounts and access credentials.
            </p>
          </div>

          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#adminModal"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Admin
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Admins
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {admins.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg text-indigo-600">
                👤
              </div>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Administrator Accounts
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {admins.length} account{admins.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">
                    Sr No.
                  </th>

                  <th className="px-4 py-3 font-semibold sm:px-5">
                    Email
                  </th>

                  <th className="px-4 py-3 font-semibold sm:px-5">
                    Password
                  </th>

                  <th className="px-4 py-3 text-center font-semibold sm:px-5">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {admins.length > 0 ? (
                  admins.map((a, i) => (
                    <tr
                      key={a.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600 sm:px-5">
                        {i + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                            {a.email?.charAt(0)?.toUpperCase() || "A"}
                          </div>

                          <span className="text-sm font-medium text-slate-800">
                            {a.email}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                        <span className="rounded-md bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                          {a.password}
                        </span>
                      </td>

                      <td className="px-4 py-4 sm:px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(a.id)}
                            className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteAdmin(a.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                          👤
                        </div>

                        <h3 className="text-sm font-semibold text-slate-800">
                          No administrators found
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Add an administrator to get started.
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

      {/* ========================================================= */}
      {/* ADD ADMIN MODAL */}
      {/* ========================================================= */}
      <div
        className="modal fade"
        id="adminModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content overflow-hidden rounded-2xl border-0 shadow-xl">
            <div className="flex items-center justify-between bg-indigo-600 px-5 py-4 text-white">
              <div>
                <h5 className="text-base font-semibold">
                  Add Admin
                </h5>

                <p className="mt-0.5 text-xs text-indigo-100">
                  Create a new administrator account
                </p>
              </div>

              <button
                type="button"
                className="text-2xl leading-none text-white/80 transition hover:text-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="bg-white p-5">
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save Admin
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EDIT ADMIN MODAL */}
      {/* ========================================================= */}
      <div
        className="modal fade"
        id="editAdminModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content overflow-hidden rounded-2xl border-0 shadow-xl">
            <div className="flex items-center justify-between bg-indigo-600 px-5 py-4 text-white">
              <div>
                <h5 className="text-base font-semibold">
                  Edit Admin
                </h5>

                <p className="mt-0.5 text-xs text-indigo-100">
                  Update administrator credentials
                </p>
              </div>

              <button
                type="button"
                className="text-2xl leading-none text-white/80 transition hover:text-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="bg-white p-5">
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Update Admin
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUCCESS MODAL */}
      {/* ========================================================= */}
      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content overflow-hidden rounded-2xl border-0 shadow-xl">
            <div className="flex items-center justify-between bg-emerald-600 px-5 py-4 text-white">
              <h5 className="text-base font-semibold">
                Success
              </h5>

              <button
                type="button"
                className="text-2xl leading-none text-white/80 transition hover:text-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col items-center justify-center bg-white px-6 py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-9 w-9 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
                </svg>
              </div>

              <h5
                id="successMessage"
                className="font-semibold text-slate-800"
              >
                Action completed successfully!
              </h5>
            </div>

            <div className="flex justify-center border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                data-bs-dismiss="modal"
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

export default Admin;
