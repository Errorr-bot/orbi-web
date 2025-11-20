// src/components/Sidebar.tsx
import React from "react";

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
  { key: "tasks", label: "Tasks", icon: "🗒️" },
];

const Sidebar: React.FC<Props> = ({ active, onSelect }) => {
  return (
    <aside className="app-sidebar" aria-hidden={false}>
      <div className="sidebar-top">
        <div className="logo">Orbi</div>
      </div>

      <nav className="sidebar-nav">
        {items.map((it) => (
          <button
            key={it.key}
            className={`sidebar-item ${active === it.key ? "active" : ""}`}
            onClick={() => onSelect(it.key)}
            aria-current={active === it.key ? "page" : undefined}
          >
            <span className="si-icon" aria-hidden>{it.icon}</span>
            <span className="si-label">{it.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <small className="muted">Made with 💚 Orbi</small>
      </div>
    </aside>
  );
};

export default Sidebar;
