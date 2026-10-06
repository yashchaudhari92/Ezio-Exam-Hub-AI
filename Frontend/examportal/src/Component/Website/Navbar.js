import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Images/logo.png";

function Navbar() {
  const [user, setUser] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const loggedUser = localStorage.getItem("loggedUser");
      const loggedInstitute = localStorage.getItem("loggedInstitute");
      const loggedTeacher = localStorage.getItem("loggedTeacher");

      setUser(loggedUser ? JSON.parse(loggedUser) : null);
      setInstitute(loggedInstitute ? JSON.parse(loggedInstitute) : null);
      setTeacher(loggedTeacher ? JSON.parse(loggedTeacher) : null);
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);

    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "/login";
  }

  function instituteLogout() {
    localStorage.removeItem("loggedInstitute");
    window.location.href = "/instituteLogin";
  }

  function teacherLogout() {
    localStorage.removeItem("loggedTeacher");
    window.location.href = "/teacherLogin";
  }

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <Link 
          to="/" 
          onClick={closeMenu} 
          className="group flex items-center gap-3 !no-underline transition-transform duration-200 hover:scale-[1.01]"
        >
          <div className="relative flex items-center justify-center">
            <img 
              src={logo} 
              alt="Ezio Exam Hub" 
              className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          </div>
          <div className="flex flex-col">
            <h6 className="m-0 text-xl font-extrabold tracking-tight text-emerald-600 transition-colors duration-200 group-hover:text-emerald-700">
              Ezio Exam Hub
            </h6>
            <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
              Online Examination Platform
            </span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-slate-700 transition-all duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
          aria-label="Toggle navigation"
        >
          <svg 
            className={`h-6 w-6 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Navigation Items */}
        <div className={`${menuOpen ? "animate-fadeIn block" : "hidden"} absolute left-0 top-full w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-lg px-5 py-4 shadow-xl transition-all duration-300 md:static md:block md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none`}>
          <ul className="m-0 flex list-none flex-col items-stretch gap-1.5 p-0 md:flex-row md:items-center md:gap-2">

            <li>
              <Link 
                onClick={closeMenu} 
                to="/" 
                className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 !no-underline transition-all duration-200 hover:bg-indigo-50/80 hover:text-indigo-600 active:scale-95"
              >
                Home
              </Link>
            </li>

            <li>
              <Link 
                onClick={closeMenu} 
                to="/about" 
                className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 !no-underline transition-all duration-200 hover:bg-indigo-50/80 hover:text-indigo-600 active:scale-95"
              >
                About
              </Link>
            </li>

            <li>
              <Link 
                onClick={closeMenu} 
                to="/quiz" 
                className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 !no-underline transition-all duration-200 hover:bg-indigo-50/80 hover:text-indigo-600 active:scale-95"
              >
                Quiz
              </Link>
            </li>

            {/* Institute Dropdown */}
            {institute && (
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200/60 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-600 md:w-auto"
                >
                  <span className="truncate max-w-[150px]">{institute.instituteName}</span>
                  <svg className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xl transition-all duration-200 md:absolute md:right-0 md:mt-2 md:w-52">
                    <Link 
                      onClick={closeMenu} 
                      to="/institute/dashboard" 
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 !no-underline transition-colors duration-150 hover:bg-indigo-50/60 hover:text-indigo-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <div className="border-t border-slate-100"></div>
                    <button 
                      onClick={instituteLogout} 
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}

            {/* User Dropdown */}
            {!institute && user && (
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200/60 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-600 md:w-auto"
                >
                  <span className="truncate max-w-[150px]">{user.name}</span>
                  <svg className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xl transition-all duration-200 md:absolute md:right-0 md:mt-2 md:w-52">
                    <Link 
                      onClick={closeMenu} 
                      to="/user/dashboard" 
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 !no-underline transition-colors duration-150 hover:bg-indigo-50/60 hover:text-indigo-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <div className="border-t border-slate-100"></div>
                    <button 
                      onClick={logout} 
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}

            {/* Teacher Dropdown */}
            {!institute && !user && teacher && (
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200/60 bg-slate-50/80 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-600 md:w-auto"
                >
                  <span className="truncate max-w-[150px]">{teacher.teacherName}</span>
                  <svg className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xl transition-all duration-200 md:absolute md:right-0 md:mt-2 md:w-52">
                    <Link 
                      onClick={closeMenu} 
                      to="/teacher/dashboard" 
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 !no-underline transition-colors duration-150 hover:bg-indigo-50/60 hover:text-indigo-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    <div className="border-t border-slate-100"></div>
                    <button 
                      onClick={teacherLogout} 
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition-colors duration-150 hover:bg-rose-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            )}

            {/* Unauthenticated Actions */}
            {!user && !institute && !teacher && (
              <>
                <li>
                  <Link 
                    onClick={closeMenu} 
                    to="/login" 
                    className="block rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 !no-underline transition-all duration-200 hover:bg-indigo-50/80 hover:text-indigo-600 active:scale-95"
                  >
                    Student Login
                  </Link>
                </li>

                <li className="mt-2 md:mt-0 md:ml-2">
                  <Link 
                    onClick={closeMenu} 
                    to="/instituteRegistration" 
                    className="block rounded-xl bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white !no-underline shadow-md shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-600/30 active:scale-95"
                  >
                    Create Account
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;