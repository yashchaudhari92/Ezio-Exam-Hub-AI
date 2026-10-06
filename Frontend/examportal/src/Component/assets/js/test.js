import $ from "jquery";
// import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from "bootstrap";
import API_BASE_URL from "../../../helper.js";
window.bootstrap = bootstrap;
$(document).ready(function () {
    // Function to show success modal
    function showSuccessModal(message) {
        $("#successMessage").text(message);
        const modal = new window.bootstrap.Modal(document.getElementById("successModal"));
        modal.show();
    }
    $("#addTestForm").submit(function (e) {
        e.preventDefault();
        let formData = new FormData(this);
        $.ajax({
            url: `${API_BASE_URL}/api/test/add`,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                showSuccessModal("Test Added Successfully!");                
                const formEl = document.getElementById("addTestForm");
                if (formEl) formEl.reset();
                const modal = window.bootstrap.Modal.getInstance(document.getElementById("testModal"));
                modal.hide();
                // loadTests();
            },
            error: function (xhr, status, error) {
                alert("Error: " + xhr.responseText);
                console.log(error);
            }
        });
    });
    window.viewQuestions = function (testId) {
        $.ajax({
            url: API_BASE_URL + "/api/test/questions/" + testId,
            type: "GET",
            success: function (questions) {
                let rows = "";
                questions.forEach(q => {
                    rows += `
                        <tr>
                            <td>${q.questions || ""}</td>
                            <td>${q.option1 || ""}</td>
                            <td>${q.option2 || ""}</td>
                            <td>${q.option3 || ""}</td>
                            <td>${q.option4 || ""}</td>
                            <td>${q.answer || ""}</td>
                            <td>${q.marks || ""}</td>
                        </tr>
                    `;
                });
                $("#questionTableBody").html(rows);
                $("#questionsModal").modal("show");
            },
            error: function (xhr) {
                console.log(xhr);
                alert("Failed to load question set!");
            }
        });
    };

    // LOAD QUESTIONS
    function viewQuestions(testId) {
        $.ajax({
            url: `${API_BASE_URL}/api/test/questions/` + testId,
            type: "GET",
            success: function (questions) {
                let qRows = "";
                questions.forEach((q) => {
                    qRows += `
                        <tr>
                            <td>${q.questions}</td>
                            <td>${q.option1}</td>
                            <td>${q.option2}</td>
                            <td>${q.option3}</td>
                            <td>${q.option4}</td>
                            <td>${q.answer}</td>
                            <td>${q.marks}</td>
                        </tr>`;
                });
                $("#questionTableBody").html(qRows);
                const modalEl = document.getElementById("questionsModal");
                const modal = new window.bootstrap.Modal(modalEl);
                modal.show();
            },
            error: function () {
                alert("Error loading questions!");
            }
        });
    }
    window.viewQuestions = viewQuestions;



    // Delete Functionality
    let testIdToDelete = null;
    // Open modal on delete button click
    $(document).on("click", ".delete-btn", function() {
        testIdToDelete = $(this).data("id");
        // $("#deleteConfirmModal").modal("show");
        const modalEl = document.getElementById("deleteConfirmModal");
        const modal = new window.bootstrap.Modal(modalEl);
        modal.show();
    });

    // Confirm delete in modal
    $("#confirmDeleteBtn").click(function() {
        if (!testIdToDelete) return;

        $.ajax({
            url: `${API_BASE_URL}/api/test/delete/${testIdToDelete}`,
            type: "DELETE",
            success: function () {
                showSuccessModal("Test Delete Successfully!");
                // loadTests();

                const modal = window.bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"));
                modal.hide();
            },
            error: function () {
                alert("Failed to delete test!");
            },
            complete: function () {

                const modal = window.bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"));
                modal.hide();
                testIdToDelete = null;
            }
        });
    });

});
