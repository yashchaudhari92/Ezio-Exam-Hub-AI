import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import API_BASE_URL from "../../helper";
import $ from "jquery";
import { useNavigate } from "react-router-dom";

window.$ = window.jQuery = $;

function AllInstitute() {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [allInstitutes, setAllInstitutes] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [editId, setEditId] = useState("");
  const [editInstituteName, setEditInstituteName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editInstituteType, setEditInstituteType] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  useEffect(() => {
    loadAllInstitute();
  }, []);

  // FETCH ALL INSTITUTE
  // function loadAllInstitute() {
  //   $.ajax({
  //     url: API_BASE_URL + "/api/institute/all",
  //     method: "GET",
  //     success: function (data) {
  //       const reversed = data.reverse();

  //       setAllInstitutes(reversed);
  //       setFilteredInstitutes(reversed);
  //     },
  //   });
  // }

  function loadAllInstitute() {
    $.ajax({
      url: API_BASE_URL + "/api/institute/all",
      method: "GET",
      success: function (data) {
        const reversed = [...data].reverse();

        Promise.all(
          reversed.map((inst) =>
            $.get(
              `${API_BASE_URL}/api/payment/gateway/${inst.id}`
            )
              .then((gateway) => ({
                ...inst,
                paymentGateway: gateway || "MANUAL",
              }))
              .catch(() => ({
                ...inst,
                paymentGateway: "MANUAL",
              }))
          )
        ).then((enrichedInstitutes) => {
          setAllInstitutes(enrichedInstitutes);
          setFilteredInstitutes(enrichedInstitutes);
        });
      },
    });
  }

  // SEARCH
  useEffect(() => {
    const keyword = searchKeyword
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");

    const filtered = allInstitutes.filter((inst) => {
      const instituteName = (inst.instituteName || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

      const email = (inst.email || "").toLowerCase();
      const phone = (inst.phoneNo || "").toLowerCase();

      return (
        instituteName.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword)
      );
    });

    setFilteredInstitutes(filtered);
  }, [searchKeyword, allInstitutes]);

  // OPEN EDIT MODAL
  function openEditModal(id) {
    $.ajax({
      url: API_BASE_URL + "/api/institute/" + id,
      method: "GET",
      success: function (inst) {
        setEditId(inst.id);
        setEditInstituteName(inst.instituteName || "");
        setEditPhone(inst.phoneNo || "");
        setEditEmail(inst.email || "");
        setEditPassword(inst.password || "");
        setEditAddress(inst.address || "");
        setEditInstituteType(inst.instituteType || "");
        setEditPlan(inst.plan || "");
        setEditStatus(inst.status || "Active");

        setShowEditModal(true);
      },
    });
  }

  // UPDATE INSTITUTE
  function updateInstitute() {
    const inst = {
      instituteName: editInstituteName,
      email: editEmail,
      phoneNo: editPhone,
      address: editAddress,
      status: editStatus,
      password: editPassword,
      instituteType: editInstituteType,
      plan: editPlan,
    };

    $.ajax({
      url: API_BASE_URL + "/api/institute/update/" + editId,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(inst),
      success: function () {
        setShowEditModal(false);

        setSuccessMessage("Organization Updated Successfully!");
        setShowSuccessModal(true);

        loadAllInstitute();
      },
    });
  }

  // DELETE
  function deleteInstitute(id) {
    if (!window.confirm("Are you sure?")) return;

    $.ajax({
      url: API_BASE_URL + "/api/institute/delete/" + id,
      method: "DELETE",
      success: function () {
        setSuccessMessage("Institute Deleted Successfully!");
        setShowSuccessModal(true);

        loadAllInstitute();
      },
    });
  }

  // DOWNLOAD EXCEL
  function downloadExcel() {
    if (!allInstitutes || allInstitutes.length === 0) {
      alert("No data available to download");
      return;
    }

    const formattedData = allInstitutes.map((inst, i) => ({
      "Sr. No": i + 1,
      "Organization Name": inst.instituteName,
      Email: inst.email,
      Password: inst.password,
      "Phone No": inst.phoneNo,
      Plan: inst.plan,
      "Payment Gateway": inst.paymentGateway || "MANUAL",
      "Plan Date": inst.planDate,
      "Plan Expiry Date": inst.planExpiryDate,
      "Organization Type": inst.instituteType,
      Status: inst.status,
      Address: inst.address,
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
      wch: 14,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Organizations"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "All_Organizations.xlsx");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Administration
            </p>

            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              All Organizations
            </h1>

            <p className="text-sm text-slate-500">
              Manage registered organizations and their subscription details.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="w-full lg:max-w-md">
              <label
                htmlFor="searchInstitute"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Search Organization
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  id="searchInstitute"
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Organization, email or phone..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-end gap-2">
              <div className="rounded-lg bg-slate-50 px-4 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Organizations
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {filteredInstitutes.length}
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
            <table className="min-w-[1500px] w-full text-left text-sm">
              <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
                <tr>
                  <th className="px-4 py-3">Sr. No.</th>
                  {/* <th className="px-4 py-3">Payment Image</th> */}
                  <th className="px-4 py-3">Organization Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Phone No</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Gateway</th>
                  <th className="px-4 py-3">Plan Date</th>
                  <th className="px-4 py-3">Plan Expiry</th>
                  <th className="px-4 py-3">Organization Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Logo</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInstitutes.length > 0 ? (
                  filteredInstitutes.map((inst, index) => (
                    <tr
                      key={inst.id || index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-600">
                        {index + 1}
                      </td>

                      {/* Payment Image */}
                      {/* <td className="px-4 py-3">
                        {inst.paymentImg ? (
                          <img
                            src={API_BASE_URL + inst.paymentImg}
                            alt="Payment"
                            className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            No Image
                          </span>
                        )}
                      </td> */}

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {inst.instituteName}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {inst.email}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {inst.password}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {inst.phoneNo}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {inst.plan || "—"}
                        </span>
                      </td>

                      {/* PAYMENT GATEWAY */}

                      <td className="px-3 py-3 text-center">

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${(inst.paymentGateway || "MANUAL").toUpperCase() ===
                            "PHONEPE"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {(inst.paymentGateway || "MANUAL").toUpperCase()}
                        </span>

                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {inst.planDate || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {inst.planExpiryDate || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {inst.instituteType || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${inst.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                            }`}
                        >
                          {inst.status || "—"}
                        </span>
                      </td>

                      {/* Logo */}
                      <td className="px-4 py-3">
                        {inst.intituteLogo ? (
                          <img
                            src={API_BASE_URL + inst.intituteLogo}
                            alt="Organization Logo"
                            className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            No Logo
                          </span>
                        )}
                      </td>

                      <td className="max-w-xs px-4 py-3 text-slate-600">
                        <span className="line-clamp-2">
                          {inst.address || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(inst.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
                            title="Edit Organization"
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteInstitute(inst.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                            title="Delete Organization"
                          >
                            🗑
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                          ◌
                        </div>

                        <h3 className="text-sm font-semibold text-slate-800">
                          No organizations found
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
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
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Organization Management
                </p>

                <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                  Edit Organization
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-5 py-5">
              <input type="hidden" value={editId} readOnly />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Organization Name
                  </label>

                  <input
                    type="text"
                    value={editInstituteName}
                    onChange={(e) =>
                      setEditInstituteName(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone No.
                  </label>

                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Institute Type
                  </label>

                  <select
                    value={editInstituteType}
                    onChange={(e) =>
                      setEditInstituteType(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">--Select--</option>
                    <option>Coaching Center</option>
                    <option>Training Institute</option>
                    <option>School</option>
                    <option>College</option>
                    <option>Academy</option>
                    <option>Computer Institute</option>
                    <option>Tuition Class</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Status
                  </label>

                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="Active">Active</option>
                    <option value="In Active">In Active</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Plan
                  </label>

                  <input
                    type="text"
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={updateInstitute}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-emerald-800">
                  Success
                </h2>

                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="text-xl text-emerald-500 hover:text-emerald-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-5 py-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                ✓
              </div>

              <h3 className="text-base font-semibold text-slate-800">
                {successMessage}
              </h3>
            </div>

            <div className="flex justify-center border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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

export default AllInstitute;
