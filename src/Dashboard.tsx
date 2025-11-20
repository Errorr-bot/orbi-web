// src/Dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Transactions from "./views/Transactions";
import SmartBudget from "./views/SmartBudget";
import SavingsPlanner from "./views/SavingsPlanner";
import SplitEaseShortcut from "./views/SplitEaseShortcut";
import { motion, AnimatePresence } from "framer-motion";
import "./Dashboard.css";
import { auth } from "./firebaseConfig";

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<string>("overview");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // close small dropdowns / overlays on outside click — safe utility
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        // nothing for now, placeholder if we add right-panel overlays
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // small toast helper
  const triggerToast = (txt: string, ms = 2400) => {
    setToastMsg(txt);
    setTimeout(() => setToastMsg(null), ms);
  };

  // back button handler - same as wallet backbehavior
  const goBackToWallet = () => {
    // change to wallet route or show wallet view - here we route to wallet path
    window.location.href = "/wallet"; // or use navigate if using react-router
  };

  return (
    <div className="dash-root">
      <div className="dash-top-controls" ref={wrapperRef}>
        <div
          className="notif-bell"
          title="Notifications"
          onClick={() => triggerToast("Open notifications in SplitEase")}
        >
          🔔
        </div>

        <div
          className="profile-icon"
          title="Profile"
          onClick={() => triggerToast("Open profile (top-right)")}
        >
          {auth.currentUser?.photoURL ? (
            <img src={auth.currentUser.photoURL} alt="me" />
          ) : (
            <span className="avatar-initial">{(auth.currentUser?.email || "U").charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>

      <Sidebar active={activeView} onSelect={setActiveView} />

      <main className="dash-content">
        <header className="dash-header">
          <div>
            <h2>{activeView === "overview" ? "Welcome Back" : activeView.replace(/^\w/, (s)=>s.toUpperCase())}</h2>
            <p className="muted">Calm, connected & smart — {auth.currentUser?.email || "your dashboard"}.</p>
          </div>
          <div className="header-actions">
            <button className="btn small" onClick={() => setActiveView("overview")}>Overview</button>
            <button className="btn mint" onClick={() => setActiveView("transactions")}>Transactions</button>
          </div>
        </header>

        <section className="dash-main-grid">
          <AnimatePresence exitBeforeEnter>
            {activeView === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.28 }}>
                <div className="overview-grid">
                  <div className="summary-row">
                    <div className="summary-card">
                      <div className="summary-title">Total Balance</div>
                      <div className="summary-value">₹ 2,450</div>
                      <div className="summary-sub muted">Based on your transactions</div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-title">Total Spending (This Month)</div>
                      <div className="summary-value">₹ 2,850</div>
                      <div className="summary-sub muted">+20% from last month</div>
                    </div>
                    <div className="summary-card">
                      <div className="summary-title">Savings Progress</div>
                      <div className="summary-value">75%</div>
                      <div className="summary-sub muted">Toward 'New Car'</div>
                    </div>
                  </div>

                  <div className="charts-row">
                    <div className="card large">
                      <div className="card-head">
                        <h3>Spending Overview</h3>
                      </div>
                      <div className="chart-placeholder">[Bar chart placeholder — wire your chart here]</div>
                    </div>

                    <div className="card large">
                      <div className="card-head">
                        <h3>Category Breakdown</h3>
                      </div>
                      <div className="chart-placeholder circle">[Donut placeholder]</div>
                    </div>
                  </div>

                  <div className="cards-row">
                    <div className="card">
                      <div className="card-head">
                        <h3>Recent Transactions</h3>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn" onClick={() => setActiveView("transactions")}>View all</button>
                          <button className="btn mint" onClick={() => setActiveView("transactions")}>+ Add Expense</button>
                        </div>
                      </div>
                      <div className="muted">Quick peek at your activity — open Transactions for full view.</div>
                    </div>

                    <div className="card">
                      <div className="card-head">
                        <h3>Savings Goals</h3>
                        <button className="tiny" onClick={() => setActiveView("savings")}>Manage</button>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div className="goal-row">
                          <div className="goal-name">Vacation to Japan</div>
                          <div className="goal-bar"><div style={{ width: "50%" }} /></div>
                          <div className="muted small">₹2,500 / ₹5,000</div>
                        </div>
                        <div className="goal-row">
                          <div className="goal-name">Emergency Fund</div>
                          <div className="goal-bar"><div style={{ width: "95%" }} /></div>
                          <div className="muted small">₹9,500 / ₹10,000</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === "transactions" && (
              <motion.div key="transactions" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.28 }}>
                <div className="view-top">
                  <button className="mint-back-btn" onClick={goBackToWallet} title="Back to Wallet">←</button>
                </div>
                <Transactions onClose={() => setActiveView("overview")} />
              </motion.div>
            )}

            {activeView === "smartbudget" && (
              <motion.div key="smartbudget" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.28 }}>
                <div className="view-top">
                  <button className="mint-back-btn" onClick={goBackToWallet} title="Back to Wallet">←</button>
                </div>
                <SmartBudget />
              </motion.div>
            )}

            {activeView === "savings" && (
              <motion.div key="savings" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.28 }}>
                <div className="view-top">
                  <button className="mint-back-btn" onClick={goBackToWallet} title="Back to Wallet">←</button>
                </div>
                <SavingsPlanner />
              </motion.div>
            )}

            {activeView === "splitease" && (
              <motion.div key="splitease" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.28 }}>
                <div className="view-top">
                  <button className="mint-back-btn" onClick={() => setActiveView("overview")} title="Close">←</button>
                </div>
                <SplitEaseShortcut />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {toastMsg && (
        <div className="mint-toast">
          <p>{toastMsg}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
