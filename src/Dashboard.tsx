// src/Dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Transactions from "./views/Transactions";
import SmartBudget from "./views/SmartBudget";
import SavingsPlanner from "./views/SavingsPlanner";
import SplitEaseShortcut from "./views/SplitEaseShortcut";
import { motion, AnimatePresence } from "framer-motion";
import "./Dashboard.css";
import { auth, db } from "./firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#73ffc4", "#b9ffe8", "#fdd7c2", "#ffd9e0", "#ffe9b9", "#cde8ff"];

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<string>("overview");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Chart data state
  const [categorySeries, setCategorySeries] = useState<{ name: string; amount: number }[]>([]);
  const [monthlySeries, setMonthlySeries] = useState<{ month: string; amount: number }[]>([]);

  // Listen to basic transactions (if you have transactions collection) to build chart data
  useEffect(() => {
    const u = auth.currentUser;
    if (!u?.email) {
      // Fallback to sample data
      setCategorySeries([
        { name: "Groceries", amount: 480 },
        { name: "Rent", amount: 1500 },
        { name: "Utilities", amount: 100 },
        { name: "Transport", amount: 150 },
        { name: "Entertainment", amount: 200 },
        { name: "Investments", amount: 500 },
      ]);
      setMonthlySeries([
        { month: "Jan", amount: 1200 },
        { month: "Feb", amount: 1500 },
        { month: "Mar", amount: 980 },
        { month: "Apr", amount: 1350 },
        { month: "May", amount: 1420 },
        { month: "Jun", amount: 1600 },
      ]);
      return;
    }

    // attempt to use your "transactions" collection
    try {
      const q = query(collection(db, "transactions"), where("owner", "==", u.uid));
      const unsub = onSnapshot(q, (snap) => {
        // aggregate per category and per month
        const catMap: Record<string, number> = {};
        const monMap: Record<string, number> = {};

        snap.docs.forEach((d) => {
          const data: any = d.data();
          const cat = data.category || "Other";
          const amt = Number(data.amount || 0);
          catMap[cat] = (catMap[cat] || 0) + Math.abs(amt);

          const dt = data.date ? new Date(data.date.seconds ? data.date.seconds * 1000 : data.date) : new Date();
          const m = dt.toLocaleString(undefined, { month: "short" });
          monMap[m] = (monMap[m] || 0) + Math.abs(amt);
        });

        setCategorySeries(Object.keys(catMap).map((k) => ({ name: k, amount: catMap[k] })));
        setMonthlySeries(Object.keys(monMap).map((k) => ({ month: k, amount: monMap[k] })));
      });
      return () => unsub();
    } catch {
      // ignore errors; keep sample data
    }
  }, []);

  // close small dropdowns / overlays on outside click — safe utility
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        // nothing for now
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

  // back button handler - direct to dashboard wallet behavior not used here; when inside a view we render the tiny Back button
  const goBackToWallet = () => {
    window.location.href = "/wallet";
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
            <h2>{activeView === "overview" ? "Welcome Back" : activeView.replace(/^\w/, (s) => s.toUpperCase())}</h2>
            <p className="muted">Calm, connected & smart — {auth.currentUser?.email || "your dashboard"}.</p>
          </div>
          <div className="header-actions">
            <button className="btn small" onClick={() => setActiveView("overview")}>Overview</button>
            <button className="btn mint" onClick={() => setActiveView("transactions")}>Transactions</button>
          </div>
        </header>

        <section className="dash-main-grid">
          <AnimatePresence mode="wait">
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
                      <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlySeries}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.06} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#73ffc4" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card large">
                      <div className="card-head">
                        <h3>Category Breakdown</h3>
                      </div>
                      <div style={{ height: 240, display: "grid", placeItems: "center" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categorySeries}
                              dataKey="amount"
                              nameKey="name"
                              outerRadius={80}
                              innerRadius={40}
                              startAngle={90}
                              endAngle={-270}
                              paddingAngle={4}
                              >
                              {categorySeries.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
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
