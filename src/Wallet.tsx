import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Wallet.css";

interface Expense {
  id: number;
  name: string;
  amount: number;
}

const Wallet: React.FC = () => {
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
    <div className="wallet-container">
      <h2 className="section-title">💰 Orbi Wallet</h2>
      <p className="wallet-balance">Current Balance: ₹{balance}</p>

      {/* SplitEase Shortcut */}
      <div className="splitease-link">
        <p className="split-text">Need to split expenses with friends?</p>
        <Link to="/splitease" className="btn-mint">
          🌿 Open SplitEase
        </Link>
      </div>

      {/* Expense Form */}
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

      {/* Expense List */}
      <ul className="wallet-list">
        {expenses.map((exp) => (
          <li key={exp.id} className="wallet-item">
            <span>{exp.name}</span>
            <span className="wallet-amt">-₹{exp.amount}</span>
          </li>
        ))}
      </ul>

      {/* Reset Button */}
      {expenses.length > 0 && (
        <button className="wallet-reset" onClick={resetWallet}>
          Reset Wallet
        </button>
      )}
    </div>
  );
};

export default Wallet;
