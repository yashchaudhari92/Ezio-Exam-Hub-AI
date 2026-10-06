import { Outlet } from "react-router-dom";
import InstituteSidebar from "./InstituteSidebar";

function InstituteBase() {
  return (
    <div className="min-h-screen bg-slate-50">
      <InstituteSidebar />

      <main className="min-h-screen min-w-0 overflow-x-hidden md:ml-[220px]">
        <Outlet />
      </main>
    </div>
  );
}

export default InstituteBase;


// import { Outlet } from "react-router-dom";
// import InstituteSidebar from "./InstituteSidebar";

// function InstituteBase() {
//   return (
//     <div className="flex min-h-screen bg-slate-50">
//       <InstituteSidebar />

//       <main className="min-w-0 flex-1 overflow-x-hidden">
//         <Outlet />
//       </main>
//     </div>
//   );
// }

// export default InstituteBase;
