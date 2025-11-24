// src/views/Transactions.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sampleTx = [
  { id: "t1", title: "Freelance Project", category: "Freelance", date: "2024-07-28", amount: 300 },
  { id: "t2", title: "Weekly Groceries", category: "Groceries", date: "2024-07-25", amount: -90 },
  { id: "t3", title: "Stock Investment", category: "Investments", date: "2024-07-22", amount: -500 },
];

export default function Transactions({ onClose }: { onClose?: () => void }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <motion.div
      className="tx-wrapper card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-head">
        <h3>Transactions</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => onClose?.()}>Close</button>
          <button className="btn mint" onClick={() => setShowAdd(true)}>+ Add Expense</button>
        </div>
      </div>

      <div className="tx-list">
        {sampleTx.map((tx) => (
          <motion.div
            key={tx.id}
            className="tx-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="tx-left">
              <div className="tx-title">{tx.title}</div>
              <div className="tx-meta">
                <span className="tx-category">{tx.category}</span> •{" "}
                <span className="muted">{new Date(tx.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={`tx-amount ${tx.amount > 0 ? "pos" : "neg"}`}>
              {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="mint-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mint-modal-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Add New Expense</h3>
                <button className="tiny" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <p className="muted small">Add an expense manually.</p>

              <div className="tx-modal-fields">
                <input placeholder="Expense description" />
                <input placeholder="Amount" type="number" />
                <select>
                  <option>Select a category</option>
                  <option>Food</option>
                  <option>Groceries</option>
                  <option>Investments</option>
                  <option>Freelance</option>
                </select>
                <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />

                <button className="btn mint" onClick={() => setShowAdd(false)}>Add Expense</button>
                <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
