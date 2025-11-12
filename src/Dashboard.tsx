import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Tasks from "./Tasks";
import Wallet from "./Wallet";
import Scan from "./Scan";
import Profile from "./Profile";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

const Dashboard: React.FC<{ email?: string }> = ({ email }) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number }[]
  >([]);
  const [hovered, setHovered] = useState<number | null>(null);

  const navigate = useNavigate();

  // 🌿 Generate floating mint particles
  useEffect(() => {
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 3,
    }));
    setParticles(generated);
  }, []);

  // ✅ Handle logout → redirect to landing page
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // 👈 Redirect to home after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const variants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="dashboard-root">
      {/* 🌿 Floating Mint Particles */}
      <div className="mint-particles">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className={`mint-particle ${
              hovered === p.id ? "mint-pulse" : ""
            }`}
            initial={{
              x: `${p.x}vw`,
              y: `${p.y}vh`,
              opacity: 0.3 + Math.random() * 0.3,
              scale: 0.8,
            }}
            animate={{
              y: [`${p.y}vh`, `${p.y + 5 * Math.sin(p.id)}vh`, `${p.y}vh`],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <motion.nav
        className="dashboard-nav"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="nav-left">
          <span className="nav-logo">🌐 Orbi</span>
        </div>
        <div className="nav-right">
          <span className="user-email">{email}</span>
          <motion.button
            className="logout-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        </div>
      </motion.nav>

      {/* Tabs */}
      <motion.div
        className="tab-bar"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {["tasks", "wallet", "scan", "profile"].map((tab) => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "tasks" && "📝 Tasks"}
            {tab === "wallet" && "💰 Wallet"}
            {tab === "scan" && "📷 Scan"}
            {tab === "profile" && "👤 Profile"}
          </motion.button>
        ))}
      </motion.div>

      {/* Animated Content */}
      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fade-section"
          >
            {activeTab === "tasks" && <Tasks />}
            {activeTab === "wallet" && <Wallet />}
            {activeTab === "scan" && <Scan />}
            {activeTab === "profile" && <Profile />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
