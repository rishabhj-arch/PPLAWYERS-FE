/*
import React, { useState, useEffect } from "react";
import "../design/style.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/insights_news");
  }, [navigate]);

  const validateInputs = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    let valid = true;
    if (!emailRegex.test(email)) {
      setEmailError("Incorrect email entered");
      valid = false;
    } else {
      setEmailError("");
    }
    if (!passwordRegex.test(password)) {
      setPasswordError("Incorrect password entered");
      valid = false;
    } else {
      setPasswordError("");
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validateInputs()) return;
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.message?.includes("email")) setEmailError(data.message);
        else if (data.message?.includes("password")) setPasswordError(data.message);
        else alert(data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      setSuccessMessage("Login Successful! Redirecting...");
      setTimeout(() => {
        navigate("/insights_news");
      }, 1000);
    } catch (error) {
      alert("An error occurred while logging in.");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const isDisabled = email.trim() === "" || password.trim() === "";

  return (
    <div className="signin-container">
      <h1 className="title">
        PAUL <span >&</span> PAUL LAWYERS
      </h1>
      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Sign in with your account</h2>
        <input
          type="text"
          placeholder="email@gmail.com"
          value={email}
          onChange={handleEmailChange}
          className={emailError ? "input-error" : ""}
        />
        {emailError && <p className="error-message">{emailError}</p>}
        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className={passwordError ? "input-error" : ""}
          />
          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {passwordError && <p className="error-message">{passwordError}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button
          type="submit"
          className={`signin-btn ${isDisabled ? "disabled" : ""}`}
          disabled={isDisabled}
        >
          <span className="signintext">SIGN IN</span>
        </button>
      </form>
    </div>
  );
}
*/

/* signin tailwind version */
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/insights_news");
  }, [navigate]);

  const validateInputs = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    let valid = true;

    if (!emailRegex.test(email)) {
      setEmailError("Incorrect email entered");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!passwordRegex.test(password)) {
      setPasswordError("Incorrect password entered");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validateInputs()) return;

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.message?.includes("email")) setEmailError(data.message);
        else if (data.message?.includes("password"))
          setPasswordError(data.message);
        else alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setSuccessMessage("Login Successful! Redirecting...");
      setTimeout(() => navigate("/insights_news"), 1000);
    } catch (error) {
      alert("An error occurred while logging in.");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const isDisabled = email.trim() === "" || password.trim() === "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
        PAUL <span className="text-[#3b3c43]">&</span> PAUL LAWYERS
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-sm space-y-4"
      >
        <h2 className="text-white text-lg font-normal text-center">
          Sign in with your account
        </h2>

        <div className="w-full">
          <input
            type="text"
            placeholder="email@gmail.com"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-3 py-2 bg-transparent border rounded text-white outline-none transition-all duration-200 
              placeholder-gray-500 focus:border-white focus:shadow-[0_0_4px_white] 
              ${emailError ? "border-[#CC000D]" : "border-[#444]"}`}
          />
          {emailError && (
            <p className="text-[#CC000D] text-sm mt-1 font-montserrat">
              {emailError}
            </p>
          )}
        </div>

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            className={`w-full px-3 py-2 pr-10 bg-transparent border rounded text-white outline-none transition-all duration-200 
              placeholder-gray-500 focus:border-white focus:shadow-[0_0_4px_white] 
              ${passwordError ? "border-[#CC000D]" : "border-[#444]"}`}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-gray-300"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
          {passwordError && (
            <p className="text-[#CC000D] text-sm mt-1 font-montserrat">
              {passwordError}
            </p>
          )}
        </div>

        {successMessage && (
          <p className="text-[#2ecc71] font-medium text-center transition-opacity duration-300">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full py-2 mt-2 font-semibold text-black rounded bg-white transition-transform duration-200
            hover:-translate-y-0.5 
            ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span className="text-[16px] font-semibold tracking-tight">
            SIGN IN
          </span>
        </button>
      </form>
    </div>
  );
}
