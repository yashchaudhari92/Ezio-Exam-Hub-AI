function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= PAGE HEADER ================= */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Welcome to Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage your Ezio Exam Hub platform.
          </p>
        </div>
      </div>

      {/* ================= POWER BI DASHBOARD ================= */}
      <div className="px-3 py-4 sm:px-5 lg:px-6">
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:p-3">
          <div className="w-full overflow-x-auto">
            <iframe
              title="Ezio_Exam_Dashboard_Live"
              src="https://app.powerbi.com/view?r=eyJrIjoiN2Q2ZTdlMmEtNDE3NC00MThkLTgyMTItYzIxNGQyMTRjMmUxIiwidCI6ImY3NTAxN2UyLTUwODktNGQ5Yy04NjkyLWM1OWQwMzU4YzdlNSJ9"
              className="block h-[1060px] w-full min-w-[900px] border-0"
              allowFullScreen
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
