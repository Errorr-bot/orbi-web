// src/Dashboard.tsx
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Tasks from "./Tasks";
import Profile from "./Profile";
import Scan from "./Scan";
import Wallet from "./Wallet";
import OrbiAvatar from "./components/OrbiAvatar";

type Props = { email?: string | null };

const Dashboard: React.FC<Props> = ({ email }) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #CA8AF6, #FF1C6C)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Poppins, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          padding: 24,
          textAlign: "center",
          backdropFilter: "blur(6px)",
          minHeight: "520px",
        }}
      >
        {/* Header with Avatar */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <OrbiAvatar />
          <h2 style={{ marginTop: 12, fontWeight: 600 }}>Good morning, Syed ✨</h2>
        </div>

        <h1 style={{ margin: "8px 0 0", fontWeight: 700, fontSize: "2rem" }}>
          🌐 Orbi
        </h1>
        <p style={{ margin: "6px 0 18px", opacity: 0.9 }}>
          Your world. One app.
        </p>

        <p style={{ fontSize: 14, opacity: 0.85 }}>
          {email ? `Signed in as ${email}` : "Welcome!"}
        </p>

        {/* Main Navigation Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 18,
          }}
        >
          {/* 📝 Tasks */}
          <button style={btn} onClick={() => setShowTasks(!showTasks)}>
            📝 Tasks
          </button>

          {/* 💰 Wallet */}
          <button style={btn} onClick={() => setShowWallet(!showWallet)}>
            💰 Wallet
          </button>

          {/* 📷 Scan */}
          <button style={btn} onClick={() => setShowScan(!showScan)}>
            📷 Scan
          </button>

          {/* 👤 Profile */}
          <button style={btn} onClick={() => setShowProfile(!showProfile)}>
            👤 Profile
          </button>
        </div>

        {/* 🚪 Logout Button */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => signOut(auth)}
            style={{
              padding: "10px 14px",
              background: "rgba(255,255,255,0.25)",
              color: "white",
              border: "none",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 600,
              width: "100%",
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Sections */}
        <div style={{ marginTop: 20 }}>
          {showWallet && <Wallet />}
          {showTasks && <Tasks />}
          {showProfile && <Profile email={email} />}
          {showScan && <Scan />}
        </div>
      </div>
    </div>
  );
};

const btn: React.CSSProperties = {
  padding: "12px 14px",
  background: "rgba(255,255,255,0.2)",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.3s ease",
};

export default Dashboard;
