import React, { useState, useEffect } from "react";
import eyeiconshow from "../assets/eye icon show.svg";
import eyeiconhide from "../assets/eye icon hide.svg";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 👈 new state for spinner
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
    setServerError("");

    if (!validateInputs()) return;

    setIsLoading(true);

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
        else setServerError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/insights_news");
    } catch (error) {
      setServerError("An error occurred while logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
    if (serverError) setServerError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
    if (serverError) setServerError("");
  };

  const isDisabled = email.trim() === "" || password.trim() === "" || isLoading;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-textWhite px-6">
      <h1 className="text-3xl font-bold mb-8 text-center tracking-tight">
        PAUL <span className="text-textPrimary">&</span> PAUL LAWYERS
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-sm space-y-4"
      >
        <h2 className="text-textWhite text-lg font-normal text-center">
          Sign in with your account
        </h2>

        <div className="w-full">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            className={`w-full px-4 py-3 bg-black text-textWhite outline-none transition-all duration-300 
              focus:border-white focus:shadow-[0_0_4px_white]
              ${emailError ? "border-[#CC000D]" : "border-[#717171]"}`}
            style={{
              borderRadius: "0",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "white",
            }}
          />
          <style>
            {`
              input::placeholder {
                color: #717171;
              }
            `}
          </style>
          {emailError && (
            <p className="text-[#CC000D] text-sm mt-1 font-montserrat">
              {emailError}
            </p>
          )}
        </div>

        <div className="w-full">
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 pr-12 bg-black text-textWhite outline-none transition-all duration-300 
                focus:border-white focus:shadow-[0_0_4px_white]
                ${passwordError ? "border-[#CC000D]" : "border-[#717171]"}`}
              style={{
                borderRadius: "0",
                borderWidth: "1px",
                borderStyle: "solid",
                color: "white",
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            >
              <img
                src={showPassword ? eyeiconhide : eyeiconshow}
                alt={showPassword ? "Hide password" : "Show password"}
                className="w-6 h-6 text-gray-500"
              />
            </span>
          </div>
          {passwordError && (
            <p className="text-[#CC000D] text-sm mt-1 font-montserrat">
              {passwordError}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-[#CC000D] text-sm text-center mt-1 font-montserrat">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full h-[50px] py-2 mt-2 font-semibold transition-transform duration-200 flex items-center justify-center gap-2
            ${
              isDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-white text-black cursor-pointer hover:-translate-y-0.5"
            }`}
          style={{
            borderRadius: "0",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#717171",
          }}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span className="text-[16px] font-semibold tracking-tight">
                Signing in...
              </span>
            </>
          ) : (
            <span className="text-[16px] font-semibold tracking-tight">
              SIGN IN
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
