import React, { useState } from "react";
import "../design/style.css";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
  };

  return (
    <div className="signin-container">
      <h1 className="title">
        PAUL <span>&</span> PAUL LAWYERS
      </h1>

      <form className="signin-form" onSubmit={handleSubmit}>
        <h2>Sign in with your account</h2>

        <input
          type="text"
          placeholder="email@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="signin-btn">
          SIGN IN
        </button>
      </form>
    </div>
  );
}
