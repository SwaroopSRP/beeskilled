import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";
import Stats from "../components/Stats";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", search: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await axios.get("/api/tasks", { params });
      setTasks(res.data.data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/tasks/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      await axios.post("/api/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowForm(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTask = async (id, formData) => {
    try {
      await axios.put(`/api/tasks/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditingTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
      fetchStats();
    } catch (err) {
      console.error("Failed to delete task");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Task Manager</h1>
        <div className="header-right">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      {stats && <Stats stats={stats} />}

      <div className="toolbar">
        <div className="filters">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input type="text" placeholder="Search tasks..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <button className="add-btn" onClick={() => { setEditingTask(null); setShowForm(true); }}>
          + Add Task
        </button>
      </div>

      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? (formData) => handleUpdateTask(editingTask._id, formData) : handleCreateTask}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty">No tasks found. Create one to get started!</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => setEditingTask(task)}
              onDelete={() => handleDeleteTask(task._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
