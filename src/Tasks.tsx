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



interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // 🔹 Listen to real-time updates from Firestore
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

  // 🔹 Add a new task
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    await addDoc(collection(db, "tasks"), {
      text: newTask,
      completed: false,
    });
    setNewTask("");
  };

  // 🔹 Toggle complete/incomplete
  const toggleComplete = async (id: string, completed: boolean) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { completed: !completed });
  };

  // 🔹 Delete task
  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return (
    <div
      style={{
        marginTop: "30px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>📝 Orbi Tasks</h2>

      {/* Add Task Form */}
      <form
        onSubmit={addTask}
        style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}
      >
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task..."
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            width: "60%",
            marginRight: "10px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            border: "none",
            borderRadius: "8px",
            background: "#fff",
            color: "#C48AF6",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      {/* Task List */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              background: "rgba(255,255,255,0.2)",
              margin: "8px auto",
              padding: "12px 16px",
              borderRadius: "8px",
              width: "70%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
              textAlign: "left",
            }}
          >
            <span
              onClick={() => toggleComplete(task.id, task.completed)}
              style={{
                textDecoration: task.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#FFD0F0",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      {/* Empty state */}
      {tasks.length === 0 && (
        <p style={{ marginTop: "15px", opacity: 0.8 }}>
          No tasks yet — add one above!
        </p>
      )}
    </div>
  );
};

export default Tasks;
