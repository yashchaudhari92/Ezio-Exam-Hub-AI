// AdminLogout.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove login session
    localStorage.removeItem("adminLogin");

    // Redirect to login page
    navigate("/adminLogin");
  }, [navigate]);

  return null;
}

export default AdminLogout;
