// src/components/Sidebar.tsx
import React from "react";
import { motion } from "framer-motion";
import "./Sidebar.css";

type Props = {
  active: string;
  onSelect: (s: string) => void;
};

const items = [
  { key: "overview", label: "Overview", icon: "🏠" },
  { key: "transactions", label: "Transactions", icon: "📋" },
  { key: "smartbudget", label: "Smart Budgeting", icon: "🧾" },
  { key: "savings", label: "Savings Planner", icon: "🎯" },
  { key: "splitease", label: "SplitEase", icon: "💸" },
  { key: "wallet", label: "Wallet", icon: "💰" },
  { key: "scan", label: "Scan", icon: "📷" },
  { key: "tasks", label: "Tasks", icon: "🗒️" }
];

const Sidebar: React.FC<Props> = ({ active, onSelect }) => {
  return (
    <aside className="sidebar-root">
      {/* Logo */}
      <div className="sidebar-logo">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sidebar-brand"
        >
          Orbi
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {items.map((it) => {
          const isActive = active === it.key;

          return (
            <motion.button
              key={it.key}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(it.key)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <span className="si-icon">{it.icon}</span>

              <span className="si-label">{it.label}</span>

              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="sidebar-active-highlight"
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <small>💚 Orbi</small>
      </div>
    </aside>
  );
};

export default Sidebar;
