// src/Wallet.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Wallet.css";

interface Expense {
  id: number;
  name: string;
  amount: number;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [balance, setBalance] = useState(0);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newExpense = { id: Date.now(), name, amount: Number(amount) };
    setExpenses([...expenses, newExpense]);
    setBalance(balance - Number(amount));
    setName("");
    setAmount("");
  };

  const resetWallet = () => {
    setExpenses([]);
    setBalance(0);
  };

  return (
    <motion.div
      className="wallet-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >

      {/* 🌿 Mint Back Button */}
      <button
        className="mint-back-btn"
        onClick={() => {
          const btn = document.querySelector(".mint-back-btn");
          btn?.classList.add("ripple");
          setTimeout(() => btn?.classList.remove("ripple"), 500);
          setTimeout(() => navigate("/dashboard"), 250);
        }}
      >
        <span className="arrow">←</span>
        <span className="tooltip">Back to Dashboard</span>
      </button>

      <h2 className="section-title">💰 Orbi Wallet</h2>
      <p className="wallet-balance">Balance: ₹{balance}</p>

      <form onSubmit={addExpense} className="wallet-form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Expense name"
          className="wallet-input"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount"
          className="wallet-input"
        />
        <button type="submit" className="wallet-add">
          Add
        </button>
      </form>

      <ul className="wallet-list">
        {expenses.map((exp) => (
          <li key={exp.id} className="wallet-item">
            <span>{exp.name}</span>
            <span className="wallet-amt">-₹{exp.amount}</span>
          </li>
        ))}
      </ul>

      {expenses.length > 0 && (
        <button className="wallet-reset" onClick={resetWallet}>
          Reset
        </button>
      )}

      {/* SplitEase Access Button */}
      <div className="splitease-access">
        <Link to="/splitease" className="splitease-btn">
          💸 Open SplitEase
        </Link>
      </div>
    </motion.div>
  );
};

export default Wallet;
