import { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";

function UserProfile() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("loggedUser");

    if (user) {
      setLoggedUser(JSON.parse(user));
    }
  }, []);

  function openEditModal() {
    if (!loggedUser) return;

    setPassword(loggedUser.password || "");
    setIsEditOpen(true);
  }

  function closeEditModal() {
    if (!isUpdating) {
      setIsEditOpen(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();

    if (!loggedUser) return;

    try {
      setIsUpdating(true);

      const response = await fetch(
        `${API_BASE_URL}/api/user/update-password/${loggedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update password");
      }

      const updatedUser = {
        ...loggedUser,
        password: password,
      };

      localStorage.setItem(
        "loggedUser",
        JSON.stringify(updatedUser)
      );

      setLoggedUser(updatedUser);
      setIsEditOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  }

  if (!loggedUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  const firstLetter =
    loggedUser.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-600">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Profile
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {loggedUser.name}
              </p>

              <p className="text-xs text-slate-500">
                Student
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {firstLetter}
            </div>
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8">

        {/* Profile Summary */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-md">
                {firstLetter}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {loggedUser.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Student Account
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={openEditModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <span>✎</span>
              Edit Profile
            </button>

          </div>

          {/* Information */}
          <div className="p-6">

            <div className="grid gap-4 md:grid-cols-2">

              {/* Email */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-lg">
                    ✉
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Email Address
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                      {loggedUser.email}
                    </p>
                  </div>

                </div>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                    ☎
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {loggedUser.phoneNo || "Not available"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Password */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 md:col-span-2">
                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">
                    🔒
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Password
                    </p>

                    <p className="mt-1 text-sm font-semibold tracking-wider text-slate-800">
                      ••••••••
                    </p>
                  </div>

                </div>
              </div>

            </div>

            {/* Account Status */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600">
                ✓
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Account Active
                </p>

                <p className="text-xs text-emerald-700">
                  Your student account is ready to use.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Account Information */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Type
            </p>

            <p className="mt-2 text-base font-bold text-slate-900">
              Student
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Portal
            </p>

            <p className="mt-2 text-base font-bold text-slate-900">
              Ezio Exam Hub
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Status
            </p>

            <p className="mt-2 text-base font-bold text-emerald-600">
              Active
            </p>
          </div>

        </section>

      </main>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update your account password
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleUpdatePassword}>

              <div className="space-y-5 px-6 py-6">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>

                  <input
                    type="text"
                    value={loggedUser.name || ""}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="text"
                    value={loggedUser.email || ""}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={loggedUser.phoneNo || ""}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={isUpdating}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-600">
              ✓
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Password Updated
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your password has been updated successfully.
            </p>

            <button
              type="button"
              onClick={() => setIsSuccessOpen(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default UserProfile;
