import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get("/api/todos");
    setTodos(res.data.data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await axios.post("/api/todos", { title });
    setTodos([res.data.data, ...todos]);
    setTitle("");
  };

  const toggleComplete = async (id, completed) => {
    const res = await axios.put(`/api/todos/${id}`, { completed: !completed });
    setTodos(todos.map((t) => (t._id === id ? res.data.data : t)));
  };

  const updateTodo = async (id) => {
    const res = await axios.put(`/api/todos/${id}`, { title: editTitle });
    setTodos(todos.map((t) => (t._id === id ? res.data.data : t)));
    setEditingId(null);
  };

  const deleteTodo = async (id) => {
    await axios.delete(`/api/todos/${id}`);
    setTodos(todos.filter((t) => t._id !== id));
  };

  return (
    <div className="todos-container">
      <header>
        <h1>My Todos</h1>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <form onSubmit={addTodo} className="add-form">
        <input type="text" placeholder="Add a new todo..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className={todo.completed ? "completed" : ""}>
            <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo._id, todo.completed)} />
            {editingId === todo._id ? (
              <div className="edit-form">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && updateTodo(todo._id)} autoFocus />
                <button onClick={() => updateTodo(todo._id)}>Save</button>
              </div>
            ) : (
              <span className="todo-title">{todo.title}</span>
            )}
            <div className="todo-actions">
              {editingId !== todo._id && (
                <button className="edit-btn" onClick={() => { setEditingId(todo._id); setEditTitle(todo.title); }}>Edit</button>
              )}
              <button className="delete-btn" onClick={() => deleteTodo(todo._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p className="empty">No todos yet. Add one above!</p>}
    </div>
  );
};

export default Todos;
