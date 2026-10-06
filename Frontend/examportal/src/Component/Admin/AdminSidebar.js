import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/Images/logo.png";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

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

  const closeMobileSidebar = () => {
    if (!isDesktop) {
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: "▦",
    },
    {
      name: "All Organization",
      path: "/admin/allInstitute",
      icon: "▥",
    },
    {
      name: "All Tests",
      path: "/admin/uploadTest",
      icon: "✓",
    },
    {
      name: "All Candidates",
      path: "/admin/users",
      icon: "◉",
    },
    {
      name: "All Exams Results",
      path: "/admin/exmaAttempt",
      icon: "▤",
    },
    {
      name: "Plans",
      path: "/admin/plans",
      icon: "◇",
    },
    {
      name: "Purchase Plans",
      path: "/admin/purchaseplans",
      icon: "₹",
    },
    {
      name: "Help Messages",
      path: "/admin/helps",
      icon: "?",
    },
    {
      name: "Qr Code",
      path: "/admin/qrcode",
      icon: "▦",
    },
    {
      name: "Admin Access",
      path: "/admin/adminAccess",
      icon: "◆",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Topbar */}
      {!isDesktop && (
        <header className="fixed left-0 right-0 top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
              <img
                src={logo}
                alt="Ezio Exam Hub"
                className="h-7 w-auto object-contain"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                Administration
              </p>
              <h2 className="text-sm font-bold text-slate-800">
                Admin Panel
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:bg-slate-100"
            aria-label="Toggle admin menu"
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
            ? "fixed left-0 top-0 h-screen w-64"
            : `fixed left-0 top-0 h-screen w-72 transition-transform duration-300 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
        }`}
      >
        {/* Brand Header */}
        <div className="border-b border-slate-800 bg-white px-5 py-3">
          <Link
            to="/"
            onClick={closeMobileSidebar}
            className="flex flex-col items-center"
          >
            <div className="flex h-12 w-full items-center justify-center rounded-lg bg-slate-50">
              <img
                src={logo}
                alt="Ezio Exam Hub"
                className="h-8 w-auto object-contain"
              />
            </div>

            <h6 className="mt-2 text-sm font-semibold text-[#6da146]">
              Ezio Exam Hub
            </h6>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-3 px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Admin Menu
            </p>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ${
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
          <Link
            to="/admin/logout"
            onClick={closeMobileSidebar}
            className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm text-slate-400 group-hover:text-red-300">
              ↪
            </span>

            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;



// import { Link, useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";
// import logo from "../assets/Images/logo.png";

// function AdminSidebar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

//   const location = useLocation();

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

//   const closeMobileSidebar = () => {
//     if (!isDesktop) {
//       setIsOpen(false);
//     }
//   };

//   const menuItems = [
//     {
//       name: "Dashboard",
//       path: "/admin/dashboard",
//       icon: "▦",
//     },
//     {
//       name: "All Organization",
//       path: "/admin/allInstitute",
//       icon: "▥",
//     },
//     {
//       name: "All Tests",
//       path: "/admin/uploadTest",
//       icon: "✓",
//     },
//     {
//       name: "All Candidates",
//       path: "/admin/users",
//       icon: "◉",
//     },
//     {
//       name: "All Exams Results",
//       path: "/admin/exmaAttempt",
//       icon: "▤",
//     },
//     {
//       name: "Plans",
//       path: "/admin/plans",
//       icon: "◇",
//     },
//     {
//       name: "Purchase Plans",
//       path: "/admin/purchaseplans",
//       icon: "₹",
//     },
//     {
//       name: "Help Messages",
//       path: "/admin/helps",
//       icon: "?",
//     },
//     {
//       name: "Qr Code",
//       path: "/admin/qrcode",
//       icon: "▦",
//     },
//     {
//       name: "Admin Access",
//       path: "/admin/adminAccess",
//       icon: "◆",
//     },
//   ];

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   return (
//     <>
//       {/* Mobile Topbar */}
//       {!isDesktop && (
//         <header className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
//           <div className="flex items-center gap-3">
//             <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
//               <img
//                 src={logo}
//                 alt="Ezio Exam Hub"
//                 className="h-7 w-auto object-contain"
//               />
//             </div>

//             <div>
//               <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
//                 Administration
//               </p>
//               <h2 className="text-sm font-bold text-slate-800">
//                 Admin Panel
//               </h2>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={toggleSidebar}
//             className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:bg-slate-100"
//             aria-label="Toggle admin menu"
//           >
//             ☰
//           </button>
//         </header>
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
//         className={`z-50 flex flex-col bg-slate-900 text-white shadow-xl transition-transform duration-300 ${
//           isDesktop
//             ? "sticky top-0 min-h-screen w-60 shrink-0 translate-x-0"
//             : `fixed left-0 top-0 min-h-screen w-72 ${
//                 isOpen ? "translate-x-0" : "-translate-x-full"
//               }`
//         }`}
//       >
//         {/* Logo Section */}
//         <div className="border-b border-white/10 bg-white px-4 py-4">
//           <Link
//             to="/"
//             onClick={closeMobileSidebar}
//             className="flex flex-col items-center"
//           >
//             <div className="flex h-12 w-full items-center justify-center rounded-lg bg-slate-50">
//               <img
//                 src={logo}
//                 alt="Ezio Exam Hub"
//                 className="h-8 w-auto object-contain"
//               />
//             </div>

//             <h6 className="mt-2 text-sm font-semibold text-[#6da146]">
//               Ezio Exam Hub
//             </h6>
//           </Link>
//         </div>

//         {/* Navigation */}
//         <div className="flex-1 overflow-y-auto px-3 py-4">
//           <div className="mb-3 px-3">
//             <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
//               Admin Menu
//             </p>
//           </div>

//           <nav className="space-y-1">
//             {menuItems.map((item) => {
//               const active = isActive(item.path);

//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   onClick={closeMobileSidebar}
//                   className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
//                     active
//                       ? "bg-indigo-600 text-white shadow-sm"
//                       : "text-slate-300 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <span
//                     className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm ${
//                       active
//                         ? "bg-white/15 text-white"
//                         : "bg-white/5 text-slate-400 group-hover:text-white"
//                     }`}
//                   >
//                     {item.icon}
//                   </span>

//                   <span className="truncate">{item.name}</span>
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Logout */}
//         <div className="border-t border-white/10 p-3">
//           <Link
//             to="/admin/logout"
//             onClick={closeMobileSidebar}
//             className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
//           >
//             <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/5 text-sm text-slate-400 group-hover:text-red-300">
//               ↪
//             </span>

//             <span>Logout</span>
//           </Link>
//         </div>
//       </aside>
//     </>
//   );
// }

// export default AdminSidebar;
