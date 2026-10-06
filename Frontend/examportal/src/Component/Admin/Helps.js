import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";
import $ from "jquery";

window.$ = window.jQuery = $;

function Helps() {
  const [helps, setHelps] = useState([]);
  const [replyData, setReplyData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadHelps();
  }, []);

  /* ================= LOAD HELPS ================= */
  function loadHelps() {
    $.get(API_BASE_URL + "/api/help/all", function (data) {
      // add replied flag
      const updated = data.map((h) => ({ ...h, replied: false }));
      setHelps(updated);
    });
  }

  /* ================= OPEN REPLY MODAL ================= */
  function openReplyModal(help) {
    setReplyData({
      id: help.id,
      name: help.name,
      email: help.email,
      message: "",
    });

    const modal = new window.bootstrap.Modal(
      document.getElementById("replyModal")
    );

    modal.show();
  }

  /* ================= SEND REPLY ================= */
  function sendReply() {
    if (!replyData.message.trim()) {
      alert("Reply message required");
      return;
    }

    $.post(
      API_BASE_URL + "/api/help/reply",
      {
        name: replyData.name,
        email: replyData.email,
        replyMessage: replyData.message,
      },
      () => {
        // mark as replied
        setHelps((prev) =>
          prev.map((h) =>
            h.id === replyData.id ? { ...h, replied: true } : h
          )
        );

        const modalEl = document.getElementById("replyModal");
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);

        modalInstance.hide();

        setSuccessMessage("Reply sent successfully!");
        setShowSuccessModal(true);
      }
    );
  }

  /* ================= DELETE HELP ================= */
  function deleteHelp(id) {
    if (!window.confirm("Are you sure you want to delete this help?")) {
      return;
    }

    $.ajax({
      url: API_BASE_URL + "/api/help/delete/" + id,
      type: "DELETE",
      success: () => {
        setHelps((prev) => prev.filter((h) => h.id !== id));

        setSuccessMessage("Help deleted successfully!");
        setShowSuccessModal(true);
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Support Management
            </p>

            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Help Messages
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage user support requests and send replies.
            </p>
          </div>

          <div className="mt-2 inline-flex w-fit items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:mt-0">
            <span className="mr-2 text-xs font-medium text-slate-500">
              Total
            </span>

            <span className="text-sm font-bold text-slate-900">
              {helps.length}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="px-3 py-4 sm:px-5 lg:px-6">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              Support Requests
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Review incoming help messages and respond when required.
            </p>
          </div>

          {helps.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h8M8 14h5m-9 6l3.2-3.2A2 2 0 019.6 16H18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h.4A2 2 0 018 16.8L4 20z"
                  />
                </svg>
              </div>

              <h3 className="text-sm font-semibold text-slate-800">
                No help messages
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                There are currently no support requests to display.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Phone
                    </th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Message
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {helps.map((h, i) => (
                    <tr
                      key={h.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-600">
                        {i + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openReplyModal(h)}
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                          >
                            Reply
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteHelp(h.id)}
                            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-800">
                        {h.name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {h.email}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {h.phoneNo}
                      </td>

                      <td className="max-w-[420px] px-4 py-3 text-sm text-slate-600">
                        <div className="line-clamp-2">
                          {h.message}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= REPLY MODAL ================= */}
      <div className="modal fade" id="replyModal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content overflow-hidden rounded-xl border-0 shadow-xl">
            <div className="modal-header border-0 bg-indigo-600 px-5 py-4 text-white">
              <div>
                <h5 className="modal-title text-base font-semibold">
                  Reply to User
                </h5>

                <p className="mt-0.5 text-xs text-indigo-100">
                  Send a response to the selected help request.
                </p>
              </div>

              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body bg-white px-5 py-5">
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </label>

                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none"
                  value={replyData.name}
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reply Message
                </label>

                <textarea
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  rows="5"
                  placeholder="Type reply message..."
                  value={replyData.message}
                  onChange={(e) =>
                    setReplyData({
                      ...replyData,
                      message: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer border-0 bg-slate-50 px-5 py-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={sendReply}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[1055] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-emerald-600 px-5 py-4 text-white">
              <h5 className="text-base font-semibold">Success</h5>

              <button
                type="button"
                className="text-2xl leading-none text-white/80 transition hover:text-white"
                onClick={() => setShowSuccessModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-7 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                  fill="currentColor"
                  className="text-emerald-600"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
                </svg>
              </div>

              <h5 className="text-base font-semibold text-slate-800">
                {successMessage}
              </h5>

              <button
                type="button"
                className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={() => setShowSuccessModal(false)}
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

export default Helps;
