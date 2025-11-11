import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

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
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { completed: !completed });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>📝 Orbi Tasks</h2>

      <form onSubmit={addTask} style={{ marginBottom: "20px" }}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task..."
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            width: "60%",
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: "10px",
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

      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              background: "rgba(255,255,255,0.15)",
              margin: "8px auto",
              padding: "12px 16px",
              borderRadius: "8px",
              width: "70%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "white",
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
                color: "#FFB6C1",
                cursor: "pointer",
              }}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
