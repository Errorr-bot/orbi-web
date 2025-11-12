// src/App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";

import LandingPage from "./LandingPage";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import SplitEase from "./SplitEase"; // ✅ new feature

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f9fffd, #d4fff2)",
          color: "#004d3a",
          fontFamily: "Poppins, sans-serif",
          fontSize: "1.5rem",
        }}
      >
        Loading Orbi...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes user={user} />
    </BrowserRouter>
  );
};

const AnimatedRoutes: React.FC<{ user: User | null }> = ({ user }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ position: "relative" }}
      >
        <Routes location={location}>
          {/* 🌿 Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          {/* 🌿 Protected Pages */}
          <Route
            path="/dashboard"
            element={<Dashboard email={user?.email || ""} />}
          />
          <Route path="/splitease" element={<SplitEase />} /> {/* ✅ New Route */}
        </Routes>

        {/* Mint wave transition overlay */}
        <motion.div
          className="mint-transition"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0 }}
          exit={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default App;
