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

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      const res = await fetch(`${API_URL}api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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
      toast.error("An error occurred during deletion.", {
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
      <aside className="sidebar">
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

      <main className="flex-1 px-10 py-[30px] flex flex-col bg-white">
        <header className="flex justify-start items-center">
          <h2 className="text-base font-bold tracking-[0px] font-semibold text-xl mb-0 font-['Montserrat']">
            INSIGHTS & NEWS
          </h2>
        </header>

        <div className="w-full h-px bg-[#ddd] my-[15px] mb-[25px]"></div>

        <div className="flex items-center gap-4 w-full">
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

        <section className="content bg-white">
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
                {searchQuery ? `No results found for "${searchQuery}"` : "No data available"}
              </p>
            </div>
          )}
        </section>

        {newsData.length > 0 && (
          <div className="flex items-center justify-end gap-[5px] bg-white py-2.5 mt-5">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="text-[#717171] bg-none border-none cursor-pointer flex items-center justify-center p-1 transition-opacity duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
              onMouseEnter={() => setIsPrevHover(true)}
              onMouseLeave={() => setIsPrevHover(false)}
              style={{
                backgroundColor: isPrevHover && page !== 1 ? "#717171" : "#FFFFFF",
              }}
            >
              <PrevIcon
                size={24}
                color={
                  isPrevHover && page !== 1 ? "#FFFFFF" : page === 1 ? "#717171" : "#000000"
                }
              />
            </button>

            <span className="text-[#3b3c43] text-sm font-normal tracking-[0] flex items-center gap-1 font-['Montserrat']">
              Page <span className="text-sm font-bold text-black">{page}</span> of{" "}
              {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="text-[#717171] bg-none border-none cursor-pointer flex items-center justify-center p-1 transition-opacity duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
              onMouseEnter={() => setIsNextHover(true)}
              onMouseLeave={() => setIsNextHover(false)}
              style={{ 
                backgroundColor: isNextHover && page !== totalPages ? "#717171" : "#FFFFFF" 
              }}
            >
              <NextIcon
                width={24}
                height={24}
                color={isNextHover && page !== totalPages ? "#FFFFFF" : page === totalPages ? "#717171" : "#000000"}
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

/* insights_news.js with tailwind 
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
  const [isSidebarHover, setIsSidebarHover] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
      const res = await fetch(`${API_URL}api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

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
      toast.error("An error occurred during deletion.", {
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
    <div className="flex min-h-screen bg-[#f9f9f9] text-black font-['Montserrat']">
      <aside 
        className={`bg-black text-white flex flex-col justify-between items-center py-[18px] px-2 transition-all duration-[220ms] ease-in-out ${
          isSidebarHover ? 'w-[250px] items-start px-5' : 'w-[110px]'
        }`}
        onMouseEnter={() => setIsSidebarHover(true)}
        onMouseLeave={() => setIsSidebarHover(false)}
      >
        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-center gap-3">
            <img
              src={ppllogo}
              alt="Logo"
              className={`w-10 h-11 flex justify-center items-center text-white transition-all duration-[180ms] ease-in-out ${
                isSidebarHover ? 'hidden' : 'my-[30px] mx-[30px]'
              }`}
              style={{ backgroundColor: "#1e1e1e" }}
            />
            <div className={`text-base font-medium leading-[1.4] ${isSidebarHover ? 'block' : 'hidden'}`}>
              PAUL<span className="text-[#3b3c43]"> & </span>PAUL LAWYERS
            </div>
          </div>
          <nav>
            <ul className="list-none p-0 m-0">
              <li className={`py-2.5 px-0 flex items-center gap-3 text-white cursor-pointer w-full ${
                isSidebarHover ? 'justify-start' : 'justify-center'
              }`}>
                <img src={sidebaricon} alt="sidebaricon" className="w-7 h-7 object-contain" />
                <span className={`text-base font-medium ${isSidebarHover ? 'inline-block' : 'hidden'}`}>
                  Insights & News
                </span>
              </li>
            </ul>
          </nav>
        </div>
        <button
          className={`bg-transparent border-none text-left cursor-pointer text-base font-medium flex items-center gap-[11px] w-full ${
            isSidebarHover ? 'justify-start' : 'justify-center'
          } transition-colors duration-200`}
          onClick={handleLogout}
          onMouseEnter={() => setIsLogoutHover(true)}
          onMouseLeave={() => setIsLogoutHover(false)}
          style={{ color: isLogoutHover ? '#FFFFFF' : '#717171' }}
        >
          <LogoutIcon
            width={22}
            height={22}
            color={isLogoutHover ? "#FFFFFF" : "#717171"}
          />
          <span className={`${isSidebarHover ? 'inline-block' : 'hidden'}`}>
            Log out
          </span>
        </button>
      </aside>

      <main className="flex-1 px-10 py-[30px] flex flex-col bg-white">
        <header className="flex justify-start items-center">
          <h2 className="text-base font-bold tracking-[0px] font-semibold text-xl mb-0 font-['Montserrat']">
            INSIGHTS & NEWS
          </h2>
        </header>

        <div className="w-full h-px bg-[#ddd] my-[15px] mb-[25px]"></div>

        <div className="flex items-center gap-4 w-full">
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

        <section className="flex-1 flex flex-col justify-start items-start pt-0 bg-white">
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
            <table className="w-full mt-5 bg-white">
              <thead>
                <tr>
                  <th className="font-semibold text-xs text-[#3b3c43] bg-white border-b border-[#ddd] py-2.5 px-4 text-left align-middle h-[45px] font-['Montserrat']">No</th>
                  <th className="font-semibold text-xs text-[#3b3c43] bg-white border-b border-[#ddd] py-2.5 px-4 text-left align-middle h-[45px] font-['Montserrat']">Name</th>
                  <th className="font-semibold text-xs text-[#3b3c43] bg-white border-b border-[#ddd] py-2.5 px-4 text-left align-middle h-[45px] font-['Montserrat']">Date</th>
                  <th className="font-semibold text-xs text-[#3b3c43] bg-white border-b border-[#ddd] py-2.5 px-4 text-left align-middle h-[45px] font-['Montserrat']">Title</th>
                  <th className="font-semibold text-xs text-[#3b3c43] bg-white border-b border-[#ddd] py-2.5 px-4 text-left align-middle h-[45px]"></th>
                </tr>
              </thead>
              <tbody>
                {newsData.map((item, index) => (
                  <tr key={item.id} className="bg-white border-b-0 hover:bg-[#f5f5f5]">
                    <td className="font-medium text-base text-left border-0 text-black align-middle py-2.5 px-4 h-[60px] font-['Montserrat']">
                      {(page - 1) * ITEMS_PER_PAGE + (index + 1)}
                    </td>
                    <td className="font-medium text-base text-left border-0 text-black align-middle py-2.5 px-4 h-[60px] font-['Montserrat']">{item.name}</td>
                    <td className="font-medium text-base text-left border-0 text-black align-middle py-2.5 px-4 h-[60px] font-['Montserrat']">
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="font-medium text-base text-left border-0 text-black align-middle py-2.5 px-4 h-[60px] max-w-[300px] whitespace-nowrap overflow-hidden text-ellipsis font-['Montserrat']">
                      {item.title}
                    </td>
                    <td className="font-medium text-base text-left border-0 text-black align-middle py-2.5 px-4 h-[60px]">
                      <div className="flex gap-0 items-center justify-end">
                        <span
                          className="w-[60px] h-[60px] p-5 flex justify-center items-center cursor-pointer rounded transition-colors duration-200 ease-in-out"
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
                          className="w-[60px] h-[60px] p-5 flex justify-center items-center cursor-pointer rounded transition-colors duration-200 ease-in-out hover:bg-[#717171]"
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
                          className="w-[60px] h-[60px] p-5 flex justify-center items-center cursor-pointer rounded transition-colors duration-200 ease-in-out hover:bg-[#717171]"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col justify-center items-center text-center text-[#777] h-full w-full">
              <img src={noDataIcon} alt="No data" className="w-20 h-20 mb-2.5" />
              <p className="font-semibold text-xl text-[#717171] font-['Montserrat']">
                {searchQuery ? `No results found for "${searchQuery}"` : "No data available"}
              </p>
            </div>
          )}
        </section>

        {newsData.length > 0 && (
          <div className="flex items-center justify-end gap-[5px] bg-white py-2.5 mt-5">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="text-[#717171] bg-none border-none cursor-pointer flex items-center justify-center p-1 transition-opacity duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
              onMouseEnter={() => setIsPrevHover(true)}
              onMouseLeave={() => setIsPrevHover(false)}
              style={{
                backgroundColor: isPrevHover && page !== 1 ? "#717171" : "#FFFFFF",
              }}
            >
              <PrevIcon
                size={24}
                color={
                  isPrevHover && page !== 1 ? "#FFFFFF" : page === 1 ? "#717171" : "#000000"
                }
              />
            </button>

            <span className="text-[#3b3c43] text-sm font-normal tracking-[0] flex items-center gap-1 font-['Montserrat']">
              Page <span className="text-sm font-bold text-black">{page}</span> of{" "}
              {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="text-[#717171] bg-none border-none cursor-pointer flex items-center justify-center p-1 transition-opacity duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70"
              onMouseEnter={() => setIsNextHover(true)}
              onMouseLeave={() => setIsNextHover(false)}
              style={{ 
                backgroundColor: isNextHover && page !== totalPages ? "#717171" : "#FFFFFF" 
              }}
            >
              <NextIcon
                width={24}
                height={24}
                color={isNextHover && page !== totalPages ? "#FFFFFF" : page === totalPages ? "#717171" : "#000000"}
              />
            </button>
          </div>
        )}
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="text-center shadow-[0px_4px_10px_rgba(0,0,0,0.2)] p-2.5 gap-5 bg-white text-black font-['Montserrat']" style={{ width: "374px", height: "174px" }}>
            <h3 className="text-xl tracking-[0%] font-semibold p-2.5 m-0 gap-2.5 font-['Montserrat']">
              LOG OUT
            </h3>
            <p className="text-base text-[#3b3c43] m-0 font-medium tracking-[0%] pt-2.5 pb-2.5 gap-2.5 font-['Montserrat']">
              Are you sure you want to log out?
            </p>
            <div className="mt-5 flex justify-center">
              <button
                onClick={cancelLogout}
                className="bg-transparent border border-white text-[#717171] py-[15px] px-[54px] text-base font-semibold cursor-pointer tracking-[0%] font-['Montserrat'] hover:bg-[#f1f1f1]"
              >
                CANCEL
              </button>
              <button
                onClick={confirmLogout}
                className="bg-white text-black py-[15px] px-[56px] text-base font-semibold tracking-[0%] cursor-pointer border border-black font-['Montserrat'] hover:opacity-80"
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="text-center shadow-[0px_4px_10px_rgba(0,0,0,0.2)] p-2.5 gap-5 bg-white text-black font-['Montserrat']" style={{ width: "374px", height: "174px" }}>
            <h3 className="text-xl tracking-[0%] font-semibold p-2.5 m-0 gap-2.5 font-['Montserrat']">
              DELETE
            </h3>
            <p className="text-base text-[#3b3c43] m-0 font-medium tracking-[0%] pt-2.5 pb-2.5 gap-2.5 font-['Montserrat']">
              Are you sure you want to delete?
            </p>
            <div className="mt-5 flex justify-center">
              <button
                onClick={cancelDelete}
                className="bg-transparent border border-white text-[#717171] py-[15px] px-[54px] text-base font-semibold cursor-pointer tracking-[0%] font-['Montserrat'] hover:bg-[#f1f1f1]"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="bg-white text-black py-[15px] px-[56px] text-base font-semibold tracking-[0%] cursor-pointer border border-black font-['Montserrat'] hover:opacity-80"
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

*/