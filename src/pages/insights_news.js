import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash.debounce";

import search from "../assets/search-normal.png";
import PrevIcon from "../assets/previcon";
import sidebaricon from "../assets/news-svgrepo-com (1) 1.png";
import searchcloseicon from "../assets/searchcloseicon.png";
import CalendarPending from "../assets/CalendarPending";
import CalendarCompleted from "../assets/CalendarCompleted";
import TrashIcon from "../assets/TrashIcon";
import Editicon from "../assets/Editicon";
import NextIcon from "../assets/NextIcon";
import LogoutIcon from "../assets/LogoutIcon";
import ppllogo from "../assets/ppllogo.svg";
import noDataIcon from "../assets/noDataIcon.png";

export default function InsightsNews() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isTrashHover, setIsTrashHover] = useState(null);
  const [isEditHover, setIsEditHover] = useState(null);
  const [isCalendarHover, setIsCalendarHover] = useState(null);
  const [isPrevHover, setIsPrevHover] = useState(false);
  const [isNextHover, setIsNextHover] = useState(false);
  const [isLogoutHover, setIsLogoutHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const [newsData, setNewsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const API_URL = process.env.REACT_APP_API_URL;
  const ITEMS_PER_PAGE = 10;
  const DEBOUNCE_DELAY = 500;

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
    style: {
      background: "#FFFFFF",
      color: "#000000",
      borderLeft: "10px solid #0CBF2E",
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
      fontFamily: "Montserrat",
      fontWeight: 500,
      fontSize: "14px",
      letterSpacing: "0px",
      padding: "16px",
    },
    icon: "✓",
  };

  const fetchNews = useCallback(
    async (pageNum = 1, query = "") => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      setIsLoading(true);
      try {
        const url = query
          ? `${API_URL}api/news?page=${pageNum}&limit=${ITEMS_PER_PAGE}&search=${encodeURIComponent(
              query
            )}`
          : `${API_URL}api/news?page=${pageNum}&limit=${ITEMS_PER_PAGE}`;

        console.log("[InsightsNews] Fetching news from URL:", url);

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("[InsightsNews] Response status:", res.status);

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/signin");
            return;
          }
          setNewsData([]);
          setTotalPages(1);
          setTotalResults(0);
          return;
        }
        const data = await res.json();
        setNewsData(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.total || 0);
      } catch (err) {
        console.error("[InsightsNews] Error fetching news:", err);
        console.error("[InsightsNews] Error message:", err.message);
        setNewsData([]);
        setTotalPages(1);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    },
    [API_URL, ITEMS_PER_PAGE, navigate]
  );

  const debouncedFetchNews = useMemo(
    () =>
      debounce((query) => {
        setPage(1);
        fetchNews(1, query);
      }, DEBOUNCE_DELAY),
    [fetchNews, DEBOUNCE_DELAY]
  );

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    debouncedFetchNews(newQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPage(1);
    fetchNews(1, "");
    debouncedFetchNews.cancel();
  };

  useEffect(() => {
    return () => {
      debouncedFetchNews.cancel();
    };
  }, [debouncedFetchNews]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }
    fetchNews(page, searchQuery);
  }, [navigate, page, fetchNews, searchQuery]);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, toastOptions);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

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
      const url = `${API_URL}api/news/${id}`;
      console.log("[InsightsNews] Deleting news item with URL:", url);

      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("[InsightsNews] Delete response status:", res.status);

      if (!res.ok) {
        throw new Error("Failed to delete news item");
      }

      const currentPageHasOnlyOneItem = newsData.length === 1;
      const shouldGoToPreviousPage = currentPageHasOnlyOneItem && page > 1;

      if (shouldGoToPreviousPage) {
        setPage(page - 1);
        fetchNews(page - 1, searchQuery);
      } else {
        fetchNews(page, searchQuery);
      }

      toast.success("Insights and news have been deleted.", toastOptions);
    } catch (err) {
      console.error("[InsightsNews] Error deleting news:", err);
      console.error("[InsightsNews] Error message:", err.message);
      toast.error("An error occurred during deletion: " + err.message, {
        ...toastOptions,
        style: {
          ...toastOptions.style,
          borderLeft: "10px solid #FF3B30",
        },
        icon: "✗",
      });
    }
  };

  const handleEdit = (item) => {
    navigate("/insights_news/edit", { state: { newsItem: item } });
  };
  const handleCreateNew = () => {
    navigate("/insights_news/create");
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="insights-container bg-white font-['Montserrat']">
      <aside
        className={`sidebar ${isSidebarHovered ? "sidebar-open" : ""}`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="sidebar-top">
          <div className="logo">
            <img
              src={ppllogo}
              alt="Logo"
              className="logo-img"
              style={{ backgroundColor: "#1e1e1e" }}
            />
            <div className="logo-text font-['Montserrat']">
              PAUL<span> & </span>PAUL LAWYERS
            </div>
          </div>
          <nav className="nav">
            <ul>
              <li className="active font-['Montserrat']">
                <img src={sidebaricon} alt="sidebaricon" className="nav-icon" />
                <span className="nav-label">Insights & News</span>
              </li>
            </ul>
          </nav>
        </div>
        <button
          className="logout-btn font-['Montserrat']"
          onClick={handleLogout}
          onMouseEnter={() => setIsLogoutHover(true)}
          onMouseLeave={() => setIsLogoutHover(false)}
        >
          <LogoutIcon
            width={22}
            height={22}
            color={isLogoutHover ? "#FFFFFF" : "#717171"}
          />
          <span
            className="logout-text"
            style={{ color: isLogoutHover ? "#FFFFFF" : "#717171" }}
          >
            Log out
          </span>
        </button>
      </aside>

      <main className="main-page flex-1 px-10 py-[30px] flex flex-col bg-white">
        <header className="flex justify-start items-center pb-[15px] border-b border-[#ddd] mb-[25px]">
          <h2 className="text-base font-bold tracking-[0px] font-semibold text-xl mb-0 font-['Montserrat']">
            INSIGHTS & NEWS
          </h2>
        </header>
        <div className="flex items-center gap-4 w-full mb-5">
          <div className="relative flex-1 flex items-center">
            <img
              src={search}
              alt="search icon"
              className="absolute top-[13px] bottom-[13px] left-[13px] w-6 h-6 opacity-60 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search here..."
              className="w-full h-[50px] py-2.5 pr-10 pl-10 border border-[#ddd] text-base font-normal outline-none bg-[#f8f8f8] transition-[border] duration-200 ease-in-out font-['Montserrat']"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <img
                src={searchcloseicon}
                alt="Clear"
                className="absolute right-0 w-[50px] h-[50px] cursor-pointer opacity-70 transition-opacity duration-200 ease-in-out hover:bg-[#717171] hover:opacity-100"
                onClick={handleClearSearch}
              />
            )}
          </div>

          <button
            className="bg-white border border-black cursor-pointer text-base font-semibold tracking-[0px] w-[201px] h-[50px] hover:bg-black hover:text-white font-['Montserrat']"
            onClick={handleCreateNew}
          >
            CREATE NEW
          </button>
        </div>

        <section className="content bg-white flex-1">
          {isLoading ? (
            <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
              <TailSpin
                height="60"
                width="60"
                color="#000000"
                ariaLabel="tail-spin-loading"
                radius="1"
                visible={true}
              />
            </div>
          ) : newsData.length > 0 ? (
            <table className="news-table bg-white">
              <thead>
                <tr>
                  <th className="font-['Montserrat']">No</th>
                  <th className="font-['Montserrat']">Name</th>
                  <th className="font-['Montserrat']">Date</th>
                  <th className="font-['Montserrat']">Title</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {newsData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="font-['Montserrat']">
                      {(page - 1) * ITEMS_PER_PAGE + (index + 1)}
                    </td>
                    <td className="font-['Montserrat']">{item.name}</td>
                    <td className="font-['Montserrat']">
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="title-cell font-['Montserrat']">
                      {item.title}
                    </td>
                    <td className="actions">
                      <span
                        className="table-icon-schedule"
                        onMouseEnter={() => setIsCalendarHover(index)}
                        onMouseLeave={() => setIsCalendarHover(null)}
                      >
                        {new Date(item.date) > new Date() ? (
                          <CalendarPending />
                        ) : (
                          <CalendarCompleted />
                        )}
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
              <p className="datap font-['Montserrat']">
                {searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "No data available"}
              </p>
            </div>
          )}
        </section>

        {newsData.length > 0 && (
          <div className="pagination-container flex items-center justify-end gap-[5px] bg-white mt-5 mb-0">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="text-[#717171] bg-none border-none cursor-pointer flex items-center justify-center p-1 transition-opacity duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
              onMouseEnter={() => setIsPrevHover(true)}
              onMouseLeave={() => setIsPrevHover(false)}
              style={{
                backgroundColor:
                  isPrevHover && page !== 1 ? "#717171" : "#FFFFFF",
              }}
            >
              <PrevIcon
                size={24}
                color={
                  isPrevHover && page !== 1
                    ? "#FFFFFF"
                    : page === 1
                    ? "#717171"
                    : "#000000"
                }
              />
            </button>

            <span className="text-[#3b3c43] text-sm font-normal tracking-[0] flex items-center gap-1 font-['Montserrat']">
              Page <span className="text-sm font-bold text-black">{page}</span>{" "}
              of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="text-[#717171] bg-none border-none cursor-pointer flex items-center justify-center p-1 transition-opacity duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
              onMouseEnter={() => setIsNextHover(true)}
              onMouseLeave={() => setIsNextHover(false)}
              style={{
                backgroundColor:
                  isNextHover && page !== totalPages ? "#717171" : "#FFFFFF",
              }}
            >
              <NextIcon
                width={24}
                height={24}
                color={
                  isNextHover && page !== totalPages
                    ? "#FFFFFF"
                    : page === totalPages
                    ? "#717171"
                    : "#000000"
                }
              />
            </button>
          </div>
        )}
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div
            className="bg-white text-black"
            style={{ width: "374px", height: "174px" }}
          >
            <h3
              className="text-xl font-semibold text-center font-['Montserrat']"
              style={{ paddingTop: "10px", paddingBottom: "10px" }}
            >
              LOG OUT
            </h3>
            <p
              className="text-base text-[#3b3c43] font-medium text-center font-['Montserrat']"
              style={{ paddingTop: "10px", paddingBottom: "10px" }}
            >
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-0 mt-2">
              <button
                onClick={cancelLogout}
                className="text-base font-semibold text-[#717171] border border-[#ffffff] font-['Montserrat'] hover:bg-[#f1f1f1]"
                style={{ width: "177px", height: "50px" }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmLogout}
                className="text-base font-semibold border border-black bg-white font-['Montserrat'] hover:bg-black hover:text-white transition"
                style={{ width: "177px", height: "50px" }}
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div
            className="bg-white text-black"
            style={{ width: "374px", height: "174px" }}
          >
            <h3
              className="text-xl font-semibold text-center font-['Montserrat']"
              style={{ paddingTop: "10px", paddingBottom: "10px" }}
            >
              DELETE
            </h3>
            <p
              className="text-base text-[#3b3c43] font-medium text-center font-['Montserrat']"
              style={{ paddingTop: "10px", paddingBottom: "10px" }}
            >
              Are you sure you want to delete?
            </p>
            <div className="flex justify-center gap-0 mt-2">
              <button
                onClick={cancelDelete}
                className="text-base font-semibold text-[#717171] border border-[#ffffff] font-['Montserrat'] hover:bg-[#f1f1f1]"
                style={{ width: "177px", height: "50px" }}
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="text-base font-semibold border border-black bg-white font-['Montserrat'] hover:bg-black hover:text-white transition"
                style={{ width: "177px", height: "50px" }}
              >
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
