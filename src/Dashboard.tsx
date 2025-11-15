// src/Dashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import "./Dashboard.css";

interface NotificationItem {
  id: string;
  message?: string;
  amount?: number;
  upiLink?: string | null;
  groupId?: string;
  status: "read" | "unread";
}

const Dashboard: React.FC<{ email: string }> = ({ email }) => {
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifList, setNotifList] = useState<NotificationItem[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sound] = useState(new Audio("/sounds/mint_notify.mp3"));

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.email) return;

    const q = query(
      collection(db, "notifications"),
      where("to", "==", user.email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const all: NotificationItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setNotifList(all);

      const unread = all.filter((n) => n.status === "unread").length;
      setUnreadCount(unread);

      if (unread > unreadCount) {
        try {
          sound.play();
        } catch {}

        setToastMsg("💬 You have a new SplitEase notification!");
        setTimeout(() => setToastMsg(null), 6000);
      }
    });

    return () => unsub();
  }, [unreadCount, sound]);

  return (
    <div className="dash-root">
      {/* 🔔 Notification Bell */}
      <div className="notif-bell" onClick={() => navigate("/notifications")}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </div>

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

      {/* Mint Toast */}
      {toastMsg && (
        <div className="mint-toast">
          <p>{toastMsg}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
