import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../helper";
import '../assets/css/usercustom.css';

function TeacherDashboard() {

    const [teacherName, setTeacherName] = useState("");
    const [tests, setTests] = useState([]);  
    const [filteredTests, setFilteredTests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const teacher = JSON.parse(localStorage.getItem("loggedTeacher"));

        if (teacher?.teacherName) {
        setTeacherName(teacher.teacherName);
        }

        // Important Part
        if (teacher?.institude) {
        fetchTests(teacher.institude);
        }

    }, []);

    // Fetch Only Theory Test
    const fetchTests = (institude) => {
        fetch(`${API_BASE_URL}/api/test/by-institute/${institude}`)
        .then(res => res.json())
        .then(data => {
        const theoryTests = data.filter(
            (t) => t.examType?.toLowerCase() === "theory"
        );
        setTests(theoryTests);
        setFilteredTests(theoryTests); // default only theory
        })
        .catch(err => console.error("Test Fetch Error:", err));
    };
    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase().trim();
        const normalizedKeyword = keyword.replace(/\s+/g, "");
        if (!normalizedKeyword) {
        setFilteredTests(tests);
        return;
        }
        const result = tests.filter((t) => {
        const topicName = (t.topicName || "")
            .toLowerCase()
            .replace(/\s+/g, "");
        const examType = (t.examType || "")
            .toLowerCase()
            .replace(/\s+/g, "");
        const language = (t.language || "")
            .toLowerCase()
            .replace(/\s+/g, "");
        const duration = (t.duration || "")
            .toLowerCase()
            .replace(/\s+/g, "");
        const note = (t.note || "")
            .toLowerCase()
            .replace(/\s+/g, "");
        const totalMarks = t.testTotalMarks?.toString() || "";
        const totalQuestion = t.testTotalQuestion?.toString() || "";
        const passingMarks = t.passingMarks?.toString() || "";
        return (
            topicName.includes(normalizedKeyword) ||
            examType.includes(normalizedKeyword) ||
            language.includes(normalizedKeyword) ||
            duration.includes(normalizedKeyword) ||
            note.includes(normalizedKeyword) ||
            totalMarks.includes(normalizedKeyword) ||
            totalQuestion.includes(normalizedKeyword) ||
            passingMarks.includes(normalizedKeyword)
        );
        });
        setFilteredTests(result);
    };
  return (
    <div>
      <h1 className="bg-warning p-4">Welcome {teacherName}</h1>
      <div className="container">
        <div className="row px-2 mb-3 justify-content-between aling-items-center">
            <div className="col-md-3 text-lg-start">
                <h2 className="">All Test</h2>
            </div>
            <div className="col-md-3 d-flex gap-2 px-3">
                <input className="form-control border border-dark" type="text" onChange={handleSearch} placeholder="Search test, Exam Type or language..." />
            </div>
        </div>
        <div className="row">
          {filteredTests.length === 0 ? (
            <p className="text-center mt-4">No Tests Available</p>
          ) : (
            [...filteredTests].reverse().map((test) => (
              <div className="col-md-4 mb-4" key={test.id}>
                <div className="border p-3 shadow rounded">
                  <h4 className="text-danger">{test.topicName}</h4>
                  {/* <h6>{test.institude}</h6> */}
                  <div className="d-flex justify-content-between">
                    <p className="mb-1"><b>Questions:</b> {test.testTotalQuestion}</p>
                    <p className="mb-1"><b>Marks:</b> {test.testTotalMarks}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <p className="mb-1"><b>Language:</b> {test.language}</p>
                    <p className="mb-1"><b>Duration:</b> {test.duration}</p>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <p className="mb-1"><b>Exam Type:</b> {test.examType}</p>
                  </div>
                  <div className="text-center">
                    <button
                        className="btn btn-warning fw-semibold"
                        onClick={() => navigate(`/teacher/checkExam/${test.id}`)}
                        >
                        View Report
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default TeacherDashboard;