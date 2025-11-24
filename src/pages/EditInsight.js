import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { TailSpin } from "react-loader-spinner";
import "react-toastify/dist/ReactToastify.css";
import closeImageIcon from "../assets/closeimageicon.png";
import sidebaricon from "../assets/news-svgrepo-com (1) 1.png";
import ArrowDown from "../assets/ArrowDown";
import LogoutIcon from "../assets/LogoutIcon";
import Fileupload from "../assets/Fileupload";
import ReactInputTag from "../components/ReactInputTag";
import ppllogo from "../assets/ppllogo.svg";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

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

export default function EditInsight() {
  const navigate = useNavigate();
  const location = useLocation();
  const newsItem = location.state?.newsItem;
  const isPastDate =
    newsItem?.date && dayjs(newsItem.date).isBefore(dayjs(), "day");

  const [showImageOverlay, setShowImageOverlay] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const [isLogoutHover, setIsLogoutHover] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    date: null,
    title: "",
    tag: [],
    description: "",
    file: null,
  });

  const [originalData, setOriginalData] = useState(null);
  const [isDataChanged, setIsDataChanged] = useState(false);

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

  useEffect(() => {
    if (!newsItem) return;

    let parsedTags = [];

    if (Array.isArray(newsItem.tag)) {
      parsedTags = newsItem.tag;
    } else if (typeof newsItem.tag === "string") {
      try {
        parsedTags = JSON.parse(newsItem.tag);
      } catch {
        parsedTags = newsItem.tag
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const initialData = {
      name: newsItem.name || "",
      date: newsItem.date ? dayjs(newsItem.date) : null,
      title: newsItem.title || "",
      tag: parsedTags,
      description: newsItem.description || "",
      file: null,
    };

    setFormData(initialData);
    setOriginalData(initialData);
    setIsDataChanged(false);

    setImagePreview(newsItem.imageUrl || null);
  }, [newsItem]);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const cancelLogout = () => setShowLogoutModal(false);

  const handleImageClick = () => setShowImageOverlay(true);
  const closeImageOverlay = () => setShowImageOverlay(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, [name]: "" }));
    checkIfDataChanged(updatedFormData);
  };

  const handleDateChange = (date) => {
    const updatedFormData = { ...formData, date };
    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, date: "" }));
    checkIfDataChanged(updatedFormData);
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
        setImagePreview(newsItem.imageUrl);
        e.target.value = null;
        return;
      }
      setErrors((prev) => ({ ...prev, file: "" }));
      const updatedFormData = { ...formData, file };
      setFormData(updatedFormData);
      setIsDataChanged(true);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    const updatedFormData = { ...formData, file: null };
    setFormData(updatedFormData);
    setImagePreview(null);
    setErrors((prev) => ({ ...prev, file: "" }));
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = null;
    setIsDataChanged(true);
  };

  const handleDescriptionChange = (value) => {
    const updatedFormData = { ...formData, description: value };
    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, description: "" }));
    checkIfDataChanged(updatedFormData);
  };

  const handleTagInputFocus = (e) => {
  const MAX_TAGS = 5;
  if (formData.tag.length >= MAX_TAGS) {
    toast.error(`You can only add a maximum of ${MAX_TAGS} tags.`, {
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
        borderLeft: "10px solid #CC000D",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        fontFamily: "Montserrat",
        fontWeight: 500,
        fontSize: "14px",
        letterSpacing: "0px",
        padding: "16px",
      },
      icon: ({ theme, type }) => (
        <div
          style={{
            backgroundColor: "#CC000D",
            color: "#FFFFFF",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          i
        </div>
      ),
    });
    e.preventDefault();
  }
};

  const handleTagsChange = (newTags) => {
    const MAX_TAGS = 5;

    if (newTags.length > MAX_TAGS) {
      toast.error(`You can only add a maximum of ${MAX_TAGS} tags.`, {
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
          borderLeft: "10px solid #CC000D",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
          fontFamily: "Montserrat",
          fontWeight: 500,
          fontSize: "14px",
          letterSpacing: "0px",
          padding: "16px",
        },
        icon: ({ theme, type }) => (
          <div
            style={{
              backgroundColor: "#CC000D",
              color: "#FFFFFF",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            i
          </div>
        ),
      });
      return;
    }

    const updatedFormData = { ...formData, tag: newTags };
    setFormData(updatedFormData);
    setErrors((prev) => ({ ...prev, tag: "" }));
    checkIfDataChanged(updatedFormData);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name";
    if (!formData.date) newErrors.date = "Please select date & time";
    if (!formData.title.trim()) newErrors.title = "Please enter title";
    if (formData.tag.length === 0)
      newErrors.tag = "Please add at least one tag";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("name", formData.name);
    const dateToSubmit = formData.date
      ? dayjs(formData.date).format("YYYY-MM-DD")
      : "";
    form.append("date", dateToSubmit);
    form.append("title", formData.title);
    form.append("tag", JSON.stringify(formData.tag));
    form.append("description", formData.description);
    if (formData.file) form.append("image", formData.file);

    try {
      const res = await fetch(`${API_URL}api/news/${newsItem.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast.success("Insights and News are Updated.", toastOptions);
        setTimeout(() => navigate("/insights_news"), 1000);
      } else {
        setErrors({ form: "Error updating entry" });
      }
    } catch (err) {
      setErrors({ form: "Failed to update entry" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => navigate("/insights_news");

  const checkIfDataChanged = (updatedFormData) => {
    if (!originalData) return;

    const changed =
      updatedFormData.name !== originalData.name ||
      updatedFormData.date?.format("YYYY-MM-DD") !==
        originalData.date?.format("YYYY-MM-DD") ||
      updatedFormData.title !== originalData.title ||
      JSON.stringify(updatedFormData.tag) !==
        JSON.stringify(originalData.tag) ||
      updatedFormData.description !== originalData.description ||
      updatedFormData.file !== null;

    setIsDataChanged(changed);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex h-screen bg-white text-black font-['Montserrat'] overflow-hidden">
        <aside className="sidebar bg-black text-white flex flex-col justify-between p-5 w-[210px] flex-shrink-0">
          <div className="flex flex-col gap-5">
            <div className="logo">
              <img
                src={ppllogo}
                alt="Logo"
                className="logo-img"
                style={{ backgroundColor: "#1e1e1e" }}
              />
              <div className="logo-text">
                PAUL <span className="text-[#3b3c43]">&</span> PAUL LAWYERS
              </div>
            </div>
            <nav>
              <ul className="list-none p-0 mt-0 w-full flex justify-center">
                <li className="py-2.5 px-0 flex items-center gap-2 text-white text-base font-medium">
                  <img
                    src={sidebaricon}
                    alt="sidebaricon"
                    className="nav-icon"
                  />
                  <span className="nav-label">Insights & News</span>
                </li>
              </ul>
            </nav>
          </div>
          <button
            className="logout-btn"
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

        <main className="flex-1 flex flex-col bg-white overflow-y-auto">
          <div className="py-5 px-[60px]">
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-3">
                <div
                  onClick={handleGoBack}
                  className="group w-6 h-6 flex items-center justify-center cursor-pointer rounded hover:bg-[#717171] transition-all"
                >
                  <ArrowDown
                    size={24}
                    className="text-black group-hover:text-white"
                  />
                </div>

                <h2 className="text-lg font-semibold uppercase">EDIT</h2>
              </div>
            </div>

            <div className="border border-dashed border-[#E0E0E0] rounded-none p-8 text-center bg-white mb-4 transition-colors duration-300 ease-in-out flex justify-center items-center min-h-[160px] hover:border-[#999]">
              {!imagePreview ? (
                <label
                  htmlFor="file-upload"
                  className="flex flex-row items-center justify-center gap-3 cursor-pointer text-left"
                >
                  <Fileupload className="w-10 h-10 text-[#717171]" />
                  <div className="flex flex-col items-start justify-center text-sm text-[#717171] font-normal">
                    <span className="font-normal text-sm text-[#3b3c43]">
                      Drag & Drop your image here
                    </span>
                    <div className="inline">
                      <span className="font-normal text-xs text-[#3b3c43]">
                        or{" "}
                      </span>
                      <span className="font-normal text-xs text-[#3b3c43] underline">
                        Click to browse
                      </span>
                    </div>
                    <span className="font-normal text-[10px] text-[#3b3c43]">
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
                <div className="flex justify-center items-center w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-[120px] w-auto h-auto object-contain cursor-pointer"
                    onClick={handleImageClick}
                  />
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="flex justify-between items-center w-full mb-4">
                <p className="text-sm font-normal text-black m-0 flex-1 text-left">
                  {formData.file
                    ? formData.file.name
                    : newsItem.image || imagePreview.split("/").pop()}
                </p>
                <button
                  className="removebuttonmediapreview"
                  onClick={handleRemoveImage}
                ></button>
              </div>
            )}

            {errors.file && (
              <p className="text-[#cc000d] text-sm mt-1 ml-0.5 flex items-center gap-1 mb-4">
                <span className="rounded-full bg-[#CC000D] text-white h-5 w-5 flex items-center justify-center text-xs">
                  i
                </span>
                {errors.file}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`p-4 text-sm bg-[#F5F5F5] font-medium text-black w-full border-0 rounded-none h-[50px] ${
                    errors.name ? "border border-[#cc000d]" : ""
                  }`}
                  style={{ color: "#000000" }}
                />
                {errors.name && (
                  <p className="text-[#cc000d] text-xs mt-1 ml-0.5 flex items-center gap-1">
                    <span className="rounded-full bg-[#CC000D] text-white h-4 w-4 flex items-center justify-center text-[10px]">
                      i
                    </span>
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <div
                  className={`custom-date-picker w-full ${
                    isPastDate ? "cursor-not-allowed" : ""
                  }`}
                >
                  <DatePicker
                    value={formData.date ? dayjs(formData.date) : null}
                    onChange={handleDateChange}
                    format="DD MMM, YYYY"
                    disablePast
                    disabled={isPastDate}
                    slotProps={{
                      textField: {
                        sx: {
                          width: "100%",
                          backgroundColor: "#F5F5F5 !important",
                          "& .MuiInputBase-root": {
                            backgroundColor: "#F5F5F5 !important",
                            height: "50px !important",
                            cursor: isPastDate ? "not-allowed" : "text",
                            borderRadius: "0px",
                          },
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#F5F5F5 !important",
                            height: "50px !important",
                            "& fieldset": {
                              border: "none",
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            backgroundColor: "#F5F5F5 !important",
                            padding: "16px !important",
                            fontFamily: "Montserrat",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#000000",
                            height: "50px !important",
                            boxSizing: "border-box",
                            cursor: isPastDate ? "not-allowed" : "text",
                          },
                        },
                      },
                    }}
                  />
                </div>
                {errors.date && (
                  <p className="text-[#cc000d] text-xs mt-1 ml-0.5 flex items-center gap-1">
                    <span className="rounded-full bg-[#CC000D] text-white h-4 w-4 flex items-center justify-center text-[10px]">
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
                  className={`p-4 text-sm bg-[#F5F5F5] font-medium text-black w-full border-0 rounded-none h-[50px] ${
                    errors.title ? "border border-[#cc000d]" : ""
                  }`}
                  style={{ color: "#000000" }}
                />
                {errors.title && (
                  <p className="text-[#cc000d] text-xs mt-1 ml-0.5 flex items-center gap-1">
                    <span className="rounded-full bg-[#CC000D] text-white h-4 w-4 flex items-center justify-center text-[10px]">
                      i
                    </span>
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <ReactInputTag
                  tags={formData.tag}
                  onChange={handleTagsChange}
                  onFocus={handleTagInputFocus}
                  placeholder="Write a key word, and hit enter to add tag"
                  error={errors.tag}
                  disabled={formData.tag.length >= 5}
                />
                {errors.tag && (
                  <p className="text-[#cc000d] text-xs mt-1 ml-0.5 flex items-center gap-1">
                    <span className="rounded-full bg-[#CC000D] text-white h-4 w-4 flex items-center justify-center text-[10px]">
                      i
                    </span>
                    {errors.tag}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <ReactQuill
                placeholder="Description"
                theme="snow"
                value={formData.description}
                onChange={handleDescriptionChange}
                modules={toolbarModules}
                style={{
                  backgroundColor: "#F5F5F5",
                  fontFamily: "Montserrat",
                  width: "100%",
                  height: "200px",
                }}
                className={`text-editor ${
                  errors.description ? "border border-[#cc000d]" : ""
                }`}
              />
              {errors.description && (
                <p className="text-[#cc000d] text-xs mt-1 ml-0.5 flex items-center gap-1">
                  {errors.description}
                </p>
              )}
            </div>

            {errors.form && (
              <p className="text-[#cc000d] text-sm mt-1 text-center">
                {errors.form}
              </p>
            )}

            <div className="flex justify-end mt-16">
              <button
                className={`w-[180px] h-[45px] bg-white text-black border border-black text-base font-semibold rounded-none transition-colors flex items-center justify-center gap-2 ${
                  !isDataChanged || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:bg-black hover:text-white"
                }`}
                onClick={handleUpdate}
                disabled={!isDataChanged || isLoading}
              >
                {isLoading ? "SAVE" : "SAVE"}
              </button>
            </div>
          </div>
        </main>

        {isLoading && (
          <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-[1001]">
            <TailSpin
              height="60"
              width="60"
              color="#000000"
              ariaLabel="tail-spin-loading"
              radius="1"
              visible={true}
            />
          </div>
        )}

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
            <div
              className="bg-white text-black"
              style={{
                width: "374px",
                height: "174px",
              }}
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
                  style={{
                    width: "177px",
                    height: "50px",
                  }}
                >
                  CANCEL
                </button>

                <button
                  onClick={confirmLogout}
                  className="text-base font-semibold border border-black bg-white font-['Montserrat'] hover:bg-black hover:text-white transition"
                  style={{
                    width: "177px",
                    height: "50px",
                  }}
                >
                  LOG OUT
                </button>
              </div>
            </div>
          </div>
        )}

        {showImageOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-[1px] flex justify-center items-center z-[1000]">
            <div className="relative inline-block">
              <img
                src={closeImageIcon}
                alt="Close"
                onClick={closeImageOverlay}
                className="absolute top-0 right-[-40px] w-8 h-8 cursor-pointer bg-black p-2 rounded shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
              />
              <img
                src={imagePreview}
                alt="Full Preview"
                className="max-w-[61vw] max-h-[63vh] rounded"
              />
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
