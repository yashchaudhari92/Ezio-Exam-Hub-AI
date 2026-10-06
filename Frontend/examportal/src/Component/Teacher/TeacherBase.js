import { Outlet } from "react-router-dom";
import '../assets/css/institutecustom.css';
import TeacherSidebar from "./TeacherSidebar";

function TeacherBase() {

  return (
    <div className="institute-container container-fluid p-0 m-0">
      <TeacherSidebar />
      <div className="institute-content">
        <Outlet />
      </div>
    </div>
  );
}

export default TeacherBase;
