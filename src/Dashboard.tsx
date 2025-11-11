// src/Dashboard.tsx
import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Tasks from "./Tasks";
import Profile from "./Profile";
import Scan from "./Scan";

type Props = { email?: string | null };

const Dashboard: React.FC<Props> = ({ email }) => {
  const [showTasks, setShowTasks] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showScan, setShowScan] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #C48AF6, #FF71C6)",
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
        {/* Avatar placeholder */}
        <div
          style={{
            width: 140,
            height: 140,
            margin: "0 auto 12px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 35%, #FFFFFF, #EBD6FF 60%, rgba(255,255,255,0.0) 70%)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              transform: "rotate(45deg)",
              background: "#F3C6FF",
              borderRadius: 4,
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -10,
              left: -6,
              width: 18,
              height: 18,
              transform: "rotate(25deg)",
              background: "#FFD0F0",
              borderRadius: 4,
              opacity: 0.9,
            }}
          />
        </div>

        <h1 style={{ margin: "8px 0 0" }}>🌐 Orbi</h1>
        <p style={{ margin: "6px 0 18px", opacity: 0.9 }}>
          Your world. One app.
        </p>

        <p style={{ fontSize: 14, opacity: 0.85 }}>
          {email ? `Signed in as ${email}` : "Welcome!"}
        </p>

        {/* Buttons Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginTop: 18,
          }}
        >
          {/* 📝 Tasks Button */}
          <button style={btn} onClick={() => setShowTasks(!showTasks)}>
            📝 Tasks
          </button>

          {/* 💰 Wallet Button (future) */}
          <button style={btn}>💰 Wallet</button>

          {/* 📷 Scan Button */}
          <button style={btn} onClick={() => setShowScan(!showScan)}>
            📷 Scan
          </button>

          {/* 👤 Profile Button */}
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

        {/* 🧩 Toggle Sections */}
        {showTasks && <Tasks />}
        {showProfile && <Profile email={email} />}
        {showScan && <Scan />}
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
  transition: "background 0.3s ease",
};

export default Dashboard;
