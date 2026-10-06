import $ from "jquery";
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

    // LOGIN FUNCTION
    $("#loginForm").submit(function (e) {
        e.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();

        let loginData = {
            email: email,
            password: password
        };
        $.ajax({
            url: `${API_BASE_URL}/api/user/login`,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(loginData),

            success: function (user) {
                localStorage.setItem("loggedUser", JSON.stringify(user));
                showSuccessModal("Login Successfully!");
                setTimeout(() => {
                    window.location.href = "/";
                }, 1200);  
            },
            error: function (xhr) {
                alert(xhr.responseText || "Login failed!");
            }
        });
    });
});
