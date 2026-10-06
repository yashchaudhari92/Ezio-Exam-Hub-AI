import { Link } from "react-router-dom";
import { useState } from "react";
import API_BASE_URL from "../../helper";

function Footer() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [helpData, setHelpData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    message: "",
  });

  const handleChange = (e) => {
    setHelpData({ ...helpData, [e.target.name]: e.target.value });
  };

  const submitHelp = (e) => {
    e.preventDefault();

    fetch(API_BASE_URL + "/api/help/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(helpData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        console.log("Saved:", data);

        setSuccessMessage("Message Send Successfully!");
        setShowHelpModal(false);
        setShowSuccessModal(true);

        setHelpData({
          name: "",
          email: "",
          phoneNo: "",
          message: "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong ❌");
      });
  };

  return (
    <>
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link to="/" className="text-sm font-medium text-slate-300 !no-underline hover:text-white">Home</Link>
            <Link to="/about" className="text-sm font-medium text-slate-300 !no-underline hover:text-white">About</Link>
            <Link to="/quiz" className="text-sm font-medium text-slate-300 !no-underline hover:text-white">Quiz</Link>
            <Link to="/term&conditions" className="text-sm font-medium text-slate-300 !no-underline hover:text-white">Terms & Conditions</Link>
            <Link to="/privatepolicy" className="text-sm font-medium text-slate-300 !no-underline hover:text-white">Private Policy</Link>
          </div>

          <div className="my-7 h-px bg-white/15" />

          <div className="text-center">
            <p className="m-0 text-sm text-slate-400">
              Copyright © 2026 All rights reserved | Designed By{" "}
              <a
                href="https://ezioinfotech.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-amber-400 !no-underline hover:text-amber-300"
              >
                Ezio Infotech Pvt.Ltd
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Help Button */}
      <button
        type="button"
        onClick={() => setShowHelpModal(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-amber-300"
      >
        Help ?
      </button>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-4">
              <h2 className="m-0 text-lg font-bold text-slate-900">Need Help?</h2>

              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg px-3 py-1 text-xl font-bold text-slate-700 hover:bg-black/10"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitHelp} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={helpData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={helpData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone No</label>
                <input
                  type="text"
                  name="phoneNo"
                  value={helpData.phoneNo}
                  onChange={handleChange}
                  maxLength="10"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  rows="4"
                  value={helpData.message}
                  onChange={handleChange}
                  required
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="w-1/2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">Success</h2>

            <p className="mt-2 text-sm text-slate-600">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;