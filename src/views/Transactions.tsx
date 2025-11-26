// src/views/Transactions.tsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from "tesseract.js";

type Tx = { id: string; title: string; category: string; date: string; amount: number };

const sampleTx: Tx[] = [
  { id: "t1", title: "Freelance Project", category: "Freelance", date: "2024-07-28", amount: 300 },
  { id: "t2", title: "Weekly Groceries", category: "Groceries", date: "2024-07-25", amount: -90 },
  { id: "t3", title: "Stock Investment", category: "Investments", date: "2024-07-22", amount: -500 },
];

export default function Transactions({ onClose }: { onClose?: () => void }) {
  const [tx, setTx] = useState<Tx[]>(sampleTx);
  const [showAdd, setShowAdd] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);

  // add-expense form state (can be prefilled by OCR)
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Add transaction (local demo only — replace with your DB save)
  const addExpense = () => {
    const a = Number(amount) || 0;
    if (!desc || !a) return alert("Fill description and amount");
    const newTx: Tx = { id: `t${Date.now()}`, title: desc, category: category || "Misc", date: new Date().toISOString(), amount: a };
    setTx((s) => [newTx, ...s]);
    setShowAdd(false);
    setDesc("");
    setAmount("");
    setCategory("");
  };

  // open file input to capture / choose photo
  const openFile = () => {
    setScanOpen(true);
    setTimeout(() => fileRef.current?.click(), 50);
  };

  // parse text -> try to find amount & description heuristics
  const heuristicsParse = (text: string) => {
    // simple heuristics: find the largest currency-like number
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let foundAmount: number | null = null;
    for (const l of lines) {
      // look for ₹ or Rs or numbers
      const m = l.match(/(?:₹|Rs\.?|INR)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
      if (m) {
        const num = Number(m[1].replace(/,/g, ""));
        if (!isNaN(num) && (foundAmount === null || num > (foundAmount || 0))) foundAmount = num;
      } else {
        // fallback: any plain number
        const m2 = l.match(/([0-9,]+(?:\.[0-9]{1,2})?)/);
        if (m2) {
          const num = Number(m2[1].replace(/,/g, ""));
          if (!isNaN(num) && (foundAmount === null || num > (foundAmount || 0))) foundAmount = num;
        }
      }
    }

    // choose a description as the first non-numeric line
    const descLine = lines.find((l) => !/^[0-9₹Rs\.,\s]+$/.test(l)) || lines[0] || "";
    return { amount: foundAmount, description: descLine };
  };

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setScanOpen(false);
      return;
    }

    try {
      setScanning(true);
      setOcrProgress(0);
      const imgURL = URL.createObjectURL(f);

      // run tesseract
      const worker = Tesseract.createWorker({
        logger: (m) => {
          if (m.status === "recognizing text" && typeof m.progress === "number") setOcrProgress(Math.round(m.progress * 100));
        },
      });

      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      const { data } = await worker.recognize(imgURL);
      await worker.terminate();

      const text = data.text || "";
      const { amount: parsedAmount, description } = heuristicsParse(text);

      // prefill Add Expense form with heuristics result
      setDesc(description || "");
      setAmount(parsedAmount ?? "");
      setCategory(""); // user picks
      setShowAdd(true);
      setScanOpen(false);
    } catch (err) {
      console.error("OCR error", err);
      alert("Receipt scan failed — you can try again or add manually.");
    } finally {
      setScanning(false);
      setOcrProgress(null);
      // reset input value so same file can be selected again
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <motion.div
      className="tx-wrapper"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Transactions</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => onClose?.()}>Close</button>
          <button className="btn" onClick={openFile}>📷 Scan Receipt</button>
          <button className="btn mint" onClick={() => setShowAdd(true)}>+ Add Expense</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {tx.map((t) => (
          <motion.div key={t.id} className="tx-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <div className="tx-left">
              <div className="tx-title">{t.title}</div>
              <div className="tx-meta"><span className="tx-category">{t.category}</span> • <span className="muted">{new Date(t.date).toLocaleDateString()}</span></div>
            </div>
            <div className={`tx-amount ${t.amount > 0 ? "pos" : "neg"}`}>{t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}</div>
          </motion.div>
        ))}
      </div>

      {/* hidden file input for camera / gallery */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={onFileChosen}
      />

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="mint-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mint-modal-card" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Add New Expense</h3>
                <button className="tiny" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <p className="muted small">Manually add an expense or scan a receipt (Scan pre-fills fields).</p>

              <div className="tx-modal-fields" style={{ marginTop: 10 }}>
                <input placeholder="Expense description" value={desc} onChange={(e) => setDesc(e.target.value)} />
                <input placeholder="Amount" type="number" value={amount as any} onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")} />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select a category</option>
                  <option>Food</option>
                  <option>Groceries</option>
                  <option>Investments</option>
                  <option>Freelance</option>
                  <option>Transport</option>
                  <option>Entertainment</option>
                </select>
                <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn mint" onClick={addExpense}>Add Expense</button>
                  <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan progress modal */}
      <AnimatePresence>
        {scanning && (
          <motion.div className="mint-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="mint-modal-card" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <h4>Scanning receipt…</h4>
              <div className="muted small" style={{ marginTop: 8 }}>
                OCR progress: {ocrProgress ?? 0}%
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button className="btn" onClick={() => { /* allow user to cancel scan — we just stop visual */ setScanning(false); }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
