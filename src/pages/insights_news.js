import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import noDataIcon from "../assets/news-svgrepo-com 1.svg";
import logout from "../assets/log-out.svg";
import search from "../assets/search-normal.png";
import previcon from "../assets/prev_icon.png";
import sidebaricon from "../assets/news-svgrepo-com (1) 1.svg";
import searchcloseicon from "../assets/searchcloseicon.png";
import CalendarPending from "../assets/CalendarPending";
import CalendarCompleted from "../assets/CalendarCompleted";
import TrashIcon from "../assets/TrashIcon";
import Editicon from "../assets/Editicon";
import NextIcon from "../assets/NextIcon";

export default function InsightsNews() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isTrashHover, setIsTrashHover] = useState(null);
  const [isEditHover, setIsEditHover] = useState(null);
  const [isCalendarHover, setIsCalendarHover] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [isNextHover, setIsNextHover] = useState(false);
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

  const handleEdit = (item) => {
    navigate("/insights_news/edit", { state: { newsItem: item } });
  };
  const handleCreateNew = () => {
    navigate("/insights_news/create");
  };

  const filteredNews = newsData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < totalPages && setPage(page + 1);

  return (
    <div className="insights-container bg-white">
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

      <main className="main-content bg-white">
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

          <button className="create-btn" onClick={handleCreateNew}>
            CREATE NEW
          </button>
        </div>

        <section className="content bg-white">
          {filteredNews.length > 0 ? (
            <table className="news-table bg-white">
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
                        return dateObj.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      })()}
                    </td>
                    <td className="title-cell">{item.title}</td>
                    <td className="actions">
                      <span
                        className="table-icon-schedule"
                        onMouseEnter={() => setIsCalendarHover(index)}
                        onMouseLeave={() => setIsCalendarHover(null)}
                      >
                        {(() => {
                          const taskDateObj = new Date(item.date);
                          const todayObj = new Date();
                          const isFuture = taskDateObj > todayObj;

                          return isFuture ? (
                            <CalendarPending />
                          ) : (
                            <CalendarCompleted />
                          );
                        })()}
                      </span>

                      <span
                        className="table-icon-edit"
                        onClick={() => handleEdit(item)}
                        onMouseEnter={() => setIsEditHover(index)}
                        onMouseLeave={() => setIsEditHover(null)}
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
                        onMouseLeave={() => setIsTrashHover(null)}
                      >
                        <TrashIcon
                          width="20"
                          height="20"
                          strokecolor={isTrashHover === index ? "#fff" : "#000"}
                        />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <img src={noDataIcon} alt="No data" className="no-data-icon" />
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
            <img src={previcon} alt="Previous" className="pagination-icon" />
          </button>

          <span className="pagination-text">
            Page <span className="pagination-current">{page}</span> of{" "}
            {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="pagination-btn"
            onMouseEnter={() => setIsNextHover(true)}
            onMouseLeave={() => setIsNextHover(false)}
            style={{
              backgroundColor: isNextHover ? "#717171" : "#FFFFFF",
            }}
          >
            <NextIcon
              width={24}
              height={24}
              color={isNextHover ? "#FFFFFF" : "#000000"}
            />
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
  );
}
