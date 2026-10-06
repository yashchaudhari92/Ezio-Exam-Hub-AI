import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";
import $ from "jquery";

function PlanPurchases() {
  const [inst, setInst] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    let data = localStorage.getItem("loggedInstitute");

    if (data) {
      const institute = JSON.parse(data);
      setInst(institute);
      loadPlans(institute);
    }
  }, []);

  // function loadPlans(institute) {
  //   let allPlans = [];

  //   // Registration Plan
  //   if (institute.plan) {
  //     allPlans.push({
  //       paymentImg: institute.paymentImg,
  //       instituteName: institute.instituteName,
  //       duration: institute.plan,
  //       price: "-",
  //       planDate: institute.planDate,
  //       planExpiryDate: institute.planExpiryDate,
  //       source: "Registration Time",
  //     });
  //   }

  //   // Purchased Plans
  //   $.get(
  //     `${API_BASE_URL}/api/purchaseplan/by-institute/${institute.instituteName}`,
  //     function (data) {
  //       data.forEach((p) => {
  //         allPlans.push({
  //           paymentImg: p.paymentImg,
  //           instituteName: p.instituteName,
  //           duration: p.duration,
  //           price: p.price,
  //           planDate: p.planDate,
  //           planExpiryDate: p.planExpiryDate,
  //           source: "Purchase",
  //         });
  //       });

  //       setPlans(allPlans);
  //     }
  //   );
  // }

  function loadPlans(institute) {
    let allPlans = [];

    // Registration Plan
    if (institute.plan) {
      $.get(
        `${API_BASE_URL}/api/payment/gateway/${institute.id}`,
        function (gateway) {
          allPlans.push({
            paymentImg: institute.paymentImg,
            instituteName: institute.instituteName,
            duration: institute.plan,
            price: "-",
            planDate: institute.planDate,
            planExpiryDate: institute.planExpiryDate,
            gateway: gateway || "MANUAL",
            source: "Registration Time",
          });

          loadPurchasedPlans(allPlans, institute);
        }
      ).fail(function () {
        allPlans.push({
          paymentImg: institute.paymentImg,
          instituteName: institute.instituteName,
          duration: institute.plan,
          price: "-",
          planDate: institute.planDate,
          planExpiryDate: institute.planExpiryDate,
          gateway: "MANUAL",
          source: "Registration Time",
        });

        loadPurchasedPlans(allPlans, institute);
      });
    } else {
      loadPurchasedPlans(allPlans, institute);
    }
  }

  function loadPurchasedPlans(allPlans, institute) {
    $.get(
      `${API_BASE_URL}/api/purchaseplan/by-institute/${institute.instituteName}`,
      function (data) {
        data.forEach((p) => {
          allPlans.push({
            paymentImg: p.paymentImg,
            instituteName: p.instituteName,
            duration: p.duration,
            price: p.price,
            planDate: p.planDate,
            planExpiryDate: p.planExpiryDate,
            gateway: p.paymentGateway || "MANUAL",
            source: "Purchase",
          });
        });

        setPlans(allPlans);
      }
    );
  }

  // Table Responsive
  const [expandedPlan, setExpandedPlan] = useState(null);

  const togglePlanRow = (index) => {
    setExpandedPlan(expandedPlan === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Subscription Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              {inst ? inst.instituteName : "Institute"} - Plans
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your registration plan and purchased subscription plans.
            </p>
          </div>

          {/* Total Plans */}
          <div className="rounded-xl bg-indigo-50 px-5 py-3 text-center">
            <p className="text-xs font-medium text-indigo-500">
              Total Plans
            </p>

            <p className="text-xl font-bold text-indigo-700">
              {plans.length}
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          SECTION HEADER
      ========================== */}
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Purchase Plan
          </h2>

          <p className="text-sm text-slate-500">
            Subscription and payment history
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {plans.length} {plans.length === 1 ? "Plan" : "Plans"}
        </span>
      </div>

      {/* =========================
          DESKTOP / TABLE
      ========================== */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-white">
              <tr>
                {/* Mobile Toggle */}
                <th className="px-3 py-4 text-center md:hidden">
                  #
                </th>

                <th className="whitespace-nowrap px-4 py-4">
                  Sr. No
                </th>

                {/* <th className="whitespace-nowrap px-4 py-4 text-center">
                  Payment
                </th> */}

                <th className="whitespace-nowrap px-4 py-4">
                  Plan
                </th>

                <th className="whitespace-nowrap px-4 py-4">
                  Price
                </th>

                <th className="whitespace-nowrap px-4 py-4">
                  Plan Date
                </th>

                <th className="whitespace-nowrap px-4 py-4">
                  Expiry Date
                </th>

                <th className="whitespace-nowrap px-4 py-4">
                  Gateway
                </th>

                <th className="whitespace-nowrap px-4 py-4">
                  Source
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {plans.length > 0 ? (
                plans.map((p, i) => (
                  <React.Fragment key={i}>
                    <tr className="transition hover:bg-slate-50">
                      {/* Mobile Toggle */}
                      <td className="px-3 py-4 text-center md:hidden">
                        <button
                          type="button"
                          onClick={() => togglePlanRow(i)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold transition ${expandedPlan === i
                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {expandedPlan === i ? "−" : "+"}
                        </button>
                      </td>

                      {/* Sr No */}
                      <td className="px-4 py-4 font-medium text-slate-500">
                        {i + 1}
                      </td>

                      {/* Payment */}
                      {/* <td className="px-4 py-4 text-center">
                        <a
                          href={`${API_BASE_URL}${p.paymentImg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex"
                        >
                          <img
                            src={`${API_BASE_URL}${p.paymentImg}`}
                            width="60"
                            alt="Payment"
                            className="h-14 w-14 rounded-lg border border-slate-200 bg-white object-cover p-1 shadow-sm transition hover:scale-105 hover:shadow-md"
                          />
                        </a>
                      </td> */}

                      {/* Plan */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <i className="fa-solid fa-crown text-sm"></i>
                          </div>

                          <span className="font-semibold text-slate-800">
                            {p.duration}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-700">
                          {p.price === "-" ? "—" : `₹ ${p.price}`}
                        </span>
                      </td>

                      {/* Plan Date */}
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {p.planDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {p.planExpiryDate}
                      </td>

                      {/* Gateway */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.gateway === "PHONEPE"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${p.gateway === "PHONEPE"
                              ? "bg-indigo-500"
                              : "bg-slate-500"
                              }`}
                          ></span>

                          {p.gateway}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.source === "Registration"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.source === "Registration Time"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-indigo-50 text-indigo-700"
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${p.source === "Registration" ||
                              p.source === "Registration Time"
                              ? "bg-emerald-500"
                              : "bg-indigo-500"
                              }`}
                          ></span>

                          {p.source}
                        </span>
                      </td>
                    </tr>

                    {/* =========================
                        MOBILE EXPANDED ROW
                    ========================== */}
                    {expandedPlan === i && (
                      <tr className="bg-slate-50 md:hidden">
                        <td colSpan="3" className="px-4 py-4">
                          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                            <div>
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                Gateway
                              </p>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.gateway === "PHONEPE"
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "bg-slate-100 text-slate-600"
                                  }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${p.gateway === "PHONEPE"
                                      ? "bg-indigo-500"
                                      : "bg-slate-500"
                                    }`}
                                ></span>

                                {p.gateway}
                              </span>
                            </div>

                            {/* Payment + Source */}
                            <div className="mb-4 flex items-center justify-between gap-4">
                              <div>
                                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                  Source
                                </p>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.source === "Registration" ||
                                    p.source === "Registration Time"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-indigo-50 text-indigo-700"
                                    }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${p.source === "Registration" ||
                                      p.source === "Registration Time"
                                      ? "bg-emerald-500"
                                      : "bg-indigo-500"
                                      }`}
                                  ></span>

                                  {p.source}
                                </span>
                              </div>

                              {/* <a
                                href={`${API_BASE_URL}${p.paymentImg}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <img
                                  src={`${API_BASE_URL}${p.paymentImg}`}
                                  width="70"
                                  alt="Payment"
                                  className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-cover p-1 shadow-sm"
                                />
                              </a> */}
                            </div>

                            <div className="mb-4 border-t border-slate-100"></div>

                            {/* Mobile Details */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-400">
                                  Price
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {p.price === "-"
                                    ? "—"
                                    : `₹ ${p.price}`}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-400">
                                  Plan
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {p.duration}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-400">
                                  Plan Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {p.planDate}
                                </p>
                              </div>

                              <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-400">
                                  Expiry Date
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {p.planExpiryDate}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-14 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <i className="fa-solid fa-receipt text-xl"></i>
                      </div>

                      <h3 className="font-semibold text-slate-700">
                        No plans found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        No registration or purchased plans are available.
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
  );
}

export default PlanPurchases;