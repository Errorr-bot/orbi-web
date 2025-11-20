// src/views/Transactions.tsx
import React, { useState } from "react";

const sampleTx = [
  { id: "t1", title: "Freelance Project", category: "Freelance", date: "2024-07-28", amount: 300 },
  { id: "t2", title: "Weekly Groceries", category: "Groceries", date: "2024-07-25", amount: -90 },
  { id: "t3", title: "Stock Investment", category: "Investments", date: "2024-07-22", amount: -500 },
  // ... you can fetch real data later
];

export default function Transactions({ onClose }: { onClose?: () => void }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="transactions-view card">
      <div className="card-head">
        <h3>Transactions</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => onClose?.()}>Close</button>
          <button className="btn mint" onClick={() => setShowAdd(true)}>+ Add Expense</button>
        </div>
      </div>

      <div className="transactions-card-inner" style={{ marginTop: 12 }}>
        <table className="tx-table" style={{ width: "100%" }}>
          <thead>
            <tr><th>Description</th><th>Category</th><th>Date</th><th style={{ textAlign: "right" }}>Amount</th></tr>
          </thead>
          <tbody>
            {sampleTx.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.title}</strong></td>
                <td className="muted">{t.category}</td>
                <td className="muted">{new Date(t.date).toLocaleDateString()}</td>
                <td style={{ textAlign: "right" }}>
                  <span className={`amt ${t.amount > 0 ? "pos" : "neg"}`}>{t.amount > 0 ? `+₹${t.amount.toFixed?.(2) ?? t.amount}` : `-₹${Math.abs(t.amount).toFixed?.(2) ?? t.amount}`}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="mint-modal" role="dialog" aria-modal="true">
          <div className="mint-modal-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Add New Expense</h3>
              <button className="tiny" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <p className="muted small">Manually add an expense or scan a receipt.</p>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              <input placeholder="Expense description" />
              <input placeholder="Amount" />
              <select><option>Select a category</option></select>
              <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
              <button className="btn" onClick={() => { setShowAdd(false); }}>Add Expense</button>
              <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
