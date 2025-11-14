// src/Profile.tsx
import React, { useEffect, useState } from "react";
import "./Profile.css";
import { db, auth } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [upi, setUpi] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Load profile
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setUpi(data.upi || "");
      }
    };
    loadProfile();
  }, [user]);

  // Save profile
  const saveProfile = async () => {
    if (!user) return;

    await setDoc(doc(db, "profiles", user.uid), {
      name,
      email: user.email,
      upi
    });

    setStatusMsg("✓ Profile updated successfully!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  return (
    <motion.div
      className="profile-root"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 🌿 Mint Back Button */}
      <button
        className="mint-back-btn"
        onClick={() => {
          const btn = document.querySelector(".mint-back-btn");
          btn?.classList.add("ripple");
          setTimeout(() => btn?.classList.remove("ripple"), 500);
          setTimeout(() => navigate("/dashboard"), 250);
        }}
      >
        <span className="arrow">←</span>
        <span className="tooltip">Back to Dashboard</span>
      </button>

      <motion.div
        className="profile-card glass-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>👤 Your Profile</h2>
        <p className="muted">Manage your identity, contact, and payment details.</p>

        <div className="profile-fields">
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />

          <label>Email (read-only)</label>
          <input value={email} disabled />

          <label>UPI ID</label>
          <input
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            placeholder="e.g. johndoe@oksbi"
          />

          {upi && (
            <div className="upi-status">
              <span className="check">✓</span> UPI Linked
            </div>
          )}

          <button className="mint-btn" onClick={saveProfile}>
            Save Profile
          </button>

          {statusMsg && <div className="status-msg">{statusMsg}</div>}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
