import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get("/api/boards");
      setBoards(res.data.data);
    } catch (err) {
      console.error("Failed to fetch boards");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/boards", { title, description });
      setBoards([res.data.data, ...boards]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create board");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this board?")) return;
    try {
      await api.delete(`/api/boards/${id}`);
      setBoards(boards.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Failed to delete board");
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Projects</h1>
        <div className="header-right">
          <span className="user-name">{user?.name}</span>
          <span className="role-badge">{user?.role}</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="boards-header">
        <h2>Your Boards</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Board</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>New Board</h3>
            <form onSubmit={handleCreate}>
              <input type="text" placeholder="Board title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
              <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="boards-grid">
        {boards.map((board) => (
          <div key={board._id} className="board-card" onClick={() => navigate(`/board/${board._id}`)}>
            <div className="board-card-header">
              <h3>{board.title}</h3>
              <button className="btn-icon" onClick={(e) => handleDelete(board._id, e)} title="Delete">×</button>
            </div>
            {board.description && <p className="board-desc">{board.description}</p>}
            <div className="board-meta">
              <span>{board.members?.length || 0} members</span>
              <span>{board.lists?.length || 0} lists</span>
            </div>
          </div>
        ))}
        {boards.length === 0 && <p className="empty-msg">No boards yet. Create your first one!</p>}
      </div>
    </div>
  );
};

export default Dashboard;
