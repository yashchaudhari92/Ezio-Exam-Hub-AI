import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../helper";
import logo from "../assets/Images/logo.png";

function InstituteSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [institute, setInstitute] = useState(null);

  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;

      setIsDesktop(desktop);
      setIsOpen(desktop);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const inst = JSON.parse(localStorage.getItem("loggedInstitute"));

    if (inst) {
      setInstitute(inst);
    }
  }, []);

  function instituteLogout() {
    localStorage.removeItem("loggedInstitute");
    window.location.href = "/instituteLogin";
  }

  const closeMobileSidebar = () => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/institute/dashboard",
      icon: "⌂",
    },
    {
      name: "Add Test",
      path: "/institute/addTest",
      icon: "＋",
    },
    {
      name: "Candidates",
      path: "/institute/userRegistration",
      icon: "◉",
    },
    {
      name: "Exam Attempts",
      path: "/institute/userExamAttempts",
      icon: "▤",
    },
    {
      name: "Plan History",
      path: "/institute/planpurchases",
      icon: "◈",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Topbar */}
      {!isDesktop && (
        <header className="fixed left-0 right-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
              <img
                src={
                  institute?.intituteLogo
                    ? API_BASE_URL + institute.intituteLogo
                    : logo
                }
                alt="Institute Logo"
                className="h-7 w-auto object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                Institute Portal
              </p>

              <h2 className="truncate text-sm font-bold text-slate-800">
                {institute?.instituteName || "Institute Panel"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl text-slate-700 transition hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </header>
      )}

      {/* Mobile Overlay */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`z-50 flex flex-col bg-slate-900 text-white shadow-xl ${
          isDesktop
            ? "fixed left-0 top-0 h-screen w-[220px]"
            : `fixed left-0 top-0 h-screen w-[260px] transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }`}
      >
        {/* Brand Header */}
        <div className="border-b border-slate-800 bg-white px-4 py-4">
          <Link
            to="/"
            onClick={closeMobileSidebar}
            className="block"
          >
            <div className="flex h-[72px] items-center justify-center rounded-xl bg-slate-50">
              <img
                src={
                  institute?.intituteLogo
                    ? API_BASE_URL + institute.intituteLogo
                    : logo
                }
                alt="Institute Logo"
                className="max-h-14 max-w-[150px] object-contain"
              />
            </div>

            <p className="mt-2 truncate text-center text-xs font-semibold text-slate-700">
              {institute?.instituteName || "Institute"}
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Institute Management
          </p>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-white/5 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={instituteLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base text-slate-400 group-hover:text-red-300">
              ↪
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default InstituteSidebar;


// import { Link } from "react-router-dom";
// import { useState, useEffect } from "react";
// import API_BASE_URL from "../../helper";
// import logo from "../assets/Images/logo.png";

// function InstituteSidebar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
//   const [institute, setInstitute] = useState(null);

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       const isNowDesktop = window.innerWidth >= 768;

//       setIsDesktop(isNowDesktop);
//       setIsOpen(isNowDesktop);
//     };

//     handleResize();

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     const inst = JSON.parse(localStorage.getItem("loggedInstitute"));

//     if (inst) {
//       setInstitute(inst);
//     }
//   }, []);

//   function instituteLogout() {
//     localStorage.removeItem("loggedInstitute");
//     window.location.href = "/instituteLogin";
//   }

//   const closeMobileSidebar = () => {
//     if (!isDesktop) {
//       setIsOpen(false);
//     }
//   };

//   return (
//     <>
//       {/* Mobile Topbar */}
//       {!isDesktop && (
//         <div className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
//               Institute Portal
//             </p>

//             <h2 className="text-base font-bold text-slate-800">
//               Institute Panel
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={toggleSidebar}
//             className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl text-slate-700 transition hover:bg-slate-100"
//             aria-label="Toggle sidebar"
//           >
//             ☰
//           </button>
//         </div>
//       )}

//       {/* Mobile Overlay */}
//       {!isDesktop && isOpen && (
//         <div
//           className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
//           onClick={closeMobileSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`
//           z-50 flex flex-col bg-[#0f172a] text-white shadow-xl
//           transition-transform duration-300

//           ${
//             isDesktop
//               ? "sticky top-0 min-h-screen w-[220px] shrink-0 translate-x-0"
//               : `fixed left-0 top-0 min-h-screen w-[260px] ${
//                   isOpen ? "translate-x-0" : "-translate-x-full"
//                 }`
//           }
//         `}
//       >
//         {/* Logo Section */}
//         <div className="border-b border-white/10 bg-white px-4 py-3">
//           <Link
//             to="/"
//             onClick={closeMobileSidebar}
//             className="block"
//           >
//             <div className="flex h-[72px] items-center justify-center rounded-xl bg-slate-50">
//               <img
//                 src={
//                   institute?.intituteLogo
//                     ? API_BASE_URL + institute.intituteLogo
//                     : logo
//                 }
//                 alt="Institute Logo"
//                 className="max-h-14 max-w-[150px] object-contain"
//               />
//             </div>

//             <p className="mt-2 truncate text-center text-xs font-semibold text-slate-700">
//               {institute?.instituteName || "Institute"}
//             </p>
//           </Link>
//         </div>

//         {/* Navigation */}
//         <div className="flex-1 px-3 py-5">
//           <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
//             Institute Management
//           </p>

//           <nav className="space-y-1.5">

//             {/* Dashboard */}
//             <Link
//               to="/institute/dashboard"
//               onClick={closeMobileSidebar}
//               className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
//             >
//               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-indigo-500/20">
//                 ⌂
//               </span>

//               <span>Dashboard</span>
//             </Link>

//             {/* Add Test */}
//             <Link
//               to="/institute/addTest"
//               onClick={closeMobileSidebar}
//               className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
//             >
//               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-indigo-500/20">
//                 ＋
//               </span>

//               <span>Add Test</span>
//             </Link>

//             {/* Candidates */}
//             <Link
//               to="/institute/userRegistration"
//               onClick={closeMobileSidebar}
//               className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
//             >
//               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-indigo-500/20">
//                 ◉
//               </span>

//               <span>Candidates</span>
//             </Link>

//             {/* Exam Attempts */}
//             <Link
//               to="/institute/userExamAttempts"
//               onClick={closeMobileSidebar}
//               className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
//             >
//               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-indigo-500/20">
//                 ▤
//               </span>

//               <span className="leading-5">
//                 Exam Attempts
//               </span>
//             </Link>

//             {/* Plan History */}
//             <Link
//               to="/institute/planpurchases"
//               onClick={closeMobileSidebar}
//               className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
//             >
//               <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-indigo-500/20">
//                 ◈
//               </span>

//               <span>Plan History</span>
//             </Link>

//           </nav>
//         </div>

//         {/* Logout */}
//         <div className="border-t border-white/10 p-3">
//           <button
//             type="button"
//             onClick={instituteLogout}
//             className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
//           >
//             <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-red-500/10">
//               ↪
//             </span>

//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }

// export default InstituteSidebar;