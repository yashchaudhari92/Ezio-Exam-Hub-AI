import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../helper";
import '../assets/css/usercustom.css';
import logo from '../assets/Images/logo.png';

function TeacherSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [institute, setInstitute] = useState(null);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleResize = () => {
      const isNowDesktop = window.innerWidth >= 768;
      setIsDesktop(isNowDesktop);
      if (isNowDesktop) setIsOpen(true);
      else setIsOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Institute name Logo
  useEffect(() => {
    const teacher = JSON.parse(localStorage.getItem("loggedTeacher"));
    if (teacher?.institude) {
      fetchInstitute(teacher.institude);
    }
  }, []);
  function fetchInstitute(instituteName) {
    fetch(`${API_BASE_URL}/api/institute/by-name/${instituteName}`)
      .then(res => res.json())
      .then(data => setInstitute(data))
      .catch(err => console.error("Institute fetch error", err));
  }

  function logout() {
    localStorage.removeItem("loggedTeacher");
    window.location.href = "/teacherLogin";
  }

  return (
    <>
      {/* Topbar for mobile only */}
      {!isDesktop && (
        <div className="user-topbar">
          <h2>Teacher Panel</h2>
          <button className="menu-btn" onClick={toggleSidebar}>☰</button>
        </div>
      )}
      <div className={`user-sidebar bg-blue ${isDesktop ? "desktop" : "mobile"} ${isOpen ? "show" : ""}`}>
        <div className="text-center bg-white py-2">
          <Link className="navbar-brand" to="/">
            <img
              src={
                institute?.instituteLogo
                  ? API_BASE_URL + institute.intituteLogo
                  : logo
              }
              alt="Institute Logo"
              style={{ height: "50px", objectFit: "contain" }}
            />
          </Link>

          <h6 style={{ color: "#6da146" }}>
            {institute?.instituteName || "Institute"}
          </h6>
        </div>

        <ul className="p-3">
          <li className="menuLi py-2 ps-2 d-flex gap-4">
            <Link className="text-decoration-none w-100" to="/teacher/dashboard">Dashboard</Link>
          </li>
          <li className="menuLi py-2 ps-2 d-flex gap-4">
            <Link className="text-decoration-none w-100" onClick={logout}>
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default TeacherSidebar;