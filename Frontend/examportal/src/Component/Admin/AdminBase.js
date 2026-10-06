import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

function AdminBase() {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLogin");

    if (!isLoggedIn) {
      navigate("/adminLogin");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-64">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminBase;



// import React, { useEffect } from "react";
// import { Outlet, useNavigate } from "react-router-dom";
// import AdminSidebar from "./AdminSidebar";

// function AdminBase() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const isLoggedIn = localStorage.getItem("adminLogin");

//     if (!isLoggedIn) {
//       navigate("/adminLogin");
//     }
//   }, [navigate]);

//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       {/* LEFT SIDEBAR */}
//       <AdminSidebar />

//       {/* RIGHT CONTENT */}
//       <main className="min-w-0 flex-1 overflow-x-hidden">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default AdminBase;

