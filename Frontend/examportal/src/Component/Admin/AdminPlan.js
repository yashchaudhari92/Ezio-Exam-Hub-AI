import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";

function AdminPlan() {
  const [plans, setPlans] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [filteredPlans, setFilteredPlans] = useState([]);

  const [formData, setFormData] = useState({
    duration: "",
    price: "",
    status: "",
  });

  const [editId, setEditId] = useState(null);

  // ================= LOAD ALL PLANS =================
  useEffect(() => {
    loadPlans();
  }, []);

  function loadPlans() {
    fetch(API_BASE_URL + "/api/plan/all")
      .then((res) => res.json())
      .then((data) => {
        setPlans(data);
        setFilteredPlans(data);
      });
  }

  // ================= SEARCH =================
  function handleSearch(e) {
    const keywordRaw = e.target.value.toLowerCase().trim();

    if (keywordRaw === "") {
      setFilteredPlans(plans);
      return;
    }

    const keyword = keywordRaw.replace(/\s|_/g, "");

    const result = plans.filter((p) => {
      const duration = p.duration?.toLowerCase();
      const price = p.price?.toString();

      const statusRaw = p.status?.toLowerCase().trim();
      const statusNormalized = statusRaw?.replace(/\s|_/g, "");

      const statusMatch =
        keyword === "active"
          ? statusNormalized === "active"
          : keyword === "inactive"
            ? statusNormalized === "inactive"
            : false;

      return (
        duration?.includes(keywordRaw) ||
        price?.includes(keywordRaw) ||
        statusMatch
      );
    });

    setFilteredPlans(result);
  }

  // ================= HANDLE INPUT =================
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // ================= ADD PLAN =================
  function savePlan(e) {
    e.preventDefault();

    fetch(API_BASE_URL + "/api/plan/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        setSuccessMessage("New Plan Added Successfully!");
        showSuccessModal();

        setShowAddModal(false);

        setFormData({
          duration: "",
          price: "",
          status: "",
        });

        loadPlans();
      });
  }

  // ================= OPEN EDIT MODAL =================
  function editPlan(id) {
    setEditId(id);

    fetch(API_BASE_URL + "/api/plan/" + id)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          duration: data.duration,
          price: data.price,
          status: data.status,
        });

        setShowEditModal(true);
      });
  }

  // ================= UPDATE PLAN =================
  function updatePlan(e) {
    e.preventDefault();

    fetch(API_BASE_URL + "/api/plan/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        id: editId,
      }),
    }).then(() => {
      setSuccessMessage("Plan Updated Successfully!");
      showSuccessModal();

      setShowEditModal(false);

      setFormData({
        duration: "",
        price: "",
        status: "",
      });

      loadPlans();
    });
  }

  // ================= DELETE PLAN =================
  function deletePlan(id) {
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return;
    }

    fetch(API_BASE_URL + "/api/plan/" + id, {
      method: "DELETE",
    }).then(() => {
      setSuccessMessage("Plan Deleted Successfully!");
      showSuccessModal();

      loadPlans();
    });
  }

  // ================= SUCCESS MODAL =================
  function showSuccessModal() {
    const modalElement = document.getElementById("successModal");

    if (!modalElement) return;

    const modal = window.bootstrap.Modal.getOrCreateInstance(
      modalElement
    );

    modal.show();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Admin All Plans
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage subscription plans, pricing and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <span className="text-lg leading-none">+</span>
            Add Plan
          </button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        {/* ================= TOOLBAR ================= */}
        <div className="mb-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Subscription Plans
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPlans.length} plan
              {filteredPlans.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="w-full sm:w-80">
            <label className="sr-only">Search plans</label>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by plan, price or status..."
                onChange={handleSearch}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-center font-semibold sm:px-5">
                    #
                  </th>

                  <th className="px-4 py-3 text-center font-semibold sm:px-5">
                    Duration
                  </th>

                  <th className="px-4 py-3 text-center font-semibold sm:px-5">
                    Price
                  </th>

                  <th className="px-4 py-3 text-center font-semibold sm:px-5">
                    Status
                  </th>

                  <th className="px-4 py-3 text-center font-semibold sm:px-5">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((p, i) => {
                    const normalizedStatus = p.status
                      ?.toLowerCase()
                      .replace(/\s|_/g, "");

                    const isActive = normalizedStatus === "active";

                    return (
                      <tr
                        key={p.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-slate-600 sm:px-5">
                          {i + 1}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-center sm:px-5">
                          <span className="text-sm font-semibold text-slate-800">
                            {p.duration}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-center sm:px-5">
                          <span className="text-sm font-semibold text-slate-800">
                            ₹ {p.price}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-center sm:px-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="px-4 py-4 sm:px-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => editPlan(p.id)}
                              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deletePlan(p.id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center"
                    >
                      <div className="mx-auto max-w-sm">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                          📋
                        </div>

                        <h3 className="text-sm font-semibold text-slate-800">
                          No plans found
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Try a different search term or create a new plan.
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
      {/* ADD PLAN MODAL */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <form onSubmit={savePlan}>
              <div className="flex items-center justify-between bg-indigo-600 px-5 py-4 text-white">
                <div>
                  <h2 className="text-base font-semibold">
                    Add Plan
                  </h2>

                  <p className="mt-0.5 text-xs text-indigo-100">
                    Create a new subscription plan
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-2xl leading-none text-white/80 transition hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Price
                  </label>

                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">--Select--</option>
                    <option>Active</option>
                    <option>In-Active</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT PLAN MODAL */}
      {/* ========================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <form onSubmit={updatePlan}>
              <div className="flex items-center justify-between bg-emerald-600 px-5 py-4 text-white">
                <div>
                  <h2 className="text-base font-semibold">
                    Edit Plan
                  </h2>

                  <p className="mt-0.5 text-xs text-emerald-100">
                    Update subscription plan details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-2xl leading-none text-white/80 transition hover:text-white"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Duration
                  </label>

                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Price
                  </label>

                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">--Select--</option>
                    <option>Active</option>
                    <option>In Active</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

              <h5 className="font-semibold text-slate-800">
                {successMessage}
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

export default AdminPlan;
