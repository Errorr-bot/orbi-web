// src/views/SavingsPlanner.tsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import "./SavingsPlanner.css";

type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  owner?: string;
  createdAt?: any;
};

const COLORS = ["#73ffc4", "#b9ffe8", "#ffd9c2", "#ffd9e0", "#ffe9b9", "#cde8ff"];

export default function SavingsPlanner() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) {
      // no user: show sample static goals
      setGoals([
        { id: "g1", name: "Vacation to Japan", target: 5000, saved: 2500 },
        { id: "g2", name: "Emergency Fund", target: 10000, saved: 9500 },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, "savingsGoals"), where("owner", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const arr: Goal[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          name: data.name,
          target: data.target || 0,
          saved: data.saved || 0,
          owner: data.owner,
          createdAt: data.createdAt,
        };
      });
      setGoals(arr);
      setLoading(false);
    }, (err) => {
      console.error("SavingsPlanner.onSnapshot error", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  const addGoal = async () => {
    if (!user?.uid) {
      alert("Sign in to save goals");
      return;
    }
    const name = newName.trim();
    const target = Number(newTarget || 0);
    if (!name || !target) return;
    try {
      await addDoc(collection(db, "savingsGoals"), {
        name,
        target,
        saved: 0,
        owner: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewName("");
      setNewTarget("");
    } catch (err) {
      console.error("addGoal error", err);
      alert("Failed to add goal");
    }
  };

  const updateSaved = async (id: string, newSaved: number) => {
    try {
      const ref = doc(db, "savingsGoals", id);
      await updateDoc(ref, { saved: newSaved });
    } catch (err) {
      console.error("updateSaved error", err);
    }
  };

  const removeGoal = async (id: string) => {
    const ok = window.confirm("Delete this goal?");
    if (!ok) return;
    try {
      await deleteDoc(doc(db, "savingsGoals", id));
    } catch (err) {
      console.error("removeGoal error", err);
    }
  };

  // computed donut data for chart
  const donutData = goals.map((g) => ({ name: g.name, value: g.saved }));

  return (
    <div className="card savings-card">
      <div className="card-head">
        <h3>Savings Planner</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>
        <div>
          <p className="muted">Track your progress for each of your savings objectives. Changes sync to Firestore.</p>

          <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
            {loading && <div className="muted">Loading...</div>}
            {!loading && goals.length === 0 && <div className="muted">No savings goals yet — add one.</div>}

            {goals.map((g) => {
              const pct = g.target > 0 ? Math.min((g.saved / g.target) * 100, 100) : 0;
              return (
                <div key={g.id} className="saving-goal">
                  <div className="goal-top">
                    <strong>{g.name}</strong>
                    <div className="muted small">₹{g.saved} / ₹{g.target}</div>
                  </div>

                  <div className="goal-bar">
                    <div style={{ width: pct + "%" }} />
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                    <input
                      type="number"
                      className="mini-input"
                      value={g.saved}
                      onChange={(e) => updateSaved(g.id, Number(e.target.value || 0))}
                    />
                    <button className="btn" onClick={() => updateSaved(g.id, Math.min(g.saved + Math.round(g.target * 0.05), g.target))}>
                      +5%
                    </button>
                    <button className="btn" onClick={() => updateSaved(g.id, Math.max(g.saved - Math.round(g.target * 0.05), 0))}>
                      -5%
                    </button>
                    <button className="btn" onClick={() => removeGoal(g.id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="add-goal-box" style={{ marginTop: 16 }}>
            <h4>Add New Goal</h4>
            <input placeholder="Goal name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input placeholder="Target amount" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn mint" onClick={addGoal}>Add Goal</button>
            </div>
          </div>
        </div>

        <div>
          <div style={{ height: 260, display: "grid", placeItems: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={6}
                  >
                  {donutData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>Summary</h4>
            <div className="muted small">Total saved: ₹{goals.reduce((s, g) => s + g.saved, 0)} • Total target: ₹{goals.reduce((s, g) => s + g.target, 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
