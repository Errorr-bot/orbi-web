// src/views/SmartBudget.tsx
import React, { useState } from "react";

export default function SmartBudget() {
  const [income, setIncome] = useState<string>("5000");
  const [fixed, setFixed] = useState<string>("1800");
  const [savings, setSavings] = useState<string>("1000");
  const [result, setResult] = useState<Record<string, number> | null>(null);

  const generate = () => {
    const inc = Number(income) || 0;
    const fixedN = Number(fixed) || 0;
    const saveN = Number(savings) || 0;
    const remaining = Math.max(0, inc - fixedN - saveN);
    // simple split
    const buckets = {
      Groceries: Math.round(remaining * 0.18),
      Rent: Math.round(remaining * 0.4),
      Utilities: Math.round(remaining * 0.05),
      Transport: Math.round(remaining * 0.04),
      Entertainment: Math.round(remaining * 0.05),
      Savings: saveN,
    };
    setResult(buckets);
  };

  return (
    <div className="card">
      <div className="card-head"><h3>Smart Budgeting</h3></div>

      <div style={{ display: "grid", gap: 12 }}>
        <label>Monthly Salary ($)</label>
        <input value={income} onChange={(e) => setIncome(e.target.value)} />

        <label>Fixed Expenses ($)</label>
        <input value={fixed} onChange={(e) => setFixed(e.target.value)} />

        <label>Monthly Savings Goal ($)</label>
        <input value={savings} onChange={(e) => setSavings(e.target.value)} />

        <button className="btn mint" onClick={generate}>Generate Budget</button>

        {result && (
          <div style={{ marginTop: 10 }}>
            <h4>Suggested allocations</h4>
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(result).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>{k}</div>
                  <div className="muted">₹{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
