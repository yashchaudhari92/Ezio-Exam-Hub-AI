import React, { useEffect, useState } from "react";
import templateFile from "../assets/Images/template.xlsx";
import API_BASE_URL from "../../helper";

function Teachers() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [loggedInstitute, setLoggedInstitute] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const [form, setForm] = useState({
      institude: "",
      teacherName: "",
      phoneNo: "",
      email: "",
      password: "",
      confirmpassword: "",
      status: "",
    });
    const resetForm = () => {
      setForm({
        institude: loggedInstitute ? loggedInstitute.instituteName : "",
        teacherName: "",
        phoneNo: "",
        email: "",
        password: "",
        confirmpassword: "",
        status: "",
      });
    };
    useEffect(() => {
        const data = localStorage.getItem("loggedInstitute");
        if (data) {
            const inst = JSON.parse(data);
            setLoggedInstitute(inst);
            setForm((prev) => ({
            ...prev,
            institude: inst.instituteName,
            }));
        }
    }, []);
    useEffect(() => {
      fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
      const res = await fetch(`${API_BASE_URL}/api/teacher/all`);
      const data = await res.json();
      setTeachers(data);
    };

    const validateForm = () => {

      if (form.phoneNo.length !== 10) {
        alert("Phone number must be 10 digits");
        return false;
      }

      if (form.password !== form.confirmpassword) {
        alert("Password & Confirm Password not match");
        return false;
      }

      return true;
    };

    const handleAddTeacher = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const res = await fetch(`${API_BASE_URL}/api/teacher/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data);
        return;
      }

      fetchTeachers();
      resetForm();
      setShowAddModal(false);
      setSuccessMessage("Teacher Added Successfully");
      setShowSuccessModal(true);
    };

    const handleEdit = (teacher) => {
      setEditId(teacher.id);
      setForm({
        ...teacher,
        confirmpassword: teacher.password,
      });
      setShowEditModal(true);
    };

    const handleUpdateTeacher = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
      const res = await fetch(`${API_BASE_URL}/api/teacher/update/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data);
        return;
      }
      fetchTeachers();
      setShowEditModal(false);
      setEditId(null);
      setSuccessMessage("Teacher Updated Successfully");
      setShowSuccessModal(true);
    };

    const handleDelete = (id) => {
      setDeleteId(id);
      setShowDeleteModal(true);
    };
    const confirmDelete = async () => {
      await fetch(`${API_BASE_URL}/api/teacher/delete/${deleteId}`, {
        method: "DELETE",
      });
      fetchTeachers();
      setShowDeleteModal(false);
      setDeleteId(null);
      setSuccessMessage("Teacher Deleted Successfully");
      setShowSuccessModal(true);
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNo") {
      // Only digits allow + max 10 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setForm({
        ...form,
        [name]: numericValue,
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };  
  return (
    <div>
        <h1 className="bg-warning p-4">
            {loggedInstitute ? loggedInstitute.instituteName : ""} - Teachers
        </h1>
      <div className="px-3 d-lg-flex justify-content-between">
        <h3>All Teachers</h3>
        <div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            Add Teacher
          </button>
        </div>
      </div>
      <div className="row px-2 justify-content-between aling-items-center">
        <div className="col-md-3 d-flex gap-2 my-2 px-3">
          <input className="form-control border border-dark"
            type="text" placeholder="Search teacherName or Email..." />
        </div>
        <div className="col-md-3 text-lg-end my-2">
          <button className="btn btn-primary">
            Download Excel
          </button>
        </div>
      </div>
      {/* TABLE */}
      <div className="px-3 mt-3">
        <table className="table table-bordered align-middle">
          <thead className="table-dark text-center">
            <tr>
              <th className="d-md-none">+</th>
              <th>Sr. No</th>
              <th>Teacher Name</th>
              <th className="d-none d-md-table-cell">Organization</th>
              <th className="d-none d-md-table-cell">Email</th>
              <th className="d-none d-md-table-cell">Password</th>
              <th className="d-none d-md-table-cell">PhoneNo</th>
              <th className="d-none d-md-table-cell">Status</th>
              <th className="d-none d-md-table-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, index) => (
              <tr key={t.id}>
                <td>{index + 1}</td>
                <td>{t.teacherName}</td>
                <td>{t.institude}</td>
                <td>{t.email}</td>
                <td>{t.password}</td>
                <td>{t.phoneNo}</td>
                <td>{t.status}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(t)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(t.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ADD Teacher MODAL */}
      {showAddModal && (
        <div className="modal show d-block" style={{ background: "#00000090" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5>Add Teacher</h5>
                <button className="btn-close" onClick={() => {setShowAddModal(false); resetForm();}}></button>
              </div>
              <form onSubmit={handleAddTeacher}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Teaacher Name</label>
                      <input type="text" name="teacherName" className="form-control" value={form.teacherName} onChange={handleChange} placeholder="enter teacher name" required />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Organization Name</label>
                      <input type="text" name="institude" className="form-control" value={form.institude} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Phone No.</label>
                      <input type="number" name="phoneNo" className="form-control" inputMode="numeric" maxLength="10" pattern="[0-9]{10}" value={form.phoneNo} onChange={handleChange} placeholder="enter teacher phoneNo" required />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Email</label>
                      <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} placeholder="enter teacher email" required />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Password</label>
                      <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} placeholder="enter teacher password" required />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Confirm Password</label>
                      <input type="password" name="confirmpassword" className="form-control" value={form.confirmpassword} onChange={handleChange} placeholder="enter teacher confirm password" required />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-semibold text-dark">Status</label>
                      <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                        <option value="">--Select--</option>
                        <option>Active</option>
                        <option>In-Active</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => {setShowAddModal(false); resetForm();}}>Close</button>
                  <button className="btn btn-primary" type="submit">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ background: "#00000090" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5>Edit Teacher</h5>
                <button className="btn-close" onClick={() => {setShowEditModal(false); resetForm();}}></button>
              </div>
              <form onSubmit={handleUpdateTeacher}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="fw-semibold">Teacher Name</label>
                      <input type="text" name="teacherName" className="form-control" value={form.teacherName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        readOnly   // email change nahi karne dena better hai
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Phone No</label>
                      <input
                        type="number"
                        name="phoneNo"
                        className="form-control"
                        value={form.phoneNo}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label>Status</label>
                      <select
                        name="status"
                        className="form-control"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="">--Select--</option>
                        <option value="Active">Active</option>
                        <option value="In-Active">In-Active</option>
                      </select>
                    </div>

                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => {setShowEditModal(false); resetForm();}}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-warning" type="submit">
                    Update
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal show d-block" style={{ background: "#00000090" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>

              <div className="modal-body text-center py-4">
                <h5 className="text-dark">
                  Are you sure you want to delete this teacher?
                </h5>
              </div>

              <div className="modal-footer justify-content-center border-0">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setShowDeleteModal(false)}
                >
                  No
                </button>
                <button
                  className="btn btn-danger px-4"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <svg xmlns="http://www.w3.org/2000/svg" className="text-success mb-3" width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
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
export default Teachers;