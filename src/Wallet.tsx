// src/Wallet.tsx
import React, { useState } from "react";

interface Transaction {
  id: number;
  label: string;
  amount: number;
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<number | "">("");

  const addTransaction = () => {
    if (!label || amount === "") return;
    const newTransaction = {
      id: Date.now(),
      label,
      amount: Number(amount),
    };
    setTransactions([...transactions, newTransaction]);
    setBalance(balance + Number(amount));
    setLabel("");
    setAmount("");
  };

  const removeTransaction = (id: number, amt: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    setBalance(balance - amt);
  };

  return (
    <div
      style={{
        marginTop: "30px",
        background: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 24,
        color: "white",
        textAlign: "center",
      }}
    >
      <h2>💰 Wallet</h2>
      <p style={{ opacity: 0.8 }}>Your current balance</p>
      <h1 style={{ margin: "8px 0", fontSize: "2rem" }}>₹ {balance}</h1>

      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Label (e.g., Lunch, Salary)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={inputStyle}
        />
        <button onClick={addTransaction} style={btnStyle}>
          ➕ Add
        </button>
      </div>

      {transactions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>📜 Transactions</h3>
          {transactions.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                background: "rgba(255,255,255,0.15)",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              <span>
                {t.label} — ₹{t.amount}
              </span>
              <button
                onClick={() => removeTransaction(t.id, t.amount)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ff7070",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  margin: "6px",
  padding: "8px",
  borderRadius: "6px",
  border: "none",
  outline: "none",
  fontSize: "14px",
  width: "40%",
};

const btnStyle: React.CSSProperties = {
  padding: "8px 14px",
  background: "rgba(255,255,255,0.25)",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 600,
};

export default Wallet;
