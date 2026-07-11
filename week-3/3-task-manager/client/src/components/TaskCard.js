const TaskCard = ({ task, onEdit, onDelete }) => {
  const statusColors = {
    todo: "#6c757d",
    "in-progress": "#ffc107",
    completed: "#28a745",
  };

  const priorityColors = {
    low: "#17a2b8",
    medium: "#ffc107",
    high: "#dc3545",
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="task-badges">
          <span className="badge" style={{ background: statusColors[task.status] }}>
            {task.status.replace("-", " ")}
          </span>
          <span className="badge" style={{ background: priorityColors[task.priority] }}>
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      {task.dueDate && (
        <p className="task-due">Due: {formatDate(task.dueDate)}</p>
      )}

      {task.attachment && (
        <a href={task.attachment} target="_blank" rel="noopener noreferrer" className="task-attachment">
          📎 Attachment
        </a>
      )}

      <div className="task-actions">
        <button onClick={onEdit} className="edit-btn">Edit</button>
        <button onClick={onDelete} className="delete-btn">Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
