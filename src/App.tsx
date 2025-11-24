// src/App.tsx
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";

import LandingPage from "./LandingPage";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Tasks from "./Tasks";
import Wallet from "./Wallet";
import Scan from "./Scan";
import Profile from "./Profile";
import SplitEase from "./SplitEase";

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
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ position: "relative" }}
      >
        <Routes location={location}>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          {/* Private Pages */}
          <Route path="/dashboard" element={<Dashboard />} /> 
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/profile" element={<Profile />} />

          {/* SplitEase - receives navigation state */}
          <Route path="/splitease" element={<SplitEase />} />
        </Routes>

        {/* transition overlay */}
        <motion.div
          className="mint-transition"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0 }}
          exit={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #d4fff2, #f9fffd)",
            transformOrigin: "right",
            zIndex: 1000,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default App;
