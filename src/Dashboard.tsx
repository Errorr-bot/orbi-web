// src/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import "./Dashboard.css";

const Dashboard: React.FC<{ email: string }> = ({ email }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sound] = useState(new Audio("/sounds/mint_notify.mp3"));

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.email) return;

    // Listen for unread notifications
    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.email),
      where("status", "==", "unread")
    );

    const unsub = onSnapshot(q, (snap) => {
      const count = snap.size;
      setUnreadCount(count);

      if (count > unreadCount) {
        // New notification just arrived
        sound.play();
        setToastMsg("💬 You have a new SplitEase notification!");
        setTimeout(() => setToastMsg(null), 7000);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadCount]);

  return (
    <div className="dash-root">
      <header className="dash-header">
        <h2>🌍 Welcome back, {email || "User"}!</h2>
        <p>Explore your Orbi Dashboard — calm, connected, and smart.</p>
      </header>

      <div className="dash-grid">
        <div className="dash-card" onClick={() => navigate("/tasks")}>
          📝 <h3>Tasks</h3>
          <p>Organize your day calmly.</p>
        </div>

        <div className="dash-card wallet-card" onClick={() => navigate("/wallet")}>
          💰 <h3>Wallet</h3>
          <p>Track & split expenses easily.</p>
          {unreadCount > 0 && <span className="mint-badge" />}
        </div>

        <div className="dash-card" onClick={() => navigate("/scan")}>
          📷 <h3>Scan</h3>
          <p>Extract text instantly.</p>
        </div>

        <div className="dash-card" onClick={() => navigate("/profile")}>
          👤 <h3>Profile</h3>
          <p>Manage your details effortlessly.</p>
        </div>
      </div>

      <button className="logout-btn" onClick={() => navigate("/")}>
        ⎋ Logout
      </button>

      {/* Mint Toast Notification */}
      {toastMsg && (
        <div className="mint-toast">
          <p>{toastMsg}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
