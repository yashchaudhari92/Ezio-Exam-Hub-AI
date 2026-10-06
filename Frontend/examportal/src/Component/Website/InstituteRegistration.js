import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../helper";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";

function InstituteRegistration() {

  /* ================= EMAIL CHECK ================= */
  const [emailError, setEmailError] = useState("");
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    $("#email").on("keyup change", function () {

      let email = $(this).val();

      if (email.length < 5) {
        setEmailError("Please enter valid email");
        setEmailValid(false);
        return;
      }

      $.ajax({
        url: API_BASE_URL + "/api/institute/check-email",
        method: "GET",
        data: { email },

        success: function (exists) {

          if (exists) {
            setEmailError("❌ Email already exists!");
            setEmailValid(false);
          } else {
            setEmailError("✔ Email is available");
            setEmailValid(true);
          }
        },

        error: function () {
          setEmailError("Unable to check email");
          setEmailValid(false);
        }
      });
    });

    return () => {
      $("#email").off("keyup change");
    };

  }, []);

  /* ================= STATES ================= */

  const [plans, setPlans] = useState([]);

  const [form, setForm] = useState({
    instituteName: "",
    phoneNo: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    instituteType: "",
    plan: "",
  });

  const [logoFile, setLogoFile] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const [processingPayment, setProcessingPayment] = useState(false);

  /* ================= LOAD PLANS ================= */

  useEffect(() => {

    fetch(`${API_BASE_URL}/api/plan/active`)
      .then(res => res.json())
      .then(setPlans)
      .catch(err =>
        console.error("Error loading active plans", err)
      );

  }, []);

  /* ================= HANDLERS ================= */

  function handleInput(e) {

    const { name, value } = e.target;

    setForm(s => ({
      ...s,
      [name]: value
    }));
  }

  function handlePlanChange(e) {

    const planId = e.target.value;

    const p = plans.find(
      x => String(x.id) === planId
    );

    if (p) {

      setSelectedPlan(p);

      setForm(s => ({
        ...s,
        plan: `${p.duration} (₹${p.price})`
      }));
    }
  }

  /* ================= OPEN PAYMENT ================= */

  function openPaymentModal(e) {

    e.preventDefault();

    if (!form.plan) {
      return alert("Select a plan!");
    }

    if (!logoFile) {
      return alert("Please upload organization logo!");
    }

    if (form.password !== form.confirmPassword) {
      return alert("Password not matched!");
    }

    if (!emailValid) {
      return alert("Please enter a valid and available email!");
    }

    setShowPaymentModal(true);
  }

  /* ================= PHONEPE PAYMENT ================= */

  async function proceedToPhonePe() {

    if (!selectedPlan) {
      alert("Please select a plan!");
      return;
    }

    if (processingPayment) {
      return;
    }

    try {

      setProcessingPayment(true);

      /*
       * STEP 1
       * Register organization in inactive state.
       *
       * This uses the new PhonePe registration endpoint.
       * No payment screenshot is required.
       */

      const registrationData = new FormData();

      registrationData.append(
        "instituteName",
        form.instituteName
      );

      registrationData.append(
        "phoneNo",
        form.phoneNo
      );

      registrationData.append(
        "email",
        form.email
      );

      registrationData.append(
        "password",
        form.password
      );

      registrationData.append(
        "address",
        form.address
      );

      registrationData.append(
        "instituteType",
        form.instituteType
      );

      registrationData.append(
        "plan",
        form.plan
      );

      registrationData.append(
        "instituteLogo",
        logoFile
      );

      const registrationResponse = await fetch(
        `${API_BASE_URL}/api/institute/register-phonepe`,
        {
          method: "POST",
          body: registrationData
        }
      );

      const registrationResult =
        await registrationResponse.json().catch(() => null);

      if (!registrationResponse.ok) {

        const errorMessage =
          typeof registrationResult === "string"
            ? registrationResult
            : "Organization registration failed.";

        throw new Error(errorMessage);
      }

      /*
       * Backend returns the newly created organization.
       */

      const instituteId = registrationResult.id;

      if (!instituteId) {
        throw new Error(
          "Organization ID was not returned by server."
        );
      }

      /*
       * STEP 2
       * Create PhonePe payment.
       *
       * Amount is sent in paise.
       * Plan price is currently in rupees.
       */

      const amountInPaise =
        Number(selectedPlan.price) * 100;

      const paymentRequest = {

        instituteId: instituteId,

        instituteName:
          registrationResult.instituteName ||
          form.instituteName,

        instituteEmail:
          registrationResult.email ||
          form.email,

        planDuration:
          selectedPlan.duration,

        planPrice:
          String(selectedPlan.price),

        amount:
          amountInPaise
      };

      const paymentResponse = await fetch(
        `${API_BASE_URL}/api/payment/create`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(paymentRequest)
        }
      );

      const paymentResult =
        await paymentResponse.json().catch(() => null);

      if (!paymentResponse.ok) {

        const errorMessage =
          typeof paymentResult === "string"
            ? paymentResult
            : paymentResult?.message ||
              "Unable to create PhonePe payment.";

        throw new Error(errorMessage);
      }

      if (
        !paymentResult ||
        !paymentResult.success ||
        !paymentResult.checkoutUrl
      ) {

        throw new Error(
          paymentResult?.message ||
          "PhonePe checkout URL was not received."
        );
      }

      /*
       * Store merchant order ID temporarily.
       *
       * The callback page can use this later
       * to verify payment status.
       */

      localStorage.setItem(
        "phonePeMerchantOrderId",
        paymentResult.merchantOrderId
      );

      localStorage.setItem(
        "phonePeInstituteId",
        String(instituteId)
      );

      /*
       * Close our modal before opening PhonePe.
       */

      setShowPaymentModal(false);

      /*
       * STEP 3
       * Redirect organization to PhonePe Checkout.
       */

      window.location.href =
        paymentResult.checkoutUrl;

    } catch (error) {

      console.error(
        "PhonePe payment error:",
        error
      );

      alert(
        error.message ||
        "Something went wrong while starting payment."
      );

      setProcessingPayment(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="container-fluid bg-blue py-5">

      <div className="container">

        <div className="row justify-content-center">

          <div className="col-md-8">

            <div className="card">

              <div className="card-header bg-warning">

                <h4 className="text-center">
                  Create Organization Account
                </h4>

              </div>

              <div className="card-body">

                <form
                  onSubmit={openPaymentModal}
                  encType="multipart/form-data"
                >

                  <div className="row">

                    {/* ORGANIZATION NAME */}

                    <div className="col-md-12 mb-3">

                      <label className="fw-semibold">
                        Organization Name *
                      </label>

                      <input
                        className="form-control"
                        name="instituteName"
                        value={form.instituteName}
                        onChange={handleInput}
                        required
                      />

                    </div>

                    {/* PHONE */}

                    <div className="col-md-6 mb-3">

                      <label className="fw-semibold">
                        Phone No *
                      </label>

                      <input
                        className="form-control"
                        name="phoneNo"
                        type="number"
                        value={form.phoneNo}
                        onChange={(e) => {

                          if (
                            e.target.value.length <= 10
                          ) {
                            handleInput(e);
                          }

                        }}
                        required
                      />

                    </div>

                    {/* EMAIL */}

                    <div className="col-md-6 mb-3">

                      <label className="fw-semibold">
                        Email *
                      </label>

                      <input
                        id="email"
                        type="email"
                        className="form-control"
                        name="email"
                        value={form.email}
                        onChange={handleInput}
                        required
                      />

                      <small
                        style={{
                          color:
                            emailValid
                              ? "green"
                              : "red"
                        }}
                      >
                        {emailError}
                      </small>

                    </div>

                    {/* PASSWORD */}

                    <div className="col-md-6 mb-3">

                      <label className="fw-semibold">
                        Password *
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={form.password}
                        onChange={handleInput}
                        required
                      />

                    </div>

                    {/* CONFIRM PASSWORD */}

                    <div className="col-md-6 mb-3">

                      <label className="fw-semibold">
                        Confirm Password *
                      </label>

                      <input
                        type="password"
                        className="form-control"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleInput}
                        required
                      />

                    </div>

                    {/* ADDRESS */}

                    <div className="col-md-12 mb-3">

                      <label className="fw-semibold">
                        Address *
                      </label>

                      <textarea
                        className="form-control"
                        name="address"
                        value={form.address}
                        onChange={handleInput}
                        required
                      />

                    </div>

                    {/* LOGO */}

                    <div className="col-md-6 mb-3">

                      <label className="fw-semibold">
                        Organization Logo *
                      </label>

                      <input
                        type="file"
                        className="form-control"
                        name="instituteLogo"
                        onChange={(e) =>
                          setLogoFile(
                            e.target.files[0]
                          )
                        }
                        required
                      />

                    </div>

                    {/* ORGANIZATION TYPE */}

                    <div className="col-md-6 mb-3">

                      <label className="fw-semibold">
                        Organization Type *
                      </label>

                      <select
                        className="form-control"
                        name="instituteType"
                        value={form.instituteType}
                        onChange={handleInput}
                        required
                      >

                        <option value="">
                          --Select--
                        </option>

                        <option>
                          Coaching Center
                        </option>

                        <option>
                          Training Institute
                        </option>

                        <option>
                          School
                        </option>

                        <option>
                          College
                        </option>

                        <option>
                          Academy
                        </option>

                        <option>
                          Computer Institute
                        </option>

                        <option>
                          Tuition Class
                        </option>

                      </select>

                    </div>

                    {/* PLAN */}

                    <div className="col-md-12 mb-3">

                      <label className="fw-semibold">
                        Select Plan *
                      </label>

                      <select
                        className="form-control"
                        value={
                          selectedPlan
                            ? selectedPlan.id
                            : ""
                        }
                        onChange={handlePlanChange}
                        required
                      >

                        <option value="">
                          --Select Plan--
                        </option>

                        {plans.map((p) => (

                          <option
                            key={p.id}
                            value={p.id}
                          >
                            {p.duration} (₹{p.price})
                          </option>

                        ))}

                      </select>

                    </div>

                    {/* PAYMENT BUTTON */}

                    <div className="col-md-12 d-flex justify-content-center align-items-center mb-3">

                      <button
                        className="btn btn-success"
                        type="submit"
                      >
                        Proceed to Payment
                      </button>

                    </div>

                  </div>

                </form>

              </div>

            </div>

            <p className="text-center text-white pt-3">

              Do you have an account?

              {" "}

              <a
                className="text-white"
                href="/instituteLogin"
              >
                Login Now
              </a>

            </p>

            {/* ================= PHONEPE PAYMENT MODAL ================= */}

            {showPaymentModal &&
              selectedPlan && (

                <div
                  className="modal show d-block"
                  style={{
                    background: "#00000088"
                  }}
                >

                  <div className="modal-dialog modal-dialog-centered">

                    <div className="modal-content p-3">

                      <div className="modal-header">

                        <h5 className="modal-title">
                          PhonePe Payment
                        </h5>

                        <button
                          className="btn-close"
                          onClick={() =>
                            setShowPaymentModal(false)
                          }
                          disabled={processingPayment}
                        ></button>

                      </div>

                      <div className="modal-body text-center">

                        <h5 className="mb-3">
                          {selectedPlan.duration}
                        </h5>

                        <h3 className="text-success mb-3">
                          ₹{selectedPlan.price}
                        </h3>

                        <p className="text-muted">
                          You will be redirected to
                          PhonePe secure checkout to
                          complete your payment.
                        </p>

                        <button
                          className="btn btn-primary w-100 mt-3"
                          onClick={proceedToPhonePe}
                          disabled={processingPayment}
                        >

                          {processingPayment
                            ? "Processing..."
                            : "Proceed to PhonePe"}

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              )}

          </div>

        </div>

      </div>

      {/* ================= SUCCESS MODAL ================= */}

      {showSuccessModal && (

        <div
          className="modal show d-block"
          style={{
            background: "#00000088"
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header bg-success text-white">

                <h5>
                  Success
                </h5>

                <button
                  className="btn-close text-white"
                  onClick={() =>
                    setShowSuccessModal(false)
                  }
                ></button>

              </div>

              <div className="modal-body text-center">

                <h5>
                  {successMessage}
                </h5>

                <button
                  className="btn btn-success mt-3"
                  onClick={() =>
                    setShowSuccessModal(false)
                  }
                >
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

export default InstituteRegistration;


// import React, { useEffect, useState } from "react";
// import API_BASE_URL from "../../helper";
// import $ from "jquery";
// import "bootstrap/dist/css/bootstrap.min.css";

// function InstituteRegistration() {
//   /* ================= EMAIL CHECK ================= */
//   const [emailError, setEmailError] = useState("");
//   const [emailValid, setEmailValid] = useState(false);

//   const generateUpiQr = (upiId, upiName, amount) => {
//     const payload = `upi://pay?pa=${upiId}&pn=${upiName}&am=${amount}&cu=INR`;
//     return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
//   };
//   useEffect(() => {
//     $("#email").on("keyup change", function () {
//       let email = $(this).val();
//       if (email.length < 5) {
//         setEmailError("Please enter valid email");
//         setEmailValid(false);
//         return;
//       }
//       $.ajax({
//         url: API_BASE_URL + "/api/institute/check-email",
//         method: "GET",
//         data: { email },
//         success: function (exists) {
//           if (exists) {
//             setEmailError("❌ Email already exists!");
//             setEmailValid(false);
//           } else {
//             setEmailError("✔ Email is available");
//             setEmailValid(true);
//           }
//         },
//       });
//     });
//   }, []);
//   /* ================= STATES ================= */
//   const [plans, setPlans] = useState([]);
//   const [upi, setUpi] = useState(null);
//   const [form, setForm] = useState({
//     instituteName: "",
//     phoneNo: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     address: "",
//     instituteType: "",
//     plan: "",
//   });

//   const [logoFile, setLogoFile] = useState(null);
//   const [paymentImgFile, setPaymentImgFile] = useState(null);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   /* ================= LOAD DATA ================= */
//   useEffect(() => {
//     fetch(`${API_BASE_URL}/api/plan/active`)
//       .then(res => res.json())
//       .then(setPlans)
//       .catch(err => console.error("Error loading active plans", err));
//   }, []);
//   useEffect(() => {
//     fetch(`${API_BASE_URL}/api/qrcode/first`)
//       .then(res => res.json())
//       .then(setUpi);
//   }, []);
//   /* ================= HANDLERS ================= */
//   function handleInput(e) {
//     const { name, value } = e.target;
//     setForm(s => ({ ...s, [name]: value }));
//   }
//   function handlePlanChange(e) {
//     const planId = e.target.value;
//     const p = plans.find(x => String(x.id) === planId);
//     if (p) {
//       setSelectedPlan(p);
//       setForm(s => ({
//         ...s,
//         plan: `${p.duration} (₹${p.price})`,
//       }));
//     }
//   }
//   function openPaymentModal(e) {
//     e.preventDefault();
//     if (!form.plan) return alert("Select a plan!");
//     if (form.password !== form.confirmPassword)
//       return alert("Password not matched!");
//     setShowPaymentModal(true);
//   }
//   async function submitRegistration() {
//     if (!paymentImgFile) return alert("Upload payment screenshot");
//     const fd = new FormData();
//     Object.keys(form).forEach(key => fd.append(key, form[key]));
//     fd.append("paymentImg", paymentImgFile);
//     fd.append("instituteLogo", logoFile);
//     const res = await fetch(`${API_BASE_URL}/api/institute/register`, {
//       method: "POST",
//       body: fd,
//     });
//     if (!res.ok) {
//       alert("Registration failed");
//       return;
//     }
//     setShowPaymentModal(false);
//     setSuccessMessage("Registration Successfully!");
//     setShowSuccessModal(true);
//     setTimeout(() => {
//       window.location.href = "/instituteLogin";
//     }, 1500);
//   }
//   return (
//     <div className="container-fluid bg-blue py-5">
//       <div className="container">
//         <div className="row justify-content-center">
//           <div className="col-md-8">
//             <div className="card">
//               <div className="card-header bg-warning">
//                 <h4 className="text-center">Create Organization Account</h4>
//               </div>
//               <div className="card-body">                
//                   <form onSubmit={openPaymentModal} encType="multipart/form-data">
//                       <div className="row">
//                         <div className="col-md-12 mb-3">
//                             <label className="fw-semibold">Organization Name *</label>
//                             <input className="form-control" name="instituteName"
//                             value={form.instituteName} onChange={handleInput} required />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="fw-semibold">Phone No *</label>
//                             <input className="form-control" name="phoneNo" type="number"
//                             value={form.phoneNo} onChange={(e) => {
//                               if (e.target.value.length <= 10) {
//                                 handleInput(e);
//                               }
//                             }} required />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                           <label className="fw-semibold">Email *</label>
//                           <input type="email" className="form-control" name="email"
//                             value={form.email} onChange={handleInput} required />
//                           <small style={{ color: emailValid ? "green" : "red" }}>  {emailError} </small>
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="fw-semibold">Password *</label>
//                             <input type="password" className="form-control" name="password"
//                             value={form.password} onChange={handleInput} required />
//                       </div>
//                       <div className="col-md-6 mb-3">
//                             <label className="fw-semibold">Confirm Password *</label>
//                             <input type="password" className="form-control" name="confirmPassword"
//                             value={form.confirmPassword} onChange={handleInput} required />
//                         </div>
//                         <div className="col-md-12 mb-3">
//                             <label className="fw-semibold">Address *</label>
//                             <textarea className="form-control" name="address"
//                             value={form.address} onChange={handleInput} required/>
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="fw-semibold">Organization Logo *</label>
//                             <input type="file" className="form-control" name="instituteLogo" onChange={(e) => setLogoFile(e.target.files[0])} required />
//                         </div>
//                         <div className="col-md-6 mb-3">
//                             <label className="fw-semibold">Organization Type *</label>
//                             <select className="form-control" name="instituteType"
//                             value={form.instituteType} onChange={handleInput} required>
//                                 <option value="">--Select--</option>
//                                 <option>Coaching Center</option>
//                                 <option>Training Institute</option>
//                                 <option>School</option>
//                                 <option>College</option>
//                                 <option>Academy</option>
//                                 <option>Computer Institute</option>
//                                 <option>Tuition Class</option>
//                             </select>
//                         </div>
//                         <div className="col-md-12 mb-3">
//                             <label className="fw-semibold">Select Plan *</label>
//                             <select className="form-control" onChange={handlePlanChange}>
//                             <option value="">--Select Plan--</option>
//                             {plans.map((p) => (
//                                 <option key={p.id} value={p.id}>
//                                 {p.duration} (₹{p.price})
//                                 </option>
//                             ))}
//                             </select>
//                         </div>
//                         <div className="col-md-12 d-flex justify-content-center align-items-center mb-3">
//                             <button className="btn btn-success" type="submit">
//                                 Proceed to Payment
//                             </button>
//                         </div>
//                       </div>
//                   </form>
//               </div>
//             </div>
//             <p className="text-center text-white pt-3">Do you have an account? <a className="text-white" href="/instituteLogin">Login Now</a></p>
//             {/* PAYMENT MODAL */}
//             {showPaymentModal && upi && selectedPlan && (
//               <div className="modal show d-block" style={{ background: "#00000088" }}>
//                 <div className="modal-dialog modal-dialog-centered">
//                   <div className="modal-content p-3">
//                     <div className="modal-header">
//                           <h5 className="modal-title">Pay — ₹{selectedPlan.price}</h5>
//                           <button className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
//                       </div>
//                     <div className="d-flex justify-content-center align-items-center my-3">                      
//                       <img src={generateUpiQr( upi.upiId, upi.upiName, selectedPlan.price )} alt="UPI QR" style={{ width: 250 }} />
//                     </div>
//                     <div className="mt-3">
//                       <label className="fw-semibold">Upload Payment Screenshot *</label>
//                       <input type="file" className="form-control" onChange={(e) => setPaymentImgFile(e.target.files[0])} />
//                     </div>
//                     <button className="btn btn-primary mt-3" onClick={submitRegistration}>
//                       Complete Registration
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* SUCCESS MODAL */}
//       {showSuccessModal && (
//           <div className="modal show d-block" style={{ background: "#00000088" }}>
//           <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header bg-success text-white">
//                     <h5>Success</h5>
//                     <button className="btn-close text-white" onClick={() => setShowSuccessModal(false)}></button>
//                 </div>
//                 <div className="modal-body text-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" class="text-success mb-3" width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
//                         <path d="M16 8A8 8 0 11.001 8a8 8 0 0115.999 0zM6.97 11.03a.75.75 0 001.06 0l4.992-4.992a.75.75 0 10-1.06-1.06L7.5 9.939 4.53 6.97a.75.75 0 10-1.06 1.06l3.5 3.5z"/>
//                     </svg>
//                     <h5>{successMessage}</h5>
//                     <p>Your account will be activated soon.</p>
//                     <button className="btn btn-success mt-3" onClick={() => setShowSuccessModal(false)} >OK </button>
//                 </div>
//               </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// export default InstituteRegistration;
