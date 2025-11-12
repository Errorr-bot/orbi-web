// src/Auth.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import "./Auth.css";

interface AuthProps {
  mode: "login" | "signup";
}

const Auth: React.FC<AuthProps> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentMode, setCurrentMode] = useState<"login" | "signup">(mode);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      if (currentMode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("✅ Logged in successfully!");
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("🎉 Account created successfully!");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Mint Waves handled in CSS */}
      <div className="auth-card">
        <h2 className="auth-title">
          {currentMode === "login" ? "Welcome Back 👋" : "Create Your Account 🌿"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="auth-btn">
            {currentMode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p
          className="auth-toggle"
          onClick={() =>
            setCurrentMode(currentMode === "login" ? "signup" : "login")
          }
        >
          {currentMode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </p>

        {message && <p className="auth-message">{message}</p>}
      </div>
    </div>
  );
};

export default Auth;
