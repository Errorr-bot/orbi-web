// src/views/Transactions.tsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recognize } from "tesseract.js";

type Tx = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
};

const initialTx: Tx[] = [
  { id: "t1", title: "Freelance Project", category: "Freelance", date: "2024-07-28", amount: 300 },
  { id: "t2", title: "Weekly Groceries", category: "Groceries", date: "2024-07-25", amount: -90 },
  { id: "t3", title: "Stock Investment", category: "Investments", date: "2024-07-22", amount: -500 },
];

export default function Transactions({ onClose }: { onClose?: () => void }) {
  const [transactions, setTransactions] = useState<Tx[]>(initialTx);
  const [showAdd, setShowAdd] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  // ---------- OCR PARSER ----------
  const parseReceiptText = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

    let detectedAmount: number | null = null;
    for (const l of lines) {
      const match = l.match(/([0-9,]+(?:\.[0-9]{1,2})?)/);
      if (match) {
        const num = Number(match[1].replace(/,/g, ""));
        if (!isNaN(num)) detectedAmount = Math.max(detectedAmount ?? 0, num);
      }
    }

    const desc = lines.find(l => l.length > 4 && !l.match(/[0-9]/)) || "Scanned Expense";
    return { desc, detectedAmount };
  };

  // ---------- SCAN RECEIPT ----------
  const handleScan = async (file: File) => {
    setScanning(true);
    setProgress(0);

    try {
      const { data } = await recognize(file, "eng", {
        logger: (m) => {
          if (m.progress) setProgress(Math.round(m.progress * 100));
        }
      });

      const { desc, detectedAmount } = parseReceiptText(data.text || "");

      setTitle(desc);
      setAmount(detectedAmount ?? "");
      setShowAdd(true);
    } catch (err) {
      alert("Receipt scan failed. You can enter manually.");
      console.error(err);
    } finally {
      setScanning(false);
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addExpense = () => {
    if (!title || !amount) return alert("Enter title & amount");

    const tx: Tx = {
      id: `t${Date.now()}`,
      title,
      category: category || "Misc",
      date: new Date().toISOString(),
      amount: -Math.abs(Number(amount)),
    };

    setTransactions([tx, ...transactions]);
    setShowAdd(false);
    setTitle(""); setAmount(""); setCategory("");
  };

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      <div className="card-head">
        <h3>Transactions</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>📷 Scan Receipt</button>
          <button className="btn mint" onClick={() => setShowAdd(true)}>+ Add</button>
        </div>
      </div>

      {transactions.map(tx => (
        <div key={tx.id} className="tx-item">
          <div>
            <strong>{tx.title}</strong>
            <div className="muted small">{tx.category} • {new Date(tx.date).toLocaleDateString()}</div>
          </div>
          <div className={tx.amount > 0 ? "pos" : "neg"}>
            ₹{Math.abs(tx.amount)}
          </div>
        </div>
      ))}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => e.target.files && handleScan(e.target.files[0])}
      />

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="mint-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mint-modal-card">
              <h3>Add Expense</h3>

              <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
              <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(+e.target.value)} />

              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select category</option>
                <option>Food</option>
                <option>Groceries</option>
                <option>Transport</option>
                <option>Entertainment</option>
              </select>

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button className="btn mint" onClick={addExpense}>Add</button>
                <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan indicator */}
      {scanning && (
        <div className="mint-modal">
          <div className="mint-modal-card">
            <h4>Scanning receipt…</h4>
            <div className="muted">OCR progress: {progress ?? 0}%</div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
