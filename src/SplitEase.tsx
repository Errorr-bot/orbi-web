// src/SplitEase.tsx
import React, { useEffect, useRef, useState } from "react";
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

type Member = { id: string; name: string; email?: string };
type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
  note?: string;
  createdAt: any;
};
type Group = { id: string; name: string; currency?: string };

// sound path
const SOUND_PATH = `${process.env.PUBLIC_URL || ""}/sounds/mint_notify.mp3`;

const SplitEase: React.FC = () => {
  const navigate = useNavigate();
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
  const [showQR, setShowQR] = useState(false);
  const [qrMsg, setQrMsg] = useState("");
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // animation triggers
  const [notifyAnim, setNotifyAnim] = useState(false);
  const [remindAnim, setRemindAnim] = useState(false);

  // delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  // member profile cache: memberId -> { email?, upi? }
  const [memberProfiles, setMemberProfiles] = useState<
    Record<string, { email?: string; upi?: string }>
  >({});

  // flyout state: which member's flyout is open + coordinates + side
  const [openFlyoutMemberId, setOpenFlyoutMemberId] = useState<string | null>(
    null
  );
  const [flyoutPos, setFlyoutPos] = useState<{
    top: number;
    left: number;
    side: "left" | "right";
  } | null>(null);

  // refs
  const listContainerRef = useRef<HTMLUListElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);

  // track whether device likely supports touch (to toggle hover vs click behavior)
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

  const user = auth.currentUser;
  const currentUserProfileRef = useRef<any | null>(null);

  // Load current user's profile once (if logged in)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      try {
        const profSnap = await getDoc(doc(db, "profiles", user.uid));
        if (!mounted) return;
        if (profSnap.exists()) {
          currentUserProfileRef.current = profSnap.data();
        } else {
          currentUserProfileRef.current = null;
        }
      } catch (e) {
        currentUserProfileRef.current = null;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  // Load groups
  useEffect(() => {
    const q = query(collection(db, "groups"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Group))
      );
    });
    return () => unsub();
  }, []);

  // Load members & expenses when group changes
  useEffect(() => {
    if (!selectedGroup) {
      setMembers([]);
      setExpenses([]);
      setMemberProfiles({});
      return;
    }

    const membersRef = collection(db, "groups", selectedGroup.id, "members");
    const expRef = collection(db, "groups", selectedGroup.id, "expenses");

    const unsubM = onSnapshot(membersRef, (snap) => {
      const list = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as any) } as Member)
      );
      setMembers(list);
    });

    const unsubE = onSnapshot(
      query(expRef, orderBy("createdAt", "desc")),
      (snap) =>
        setExpenses(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Expense))
        )
    );

    return () => {
      unsubM();
      unsubE();
    };
  }, [selectedGroup]);

  // whenever members change, fetch their profiles (if email exists) and cache them
  useEffect(() => {
    let mounted = true;
    if (!members || members.length === 0) {
      setMemberProfiles({});
      return;
    }

    (async () => {
      const map: Record<string, { email?: string; upi?: string }> = {};
      await Promise.all(
        members.map(async (m) => {
          // if member has email, try lookup profile by email
          if (m.email) {
            try {
              const q = query(collection(db, "profiles"), where("email", "==", m.email));
              const snap = await getDocs(q);
              if (snap.docs.length > 0) {
                const data = snap.docs[0].data() as any;
                map[m.id] = { email: data.email, upi: data.upi };
                return;
              }
            } catch (e) {
              // ignore lookup error
            }
          }
          // no email or no profile found
          map[m.id] = { email: m.email || undefined, upi: undefined };
        })
      );

      if (!mounted) return;

      setMemberProfiles(map);

      // If logged-in user profile exists and a member matches your name but has empty email,
      // automatically update that member doc to include your email (to link profiles).
      try {
        const cur = currentUserProfileRef.current;
        if (cur && cur.email) {
          // find member with same name (case-insensitive) and no email
          for (const m of members) {
            if (
              (!m.email || m.email.trim() === "") &&
              m.name.trim().toLowerCase() === (cur.name || "").trim().toLowerCase()
            ) {
              // update member doc email
              const memRef = doc(db, "groups", selectedGroup!.id, "members", m.id);
              await updateDoc(memRef, { email: cur.email });
              // update local cache
              setMemberProfiles((prev) => ({ ...prev, [m.id]: { email: cur.email, upi: cur.upi } }));
            }
          }
        }
      } catch (err) {
        // ignore update errors silently
      }
    })();

    return () => {
      mounted = false;
    };
  }, [members, selectedGroup]);

  // Create group
  const handleCreateGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGroupName.trim()) return;
    const docRef = await addDoc(collection(db, "groups"), {
      name: newGroupName.trim(),
      currency: "INR",
      createdAt: Timestamp.now(),
    });
    setNewGroupName("");
    const snap = await getDoc(doc(db, "groups", docRef.id));
    setSelectedGroup({ id: docRef.id, ...(snap.data() as any) } as Group);
  };

  // Add Member
  const handleAddMember = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroup) return setMessage("Select a group first.");
    if (!newMemberName.trim()) return;

    await addDoc(collection(db, "groups", selectedGroup.id, "members"), {
      name: newMemberName.trim(),
      email: "",
      createdAt: Timestamp.now(),
    });
    setNewMemberName("");
  };

  // Add Expense
  const handleAddExpense = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedGroup) return setMessage("Select a group first.");

    if (!newExpenseTitle.trim() || !newExpenseAmount.trim() || !newExpensePaidBy)
      return setMessage("Please fill all fields.");

    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return setMessage("Invalid amount");

    await addDoc(collection(db, "groups", selectedGroup.id, "expenses"), {
      title: newExpenseTitle.trim(),
      amount,
      paidBy: newExpensePaidBy,
      participants:
        newExpenseParticipants.length > 0
          ? newExpenseParticipants
          : members.map((m) => m.id),
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

  // Balances
  const computeBalances = () => {
    const bal: Record<string, number> = {};
    members.forEach((m) => (bal[m.id] = 0));

    expenses.forEach((exp) => {
      const parts = Array.isArray(exp.participants) && exp.participants.length > 0
        ? exp.participants
        : [exp.paidBy];
      const share = exp.amount / parts.length;
      bal[exp.paidBy] = (bal[exp.paidBy] || 0) + exp.amount;
      parts.forEach((p) => {
        bal[p] = (bal[p] || 0) - share;
      });
    });

    return members.map((m) => ({
      member: m,
      balance: Number((bal[m.id] || 0).toFixed(2)),
    }));
  };

  // Get UPI profile
  const findProfileByEmail = async (email?: string) => {
    if (!email) return null;
    const q = query(collection(db, "profiles"), where("email", "==", email));
    const snap = await getDocs(q);
    if (snap.docs.length === 0) return null;
    return snap.docs[0].data() as any;
  };

  // Build UPI link
  const buildUpiLink = (upi: string, name: string, amount: number) =>
    `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(
      name
    )}&am=${encodeURIComponent(amount.toFixed(2))}&cu=INR`;

  // Play sound
  const playMintSound = async () => {
    try {
      const audio = new Audio(SOUND_PATH);
      audio.volume = 0.45;
      audio.currentTime = 0;
      await audio.play();
    } catch (err) {
      const retry = async () => {
        try {
          const audio2 = new Audio(SOUND_PATH);
          audio2.volume = 0.45;
          await audio2.play();
        } catch {}
        document.removeEventListener("click", retry);
      };
      document.addEventListener("click", retry, { once: true });
    }
  };

  const triggerNotifyAnim = () => {
    setNotifyAnim(true);
    setTimeout(() => setNotifyAnim(false), 700);
  };

  const triggerRemindAnim = () => {
    setRemindAnim(true);
    setTimeout(() => setRemindAnim(false), 800);
  };

  // Haptic helper
  const doHaptic = (pattern: number | number[] = 10) => {
    try {
      if ((navigator as any).vibrate) (navigator as any).vibrate(pattern);
    } catch (e) {
      /* ignore */
    }
  };

  // Send notification
  const sendNotification = async (member: Member, amount: number) => {
    if (!user?.email) return alert("You must be logged in");
    if (!selectedGroup) return;

    const profile = await findProfileByEmail(member.email);
    const upi = profile?.upi || null;

    if (!upi) {
      setToast("Recipient has no UPI on file.");
      setTimeout(() => setToast(null), 4000);

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

      triggerNotifyAnim();
      doHaptic(12);
      playMintSound();
      return;
    }

    const upiLink = buildUpiLink(upi, member.name, amount);

    await addDoc(collection(db, "notifications"), {
      from: user.email,
      to: member.email || "unknown",
      amount,
      message: `You owe ₹${amount}`,
      groupId: selectedGroup.id,
      upiLink,
      createdAt: Timestamp.now(),
      status: "unread",
    });

    setQrMsg(`Notification sent to ${member.name}`);
    setQrLink(upiLink);
    setShowQR(true);
    setToast(`🔔 Sent to ${member.name}`);

    triggerNotifyAnim();
    doHaptic(18);
    playMintSound();

    setTimeout(() => setToast(null), 7000);
    setTimeout(() => setShowQR(false), 3000);
  };

  const remindMember = (m: Member, amount: number) => {
    triggerRemindAnim();
    doHaptic([20, 10, 20]); // pattern
    sendNotification(m, amount);
  };

  // ********** Group deletion **********
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
      // delete members
      const membersSnap = await getDocs(collection(db, "groups", g.id, "members"));
      for (const d of membersSnap.docs) {
        await deleteDoc(doc(db, "groups", g.id, "members", d.id));
      }
      // delete expenses
      const expSnap = await getDocs(collection(db, "groups", g.id, "expenses"));
      for (const d of expSnap.docs) {
        await deleteDoc(doc(db, "groups", g.id, "expenses", d.id));
      }
      // delete notifications that belong to this group (optional cleanup)
      const notifQ = query(collection(db, "notifications"), where("groupId", "==", g.id));
      const notifSnap = await getDocs(notifQ);
      for (const d of notifSnap.docs) {
        await deleteDoc(doc(db, "notifications", d.id));
      }

      // delete the group document
      await deleteDoc(doc(db, "groups", g.id));

      setToast(`Group "${g.name}" deleted`);
      setTimeout(() => setToast(null), 4000);

      // if we deleted the currently selected group, clear selection
      if (selectedGroup?.id === g.id) {
        setSelectedGroup(null);
        setMembers([]);
        setExpenses([]);
      }
    } catch (err) {
      console.error("Failed to delete group:", err);
      setToast("Failed to delete group. Check console.");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setShowDeleteConfirm(false);
      setGroupToDelete(null);
    }
  };

  // helper: render chip with small trash icon
  const GroupChip: React.FC<{ g: Group }> = ({ g }) => {
    return (
      <div
        className={`group-chip ${selectedGroup?.id === g.id ? "active" : ""}`}
        onClick={() => setSelectedGroup(g)}
      >
        <span className="chip-name">{g.name}</span>
        <button
          className="chip-trash"
          title="Delete group"
          onClick={(ev) => {
            ev.stopPropagation();
            confirmDeleteGroup(g);
          }}
          aria-label={`Delete ${g.name}`}
        >
          🗑
        </button>
      </div>
    );
  };

  // helper: copy to clipboard with small toast
  const copyToClipboard = (text: string, label = "Copied") => {
    try {
      navigator.clipboard?.writeText(text);
      setToast(`${label}`);
      setTimeout(() => setToast(null), 2200);
    } catch (e) {
      setToast("Copy failed");
      setTimeout(() => setToast(null), 2200);
    }
  };

  // --- Flyout helpers: compute position & open/close logic ---
  const openFlyoutForMember = (memberId: string, anchorEl: HTMLElement | null) => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const flyoutWidth = 260; // approximate width of flyout
    const gap = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // default place to right unless near right edge -> left
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const placeSide = spaceRight < flyoutWidth + gap ? "left" : "right";

    const top = Math.max(12, rect.top + window.scrollY - 6); // small offset
    let left;
    if (placeSide === "right") {
      left = rect.right + gap + window.scrollX;
      // if would overflow bottom, nudge up
      if (top + 220 > window.scrollY + viewportHeight) {
        // push upward
        const diff = top + 220 - (window.scrollY + viewportHeight);
        left = Math.max(8 + window.scrollX, left);
      }
    } else {
      // place left: align to rect.left - flyoutWidth - gap
      left = rect.left - flyoutWidth - gap + window.scrollX;
      if (left < 8 + window.scrollX) left = 8 + window.scrollX;
    }

    setFlyoutPos({ top, left, side: placeSide });
    setOpenFlyoutMemberId(memberId);
  };

  const closeFlyout = () => {
    setOpenFlyoutMemberId(null);
    setFlyoutPos(null);
  };

  // close when click outside flyout or outside members list
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!openFlyoutMemberId) return;
      const flyoutEl = flyoutRef.current;
      const listEl = listContainerRef.current;
      if (flyoutEl && flyoutEl.contains(target)) return;
      if (listEl && listEl.contains(target)) return;
      // clicked elsewhere
      closeFlyout();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openFlyoutMemberId]);

  // keyboard: Esc closes flyout
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFlyout();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // render
  return (
    <motion.div
      className="split-root"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Top-right toast */}
      {toast && (
        <div className="mint-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {/* Back button (mint circle) */}
      <button
        className="back-btn"
        onClick={() => {
          const btn = document.querySelector(".back-btn");
          if (btn) {
            btn.classList.add("ripple");
            setTimeout(() => btn.classList.remove("ripple"), 500);
          }
          setTimeout(() => navigate("/wallet"), 300);
        }}
      >
        <span className="arrow">←</span>
        <span className="tooltip">Back to Wallet</span>
      </button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="split-wrap">
        <header className="split-header">
          <h2>SplitEase — Group Expense Splitter</h2>
          <p className="muted">Create groups, add members, and track expenses effortlessly.</p>
        </header>

        {/* Create Group */}
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
                <GroupChip g={g} key={g.id} />
              ))}
            </div>
          </div>
        </section>

        {/* If group selected, show main */}
        {selectedGroup && (
          <section className="split-main">

            {/* LEFT column */}
            <div className="split-column">

              <div className="card">
                <div className="selected-group-head">
                  <div>
                    <h3>{selectedGroup.name}</h3>
                    <div className="muted small">Currency: {selectedGroup.currency || "INR"}</div>
                  </div>

                  <div className="group-actions">
                    <button className="btn" onClick={() => setSelectedGroup(null)}>Close</button>
                    <button
                      className="btn mint"
                      onClick={() => confirmDeleteGroup(selectedGroup)}
                      title="Delete group"
                    >
                      🗑 Delete group
                    </button>
                  </div>
                </div>

                {/* Members (flyout on hover/tap only in this section) */}
                <div className="section-block">
                  <h4>Members</h4>
                  <form onSubmit={handleAddMember} className="split-form-inline">
                    <input
                      placeholder="Add member name"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                    <button className="btn" type="submit">Add</button>
                  </form>

                  <ul className="member-list" ref={listContainerRef}>
                    {members.map((m) => {
                      const prof = memberProfiles[m.id];
                      return (
                        <li
                          key={m.id}
                          onMouseEnter={(e) => {
                            if (isTouchDevice) return;
                            // open flyout on hover (desktop)
                            const el = e.currentTarget as HTMLElement;
                            openFlyoutForMember(m.id, el);
                          }}
                          onMouseLeave={() => {
                            if (isTouchDevice) return;
                            // close on hover leave
                            closeFlyout();
                          }}
                          onClick={(e) => {
                            // toggle flyout on click/tap for touch devices
                            if (!isTouchDevice) return;
                            const el = e.currentTarget as HTMLElement;
                            if (openFlyoutMemberId === m.id) {
                              closeFlyout();
                            } else {
                              openFlyoutForMember(m.id, el);
                            }
                          }}
                          tabIndex={0}
                          aria-haspopup="dialog"
                          aria-expanded={openFlyoutMemberId === m.id}
                        >
                          <div className="member-left">
                            <strong className="member-name">{m.name}</strong>
                            <div className="muted small">
                              {/* we do not show email or upi here — only the "UPI linked" badge */}
                              {prof?.upi ? <span className="upi-badge">UPI linked</span> : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                    {members.length === 0 && <li className="muted">No members yet</li>}
                  </ul>
                </div>
              </div>

              {/* Add Expense */}
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
                          <label key={m.id} className="participant">
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

            {/* Right column */}
            <div className="split-column">
              <div className="card section-block">
                <h4>Expenses</h4>
                <ul className="expense-list">
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
                  {expenses.length === 0 && <li className="muted">No expenses yet</li>}
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
                            onClick={() => {
                              doHaptic(18);
                              sendNotification(b.member, Math.abs(b.balance));
                              triggerNotifyAnim();
                            }}
                            title={`Notify ${b.member.name}`}
                          >
                            <svg className="orbi-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                              <path d="M15 17H9a3 3 0 0 1-3-3v-3a6 6 0 0 1 12 0v3a3 3 0 0 1-3 3z" stroke="#003d2e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M11 20a1.5 1.5 0 0 0 2 0" stroke="#003d2e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            💬 Notify
                          </button>

                          <button
                            className={`btn-icon remind ${remindAnim ? "orbi-remind-anim" : ""}`}
                            onClick={() => {
                              doHaptic([20, 10, 20]);
                              remindMember(b.member, Math.abs(b.balance));
                            }}
                            title={`Remind ${b.member.name}`}
                          >
                            <svg className="orbi-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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

        {/* Flyout element (renders once in DOM; position is absolute & computed) */}
        {openFlyoutMemberId && flyoutPos && (
          <div
            ref={flyoutRef}
            className={`member-flyout ${flyoutPos.side}`}
            style={{ top: flyoutPos.top, left: flyoutPos.left, position: "absolute" }}
            role="dialog"
            aria-modal="false"
          >
            <div className="flyout-content">
              {/* member data */}
              {(() => {
                const m = members.find((mm) => mm.id === openFlyoutMemberId);
                const prof = m ? memberProfiles[m.id] : undefined;
                if (!m) return <div className="muted">Member not found</div>;
                return (
                  <>
                    <div className="flyout-head" style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      <div className="avatar-bubble" aria-hidden style={{
                        width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center",
                        fontWeight: 700, background: "linear-gradient(135deg,#b9ffe8,#73ffc4)", color: "#033b2c"
                      }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flyout-name">👤 {m.name}</div>
                        {prof?.email ? <div className="flyout-email">{prof.email}</div> : <div className="flyout-muted">No email linked</div>}
                      </div>
                    </div>

                    <div className="flyout-body" style={{ marginBottom: 8 }}>
                      {prof?.upi ? (
                        <div className="upi-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <div className="flyout-label">UPI</div>
                          <div className="flyout-value" style={{ fontFamily: "monospace" }}>{prof.upi}</div>
                          <button className="btn tiny copy-upi" onClick={() => copyToClipboard(prof.upi, "UPI copied")}>Copy</button>
                        </div>
                      ) : (
                        <div className="flyout-muted">UPI not linked</div>
                      )}
                    </div>

                    <div className="flyout-actions" style={{ display: "flex", gap: 8 }}>
                      {prof?.upi ? (
                        <button className="btn mint" onClick={() => { const link = buildUpiLink(prof.upi, m.name, Math.abs(0)); window.open(link); setToast("Opening UPI"); setTimeout(()=>setToast(null),2000); }}>Open UPI app</button>
                      ) : (
                        <button className="btn" onClick={() => setToast("No UPI to open")}>No UPI</button>
                      )}
                      <button className="btn" onClick={() => { copyToClipboard(m.name, "Name copied"); }}>Copy name</button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* QR Modal */}
        {showQR && qrLink && (
          <motion.div className="mint-modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.32 }}>
            <div className="mint-modal-card">
              <h3>Notification Sent 🎉</h3>
              <p className="muted small">{qrMsg}</p>

              <div className="qr-wrap">
                <QRCodeCanvas value={qrLink} size={176} bgColor={"#f8fffb"} fgColor={"#033b2c"} level="M" />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button className="btn mint" onClick={() => { window.open(qrLink); }}>Open UPI app</button>
                <button className="btn" onClick={() => { navigator.clipboard?.writeText(qrLink); setToast("UPI link copied"); setTimeout(()=>setToast(null), 3000); }}>Copy link</button>
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
      </motion.div>
    </motion.div>
  );
};

export default SplitEase;
