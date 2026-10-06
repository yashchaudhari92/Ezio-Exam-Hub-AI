import { Navigate } from "react-router-dom";

function InstituteProtectedRoute({ children }) {
  const institute = JSON.parse(localStorage.getItem("loggedInstitute"));

  if (!institute) {
    return <Navigate to="/instituteLogin" replace />;
  }

  return children;
}

export default InstituteProtectedRoute;