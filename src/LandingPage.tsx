// src/LandingPage.tsx
import React from "react";
import OrbiAvatar from "./components/OrbiAvatar";

const LandingPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #CA8AF6 0%, #FF1C6C 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Poppins, Avenir, sans-serif",
        color: "#fff",
        padding: "40px 20px",
      }}
    >
      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: 20,
          padding: "50px 40px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          maxWidth: 600,
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: 700, marginBottom: 10 }}>
          🌐 Orbi
        </h1>

        <p style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: 20 }}>
          Your world. One app.
        </p>

        {/* Avatar Section */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <OrbiAvatar />
        </div>

        <p style={{ fontSize: "1.05rem", opacity: 0.85, marginBottom: 30 }}>
          Connect your tasks, wallet, and lifestyle — all in one beautiful
          experience.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <a
            href="/login"
            style={{
              textDecoration: "none",
              background: "#fff",
              color: "#CA8AF6",
              padding: "12px 26px",
              borderRadius: 12,
              fontWeight: 600,
              transition: "0.3s ease",
            }}
          >
            Get Started
          </a>

          <a
            href="#features"
            style={{
              textDecoration: "none",
              background: "rgba(255,255,255,0.25)",
              color: "#fff",
              padding: "12px 26px",
              borderRadius: 12,
              fontWeight: 600,
              transition: "0.3s ease",
            }}
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{ marginTop: 80, textAlign: "center" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          What Orbi Brings You
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {[
            {
              icon: "📝",
              title: "Tasks",
              desc: "Track everything you need to do.",
            },
            {
              icon: "💰",
              title: "Wallet",
              desc: "Manage your daily expenses easily.",
            },
            {
              icon: "📷",
              title: "Scan",
              desc: "Extract text from images instantly.",
            },
            {
              icon: "👤",
              title: "Profile",
              desc: "Personalized dashboard & insights.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: 16,
                padding: "20px 24px",
                minWidth: 200,
                maxWidth: 240,
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ fontSize: "1.4rem" }}>
                {f.icon} {f.title}
              </h3>
              <p style={{ fontSize: "0.95rem", opacity: 0.75 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
