import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";
import { useNavigate } from "react-router-dom";

function PhonePeCallback() {

  const navigate = useNavigate();

  const [status, setStatus] = useState("VERIFYING");
  const [message, setMessage] = useState(
    "Verifying your PhonePe payment..."
  );

  useEffect(() => {

    let intervalId = null;
    let attempts = 0;

    const merchantOrderId =
      localStorage.getItem("phonePeMerchantOrderId");

    if (!merchantOrderId) {

      setStatus("FAILED");

      setMessage(
        "Payment information was not found. Please contact support."
      );

      return;
    }

    const checkPaymentStatus = async () => {

      try {

        attempts++;

        const response = await fetch(
          `${API_BASE_URL}/api/payment/status/${merchantOrderId}`
        );

        const result = await response.json();

        console.log(
          "PhonePe Payment Status:",
          result
        );

        if (!response.ok) {

          throw new Error(
            result?.message ||
            "Unable to verify payment."
          );
        }

        /*
         * PAYMENT SUCCESS
         */
        if (result.status === "SUCCESS") {

          if (intervalId) {
            clearInterval(intervalId);
          }

          setStatus("SUCCESS");

          setMessage(
            "Payment successful! Your organization account has been activated."
          );

          localStorage.removeItem(
            "phonePeMerchantOrderId"
          );

          localStorage.removeItem(
            "phonePeInstituteId"
          );

          setTimeout(() => {

            navigate("/instituteLogin");

          }, 2500);

          return;
        }

        /*
         * PAYMENT FAILED
         */
        if (result.status === "FAILED") {

          if (intervalId) {
            clearInterval(intervalId);
          }

          setStatus("FAILED");

          setMessage(
            "Payment failed. Your organization account has not been activated."
          );

          return;
        }

        /*
         * PAYMENT STILL PENDING
         */

        setStatus("VERIFYING");

        setMessage(
          "Payment is being verified. Please wait..."
        );

        /*
         * Stop polling after 20 attempts.
         * 20 × 3 seconds = approximately 1 minute.
         */

        if (attempts >= 20) {

          if (intervalId) {
            clearInterval(intervalId);
          }

          setStatus("PENDING");

          setMessage(
            "Payment verification is taking longer than expected. Please check again shortly."
          );
        }

      } catch (error) {

        console.error(
          "PhonePe verification error:",
          error
        );

        if (attempts >= 20) {

          if (intervalId) {
            clearInterval(intervalId);
          }

          setStatus("FAILED");

          setMessage(
            error.message ||
            "Unable to verify payment."
          );
        }
      }
    };

    /*
     * First verification immediately.
     */
    checkPaymentStatus();

    /*
     * Then check every 3 seconds.
     */
    intervalId = setInterval(
      checkPaymentStatus,
      3000
    );

    return () => {

      if (intervalId) {
        clearInterval(intervalId);
      }

    };

  }, [navigate]);

  return (

    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "#f5f7fb"
      }}
    >

      <div
        className="card shadow"
        style={{
          width: "450px",
          maxWidth: "90%"
        }}
      >

        <div className="card-body text-center p-5">

          {/* VERIFYING */}

          {status === "VERIFYING" && (

            <>
              <div
                className="spinner-border text-primary mb-4"
                role="status"
                style={{
                  width: "4rem",
                  height: "4rem"
                }}
              >
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>

              <h4 className="mb-3">
                Verifying Payment
              </h4>

              <p className="text-muted">
                {message}
              </p>

              <small className="text-muted">
                Please do not close this page.
              </small>
            </>

          )}

          {/* SUCCESS */}

          {status === "SUCCESS" && (

            <>

              <div
                className="rounded-circle bg-success text-white d-flex justify-content-center align-items-center mx-auto mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "40px"
                }}
              >
                ✓
              </div>

              <h3 className="text-success mb-3">
                Payment Successful
              </h3>

              <p className="text-muted">
                {message}
              </p>

              <p className="text-muted">
                Redirecting you to organization login...
              </p>

            </>

          )}

          {/* FAILED */}

          {status === "FAILED" && (

            <>

              <div
                className="rounded-circle bg-danger text-white d-flex justify-content-center align-items-center mx-auto mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "40px"
                }}
              >
                ✕
              </div>

              <h3 className="text-danger mb-3">
                Payment Failed
              </h3>

              <p className="text-muted">
                {message}
              </p>

              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  navigate("/instituteRegistration")
                }
              >
                Back to Registration
              </button>

            </>

          )}

          {/* PENDING */}

          {status === "PENDING" && (

            <>

              <div
                className="rounded-circle bg-warning text-dark d-flex justify-content-center align-items-center mx-auto mb-4"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "40px"
                }}
              >
                !
              </div>

              <h3 className="text-warning mb-3">
                Payment Verification Pending
              </h3>

              <p className="text-muted">
                {message}
              </p>

              <button
                className="btn btn-primary mt-3"
                onClick={() =>
                  window.location.reload()
                }
              >
                Check Again
              </button>

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default PhonePeCallback;