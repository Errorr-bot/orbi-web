// src/Profile.tsx
import React from "react";
import { auth } from "./firebaseConfig";

interface ProfileProps {
  email?: string | null;
}

const Profile: React.FC<ProfileProps> = ({ email }) => {
  const joinDate = new Date(
    auth.currentUser?.metadata.creationTime || ""
  ).toLocaleDateString();

  const xp = 70; // demo XP value for now

  return (
    <div
      style={{
        marginTop: "30px",
        background: "rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "24px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h2>👤 Profile</h2>

      {/* Orbi Avatar */}
      <div
        style={{
          width: 100,
          height: 100,
          margin: "12px auto",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 40% 35%, #FFFFFF, #EBD6FF 60%, rgba(255,255,255,0.0) 70%)",
          boxShadow: "0 0 25px rgba(255,255,255,0.4)",
        }}
      />

      <p style={{ fontSize: 14, opacity: 0.85 }}>
        <strong>Email:</strong> {email || "Unknown"}
      </p>
      <p style={{ fontSize: 14, opacity: 0.85 }}>
        <strong>Joined:</strong> {joinDate || "N/A"}
      </p>

      {/* XP Bar */}
      <div
        style={{
          marginTop: "16px",
          background: "rgba(255,255,255,0.25)",
          borderRadius: "8px",
          height: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${xp}%`,
            background: "linear-gradient(90deg,#FFD0F0,#C48AF6)",
            height: "100%",
            transition: "width 0.5s ease",
          }}
        ></div>
      </div>
      <p style={{ fontSize: 12, marginTop: "6px" }}>XP {xp}/100</p>
    </div>
  );
};

export default Profile;
