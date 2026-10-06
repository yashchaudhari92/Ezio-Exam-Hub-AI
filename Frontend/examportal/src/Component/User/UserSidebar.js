import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";
import logo from "../assets/Images/logo.png";

function UserSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [institute, setInstitute] = useState(null);
  const [logoSrc, setLogoSrc] = useState(logo);

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

  /* --------------------------------
     Load institute
  -------------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");

    if (!storedUser) return;

    try {
      const user = JSON.parse(storedUser);

      if (user?.institute) {
        fetchInstitute(user.institute);
      }
    } catch (error) {
      console.error("Invalid loggedUser data", error);
    }
  }, []);

  function fetchInstitute(instituteName) {
    fetch(`${API_BASE_URL}/api/institute/by-name/${instituteName}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch institute");
        }

        return res.json();
      })
      .then((data) => {
        setInstitute(data);

        /*
         * Backend field intentionally remains:
         * intituteLogo
         */
        if (data?.intituteLogo) {
          setLogoSrc(`${API_BASE_URL}${data.intituteLogo}`);
        } else {
          setLogoSrc(logo);
        }
      })
      .catch((error) => {
        console.error("Institute fetch error", error);
        setLogoSrc(logo);
      });
  }

  function logout() {
    localStorage.removeItem("loggedUser");
    window.location.href = "/login";
  }

  function closeMobileSidebar() {
    if (!isDesktop) {
      setIsOpen(false);
    }
  }

  const menuItems = [
    {
      label: "Dashboard",
      path: "/user/dashboard",
      icon: "⌂",
    },
    {
      label: "Profile",
      path: "/user/profile",
      icon: "◉",
    },
    {
      label: "History",
      path: "/user/history",
      icon: "▤",
    },
  ];

  return (
    <>
      {/* =====================================
          MOBILE TOP BAR
      ===================================== */}
      {!isDesktop && (
        <div className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              Student Portal
            </p>

            <p className="text-sm font-bold text-slate-800">
              User Panel
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      )}

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
          onClick={closeMobileSidebar}
        />
      )}

      {/* =====================================
          SIDEBAR
      ===================================== */}
      <aside
        className={`
          z-50 flex flex-col bg-[#0f172a] text-white shadow-lg
          transition-transform duration-300

          ${
            isDesktop
              ? "sticky top-0 h-screen w-[220px] shrink-0 translate-x-0"
              : `fixed left-0 top-0 h-screen w-[260px] ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`
          }
        `}
      >
        {/* =================================
            BRAND
        ================================= */}
        <div className="shrink-0 border-b border-slate-200 bg-white">

          <Link
            to="/"
            onClick={closeMobileSidebar}
            className="block px-4 py-4"
          >
            {/* Logo container */}
            <div className="flex h-[70px] items-center justify-center rounded-xl bg-slate-50">
              <img
                src={logoSrc}
                alt="Institute Logo"
                onError={() => setLogoSrc(logo)}
                className="max-h-[52px] max-w-[150px] object-contain"
              />
            </div>

            {/* Institute name */}
            <p className="mt-2 truncate text-center text-xs font-semibold text-slate-700">
              {institute?.instituteName || "Institute"}
            </p>
          </Link>

        </div>

        {/* =================================
            MENU
        ================================= */}
        <div className="flex-1 overflow-y-auto px-3 py-5">

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Menu
          </p>

          <nav className="space-y-1.5">

            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className="
                  group flex items-center gap-3
                  rounded-lg px-3 py-2.5
                  text-sm font-medium text-slate-300
                  transition-all duration-200
                  hover:bg-white/10 hover:text-white
                "
              >
                <span
                  className="
                    flex h-8 w-8 shrink-0
                    items-center justify-center
                    rounded-lg
                    bg-white/5
                    text-base text-slate-300
                    transition
                    group-hover:bg-indigo-500/20
                    group-hover:text-indigo-300
                  "
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}

          </nav>
        </div>

        {/* =================================
            LOGOUT
        ================================= */}
        <div className="shrink-0 border-t border-white/10 p-3">

          <button
            type="button"
            onClick={logout}
            className="
              flex w-full items-center gap-3
              rounded-lg px-3 py-2.5
              text-left text-sm font-medium
              text-slate-300
              transition
              hover:bg-red-500/10
              hover:text-red-300
            "
          >
            <span
              className="
                flex h-8 w-8
                items-center justify-center
                rounded-lg
                bg-white/5
                text-base
              "
            >
              ↪
            </span>

            <span>Logout</span>
          </button>

        </div>
      </aside>
    </>
  );
}

export default UserSidebar;
