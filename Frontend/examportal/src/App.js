import { BrowserRouter, Routes, Route } from "react-router-dom";
// Website
import Base from "./Component/Website/Base";
import Home from "./Component/Website/Home";
import About from "./Component/Website/About";
import Quiz from "./Component/Website/Quiz";
import Registration from "./Component/Website/Registration";
import Login from "./Component/Website/Login";
import TeacherLogin from "./Component/Website/TeacherLogin";
import Exam from "./Component/Website/Exam";
import AdminLogin from "./Component/Website/AdminLogin";

// Admin
import AdminDashboard from "./Component/Admin/AdminDashboard";
import AdminBase from "./Component/Admin/AdminBase";
import UploadTest from "./Component/Admin/UploadTest";
import Users from "./Component/Admin/Users";
import AdminPlan from "./Component/Admin/AdminPlan";
import Admin from "./Component/Admin/Admin";
import AdminLogout from "./Component/Admin/AdminLogout";

// User
import UserBase from "./Component/User/UserBase";
import UserDashboard from "./Component/User/UserDashboard";
import TestHistory from "./Component/User/TestHistory";
import UserProfile from "./Component/User/UserProfile";
import ExamAttempts from "./Component/Admin/ExamAttempts";

// Intitute
import InstituteDashboard from "./Component/Institude/InstituteDashboard";
import InstituteBase from "./Component/Institude/InstituteBase";
import InstituteTest from "./Component/Institude/IntituteTest";
import Teachers from "./Component/Institude/Teachers";
import InstituteExamAttempts from "./Component/Institude/InstituteExamAttempts";
import InstituteRegistration from "./Component/Website/InstituteRegistration";
import PhonePeCallback from "./Component/Website/PhonePeCallback";
import AllInstitute from "./Component/Admin/AllInstitute";
import IntituteLogin from "./Component/Website/InstituteLogin";
import PlanPurchases from "./Component/Institude/PlanPurchases";
import UserRegistration from "./Component/Institude/UserRegistration";
import PurchasePlans from "./Component/Admin/PurchasePlans";
import InstituteProtectedRoute from "./Component/Institude/InstituteProtectedRoute";
import TermCondition from "./Component/Website/TermCondition";
import PrivatPolicy from "./Component/Website/PrivatPolicy";
import Helps from "./Component/Admin/Helps";
import QrCode from "./Component/Admin/QrCode";

// Teacher
import TeacherBase from "./Component/Teacher/TeacherBase";
import TeacherDashboard from "./Component/Teacher/TeacherDashboard";
import ExamCheck from "./Component/Teacher/ExamCheck";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Webiste Routes */}
        <Route path="/" element={<Base />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="quiz" element={<Quiz />} />
          {/* <Route path="exam" element={<Exam />} /> */}
          <Route path="login" element={<Login />} />
          <Route path="teacherLogin" element={<TeacherLogin />} />
          <Route path="registration" element={<Registration />} />
          <Route path="instituteRegistration" element={<InstituteRegistration />} />
          <Route path="instituteLogin" element={<IntituteLogin />} />
          <Route path="term&conditions" element={<TermCondition />} />
          <Route path="privatepolicy" element={<PrivatPolicy />} />
        </Route>

        {/* Commone Pages */}
        <Route path="exam" element={<Exam />} />
        <Route path="adminLogin" element={<AdminLogin />} />

        {/* PhonePe Payment Callback */}
        <Route
          path="/payment/phonepe/callback"
          element={<PhonePeCallback />}
        />

        {/* User Routes */}
        <Route path="/user" element={<UserBase />} >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="history" element={<TestHistory />} />
        </Route>

        {/* Institute Routes */}
        <Route
          path="/institute" element={<InstituteProtectedRoute> <InstituteBase /> </InstituteProtectedRoute>}>
          <Route path="dashboard" element={<InstituteDashboard />} />
          <Route path="planpurchases" element={<PlanPurchases />} />
          <Route path="addTest" element={<InstituteTest />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="userRegistration" element={<UserRegistration />} />
          <Route path="userExamAttempts" element={<InstituteExamAttempts />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherBase />} >
          <Route path="dashboard" element={<TeacherDashboard />} />
          {/* <Route path="checkExam" element={<ExamCheck />} /> */}
          <Route path="checkExam/:testId" element={<ExamCheck />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminBase />} >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="plans" element={<AdminPlan />} />
          <Route path="allInstitute" element={<AllInstitute />} />
          <Route path="uploadTest" element={<UploadTest />} />
          <Route path="users" element={<Users />} />
          <Route path="exmaAttempt" element={<ExamAttempts />} />
          <Route path="purchaseplans" element={<PurchasePlans />} />
          <Route path="helps" element={<Helps />} />
          <Route path="adminAccess" element={<Admin />} />
          <Route path="qrcode" element={<QrCode />} />
          <Route path="logout" element={<AdminLogout />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
