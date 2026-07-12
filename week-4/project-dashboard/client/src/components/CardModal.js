import { useState } from "react";

const CardModal = ({ card, onClose, onUpdate, onDelete, boardMembers }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [status, setStatus] = useState(card.list);
  const [assignee, setAssignee] = useState(card.assignee?._id || "");
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split("T")[0] : "");
  const [labels, setLabels] = useState(card.labels || []);
  const [editing, setEditing] = useState(false);

  const availableLabels = ["bug", "feature", "urgent", "low", "review"];

  const toggleLabel = (label) => {
    setLabels(labels.includes(label) ? labels.filter((l) => l !== label) : [...labels, label]);
  };

  const handleSave = () => {
    onUpdate(card._id, {
      title,
      description,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
      labels,
    });
    setEditing(false);
  };

  const labelColors = {
    bug: "#e74c3c",
    feature: "#3498db",
    urgent: "#e67e22",
    low: "#27ae60",
    review: "#9b59b6",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {editing ? (
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="modal-title-input" />
          ) : (
            <h2>{title}</h2>
          )}
          <button className="btn-icon" onClick={onClose}>x</button>
        </div>

        <div className="modal-body">
          <div className="modal-main">
            <div className="field-group">
              <label>Description</label>
              {editing ? (
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Add a description..." />
              ) : (
                <p className="description">{description || "No description"}</p>
              )}
            </div>

            <div className="field-group">
              <label>Labels</label>
              <div className="label-options">
                {availableLabels.map((label) => (
                  <button
                    key={label}
                    className={"label-toggle" + (labels.includes(label) ? " active" : "")}
                    style={{ borderColor: labelColors[label] }}
                    onClick={() => editing ? toggleLabel(label) : null}
                  >
                    <span className="label-dot" style={{ background: labelColors[label] }}></span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-sidebar">
            <div className="field-group">
              <label>Assignee</label>
              {editing ? (
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {boardMembers?.map((m) => (
                    <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                  ))}
                </select>
              ) : (
                <p>{card.assignee?.name || "Unassigned"}</p>
              )}
            </div>

            <div className="field-group">
              <label>Due Date</label>
              {editing ? (
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              ) : (
                <p>{dueDate ? new Date(dueDate).toLocaleDateString() : "None"}</p>
              )}
            </div>

            <div className="field-group">
              <label>Created</label>
              <p>{new Date(card.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {editing ? (
            <>
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button className="btn-cancel" onClick={() => { setEditing(false); setTitle(card.title); setDescription(card.description || ""); setLabels(card.labels || []); }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn-danger" onClick={() => { if (window.confirm("Delete this card?")) { onDelete(card._id); onClose(); } }}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;
