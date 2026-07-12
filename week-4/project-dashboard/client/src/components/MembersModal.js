import { useState, useEffect } from "react";
import api from "../utils/api";

const MembersModal = ({ board, onClose, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/auth/users");
      setUsers(res.data.data);
    } catch (err) {
      // Non-admin users won't have access
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/api/boards/" + board._id + "/members", { email, role });
      onUpdate(res.data.data);
      setEmail("");
      setRole("editor");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const res = await api.delete("/api/boards/" + board._id + "/members/" + userId);
      onUpdate(res.data.data);
    } catch (err) {
      setError("Failed to remove member");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Board Members</h2>
          <button className="btn-icon" onClick={onClose}>x</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleAddMember} className="add-member-form">
          <input
            type="email"
            placeholder="Member email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button type="submit" className="btn-primary btn-sm">Add</button>
        </form>

        <div className="members-list">
          {board.members?.map((member) => (
            <div key={member.user._id || member.user} className="member-item">
              <div className="member-info">
                <div className="member-avatar">
                  {(member.user.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="member-name">{member.user.name}</p>
                  <p className="member-email">{member.user.email}</p>
                </div>
              </div>
              <div className="member-actions">
                <span className="role-badge">{member.role}</span>
                {member.role !== "admin" && (
                  <button
                    className="btn-icon-sm btn-danger-sm"
                    onClick={() => handleRemoveMember(member.user._id)}
                  >
                    x
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
