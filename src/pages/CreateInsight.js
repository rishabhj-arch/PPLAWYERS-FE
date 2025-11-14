import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logout from "../assets/log-out.svg";
import sidebaricon from "../assets/news-svgrepo-com (1) 1.svg";
import arrowDown from "../assets/arrow-down.png";
import Fileupload from "../assets/Fileupload";

const toolbarModules = {
  toolbar: [
    [{ size: [] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link"],
  ],
};

export default function CreateInsight() {
  const navigate = useNavigate();
  const fileInputref = useRef();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: dayjs().format("YYYY-MM-DD"),
    title: "",
    tag: "",
    description: "",
    file: null,
  });

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  };

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (date) => {
    const dateString = date ? dayjs(date).format("YYYY-MM-DD") : null;
    setFormData({ ...formData, date: dateString });
    setErrors((prev) => ({ ...prev, date: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          file: "The file type you have uploaded is not supported.",
        });
        setFormData({ ...formData, file: null });
        setImagePreview(null);
        e.target.value = null;
        return;
      }
      setErrors((prev) => ({ ...prev, file: "" }));
      setFormData({ ...formData, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, file: null });
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, file: "" }));
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = null;
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.date) newErrors.date = "Please select date & time";
    if (!formData.title.trim()) newErrors.title = "Please enter title";
    if (!formData.tag.trim()) newErrors.tag = "Please add tag";
    if (!formData.file) newErrors.file = "Please upload an image";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("name", formData.name);
    form.append("date", formData.date);
    form.append("title", formData.title);
    form.append("tag", formData.tag);
    form.append("description", formData.description);
    form.append("image", formData.file);

    try {
      const res = await fetch("http://localhost:3000/api/news/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast.success("Insights and News are Created.", toastOptions);
        setTimeout(() => {
          navigate("/insights_news");
        }, 1000);
      } else {
        const data = await res.json();
        setErrors({ form: data.message || "Error creating entry" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ form: "Failed to create entry" });
    }
  };

  const handleGoBack = () => {
    navigate("/insights_news");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="insights-container">
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="logo">
              PAUL <span>&</span> PAUL LAWYERS
            </div>
            <nav className="nav">
              <ul>
                <li className="active">
                  <img src={sidebaricon} alt="sidebaricon" />
                  Insights & News
                </li>
              </ul>
            </nav>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <img src={logout} alt="logout icon" className="logouticon" />
            Log out
          </button>
        </aside>

        <main className="main-content">
          <div className="create-header">
            <div
              className="create-header-left"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <img
                src={arrowDown}
                alt="Go back"
                className="go-back-icon"
                onClick={handleGoBack}
                style={{ cursor: "pointer" }}
              />
              <h2 className="create-header-title">CREATE NEW</h2>
            </div>
          </div>

          <label
            htmlFor="file-upload"
            className="upload-box-oneimage"
            style={{ cursor: "pointer" }}
          >
            {!imagePreview ? (
              <div className="upload-placeholder-oneimage">
                <Fileupload className="upload-icon" />
                <div className="upload-text">
                  <span className="textdecor1">
                    Drag & Drop your image here
                  </span>
                  <div className="browse-line">
                    <span className="textdecor2">or </span>
                    <span className="textdecor3">Click to browse</span>
                  </div>
                  <span className="textdecor4">
                    *Maximum upload file size: 10MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="image-preview-inside-upload">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="preview-image-centered"
                />
              </div>
            )}

            <input
              ref={fileInputref}
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>

          {imagePreview && (
            <div className="preview-filename-row">
              <p className="preview-filename-text">
                {formData.file ? formData.file.name : ""}
              </p>
              <button
                className="removebuttonmediapreview"
                onClick={handleRemoveImage}
              ></button>
            </div>
          )}

          {errors.file && (
            <p className="error-message">
              <span className="rounded-full bg-[#CC000D] text-white h-5 w-5 flex item-center justify-center">
                i
              </span>
              {errors.file}
            </p>
          )}

          <div className="form-grid">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && (
                <p className="error-message">
                  <span className="rounded-full bg-[#CC000D] text-white h-5 w-5 flex item-center justify-center">
                    i
                  </span>
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <div className="custom-date-picker">
                <DatePicker
                  className="custom-date-picker"
                  label="Date"
                  value={formData.date ? dayjs(formData.date) : null}
                  onChange={handleDateChange}
                  format="DD MMM, YYYY"
                  disablePast
                  slotProps={{
                    textField: {
                      sx: {
                        "& .MuiFormControl-root": {
                          backgroundColor: "#f1f1f1",
                        },
                        "& .MuiInputBase-root": {
                          backgroundColor: "#f1f1f1 !important",
                        },
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#f1f1f1 !important",
                        },
                        "& .MuiOutlinedInput-input": {
                          backgroundColor: "#f1f1f1 !important",
                          padding: "20px",
                          fontFamily: "Montserrat",
                        },
                        "& .MuiInputLabel-root": {
                          color: "#717171",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#ccc",
                        },
                      },
                    },
                  }}
                />
              </div>
              {errors.date && (
                <p className="error-message">
                  <span className="rounded-full bg-[#CC000D] text-white h-5 w-5 flex item-center justify-center">
                    i
                  </span>
                  {errors.date}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? "input-error" : ""}
              />
              {errors.title && (
                <p className="error-message">
                  <span className="rounded-full bg-[#CC000D] text-white h-5 w-5 flex item-center justify-center">
                    i
                  </span>
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="tag"
                placeholder="Write a key word, and hit enter to add tag"
                value={formData.tag}
                onChange={handleInputChange}
                className={errors.tag ? "input-error" : ""}
              />
              {errors.tag && (
                <p className="error-message">
                  <span className="rounded-full bg-[#CC000D] text-white h-5 w-5 flex item-center justify-center">
                    i
                  </span>
                  {errors.tag}
                </p>
              )}
            </div>
          </div>

          <div className="description-editor">
            <ReactQuill
              placeholder="Description"
              theme="snow"
              value={formData.description}
              onChange={handleDescriptionChange}
              modules={toolbarModules}
              style={{
                backgroundColor: "#f1f1f1",
                fontFamily: "Montserrat",
                width: "100%",
                height: "300px",
              }}
              className={`text-editor ${
                errors.description ? "input-error" : ""
              }`}
            />
            {errors.description && (
              <p className="error-message">{errors.description}</p>
            )}
          </div>

          {errors.form && (
            <p className="error-message" style={{ textAlign: "center" }}>
              {errors.form}
            </p>
          )}

          <div className="create-btn-wrapper">
            <button className="create-form-btn" onClick={handleCreate}>
              CREATE
            </button>
          </div>
        </main>

        {showLogoutModal && (
          <div className="modal-overlay">
            <div className="logout-modal">
              <h3>LOG OUT</h3>
              <p>Are you sure you want to log out?</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={cancelLogout}>
                  CANCEL
                </button>
                <button className="confirm-logout-btn" onClick={confirmLogout}>
                  LOG OUT
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          theme="light"
          transition={Bounce}
        />
      </div>
    </LocalizationProvider>
  );
}
