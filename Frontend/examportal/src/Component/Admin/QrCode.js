import React, { useEffect } from "react";
import API_BASE_URL from "../../helper";
import $ from "jquery";

function QrCode() {
  useEffect(() => {
    loadAllQr();

    $("#addQrForm")
      .off("submit")
      .on("submit", function (e) {
        e.preventDefault();

        const data = {
          upiId: $("#upiId").val(),
          upiName: $("#upiName").val(),
        };

        $.ajax({
          url: `${API_BASE_URL}/api/qrcode/save`,
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(data),

          success: function () {
            $("#qrModal").modal("hide");

            $("#successMessage").text("UPI Added Successfully!");
            $("#successModal").modal("show");

            loadAllQr();

            $("#addQrForm")[0].reset();
          },
        });
      });

    window.deleteQr = deleteQr;

    return () => {
      $("#addQrForm").off("submit");
      delete window.deleteQr;
    };
  }, []);

  /* ================= LOAD ALL QR ================= */

  function loadAllQr() {
    $.get(`${API_BASE_URL}/api/qrcode/all`, function (data) {
      let rows = "";

      data.forEach((qr, index) => {
        rows += `
          <tr class="border-b border-slate-100 transition hover:bg-slate-50">

            <td class="px-4 py-3 text-center text-xs font-semibold text-slate-500">
              ${index + 1}
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center gap-3">

                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                  U
                </div>

                <div>
                  <p class="text-sm font-semibold text-slate-800">
                    ${qr.upiName}
                  </p>

                  <p class="mt-0.5 text-[10px] text-slate-400">
                    UPI Account
                  </p>
                </div>

              </div>
            </td>

            <td class="px-4 py-3">
              <span class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                ${qr.upiId}
              </span>
            </td>

            <td class="px-4 py-3 text-center">

              <button
                type="button"
                class="deleteQrBtn inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                data-id="${qr.id}"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-8 0h10"
                  />
                </svg>

                Delete

              </button>

            </td>

          </tr>
        `;
      });

      $("#allQrData").html(rows);

      $(".deleteQrBtn")
        .off("click")
        .on("click", function () {
          const id = $(this).data("id");
          deleteQr(id);
        });
    });
  }

  /* ================= DELETE QR ================= */

  function deleteQr(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this QR Code?"
      )
    ) {
      return;
    }

    $.ajax({
      url: `${API_BASE_URL}/api/qrcode/delete/${id}`,
      type: "DELETE",

      success: function () {
        $("#successMessage").text(
          "QR Code Deleted Successfully!"
        );

        $("#successModal").modal("show");

        loadAllQr();
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-white px-5 py-3.5 lg:px-6">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
              Payment Configuration
            </p>

            <h1 className="mt-0.5 text-[22px] font-bold tracking-tight text-slate-900">
              UPI Management
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Configure UPI accounts for receiving payments.
            </p>
          </div>

          <button
            type="button"
            data-bs-toggle="modal"
            data-bs-target="#qrModal"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
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
                d="M12 5v14M5 12h14"
              />
            </svg>

            Add UPI
          </button>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="px-4 py-4 lg:px-6">

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    width="16"
                    height="16"
                    x="4"
                    y="4"
                    rx="2"
                  />

                  <path d="M8 8h3v3H8zM13 8h3M13 11h3M8 13h3v3H8zM13 14h3v2h-3z" />
                </svg>

              </div>

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  UPI Accounts
                </h2>

                <p className="text-[10px] text-slate-500">
                  Payment accounts configured in the system
                </p>

              </div>

            </div>

            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
              PAYMENT
            </span>

          </div>

          {/* =================================================
              TABLE
          ================================================== */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="w-20 px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    UPI Account
                  </th>

                  <th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    UPI ID
                  </th>

                  <th className="w-28 px-4 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody
                id="allQrData"
                className="divide-y divide-slate-100"
              ></tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          ADD UPI MODAL
      ====================================================== */}

      <div
        className="modal fade"
        id="qrModal"
        tabIndex="-1"
        aria-labelledby="qrModalLabel"
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content overflow-hidden rounded-xl border-0 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="modal-header border-0 bg-indigo-600 px-5 py-4 text-white">

              <div>

                <h5
                  className="modal-title text-base font-semibold"
                  id="qrModalLabel"
                >
                  Add UPI Account
                </h5>

                <p className="mt-0.5 text-[11px] text-indigo-100">
                  Enter the UPI details used for receiving payments.
                </p>

              </div>

              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>

            </div>

            {/* FORM */}

            <form id="addQrForm">

              <div className="modal-body bg-white px-5 py-5">

                <div className="space-y-4">

                  {/* UPI NAME */}

                  <div>

                    <label
                      htmlFor="upiName"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      UPI Name
                    </label>

                    <input
                      type="text"
                      name="upiName"
                      id="upiName"
                      required
                      placeholder="Enter UPI account name"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* UPI ID */}

                  <div>

                    <label
                      htmlFor="upiId"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      UPI ID
                    </label>

                    <input
                      type="text"
                      name="upiId"
                      id="upiId"
                      required
                      placeholder="example@upi"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="modal-footer flex items-center justify-end gap-2 border-0 bg-slate-50 px-5 py-3">

                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Save UPI
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}

      <div
        className="modal fade"
        id="successModal"
        tabIndex="-1"
        aria-labelledby="successModalLabel"
        aria-hidden="true"
      >

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content overflow-hidden rounded-xl border-0 shadow-2xl">

            <div className="modal-header border-0 bg-emerald-600 text-white">

              <h5
                className="modal-title text-base font-semibold"
                id="successModalLabel"
              >
                Success
              </h5>

              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>

            </div>

            <div className="modal-body bg-white py-7 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
                </svg>

              </div>

              <h5
                id="successMessage"
                className="px-4 text-sm font-semibold text-slate-800"
              >
                Action completed successfully!
              </h5>

            </div>

            <div className="modal-footer justify-content-center border-0 bg-slate-50">

              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-6 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
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

export default QrCode;
