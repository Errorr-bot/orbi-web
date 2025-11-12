// src/SplitEase.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./SplitEase.css";
import { motion } from "framer-motion";

/** Types */
type Member = {
  id: string;
  name: string;
  email?: string;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // member id
  participants: string[]; // member ids
  note?: string;
  createdAt: any;
};

type Group = {
  id: string;
  name: string;
  currency?: string;
};

const SplitEase: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("");
  const [newExpenseParticipants, setNewExpenseParticipants] = useState<string[]>(
    []
  );
  const [message, setMessage] = useState("");

  // load groups
  useEffect(() => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Group))
      );
    });
    return () => unsub();
  }, []);

  // when selectedGroup changes, subscribe to its members & expenses
  useEffect(() => {
    if (!selectedGroup) {
      setMembers([]);
      setExpenses([]);
      return;
    }

    const membersRef = collection(db, "groups", selectedGroup.id, "members");
    const expRef = collection(db, "groups", selectedGroup.id, "expenses");

    const unsubM = onSnapshot(membersRef, (snap) => {
      setMembers(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Member))
      );
    });

    const unsubE = onSnapshot(query(expRef, orderBy("createdAt", "desc")), (snap) => {
      setExpenses(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as Expense[]
      );
    });

    return () => {
      unsubM();
      unsubE();
    };
  }, [selectedGroup]);

  // create a group
  const handleCreateGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGroupName.trim()) return;
    const docRef = await addDoc(collection(db, "groups"), {
      name: newGroupName.trim(),
      currency: "INR",
      createdAt: Timestamp.now(),
    });
    setNewGroupName("");
    // auto-select the new group
    const snap = await getDoc(doc(db, "groups", docRef.id));
    setSelectedGroup({ id: docRef.id, ...(snap.data() as any) } as Group);
  };

  // add member to selected group
  const handleAddMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroup) return setMessage("Select a group first.");
    if (!newMemberName.trim()) return;
    await addDoc(collection(db, "groups", selectedGroup.id, "members"), {
      name: newMemberName.trim(),
      createdAt: Timestamp.now(),
    });
    setNewMemberName("");
  };

  // add expense
  const handleAddExpense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroup) return setMessage("Select a group first.");
    if (!newExpenseTitle.trim() || !newExpenseAmount.trim() || !newExpensePaidBy)
      return setMessage("Please fill fields.");
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return setMessage("Invalid amount");

    await addDoc(collection(db, "groups", selectedGroup.id, "expenses"), {
      title: newExpenseTitle.trim(),
      amount,
      paidBy: newExpensePaidBy,
      participants: newExpenseParticipants.length
        ? newExpenseParticipants
        : members.map((m) => m.id),
      note: "",
      createdAt: Timestamp.now(),
    });

    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpensePaidBy("");
    setNewExpenseParticipants([]);
  };

  const handleRemoveExpense = async (expenseId: string) => {
    if (!selectedGroup) return;
    await deleteDoc(doc(db, "groups", selectedGroup.id, "expenses", expenseId));
  };

  // Calculate balances: for each member, total paid - share owed
  const computeBalances = () => {
    const bal: Record<string, number> = {};
    members.forEach((m) => (bal[m.id] = 0));

    expenses.forEach((exp) => {
      const share = exp.amount / (exp.participants?.length || 1);
      // payer gets +amount
      bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
      // each participant owes share
      exp.participants.forEach((pId: string) => {
        bal[pId] = (bal[pId] || 0) - share;
      });
    });

    // convert to readable array
    return members.map((m) => ({ member: m, balance: Number((bal[m.id] || 0).toFixed(2)) }));
  };

  // quick "reminder" simulation
  const handleSendReminder = (member: Member) => {
    alert(`Reminder sent to ${member.name} (simulated)`);
  };

  // simple AI-style summary (local inference / templated)
  const generateSummary = () => {
    const balances = computeBalances();
    const owed = balances.filter((b) => b.balance < -0.01);
    const owing = balances.filter((b) => b.balance > 0.01);

    let text = "";
    if (owed.length === 0 && owing.length === 0) {
      text = "All settled — no pending balances.";
    } else {
      text = "Split summary:\n";
      owing.forEach((o) => {
        text += `${o.member.name} is owed ${selectedGroup?.currency || "INR"} ${Math.abs(
          o.balance
        ).toFixed(2)}\n`;
      });
      owed.forEach((o) => {
        text += `${o.member.name} owes ${selectedGroup?.currency || "INR"} ${Math.abs(
          o.balance
        ).toFixed(2)}\n`;
      });
    }
    return text;
  };

  return (
    <div className="split-root">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="split-wrap">
        <header className="split-header">
          <h2>SplitEase — Group Expense Splitter</h2>
          <p className="muted">Create groups, add members, log expenses — fast splits.</p>
        </header>

        <section className="split-create">
          <form onSubmit={handleCreateGroup} className="split-form-inline">
            <input
              placeholder="New group name (e.g. Trip Goa)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button className="btn mint" type="submit">Create group</button>
          </form>

          <div className="group-list">
            <label>Groups</label>
            <div className="groups-scroll">
              {groups.map((g) => (
                <button
                  key={g.id}
                  className={`group-chip ${selectedGroup?.id === g.id ? "active" : ""}`}
                  onClick={() => setSelectedGroup(g)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {selectedGroup && (
          <section className="split-main">
            <div className="split-column">
              <h3>{selectedGroup.name}</h3>

              <div className="card">
                <h4>Members</h4>
                <form onSubmit={handleAddMember} className="split-form-inline">
                  <input
                    placeholder="Add member name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                  <button className="btn" type="submit">Add</button>
                </form>

                <ul className="member-list">
                  {members.map((m) => (
                    <li key={m.id}>
                      {m.name}
                      <div className="member-actions">
                        <button className="tiny" onClick={() => handleSendReminder(m)}>
                          Remind
                        </button>
                      </div>
                    </li>
                  ))}
                  {members.length === 0 && <li className="muted">No members yet</li>}
                </ul>
              </div>

              <div className="card">
                <h4>Add Expense</h4>
                <form onSubmit={handleAddExpense} className="expense-form">
                  <input
                    required
                    placeholder="Expense title"
                    value={newExpenseTitle}
                    onChange={(e) => setNewExpenseTitle(e.target.value)}
                  />
                  <input
                    required
                    placeholder="Amount"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                  />
                  <select
                    value={newExpensePaidBy}
                    onChange={(e) => setNewExpensePaidBy(e.target.value)}
                  >
                    <option value="">Paid by...</option>
                    {members.map((m) => (
                      <option value={m.id} key={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <div className="participants">
                    <label>Participants</label>
                    <div className="participants-list">
                      {members.map((m) => {
                        const checked = newExpenseParticipants.includes(m.id);
                        return (
                          <label key={m.id} className="participant">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setNewExpenseParticipants((s) => s.filter((id) => id !== m.id));
                                } else {
                                  setNewExpenseParticipants((s) => [...s, m.id]);
                                }
                              }}
                            />
                            {m.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn mint" type="submit">Add Expense</button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setNewExpenseTitle("");
                        setNewExpenseAmount("");
                        setNewExpensePaidBy("");
                        setNewExpenseParticipants([]);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="split-column">
              <div className="card">
                <h4>Expenses</h4>
                <ul className="expense-list">
                  {expenses.map((exp) => (
                    <li key={exp.id}>
                      <div>
                        <strong>{exp.title}</strong>
                        <div className="muted">
                          {selectedGroup.currency || "INR"} {exp.amount.toFixed(2)} • paid by{" "}
                          {members.find((m) => m.id === exp.paidBy)?.name || "—"}
                        </div>
                      </div>
                      <div className="expense-actions">
                        <button className="tiny" onClick={() => handleRemoveExpense(exp.id)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                  {expenses.length === 0 && <li className="muted">No expenses yet</li>}
                </ul>
              </div>

              <div className="card">
                <h4>Balances</h4>
                <div className="balances">
                  {computeBalances().map((b) => (
                    <div key={b.member.id} className="balance-row">
                      <span>{b.member.name}</span>
                      <span className={`bal ${b.balance > 0 ? "pos" : b.balance < 0 ? "neg" : ""}`}>
                        {selectedGroup.currency || "INR"} {Math.abs(b.balance).toFixed(2)}
                        {b.balance > 0 ? " (owed)" : b.balance < 0 ? " (owes)" : " (settled)"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary">
                  <pre>{generateSummary()}</pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {message && <div className="message">{message}</div>}
      </motion.div>
    </div>
  );
};

export default SplitEase;
