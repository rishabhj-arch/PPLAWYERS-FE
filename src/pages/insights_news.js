import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

import noDataIcon from "../assets/news-svgrepo-com 1.svg";
import logout from "../assets/log-out.svg";
import search from "../assets/search-normal.png";
import previcon from "../assets/prev_icon.png";
import nexticon from "../assets/next_icon.png";
import sidebaricon from "../assets/news-svgrepo-com (1) 1.svg";
import arrowDown from "../assets/arrow-down.png";
import calendarcompleted from "../assets/calendar_completed.png";
import calendarpending from "../assets/calendar_pending.png";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import searchcloseicon from "../assets/searchcloseicon.png";
import TrashIcon from "../assets/TrashIcon";
import Editicon from "../assets/Editicon";
import Fileupload from "../assets/Fileupload";

import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import removebuttonmediapreview from "../assets/removebuttonmediapreview.png";
import removebuttonmediapreviewhover from "../assets/removebuttonmediapreviewhover.png";

const toolbarModules = {
  toolbar: [
    [{ font: [] }, { size: [] }],
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

export default function InsightsNews() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isTrashHover, setIsTrashHover] = useState(false);
  const [isEditHover, setIsEditHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: null,
    title: "",
    tag: "",
    description: "",
    file: null,
  });
  const [newsData, setNewsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/signin");
    fetchNews(page);
  }, [navigate, page]);

  const fetchNews = async (pageNum = 1) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/api/news?page=${pageNum}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/signin");
          return;
        }
        setNewsData([]);
        return;
      }

      const data = await res.json();

      setNewsData(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching news:", err);
      setNewsData([]);
    }
  };

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  const handleDeleteModal = (id) => {
    setSelectedNewsId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedNewsId) return;
    await handleDelete(selectedNewsId);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => setShowDeleteModal(false);

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
    if (!editing && !formData.file) newErrors.file = "Please upload an image";
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
        setShowCreateForm(false);
        setEditing(false);
        setFormData({
          name: "",
          date: null,
          title: "",
          tag: "",
          description: "",
          file: null,
        });
        setImagePreview(null);
        await fetchNews(1);
        setPage(1);
        toast.success("Insights and News are Created.", toastOptions);
      } else {
        const data = await res.json();
        setErrors({ form: data.message || "Error creating entry" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      date: item.date ? dayjs(item.date.split("T")[0]) : null,
      title: item.title,
      tag: item.tag,
      description: item.description,
      file: null, // no new file yet
    });
    setSelectedNewsId(item.id);
    setEditing(true);
    setShowCreateForm(true);
    setErrors({});
    setImagePreview(item.imageUrl ? item.imageUrl : null); // show existing image
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("name", formData.name);
    const dateToSubmit = formData.date
      ? dayjs(formData.date).format("YYYY-MM-DD")
      : "";
    form.append("date", dateToSubmit);
    form.append("title", formData.title);
    form.append("tag", formData.tag);
    form.append("description", formData.description);
    if (formData.file) form.append("image", formData.file);
    try {
      const res = await fetch(
        `http://localhost:3000/api/news/${selectedNewsId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      if (res.ok) {
        setShowCreateForm(false);
        setEditing(false);
        setSelectedNewsId(null);
        setFormData({
          name: "",
          date: null,
          title: "",
          tag: "",
          description: "",
          file: null,
        });
        setImagePreview(null);
        await fetchNews(page);
        toast.success("Insights and News are Updated.", toastOptions);
      } else {
        setErrors({ form: "Error updating entry" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:3000/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNews(page);
      toast.success("Insights and news have been deleted.", toastOptions);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNews = newsData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="insights-container">
        {!showCreateForm ? (
          <>
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
              <header className="header">
                <h2 className="headerp">INSIGHTS & NEWS</h2>
              </header>
              <div className="divider"></div>
              <div className="header-actions">
                <div className="search-wrapper">
                  <img src={search} alt="search icon" className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <img
                      src={searchcloseicon}
                      alt="Clear"
                      className="search-close-icon"
                      onClick={() => setSearchQuery("")}
                    />
                  )}
                </div>
                <button
                  className="create-btn"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: "",
                      date: null,
                      title: "",
                      tag: "",
                      description: "",
                      file: null,
                    });
                    setErrors({});
                    setImagePreview(null);
                    setShowCreateForm(true);
                  }}
                >
                  CREATE NEW
                </button>
              </div>
              <section className="content">
                {filteredNews.length > 0 ? (
                  <table className="news-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Title</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNews.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * limit + (index + 1)}</td>
                          <td>{item.name}</td>
                          <td>
                            {(() => {
                              const dateObj = new Date(item.date);
                              const formattedDate = dateObj.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              );
                              const parts = formattedDate.split(" ");
                              return `${parts[0]} ${parts[1]}, ${parts[2]}`;
                            })()}
                          </td>
                          <td className="title-cell">{item.title}</td>
                          <td className="actions">
                            <img
                              src={
                                new Date(item.date).setHours(0, 0, 0, 0) >
                                new Date().setHours(0, 0, 0, 0)
                                  ? calendarpending
                                  : calendarcompleted
                              }
                              alt={
                                new Date(item.date).setHours(0, 0, 0, 0) >
                                new Date().setHours(0, 0, 0, 0)
                                  ? "Pending"
                                  : "Completed"
                              }
                              className="table-icon-schedule"
                              style={{ width: "20px", height: "20px" }}
                            />
                            <span
                              className="table-icon-edit"
                              onClick={() => {
                                setIsEditHover(false);
                                handleEdit(item);
                              }}
                              onMouseEnter={() => setIsEditHover(index)}
                              onMouseLeave={() => setIsEditHover(false)}
                            >
                              <Editicon
                                width="20"
                                height="20"
                                strokeeditcolor={
                                  isEditHover === index ? "#fff" : "#000"
                                }
                              />
                            </span>

                            <span
                              className="table-icon-delete"
                              onClick={() => handleDeleteModal(item.id)}
                              onMouseEnter={() => setIsTrashHover(index)}
                              onMouseLeave={() => setIsTrashHover(false)}
                            >
                              <TrashIcon
                                width="20"
                                height="20"
                                strokecolor={
                                  isTrashHover === index ? "#fff" : "#000"
                                }
                              />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data">
                    <img
                      src={noDataIcon}
                      alt="No data"
                      className="no-data-icon"
                    />
                    <p className="datap">No data available</p>
                  </div>
                )}
              </section>
              <div className="pagination-container">
                <button
                  onClick={handlePrev}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  <img
                    src={previcon}
                    alt="Previous"
                    className="pagination-icon"
                  />
                </button>

                <span className="pagination-text">
                  Page <span className="pagination-current">{page}</span> of{" "}
                  {totalPages}
                </span>

                <button
                  onClick={handleNext}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  <img src={nexticon} alt="Next" className="pagination-icon" />
                </button>
              </div>
            </main>
          </>
        ) : (
          <>
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
                    onClick={() => {
                      setShowCreateForm(false);
                      setIsEditHover(false);
                      setIsTrashHover(false);
                      setImagePreview(null);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  <h2 className="create-header-title">
                    {editing ? "EDIT" : "CREATE NEW"}
                  </h2>
                </div>
              </div>

              <div className="upload-box-oneimage">
                {!imagePreview ? (
                  <label
                    htmlFor="file-upload"
                    className="upload-placeholder-oneimage"
                  >
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
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                ) : (
                  <div className="image-preview-inside-upload">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="preview-image-centered"
                    />
                  </div>
                )}
              </div>

              {imagePreview && (
                <div className="preview-filename-row">
                  <p className="preview-filename-text">
                    {formData.file
                      ? formData.file.name
                      : imagePreview.split("/").pop()}
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
                  <DatePicker
                    label="Date"
                    value={formData.date ? dayjs(formData.date) : null}
                    onChange={handleDateChange}
                    format="DD MM YYYY"
                    disablePast
                  />
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
                <button
                  className="create-form-btn"
                  onClick={editing ? handleUpdate : handleCreate}
                >
                  {editing ? "SAVE" : "CREATE"}
                </button>
              </div>
            </main>
          </>
        )}

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

        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="logout-modal">
              <h3>DELETE</h3>
              <p>Are you sure you want to delete?</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={cancelDelete}>
                  CANCEL
                </button>
                <button className="confirm-logout-btn" onClick={confirmDelete}>
                  DELETE
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
