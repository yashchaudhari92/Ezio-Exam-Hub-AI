import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import $ from "jquery";
import API_BASE_URL from "../../helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function ExamCheck() {
    const { testId } = useParams();
    const [teacherName, setTeacherName] = useState("");
    const [testName, setTestName] = useState("");
    const [attempts, setAttempts] = useState([]);
    const [institute, setInstitute] = useState(null);
    const allAttemptsRef = React.useRef([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [givenMarks, setGivenMarks] = useState({});

    useEffect(() => {
        const teacher = JSON.parse(localStorage.getItem("loggedTeacher"));
        if (teacher?.teacherName) {
            setTeacherName(teacher.teacherName);
        }
        if (teacher?.institude) {
            setInstitute({ institude: teacher.institude });
        }
    }, []);
  // SUCCESS MODAL
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setShowSuccessModal(true);
  };
  // LOAD ALL ATTEMPTS BY INSTITUTE
    useEffect(() => {
        if (testId) {
        loadAttemptsByTest(testId);
        }
    }, [testId]);

    function loadAttemptsByTest(testId) {
        $.ajax({
        url: `${API_BASE_URL}/api/exam/by-test/${testId}`,
        type: "GET",
        success: (data) => {
            const reversedData = [...data].reverse();
            setAttempts(reversedData);
            allAttemptsRef.current = reversedData;
            if (reversedData.length > 0) {
                setTestName(reversedData[0].test?.topicName);
            }
        },
        error: (err) => {
            console.error("Failed to fetch attempts", err);
        },
        });
    }
    function handleSearch(e) {
        const keyword = e.target.value.toLowerCase().trim();
        if (keyword === "") {
            setAttempts(allAttemptsRef.current);
            return;
        }
        const filtered = allAttemptsRef.current.filter(a =>
            a.userName?.toLowerCase().includes(keyword) ||
            a.userEmail?.toLowerCase().includes(keyword) ||
            a.test?.topicName?.toLowerCase().includes(keyword)
        );
        setAttempts(filtered);
    }
  // View Test 
  const [attemptDetails, setAttemptDetails] = useState(null);
  function viewAttempt(id) {
    $.get(`${API_BASE_URL}/api/exam/attempt/${id}`, (data) => {
        setAttemptDetails(data);
        const savedMarks = {};
        data.answers.forEach(ans => {
        if (ans.marksObtained !== null && ans.marksObtained !== undefined) {
            savedMarks[ans.questionId] = ans.marksObtained;
        }
        });
        setGivenMarks(savedMarks);
        const modalElement = document.getElementById("viewAttemptModal");
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
    });
  }
  // Download Full Report
    function downloadFullReport() {

        if (!attempts || attempts.length === 0) {
            alert("No exam attempts to download");
            return;
        }

        if (!institute) {
            alert("Institute information not available");
            return;
        }

        const doc = new jsPDF("p", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(institute.institude, pageWidth / 2, 15, { align: "center" });
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Exam Report", pageWidth / 2, 25, { align: "center" });
        doc.setFontSize(11);
        doc.text(`Test Name: ${testName}`, 15, 35);
        doc.text(`Teacher: ${teacherName}`, pageWidth - 15, 35, {
            align: "right",
        });
        doc.line(15, 40, pageWidth - 15, 40);
        const tableColumn = [
            "Sr No",
            "Candidate Name",
            "Email",
            "Test Name",
            "Exam Type",
            "Total Marks",
            "Result",
            "Date",
        ];
        const tableRows = attempts.map((a, index) => ([
            index + 1,
            a.userName,
            a.userEmail,
            a.test?.topicName,
            a.test?.examType,
            a.result === "PENDING" ? "Pending" : a.totalMarks,
            a.result,
            new Date(a.attemptedAt).toLocaleDateString(),
        ]));
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: "grid",
            styles: {
                fontSize: 8,
                halign: "center",
            },
            headStyles: {
                fillColor: [0, 0, 0],
                textColor: 255,
            },
            didParseCell: function (data) {
                if (data.section === "body" && data.column.index === 6) {
                    if (data.cell.raw === "PASS") {
                        data.cell.styles.fillColor = [200, 255, 200];
                    }
                    if (data.cell.raw === "FAIL") {
                        data.cell.styles.fillColor = [255, 200, 200];
                    }
                    if (data.cell.raw === "PENDING") {
                        data.cell.styles.fillColor = [220, 220, 220];
                    }
                }
            },
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.save(`${testName.replace(/\s+/g, "_")}_Exam_Report.pdf`);
    }
    // Table Responsive Start
    // Condidate Attempt Table
    const [expandedAttempt, setExpandedAttempt] = useState(null);
    const toggleAttemptRow = (id) => {
        setExpandedAttempt(expandedAttempt === id ? null : id);
    };
    // View Test
    const [expandedRow, setExpandedRow] = useState(null);
    const toggleRow = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };
    // Table Responsive End
    const submitEvaluation = () => {
        $.ajax({
            url: `${API_BASE_URL}/api/exam/evaluate/${attemptDetails.id}`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
            marks: givenMarks,
            teacherName: teacherName,
            teacherEmail: JSON.parse(localStorage.getItem("loggedTeacher")).email
            }),
            success: () => {
            showSuccess("Exam Evaluated Successfully");
            loadAttemptsByTest(testId);
            window.bootstrap.Modal.getInstance(
                document.getElementById("viewAttemptModal")
            ).hide();
            },
            error: (err) => {
            alert(err.responseText);
            }
        });
    };
  return (
    <div className="container p-0">
      <h1 className="bg-warning p-4">{teacherName} - Check Exam</h1>
      <div className="d-lg-flex justify-content-between align-items-center px-2 my-3">
        <h3>Test Name : {testName}</h3>
      </div>
      <div className="row justify-content-between px-2 align-items-center">
        <div className="col-md-6 mb-2">
          <button className="btn btn-primary" onClick={downloadFullReport}>
            Download Report
          </button>
        </div>
        <div className="col-md-3 mb-2 text-lg-end">
           <input className="form-control border border-dark"
              type="text" onChange={handleSearch}
              placeholder="search student name or test name..."/>
        </div>
      </div>
        <div className="w-100 overflow-scroll">
            <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark text-center">
                    <tr>
                        {/* Mobile Toggle */}
                        <th className="d-md-none">+</th>
                        <th>Sr. No</th>
                        <th>Candidate Name</th>
                        <th className="">Test Name</th>
                        {/* Mobile Result */}
                        <th className="d-none">Review Test</th>
                        <th className="">Result</th>
                        <th className="d-none d-md-table-cell">Total Marks</th>
                        <th className="d-none d-md-table-cell">Date & Time</th>
                        <th className="d-none d-md-table-cell">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {attempts.length === 0 ? (
                        <tr>
                        <td colSpan="13" className="text-center">
                            No exam attempts found
                        </td>
                        </tr>
                    ) : (
                        attempts.map((a, i) => (
                        <React.Fragment key={a.id}>
                            <tr>
                            <td className="text-center d-md-none">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => toggleAttemptRow(a.id)} >
                                {expandedAttempt === a.id ? "-" : "+"}
                                </button>
                            </td>
                            <td>{i + 1}</td>
                            <td>{a.userName}</td>
                            <td>{a.test?.topicName}</td>
                            <td className="">
                                {a.result === "PENDING" ? (
                                    <span className="badge bg-secondary text-white">Pending</span>
                                ) : a.result === "PASS" ? (
                                    <span className="badge bg-success">PASS</span>
                                ) : (
                                    <span className="badge bg-danger">FAIL</span>
                                )}
                            </td>
                            <td className="d-none d-md-table-cell">
                                {a.result === "PENDING" ? (
                                    <span className="badge bg-secondary text-white">Pending</span>
                                    ) : (
                                    a.totalMarks
                                )}
                            </td>
                            <td className="d-none d-md-table-cell">
                                {new Date(a.attemptedAt).toLocaleString()}
                            </td>
                            <td className="d-none d-md-table-cell">
                                <button className="btn btn-info btn-sm" onClick={() => viewAttempt(a.id)} >
                                View Test
                                </button>
                            </td>
                            </tr>
                            {/* Mobile Expand Row */}
                            {expandedAttempt === a.id && (
                            <tr className="d-md-none bg-light">
                                <td colSpan="5">
                                <div className="p-2">                        
                                    <p className="mb-1">
                                        <b>Result : </b>
                                        {a.result === "PENDING" ? (
                                            <span className="badge bg-secondary text-white">Pending</span>
                                            ) : a.result === "PASS" ? (
                                            <span className="badge bg-success">PASS</span>
                                            ) : (
                                            <span className="badge bg-danger">FAIL</span>
                                        )}
                                    </p>
                                    <p className="mb-1"><b>Total Marks:</b> {a.result === "PENDING" ? (
                                        <span className="badge bg-secondary text-white">Pending</span>
                                        ) : (
                                        a.totalMarks
                                        )}
                                    </p>
                                    <p className="mb-1">
                                    <b>Date & Time:</b>{" "}
                                    {new Date(a.attemptedAt).toLocaleString()}
                                    </p>
                                    <div className="d-flex gap-2 mt-2">
                                    <button className="btn btn-info btn-sm" onClick={() => viewAttempt(a.id)}>
                                        View Test
                                    </button>
                                    </div>
                                </div>
                                </td>
                            </tr>
                            )}
                        </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        <div className="modal fade" id="viewAttemptModal">
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Exam Review</h5>
                        <button className="btn-close btn-close-white" data-bs-dismiss="modal" ></button>
                    </div>
                    <div className="modal-body">
                        <div className="table-responsive" style={{ maxHeight: "80vh" }}>
                            <table className="table table-bordered align-middle">
                                <thead className="table-dark text-center">
                                    <tr>
                                        <th className="d-md-none">+</th>
                                        {/* <th>Sr. No</th> */}
                                        <th className="d-none d-md-table-cell">Sr. No</th>
                                        <th style={{ width: "100%" }}>Question</th>
                                        <th className="d-none d-md-table-cell px-3">Check</th>
                                        <th className="d-none d-md-table-cell">Student Answer</th>
                                        <th className="d-none d-md-table-cell">Correct Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attemptDetails?.answers.map((a, i) => (
                                    <React.Fragment key={i}>
                                        <tr> 
                                            <td className="text-center d-md-none">
                                                <button className="btn btn-sm btn-outline-primary" onClick={() => toggleRow(i)} >
                                                    {expandedRow === i ? "-" : "+"}
                                                </button>
                                            </td>
                                            <td className="d-none d-md-table-cell text-center fw-bold">{i + 1}</td>
                                            <td>{a.questionText}</td>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-semibold">
                                                    Marks
                                                </span>
                                                <input type="number" step="0.5" min="0" max={a.marks} style={{ width: "90px" }} className="form-control form-control-sm" value={givenMarks[a.questionId] ?? ""}
                                                    onChange={(e) => { const value = e.target.value;
                                                        if (value === "") {
                                                            setGivenMarks(prev => {
                                                            const copy = { ...prev };
                                                            delete copy[a.questionId];
                                                            return copy;
                                                            });
                                                            return;
                                                        }
                                                        const num = Number(value);
                                                        if (num < 0) return;
                                                        if (num > a.marks) return;
                                                        setGivenMarks(prev => ({
                                                            ...prev,
                                                            [a.questionId]: num
                                                        }));
                                                    }}
                                                />
                                                </div>
                                            <td className="d-none d-md-table-cell">
                                                {a.selectedAnswer ? (
                                                a.correct ? (
                                                    <span className="text-success fw-semibold">
                                                    {a.selectedAnswer}
                                                    </span>
                                                ) : (
                                                    <span className="text-danger fw-semibold">
                                                    {a.selectedAnswer}
                                                    </span>
                                                )
                                                ) : (
                                                <span className="text-warning">
                                                    Not Answered
                                                </span>
                                                )}
                                            </td>
                                            <td className="d-none d-md-table-cell text-success fw-semibold">
                                                {a.correctAnswer}
                                            </td>
                                        </tr>
                                        {expandedRow === i && (
                                        <tr className="d-md-none bg-light">
                                            <td colSpan="2">
                                            <div className="p-2">
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="fw-semibold">
                                                        Marks
                                                    </span>
                                                    <input type="number" step="0.5" min="0" max={a.marks} style={{ width: "80px" }} className="form-control form-control-sm" value={givenMarks[a.questionId] ?? ""}
                                                        onChange={(e) => { const value = e.target.value;
                                                            if (value === "") {
                                                                setGivenMarks(prev => {
                                                                const copy = { ...prev };
                                                                delete copy[a.questionId];
                                                                return copy;
                                                                });
                                                                return;
                                                            }
                                                            const num = Number(value);
                                                            if (num < 0) return;
                                                            if (num > a.marks) return;
                                                            setGivenMarks(prev => ({
                                                                ...prev,
                                                                [a.questionId]: num
                                                            }));
                                                        }}
                                                    />
                                                </div>
                                                <hr className="m-0" />
                                                <p className="mb-1">
                                                <b>Student Answer:</b>{" "}
                                                    {a.selectedAnswer ? (
                                                        a.correct ? (
                                                        <span className="text-success fw-semibold">
                                                            {a.selectedAnswer}
                                                        </span>
                                                        ) : (
                                                        <span className="text-danger fw-semibold">
                                                            {a.selectedAnswer}
                                                        </span>
                                                        )
                                                    ) : (
                                                        <span className="text-warning">
                                                        Not Answered
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="mb-1">
                                                <b>Correct Answer:</b>{" "}
                                                <span className="text-success fw-semibold">
                                                    {a.correctAnswer}
                                                </span>
                                                </p>
                                            </div>
                                            </td>
                                        </tr>
                                        )}
                                    </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                            <div className="d-flex justify-content-between justify-content-lg-end align-items-center px-3 gap-4">
                                <button className="btn btn-danger mb-2" data-bs-dismiss="modal" >Cancel</button>
                                <button className="btn btn-info mb-2" onClick={submitEvaluation}>Submit Exam</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      {showSuccessModal && (
        <div className="modal show d-block" style={{ background: "#00000090" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-check-circle-fill me-2"></i> Success
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSuccessModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center py-4 d-flex justify-content-center align-items-center flex-column">
                <svg xmlns="http://www.w3.org/2000/svg" className="text-success mb-3" width="60" height="60" fill="currentColor" viewBox="0 0 16 16" >
                  <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z" />
                </svg>
                <h5 id="successMessage" className="fw-semibold text-dark">
                  {successMessage}
                </h5>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <button type="button" className="btn btn-success px-4" onClick={() => setShowSuccessModal(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ExamCheck;