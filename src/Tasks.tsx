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
    await addDoc(collection(db, "tasks"), { text: newTask, completed: false });
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
    <div className="tasks-container">
      <h2 className="section-title">📝 Tasks</h2>

      <form onSubmit={addTask} className="task-form">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="task-input"
        />
        <button type="submit" className="task-add-btn">
          Add
        </button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`task-item ${task.completed ? "completed" : ""}`}
          >
            <span
              onClick={() => toggleComplete(task.id, task.completed)}
              className="task-text"
            >
              {task.text}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="task-delete"
            >
              ✖
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="task-empty">No tasks yet — add one above 🌱</p>
      )}
    </div>
  );
};

export default Tasks;
