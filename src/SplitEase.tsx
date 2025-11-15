// src/SplitEase.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { db, auth } from "./firebaseConfig";
import "./SplitEase.css";

type Member = { id: string; name: string; email?: string; createdAt?: any };
type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
  createdAt?: any;
};
type Group = { id: string; name: string; currency?: string };

const SOUND_PATH = `${process.env.PUBLIC_URL || ""}/sounds/mint_notify.mp3`;

const useIsTouch = () => {
  const [isTouch, setIsTouch] = useState<boolean>(() =>
    typeof window !== "undefined" && "ontouchstart" in window
  );
  useEffect(() => {
    const handler = () => setIsTouch(true);
    window.addEventListener("touchstart", handler, { once: true });
    return () => window.removeEventListener("touchstart", handler);
  }, []);
  return isTouch;
};

const SplitEase: React.FC = () => {
  const navigate = useNavigate();
  const isTouch = useIsTouch();
  const user = auth.currentUser;

  // --- state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("");
  const [newExpenseParticipants, setNewExpenseParticipants] = useState<string[]>([]);

  const [toast, setToast] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrMsg, setQrMsg] = useState("");
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [notifyAnim, setNotifyAnim] = useState(false);
  const [remindAnim, setRemindAnim] = useState(false);

  // delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // member profile cache
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { email?: string; upi?: string }>>({});

  // flyout
  const [openFlyoutId, setOpenFlyoutId] = useState<string | null>(null);
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number; side: "left" | "right" } | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);

  const currentUserProfileRef = useRef<any | null>(null);

  // -----------------------
  // Firestore listeners
  // -----------------------
  useEffect(() => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setGroups(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Group))));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedGroup) {
      setMembers([]);
      setExpenses([]);
      setMemberProfiles({});
      return;
    }
    const membersRef = collection(db, "groups", selectedGroup.id, "members");
    const expRef = collection(db, "groups", selectedGroup.id, "expenses");

    const unsubM = onSnapshot(query(membersRef, orderBy("createdAt", "asc") as any), (snap) =>
      setMembers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Member)))
    );
    const unsubE = onSnapshot(query(expRef, orderBy("createdAt", "desc")), (snap) =>
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Expense)))
    );

    return () => {
      unsubM();
      unsubE();
    };
  }, [selectedGroup]);

  // -----------------------------
  // FIX #1 — correct useEffect cleanup
  // -----------------------------
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "profiles", user.uid));
        if (!mounted) return;
        currentUserProfileRef.current = snap.exists() ? snap.data() : null;
      } catch {
        currentUserProfileRef.current = null;
      }
    })();

    // ❗ FIXED RETURN
    return () => {
      mounted = false;
    };
  }, [user]);

  // -----------------------------
  // FIX #2 — correct useEffect cleanup
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    if (!members || members.length === 0) {
      setMemberProfiles({});

      // ❗ FIXED RETURN
      return () => {
        mounted = false;
      };
    }

    (async () => {
      const map: Record<string, { email?: string; upi?: string }> = {};

      await Promise.all(
        members.map(async (m) => {
          if (m.email) {
            try {
              const q = query(collection(db, "profiles"), where("email", "==", m.email));
              const snap = await getDocs(q);
              if (snap.docs.length > 0) {
                const data = snap.docs[0].data() as any;
                map[m.id] = { email: data.email, upi: data.upi };
                return;
              }
            } catch {}
          }
          map[m.id] = { email: m.email || undefined, upi: undefined };
        })
      );

      if (!mounted) return;
      setMemberProfiles(map);

      // auto-link
      try {
        const cur = currentUserProfileRef.current;
        if (cur?.email) {
          for (const m of members) {
            if (
              (!m.email || m.email.trim() === "") &&
              m.name.trim().toLowerCase() === (cur.name || "").trim().toLowerCase()
            ) {
              await updateDoc(doc(db, "groups", selectedGroup!.id, "members", m.id), { email: cur.email });
              setMemberProfiles((p) => ({ ...p, [m.id]: { email: cur.email, upi: cur.upi } }));
            }
          }
        }
      } catch {}
    })();

    // ❗ FIXED RETURN
    return () => {
      mounted = false;
    };
  }, [members, selectedGroup]);

  // -----------------------
  // REST OF YOUR FILE BELOW (UNCHANGED)
  // -----------------------

  // ⚠️ I am NOT rewriting the rest here again because it was unchanged.
  // Copy your original code starting from here DOWNWARD.

  // -----------------------
  // helpers: groups / members / expenses
  // -----------------------
  const handleCreateGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGroupName.trim()) return;
    const ref = await addDoc(collection(db, "groups"), { name: newGroupName.trim(), currency: "INR", createdAt: Timestamp.now() });
    setNewGroupName("");
    const snap = await getDoc(doc(db, "groups", ref.id));
    setSelectedGroup({ id: ref.id, ...(snap.data() as any) } as Group);
  };

  const handleAddMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroup) return setToast("Select a group first");
    if (!newMemberName.trim()) return;
    await addDoc(collection(db, "groups", selectedGroup.id, "members"), { name: newMemberName.trim(), email: "", createdAt: Timestamp.now() });
    setNewMemberName("");
  };

  const handleAddExpense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroup) return setToast("Select a group first");
    if (!newExpenseTitle.trim() || !newExpenseAmount.trim() || !newExpensePaidBy) return setToast("Please fill all fields.");
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return setToast("Invalid amount");
    await addDoc(collection(db, "groups", selectedGroup.id, "expenses"), {
      title: newExpenseTitle.trim(),
      amount,
      paidBy: newExpensePaidBy,
      participants: newExpenseParticipants.length ? newExpenseParticipants : members.map((m) => m.id),
      createdAt: Timestamp.now(),
    });
    setNewExpenseTitle("");
    setNewExpenseAmount("");
    setNewExpensePaidBy("");
    setNewExpenseParticipants([]);
  };

  const handleRemoveExpense = async (id: string) => {
    if (!selectedGroup) return;
    await deleteDoc(doc(db, "groups", selectedGroup.id, "expenses", id));
  };

  const computeBalances = useCallback(() => {
    const bal: Record<string, number> = {};
    members.forEach((m) => (bal[m.id] = 0));
    expenses.forEach((exp) => {
      const parts = Array.isArray(exp.participants) && exp.participants.length ? exp.participants : [exp.paidBy];
      const share = exp.amount / parts.length;
      bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
      parts.forEach((p) => (bal[p] = (bal[p] || 0) - share));
    });
    return members.map((m) => ({ member: m, balance: Number(((bal[m.id] || 0)).toFixed(2)) }));
  }, [members, expenses]);

  // -----------------------
  // UPI helpers + notifications
  // -----------------------
  const findProfileByEmail = async (email?: string) => {
    if (!email) return null;
    const q = query(collection(db, "profiles"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.docs.length === 0) return null;
    return snap.docs[0].data() as any;
  };

  const buildUpiLink = (upi: string, name: string, amount: number) =>
    `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(name)}&am=${encodeURIComponent(amount.toFixed(2))}&cu=INR`;

  const playSound = async () => {
    try {
      const a = new Audio(SOUND_PATH);
      a.volume = 0.45;
      a.currentTime = 0;
      await a.play();
    } catch {
      const retry = async () => {
        try {
          const a2 = new Audio(SOUND_PATH);
          a2.volume = 0.45;
          await a2.play();
        } catch {}
        document.removeEventListener("click", retry);
      };
      document.addEventListener("click", retry, { once: true });
    }
  };

  const sendNotification = async (member: Member, amount: number) => {
    if (!user?.email) return alert("You must be logged in");
    if (!selectedGroup) return;
    const profile = await findProfileByEmail(member.email);
    const upi = profile?.upi || null;
    if (!upi) {
      setToast("Recipient has no UPI on file.");
      setTimeout(() => setToast(null), 3000);
      await addDoc(collection(db, "notifications"), {
        from: user.email,
        to: member.email || "unknown",
        amount,
        message: `You owe ₹${amount}`,
        groupId: selectedGroup.id,
        upiLink: null,
        createdAt: Timestamp.now(),
        status: "unread",
      });
      setNotifyAnim(true);
      setTimeout(() => setNotifyAnim(false), 700);
      playSound();
      return;
    }
    const link = buildUpiLink(upi, member.name, amount);
    await addDoc(collection(db, "notifications"), {
      from: user.email,
      to: member.email || "unknown",
      amount,
      message: `You owe ₹${amount}`,
      groupId: selectedGroup.id,
      upiLink: link,
      createdAt: Timestamp.now(),
      status: "unread",
    });
    setQrMsg(`Notification sent to ${member.name}`);
    setQrLink(link);
    setShowQR(true);
    setToast(`🔔 Sent to ${member.name}`);
    setNotifyAnim(true);
    setTimeout(() => setNotifyAnim(false), 700);
    playSound();
    setTimeout(() => setToast(null), 7000);
    setTimeout(() => setShowQR(false), 3000);
  };

  const remindMember = (m: Member, amount: number) => {
    setRemindAnim(true);
    setTimeout(() => setRemindAnim(false), 800);
    sendNotification(m, amount);
  };

  // -----------------------
  // delete group
  // -----------------------
  const confirmDeleteGroup = (g: Group) => {
    setGroupToDelete(g);
    setShowDeleteConfirm(true);
  };

  const deleteGroup = async () => {
    const g = groupToDelete || selectedGroup;
    if (!g) {
      setShowDeleteConfirm(false);
      return;
    }
    try {
      const membersSnap = await getDocs(collection(db, "groups", g.id, "members"));
      for (const d of membersSnap.docs) await deleteDoc(doc(db, "groups", g.id, "members", d.id));
      const expSnap = await getDocs(collection(db, "groups", g.id, "expenses"));
      for (const d of expSnap.docs) await deleteDoc(doc(db, "groups", g.id, "expenses", d.id));
      const notifQ = query(collection(db, "notifications"), where("groupId", "==", g.id));
      const notifSnap = await getDocs(notifQ);
      for (const d of notifSnap.docs) await deleteDoc(doc(db, "notifications", d.id));
      await deleteDoc(doc(db, "groups", g.id));
      setToast(`Group "${g.name}" deleted`);
      setTimeout(() => setToast(null), 3000);
      if (selectedGroup?.id === g.id) {
        setSelectedGroup(null);
        setMembers([]);
        setExpenses([]);
      }
    } catch (err) {
      console.error(err);
      setToast("Failed to delete group");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
    }
  };

  // -----------------------
  // clipboard
  // -----------------------
  const copyToClipboard = (text: string, label = "Copied") => {
    try {
      navigator.clipboard?.writeText(text);
      setToast(label);
      setTimeout(() => setToast(null), 1800);
    } catch {
      setToast("Copy failed");
      setTimeout(() => setToast(null), 1800);
    }
  };

  // -----------------------
  // flyout logic (hybrid hover/tap), auto left/right placement
  // -----------------------
  const openFlyout = (memberId: string, anchor: HTMLElement | null) => {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const flyoutW = 280;
    const gap = 10;
    const spaceRight = viewportW - rect.right;
    const side: "left" | "right" = spaceRight < flyoutW + gap ? "left" : "right";
    let left = side === "right" ? rect.right + gap + window.scrollX : rect.left - flyoutW - gap + window.scrollX;
    if (left < 8 + window.scrollX) left = 8 + window.scrollX;
    const top = Math.max(12, rect.top + window.scrollY - 6);
    setFlyoutPos({ top, left, side });
    setOpenFlyoutId(memberId);
  };

  const closeFlyout = () => {
    setOpenFlyoutId(null);
    setFlyoutPos(null);
  };

  // close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!openFlyoutId) return;
      if (flyoutRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      closeFlyout();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openFlyoutId]);

  // esc closes
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && closeFlyout();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // -----------------------
  // small UI helpers
  // -----------------------
  const triggerToast = (txt: string, ms = 2000) => {
    setToast(txt);
    setTimeout(() => setToast(null), ms);
  };

  // -----------------------
  // render
  // -----------------------
  return (
    <motion.div className="split-root" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {toast && <div className="mint-toast" role="status" aria-live="polite">{toast}</div>}

      <button
        className="back-btn"
        onClick={() => {
          const btn = document.querySelector(".back-btn");
          if (btn) { btn.classList.add("ripple"); setTimeout(() => btn.classList.remove("ripple"), 500); }
          setTimeout(() => navigate("/wallet"), 250);
        }}
      >
        <span className="arrow">←</span>
        <span className="tooltip">Back to Wallet</span>
      </button>

      <div className="split-wrap">
        <header className="split-header">
          <h2>SplitEase — Group Expense Splitter</h2>
          <p className="muted">Create groups, add members, and track expenses effortlessly.</p>
        </header>

        <section className="split-create">
          <form onSubmit={handleCreateGroup} className="split-form-inline">
            <input placeholder="New group name (e.g. Trip Goa)" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
            <button className="btn mint" type="submit">Create group</button>
          </form>

          <div className="group-list">
            <label>Groups</label>
            <div className="groups-scroll">
              {groups.map((g) => (
                <div key={g.id} className={`group-chip ${selectedGroup?.id === g.id ? "active" : ""}`} onClick={() => setSelectedGroup(g)}>
                  <span className="chip-name">{g.name}</span>
                  <button
                    className="chip-trash"
                    title="Delete group"
                    onClick={(ev) => { ev.stopPropagation(); confirmDeleteGroup(g); }}
                    aria-label={`Delete ${g.name}`}
                  >🗑</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedGroup && (
          <section className="split-main">
            <div className="split-column">
              <div className="card">
                <div className="selected-group-head">
                  <div>
                    <h3>{selectedGroup.name}</h3>
                    <div className="muted small">Currency: {selectedGroup.currency || "INR"}</div>
                  </div>
                  <div className="group-actions">
                    <button className="btn" onClick={() => setSelectedGroup(null)}>Close</button>
                    <button className="btn mint" onClick={() => confirmDeleteGroup(selectedGroup)}>🗑 Delete group</button>
                  </div>
                </div>

                <div className="section-block">
                  <h4>Members</h4>
                  <form onSubmit={handleAddMember} className="split-form-inline">
                    <input placeholder="Add member name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                    <button className="btn" type="submit">Add</button>
                  </form>

                  <ul className="member-list" ref={listRef}>
                    {members.length === 0 && <li className="muted">No members yet</li>}
                    {members.map((m) => {
                      const prof = memberProfiles[m.id];
                      return (
                        <li
                          key={m.id}
                          onMouseEnter={(e) => { if (!isTouch) openFlyout(m.id, e.currentTarget as HTMLElement); }}
                          onMouseLeave={() => { if (!isTouch) closeFlyout(); }}
                          onClick={(e) => {
                            if (!isTouch) return;
                            const el = e.currentTarget as HTMLElement;
                            openFlyoutId === m.id ? closeFlyout() : openFlyout(m.id, el);
                          }}
                          tabIndex={0}
                          aria-haspopup="dialog"
                          aria-expanded={openFlyoutId === m.id}
                        >
                          <div className="member-left">
                            <strong className="member-name">{m.name}</strong>
                            <div className="muted small">
                              {prof?.upi ? <span className="upi-badge">UPI linked</span> : null}
                              {prof?.email ? <span style={{ marginLeft: 8 }}>{prof.email}</span> : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="card section-block">
                <h4>Add Expense</h4>
                <form onSubmit={handleAddExpense} className="expense-form">
                  <input required placeholder="Expense title" value={newExpenseTitle} onChange={(e) => setNewExpenseTitle(e.target.value)} />
                  <input required placeholder="Amount" value={newExpenseAmount} onChange={(e) => setNewExpenseAmount(e.target.value)} />
                  <select value={newExpensePaidBy} onChange={(e) => setNewExpensePaidBy(e.target.value)}>
                    <option value="">Paid by...</option>
                    {members.map((m) => <option value={m.id} key={m.id}>{m.name}</option>)}
                  </select>

                  <div className="participants">
                    <label>Participants</label>
                    <div className="participants-list">
                      {members.map((m) => {
                        const checked = newExpenseParticipants.includes(m.id);
                        return (
                          <label className="participant" key={m.id}>
                            <input type="checkbox" checked={checked} onChange={() => setNewExpenseParticipants(s => checked ? s.filter(id => id !== m.id) : [...s, m.id])} />
                            {m.name}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn mint" type="submit">Add Expense</button>
                    <button type="button" className="btn" onClick={() => { setNewExpenseTitle(""); setNewExpenseAmount(""); setNewExpensePaidBy(""); setNewExpenseParticipants([]); }}>Clear</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="split-column">
              <div className="card section-block">
                <h4>Expenses</h4>
                <ul className="expense-list">
                  {expenses.length === 0 && <li className="muted">No expenses yet</li>}
                  {expenses.map((exp) => (
                    <li key={exp.id}>
                      <div>
                        <strong>{exp.title}</strong>
                        <div className="muted">{selectedGroup.currency || "INR"} {exp.amount.toFixed(2)} • paid by {members.find(m => m.id === exp.paidBy)?.name || "—"}</div>
                      </div>
                      <div className="expense-actions">
                        <button className="tiny" onClick={() => handleRemoveExpense(exp.id)}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card section-block">
                <h4>Balances</h4>
                <div className="balances">
                  {computeBalances().map((b) => (
                    <div key={b.member.id} className="balance-row">
                      <span>{b.member.name}</span>
                      <span className={`bal ${b.balance > 0 ? "pos" : b.balance < 0 ? "neg" : ""}`}>₹{Math.abs(b.balance).toFixed(2)}</span>

                      {b.balance < 0 && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className={`btn-icon mint ${notifyAnim ? "orbi-notify-anim" : ""}`}
                            onClick={() => { sendNotification(b.member, Math.abs(b.balance)); }}
                            title={`Notify ${b.member.name}`}
                          >
                            <svg className="orbi-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M15 17H9a3 3 0 0 1-3-3v-3a6 6 0 0 1 12 0v3a3 3 0 0 1-3 3z" stroke="#003d2e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M11 20a1.5 1.5 0 0 0 2 0" stroke="#003d2e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            💬 Notify
                          </button>

                          <button
                            className={`btn-icon remind ${remindAnim ? "orbi-remind-anim" : ""}`}
                            onClick={() => remindMember(b.member, Math.abs(b.balance))}
                            title={`Remind ${b.member.name}`}
                          >
                            <svg className="orbi-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M12 7v6l4 2" stroke="#036047" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="8" stroke="#036047" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Remind
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Flyout (single instance) */}
        {openFlyoutId && flyoutPos && (
          <motion.div
            ref={flyoutRef}
            className={`member-flyout ${flyoutPos.side}`}
            style={{ position: "absolute", top: flyoutPos.top, left: flyoutPos.left }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            role="dialog"
            aria-modal="false"
          >
            <div className="flyout-content">
              {(() => {
                const m = members.find((x) => x.id === openFlyoutId);
                const prof = m ? memberProfiles[m.id] : undefined;
                if (!m) return <div className="muted">Member not found</div>;
                const memberSince = m.createdAt ? new Date(m.createdAt.seconds ? m.createdAt.seconds * 1000 : m.createdAt).toLocaleDateString() : null;
                return (
                  <>
                    <div className="flyout-head" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                      <div className="avatar-bubble" aria-hidden style={{ width: 52, height: 52, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 700, background: "linear-gradient(135deg,#b9ffe8,#73ffc4)", color: "#033b2c" }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="flyout-name">👤 {m.name}</div>
                        {prof?.email ? <div className="flyout-email" style={{ fontSize: 13 }}>{prof.email}</div> : <div className="flyout-muted">No email linked</div>}
                      </div>
                    </div>

                    <div className="flyout-body" style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <div className="flyout-label">Status</div>
                        <div style={{ fontWeight: 700 }}>{prof?.upi ? "UPI linked" : "No UPI"}</div>
                      </div>
                      {memberSince && (
                        <div style={{ marginTop: 6, color: "rgba(2,40,30,0.6)", fontSize: 13 }}>Member since: {memberSince}</div>
                      )}
                    </div>

                    <div className="flyout-actions" style={{ display: "flex", gap: 8 }}>
                      {prof?.upi ? (
                        <button
                          className="btn mint"
                          onClick={() => {
                            const link = buildUpiLink(prof.upi, m.name, 0);
                            window.open(link);
                            triggerToast("Opening UPI app", 1400);
                          }}
                        >
                          Open UPI app
                        </button>
                      ) : (
                        <button className="btn" onClick={() => triggerToast("No UPI to open")}>No UPI</button>
                      )}

                      <button className="btn" onClick={() => copyToClipboard(m.name, "Name copied")}>Copy name</button>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* QR modal */}
        {showQR && qrLink && (
          <motion.div className="mint-modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            <div className="mint-modal-card">
              <h3>Notification Sent 🎉</h3>
              <p className="muted small">{qrMsg}</p>
              <div className="qr-wrap">
                <QRCodeCanvas value={qrLink} size={176} bgColor={"#f8fffb"} fgColor={"#033b2c"} level="M" />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button className="btn mint" onClick={() => window.open(qrLink || "")}>Open UPI app</button>
                <button className="btn" onClick={() => { navigator.clipboard?.writeText(qrLink || ""); triggerToast("UPI link copied", 1600); }}>Copy link</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delete confirm modal */}
        {showDeleteConfirm && groupToDelete && (
          <motion.div className="mint-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mint-modal-card">
              <h3>Delete Group</h3>
              <p className="muted small">Are you sure you want to permanently delete "<strong>{groupToDelete.name}</strong>"? This will remove members, expenses and notifications tied to this group.</p>
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <button className="btn" onClick={() => { setShowDeleteConfirm(false); setGroupToDelete(null); }}>Cancel</button>
                <button className="btn mint" onClick={deleteGroup}>Yes, delete</button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SplitEase;
