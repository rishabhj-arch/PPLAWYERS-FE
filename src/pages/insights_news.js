import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../design/style.css";
import noDataIcon from "../assets/news-svgrepo-com 1.svg";
import logout from "../assets/log-out.svg";
import search from "../assets/search-normal.png";
import previcon from "../assets/prev_icon.png";
import nexticon from "../assets/next_icon.png";
import sidebaricon from "../assets/news-svgrepo-com (1) 1.svg";
import arrowDown from "../assets/arrow-down.png";
import calendarIcon from "../assets/calendar_completed.png";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import TrashIcon from "../assets/TrashIcon";
import Editicon from "../assets/Editicon";
import Fileupload from "../assets/Fileupload";

export default function InsightsNews() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isTrashHover, setIsTrashHover] = useState(false);
  const [isEditHover, setIsEditHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    date: "",
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
        { headers: { Authorization: `Bearer ${token}` } }
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
      const sorted = (data.data || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setNewsData(sorted);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/webp",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/svg+xml",
        "image/avif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          file: "The file type you have uploaded is not supported.",
        });
        setFormData({ ...formData, file: null });
        e.target.value = null;
        return;
      }
      setErrors((prev) => ({ ...prev, file: "" }));
      setFormData({ ...formData, file });
    }
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
    if (!formData.description.trim())
      newErrors.description = "Please add description";
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
          date: "",
          title: "",
          tag: "",
          description: "",
          file: null,
        });
        await fetchNews(1);
        setPage(1);
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
      date: item.date ? item.date.split("T")[0] : "",
      title: item.title,
      tag: item.tag,
      description: item.description,
      file: null,
    });
    setSelectedNewsId(item.id);
    setEditing(true);
    setShowCreateForm(true);
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("name", formData.name);
    form.append("date", formData.date);
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
          date: "",
          title: "",
          tag: "",
          description: "",
          file: null,
        });
        await fetchNews(page);
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
              </div>
              <button
                className="create-btn"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: "",
                    date: "",
                    title: "",
                    tag: "",
                    description: "",
                    file: null,
                  });
                  setErrors({});
                  setShowCreateForm(true);
                }}
              >
                CREATE NEW
              </button>
            </div>

            <section className="content">
              {filteredNews.length > 0 ? (
                <>
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
                          <td>{filteredNews.length - index}</td>
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
                          <td>{item.title}</td>
                          <td className="actions">
                            <img
                              src={calendarIcon}
                              alt="calendar"
                              className="table-icon-schedule"
                            />
                            <span
                              className="table-icon-edit"
                              onClick={() => handleEdit(item)}
                              onMouseEnter={() => setIsEditHover(index)}
                              onMouseLeave={() => setIsEditHover(false)}
                            >
                              <Editicon
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
                      <img
                        src={nexticon}
                        alt="Next"
                        className="pagination-icon"
                      />
                    </button>
                  </div>
                </>
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
              <img
                src={arrowDown}
                alt="Go back"
                className="go-back-icon"
                onClick={() => setShowCreateForm(false)}
              />
              <h2>{editing ? "EDIT NEWS" : "CREATE NEW"}</h2>
            </div>

            <div className="upload-section">
              <label htmlFor="file-upload" className="upload-box">
                <div className="upload-content">
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
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            {errors.file && <p className="error-message">{errors.file}</p>}

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
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="date"
                  name="date"
                  placeholder="Date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? "input-error" : ""}
                />
                {errors.date && <p className="error-message">{errors.date}</p>}
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
                  <p className="error-message">{errors.title}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  name="tag"
                  placeholder="Tag"
                  value={formData.tag}
                  onChange={handleInputChange}
                  className={errors.tag ? "input-error" : ""}
                />
                {errors.tag && <p className="error-message">{errors.tag}</p>}
              </div>
            </div>

            <div className="description-editor">
              <ReactQuill
                placeholder="Description"
                theme="snow"
                value={formData.description}
                onChange={handleDescriptionChange}
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
            <p>Are you sure you want to delete this entry?</p>
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
    </div>
  );
}
