// src/views/SplitEaseShortcut.tsx
import React from "react";

export default function SplitEaseShortcut() {
  return (
    <div className="card">
      <div className="card-head">
        <h3>SplitEase — Quick Access</h3>
      </div>

      <div style={{ paddingTop: 8 }}>
        <p className="muted">
          Open the full SplitEase app for group splits, notifications and UPI flows.
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            className="btn mint"
            onClick={() => (window.location.href = "/splitease")}
          >
            Open SplitEase
          </button>
        </div>
      </div>
    </div>
  );
}
