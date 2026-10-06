import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

function UserBase() {
  return (
    <div className="flex min-h-screen bg-slate-50">

      <UserSidebar />

      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
}

export default UserBase;