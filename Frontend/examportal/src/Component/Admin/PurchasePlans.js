import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import $ from "jquery";
import API_BASE_URL from "../../helper";

function PurchasePlans() {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadAllPurchasePlans();
  }, []);

  /* ================= LOAD ALL PURCHASE PLANS ================= */

  function loadAllPurchasePlans() {
    $.get(API_BASE_URL + "/api/purchaseplan/all", function (data) {
      const reversedData = [...data].reverse();

      setPlans(reversedData);
      setFilteredPlans(reversedData);
    });
  }

  /* ================= SUCCESS MODAL ================= */

  function showSuccessModal(message) {
    setSuccessMessage(message);

    const modal = new window.bootstrap.Modal(
      document.getElementById("successModal")
    );

    modal.show();
  }

  /* ================= SEARCH ================= */

  function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    setSearchKeyword(e.target.value);

    if (!keyword) {
      setFilteredPlans(plans);
      return;
    }

    const normalizedKeyword = keyword.replace(/\s+/g, "");

    const filtered = plans.filter((p) => {
      const institute = (p.instituteName || "")
        .toLowerCase()
        .replace(/\s+/g, "");

      const duration = (p.duration || "")
        .toLowerCase()
        .replace(/\s+/g, "");

      const price = (p.price || "").toString();

      const gateway = (p.paymentGateway || "MANUAL")
        .toLowerCase()
        .replace(/\s+/g, "");

      let status = (p.status || "").toLowerCase();
      status = status.replace("_", "");

      return (
        institute.includes(normalizedKeyword) ||
        duration.includes(normalizedKeyword) ||
        price.includes(normalizedKeyword) ||
        gateway.includes(normalizedKeyword) ||
        status === normalizedKeyword
      );
    });

    setFilteredPlans(filtered);
  }

  /* ================= UPDATE STATUS ================= */

  function handleStatusChange(id, status) {
    $.ajax({
      url:
        API_BASE_URL +
        `/api/purchaseplan/update-status/${id}?status=${status}`,
      type: "PUT",
      success: function () {
        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === id ? { ...plan, status: status } : plan
          )
        );

        setFilteredPlans((prev) =>
          prev.map((plan) =>
            plan.id === id ? { ...plan, status: status } : plan
          )
        );

        showSuccessModal("Status updated successfully!");
      },
      error: function () {
        alert("Error while updating status");
      },
    });
  }

  /* ================= DELETE PLAN ================= */

  function deletePlan(id) {
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return;
    }

    $.ajax({
      url: API_BASE_URL + `/api/purchaseplan/delete/${id}`,
      type: "DELETE",

      success: function () {
        const updatedPlans = plans.filter((plan) => plan.id !== id);

        setPlans(updatedPlans);
        setFilteredPlans((prev) =>
          prev.filter((plan) => plan.id !== id)
        );

        showSuccessModal("Purchase plan deleted successfully!");
      },

      error: function () {
        alert("Error while deleting plan");
      },
    });
  }

  /* ================= DOWNLOAD EXCEL ================= */

  function downloadExcel() {
    if (!filteredPlans || filteredPlans.length === 0) {
      alert("No purchase plan data available to download");
      return;
    }

    const data = filteredPlans.map((p, index) => ({
      "Sr No.": index + 1,
      "Organization Name": p.instituteName,
      Duration: p.duration,
      Price: p.price,
      "Payment Gateway": p.paymentGateway || "MANUAL",
      "Plan Date": p.planDate,
      "Plan Expiry Date": p.planExpiryDate,
      Status: p.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

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

        fill: {
          fgColor: {
            rgb: "4F81BD",
          },
        },

        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };
    }

    worksheet["!cols"] = Object.keys(data[0]).map(() => ({
      wch: 18,
    }));

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Purchase Plans"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "All_Purchase_Plans.xlsx");
  }

  /* ================= PAYMENT IMAGE ================= */

  function PaymentImage({ image }) {
    const [imageError, setImageError] = useState(false);

    if (!image || imageError) {
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            />
          </svg>
        </div>
      );
    }

    return (
      <a
        href={`${API_BASE_URL}${image}`}
        target="_blank"
        rel="noreferrer"
        title="Open payment proof"
        className="block"
      >
        <img
          src={`${API_BASE_URL}${image}`}
          alt="Payment"
          onError={() => setImageError(true)}
          className="h-11 w-11 rounded-lg border border-slate-200 object-cover transition hover:scale-105 hover:border-indigo-400"
        />
      </a>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= PAGE HEADER ================= */}

      <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-7">

        <div className="flex items-center justify-between gap-4">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Subscription Management
            </p>

            <h1 className="mt-0.5 text-[24px] font-bold tracking-tight text-slate-900">
              Purchase Plans
            </h1>

            <p className="mt-0.5 text-xs text-slate-500">
              Manage organization subscriptions and payment records.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
            <span className="text-xs text-slate-500">
              Total
            </span>

            <span className="text-sm font-bold text-slate-900">
              {plans.length}
            </span>
          </div>

        </div>
      </div>

      {/* ================= CONTENT ================= */}

      <div className="px-4 py-4 lg:px-6">

        {/* ================= TOOLBAR ================= */}

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-[420px]">

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
                d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
              />
            </svg>

            <input
              type="text"
              value={searchKeyword}
              onChange={handleSearch}
              placeholder="Search organization, plan, price, gateway or status..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          <button
            type="button"
            onClick={downloadExcel}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 002-2v-3M3 16v3a2 2 0 002 2"
              />
            </svg>

            Download Excel
          </button>

        </div>

        {/* ================= TABLE CARD ================= */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">
                All Purchase Plans
              </h2>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {filteredPlans.length} record
                {filteredPlans.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
              {filteredPlans.length}
            </div>

          </div>

          {/* TABLE */}

          {filteredPlans.length === 0 ? (

            <div className="flex min-h-[240px] flex-col items-center justify-center px-4 text-center">

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14h6m-6-4h6m2 10H7a3 3 0 01-3-3V7a3 3 0 013-3h6l4 4v9a3 3 0 01-3 3z"
                  />
                </svg>

              </div>

              <h3 className="text-sm font-semibold text-slate-800">
                No purchase plans found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Try changing your search criteria.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1150px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="w-12 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="w-28 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Gateway
                    </th>

                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Organization
                    </th>

                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Duration
                    </th>

                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Price
                    </th>

                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Plan Date
                    </th>

                    <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Expiry
                    </th>

                    <th className="w-36 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="w-24 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredPlans.map((p, i) => (

                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-slate-50"
                    >

                      {/* NUMBER */}

                      <td className="px-3 py-3 text-center text-xs font-semibold text-slate-500">
                        {i + 1}
                      </td>

                      {/* PAYMENT GATEWAY */}

                      <td className="px-3 py-3 text-center">

                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            (p.paymentGateway || "MANUAL").toUpperCase() ===
                            "PHONEPE"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {(p.paymentGateway || "MANUAL").toUpperCase()}
                        </span>

                      </td>

                      {/* ORGANIZATION */}

                      <td className="px-3 py-3">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                            {(p.instituteName || "O")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {p.instituteName || "-"}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              Organization
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* DURATION */}

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {p.duration || "-"}
                      </td>

                      {/* PRICE */}

                      <td className="px-3 py-3">

                        <span className="font-semibold text-slate-800">
                          ₹{p.price || "0"}
                        </span>

                      </td>

                      {/* PLAN DATE */}

                      <td className="px-3 py-3 text-xs text-slate-600">
                        {p.planDate || "-"}
                      </td>

                      {/* EXPIRY */}

                      <td className="px-3 py-3 text-xs text-slate-600">
                        {p.planExpiryDate || "-"}
                      </td>

                      {/* STATUS */}

                      <td className="px-3 py-3">

                        <select
                          value={p.status || "IN_ACTIVE"}
                          onChange={(e) =>
                            handleStatusChange(
                              p.id,
                              e.target.value
                            )
                          }
                          className={`h-9 w-full rounded-lg border px-3 text-xs font-semibold outline-none transition ${
                            p.status === "ACTIVE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400"
                              : "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-400"
                          }`}
                        >

                          <option value="IN_ACTIVE">
                            In Active
                          </option>

                          <option value="ACTIVE">
                            Active
                          </option>

                        </select>

                      </td>

                      {/* DELETE */}

                      <td className="px-3 py-3 text-center">

                        <button
                          type="button"
                          onClick={() => deletePlan(p.id)}
                          className="inline-flex h-8 items-center justify-center rounded-md bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ================= SUCCESS MODAL ================= */}

      <div className="modal fade" id="successModal">

        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content overflow-hidden rounded-xl border-0 shadow-2xl">

            <div className="modal-header border-0 bg-emerald-600 text-white">

              <h5 className="modal-title text-base font-semibold">
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

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 01-1.06 1.06l3.5 3.5z" />
                </svg>

              </div>

              <h5 className="px-4 text-base font-semibold text-slate-800">
                {successMessage}
              </h5>

            </div>

            <div className="modal-footer justify-content-center border-0 bg-slate-50">

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

export default PurchasePlans;



// import React, { useEffect, useState } from "react";
// import * as XLSX from "xlsx-js-style";
// import { saveAs } from "file-saver";
// import $ from "jquery";
// import API_BASE_URL from "../../helper";

// function PurchasePlans() {
//   const [plans, setPlans] = useState([]);
//   const [filteredPlans, setFilteredPlans] = useState([]);
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   useEffect(() => {
//     loadAllPurchasePlans();
//   }, []);

//   /* ================= LOAD ALL PURCHASE PLANS ================= */

//   function loadAllPurchasePlans() {
//     $.get(API_BASE_URL + "/api/purchaseplan/all", function (data) {
//       const reversedData = [...data].reverse();

//       setPlans(reversedData);
//       setFilteredPlans(reversedData);
//     });
//   }

//   /* ================= SUCCESS MODAL ================= */

//   function showSuccessModal(message) {
//     setSuccessMessage(message);

//     const modal = new window.bootstrap.Modal(
//       document.getElementById("successModal")
//     );

//     modal.show();
//   }

//   /* ================= SEARCH ================= */

//   function handleSearch(e) {
//     const keyword = e.target.value.toLowerCase().trim();

//     setSearchKeyword(e.target.value);

//     if (!keyword) {
//       setFilteredPlans(plans);
//       return;
//     }

//     const normalizedKeyword = keyword.replace(/\s+/g, "");

//     const filtered = plans.filter((p) => {
//       const institute = (p.instituteName || "")
//         .toLowerCase()
//         .replace(/\s+/g, "");

//       const duration = (p.duration || "")
//         .toLowerCase()
//         .replace(/\s+/g, "");

//       const price = (p.price || "").toString();

//       let status = (p.status || "").toLowerCase();
//       status = status.replace("_", "");

//       return (
//         institute.includes(normalizedKeyword) ||
//         duration.includes(normalizedKeyword) ||
//         price.includes(normalizedKeyword) ||
//         status === normalizedKeyword
//       );
//     });

//     setFilteredPlans(filtered);
//   }

//   /* ================= UPDATE STATUS ================= */

//   function handleStatusChange(id, status) {
//     $.ajax({
//       url:
//         API_BASE_URL +
//         `/api/purchaseplan/update-status/${id}?status=${status}`,
//       type: "PUT",
//       success: function () {
//         setPlans((prev) =>
//           prev.map((plan) =>
//             plan.id === id ? { ...plan, status: status } : plan
//           )
//         );

//         setFilteredPlans((prev) =>
//           prev.map((plan) =>
//             plan.id === id ? { ...plan, status: status } : plan
//           )
//         );

//         showSuccessModal("Status updated successfully!");
//       },
//       error: function () {
//         alert("Error while updating status");
//       },
//     });
//   }

//   /* ================= DELETE PLAN ================= */

//   function deletePlan(id) {
//     if (!window.confirm("Are you sure you want to delete this plan?")) {
//       return;
//     }

//     $.ajax({
//       url: API_BASE_URL + `/api/purchaseplan/delete/${id}`,
//       type: "DELETE",

//       success: function () {
//         const updatedPlans = plans.filter((plan) => plan.id !== id);

//         setPlans(updatedPlans);
//         setFilteredPlans((prev) =>
//           prev.filter((plan) => plan.id !== id)
//         );

//         showSuccessModal("Purchase plan deleted successfully!");
//       },

//       error: function () {
//         alert("Error while deleting plan");
//       },
//     });
//   }

//   /* ================= DOWNLOAD EXCEL ================= */

//   function downloadExcel() {
//     if (!filteredPlans || filteredPlans.length === 0) {
//       alert("No purchase plan data available to download");
//       return;
//     }

//     const data = filteredPlans.map((p, index) => ({
//       "Sr No.": index + 1,
//       "Organization Name": p.instituteName,
//       Duration: p.duration,
//       Price: p.price,
//       "Plan Date": p.planDate,
//       "Plan Expiry Date": p.planExpiryDate,
//       Status: p.status,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);

//     const range = XLSX.utils.decode_range(worksheet["!ref"]);

//     for (let col = range.s.c; col <= range.e.c; col++) {
//       const cell = XLSX.utils.encode_cell({
//         r: 0,
//         c: col,
//       });

//       if (!worksheet[cell]) continue;

//       worksheet[cell].s = {
//         font: {
//           bold: true,
//           color: {
//             rgb: "FFFFFF",
//           },
//         },

//         fill: {
//           fgColor: {
//             rgb: "4F81BD",
//           },
//         },

//         alignment: {
//           horizontal: "center",
//           vertical: "center",
//         },
//       };
//     }

//     worksheet["!cols"] = Object.keys(data[0]).map(() => ({
//       wch: 18,
//     }));

//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(
//       workbook,
//       worksheet,
//       "Purchase Plans"
//     );

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//       cellStyles: true,
//     });

//     const blob = new Blob([excelBuffer], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     saveAs(blob, "All_Purchase_Plans.xlsx");
//   }

//   /* ================= PAYMENT IMAGE ================= */

//   function PaymentImage({ image }) {
//     const [imageError, setImageError] = useState(false);

//     if (!image || imageError) {
//       return (
//         <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-5 w-5 text-slate-400"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth="1.7"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
//             />
//           </svg>
//         </div>
//       );
//     }

//     return (
//       <a
//         href={`${API_BASE_URL}${image}`}
//         target="_blank"
//         rel="noreferrer"
//         title="Open payment proof"
//         className="block"
//       >
//         <img
//           src={`${API_BASE_URL}${image}`}
//           alt="Payment"
//           onError={() => setImageError(true)}
//           className="h-11 w-11 rounded-lg border border-slate-200 object-cover transition hover:scale-105 hover:border-indigo-400"
//         />
//       </a>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {/* ================= PAGE HEADER ================= */}

//       <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-7">

//         <div className="flex items-center justify-between gap-4">

//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
//               Subscription Management
//             </p>

//             <h1 className="mt-0.5 text-[24px] font-bold tracking-tight text-slate-900">
//               Purchase Plans
//             </h1>

//             <p className="mt-0.5 text-xs text-slate-500">
//               Manage organization subscriptions and payment records.
//             </p>
//           </div>

//           <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
//             <span className="text-xs text-slate-500">
//               Total
//             </span>

//             <span className="text-sm font-bold text-slate-900">
//               {plans.length}
//             </span>
//           </div>

//         </div>
//       </div>

//       {/* ================= CONTENT ================= */}

//       <div className="px-4 py-4 lg:px-6">

//         {/* ================= TOOLBAR ================= */}

//         <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">

//           <div className="relative w-full sm:max-w-[420px]">

//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
//               />
//             </svg>

//             <input
//               type="text"
//               value={searchKeyword}
//               onChange={handleSearch}
//               placeholder="Search organization, plan, price or status..."
//               className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//             />

//           </div>

//           <button
//             type="button"
//             onClick={downloadExcel}
//             className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-4 w-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 002-2v-3M3 16v3a2 2 0 002 2"
//               />
//             </svg>

//             Download Excel
//           </button>

//         </div>

//         {/* ================= TABLE CARD ================= */}

//         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

//           {/* TABLE HEADER */}

//           <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

//             <div>
//               <h2 className="text-[15px] font-semibold text-slate-900">
//                 All Purchase Plans
//               </h2>

//               <p className="mt-0.5 text-[11px] text-slate-500">
//                 {filteredPlans.length} record
//                 {filteredPlans.length !== 1 ? "s" : ""} found
//               </p>
//             </div>

//             <div className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
//               {filteredPlans.length}
//             </div>

//           </div>

//           {/* TABLE */}

//           {filteredPlans.length === 0 ? (

//             <div className="flex min-h-[240px] flex-col items-center justify-center px-4 text-center">

//               <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6 text-slate-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth="1.7"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M9 14h6m-6-4h6m2 10H7a3 3 0 01-3-3V7a3 3 0 013-3h6l4 4v9a3 3 0 01-3 3z"
//                   />
//                 </svg>

//               </div>

//               <h3 className="text-sm font-semibold text-slate-800">
//                 No purchase plans found
//               </h3>

//               <p className="mt-1 text-xs text-slate-500">
//                 Try changing your search criteria.
//               </p>

//             </div>

//           ) : (

//             <div className="overflow-x-auto">

//               <table className="w-full min-w-[1050px]">

//                 <thead>

//                   <tr className="border-b border-slate-200 bg-slate-50">

//                     <th className="w-12 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       #
//                     </th>

//                     <th className="w-20 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Payment
//                     </th>

//                     <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Organization
//                     </th>

//                     <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Duration
//                     </th>

//                     <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Price
//                     </th>

//                     <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Plan Date
//                     </th>

//                     <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Expiry
//                     </th>

//                     <th className="w-36 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Status
//                     </th>

//                     <th className="w-24 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
//                       Action
//                     </th>

//                   </tr>

//                 </thead>

//                 <tbody className="divide-y divide-slate-100">

//                   {filteredPlans.map((p, i) => (

//                     <tr
//                       key={p.id}
//                       className="transition-colors hover:bg-slate-50"
//                     >

//                       {/* NUMBER */}

//                       <td className="px-3 py-3 text-center text-xs font-semibold text-slate-500">
//                         {i + 1}
//                       </td>

//                       {/* PAYMENT */}

//                       <td className="px-3 py-3">

//                         <div className="flex justify-center">
//                           <PaymentImage image={p.paymentImg} />
//                         </div>

//                       </td>

//                       {/* ORGANIZATION */}

//                       <td className="px-3 py-3">

//                         <div className="flex items-center gap-2">

//                           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
//                             {(p.instituteName || "O")
//                               .charAt(0)
//                               .toUpperCase()}
//                           </div>

//                           <div>
//                             <p className="text-sm font-semibold text-slate-800">
//                               {p.instituteName || "-"}
//                             </p>

//                             <p className="text-[10px] text-slate-400">
//                               Organization
//                             </p>
//                           </div>

//                         </div>

//                       </td>

//                       {/* DURATION */}

//                       <td className="px-3 py-3 text-sm text-slate-600">
//                         {p.duration || "-"}
//                       </td>

//                       {/* PRICE */}

//                       <td className="px-3 py-3">

//                         <span className="font-semibold text-slate-800">
//                           ₹{p.price || "0"}
//                         </span>

//                       </td>

//                       {/* PLAN DATE */}

//                       <td className="px-3 py-3 text-xs text-slate-600">
//                         {p.planDate || "-"}
//                       </td>

//                       {/* EXPIRY */}

//                       <td className="px-3 py-3 text-xs text-slate-600">
//                         {p.planExpiryDate || "-"}
//                       </td>

//                       {/* STATUS */}

//                       <td className="px-3 py-3">

//                         <select
//                           value={p.status || "IN_ACTIVE"}
//                           onChange={(e) =>
//                             handleStatusChange(
//                               p.id,
//                               e.target.value
//                             )
//                           }
//                           className={`h-9 w-full rounded-lg border px-3 text-xs font-semibold outline-none transition ${
//                             p.status === "ACTIVE"
//                               ? "border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-400"
//                               : "border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-400"
//                           }`}
//                         >

//                           <option value="IN_ACTIVE">
//                             In Active
//                           </option>

//                           <option value="ACTIVE">
//                             Active
//                           </option>

//                         </select>

//                       </td>

//                       {/* DELETE */}

//                       <td className="px-3 py-3 text-center">

//                         <button
//                           type="button"
//                           onClick={() => deletePlan(p.id)}
//                           className="inline-flex h-8 items-center justify-center rounded-md bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100"
//                         >
//                           Delete
//                         </button>

//                       </td>

//                     </tr>

//                   ))}

//                 </tbody>

//               </table>

//             </div>

//           )}

//         </div>

//       </div>

//       {/* ================= SUCCESS MODAL ================= */}

//       <div className="modal fade" id="successModal">

//         <div className="modal-dialog modal-dialog-centered">

//           <div className="modal-content overflow-hidden rounded-xl border-0 shadow-2xl">

//             <div className="modal-header border-0 bg-emerald-600 text-white">

//               <h5 className="modal-title text-base font-semibold">
//                 Success
//               </h5>

//               <button
//                 type="button"
//                 className="btn-close btn-close-white"
//                 data-bs-dismiss="modal"
//                 aria-label="Close"
//               ></button>

//             </div>

//             <div className="modal-body bg-white py-7 text-center">

//               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">

//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-10 w-10 text-emerald-600"
//                   fill="currentColor"
//                   viewBox="0 0 16 16"
//                 >
//                   <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
//                 </svg>

//               </div>

//               <h5 className="px-4 text-base font-semibold text-slate-800">
//                 {successMessage}
//               </h5>

//             </div>

//             <div className="modal-footer justify-content-center border-0 bg-slate-50">

//               <button
//                 type="button"
//                 className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
//                 data-bs-dismiss="modal"
//               >
//                 OK
//               </button>

//             </div>

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default PurchasePlans;
