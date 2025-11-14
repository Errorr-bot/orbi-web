// src/Tasks.tsx
import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./Tasks.css";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(taskList);
    });
    return () => unsub();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await addDoc(collection(db, "tasks"), {
      text: newTask,
      completed: false,
    });
    setNewTask("");
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await updateDoc(doc(db, "tasks", id), { completed: !completed });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return (
    <div className="tasks-container">

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

      <h2>📝 Orbi Tasks</h2>

      <form onSubmit={addTask} className="task-form">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit" className="mint-btn">
          Add
        </button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.completed ? "done" : ""}>
            <span onClick={() => toggleComplete(task.id, task.completed)}>
              {task.text}
            </span>
            <button onClick={() => deleteTask(task.id)}>✖</button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && <p>No tasks yet — add one above 🌱</p>}
    </div>
  );
};

export default Tasks;
