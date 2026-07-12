import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

const SortableCard = ({ card, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const labelColors = {
    bug: "#e74c3c",
    feature: "#3498db",
    urgent: "#e67e22",
    low: "#27ae60",
    review: "#9b59b6",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={"card" + (isDragging ? " dragging" : "")}
      onClick={() => onClick(card)}
    >
      <h4>{card.title}</h4>
      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map((label) => (
            <span key={label} className="label" style={{ background: labelColors[label] || "#999" }}>
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="card-footer">
        {card.dueDate && (
          <span className="due-date">
            {new Date(card.dueDate).toLocaleDateString()}
          </span>
        )}
        {card.assignee && (
          <span className="assignee-avatar" title={card.assignee.name}>
            {card.assignee.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

const ListColumn = ({ list, onDeleteList, onAddCard, onCardClick }) => {
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const { setNodeRef } = useDroppable({ id: list._id });

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    onAddCard(list._id, newCardTitle);
    setNewCardTitle("");
    setAddingCard(false);
  };

  return (
    <div className="list-column">
      <div className="list-header">
        <h3>{list.title}</h3>
        <span className="card-count">{list.cards.length}</span>
        <button className="btn-icon-sm" onClick={() => onDeleteList(list._id)} title="Delete list">
          x
        </button>
      </div>

      <div className="cards-container" ref={setNodeRef}>
        <SortableContext items={list.cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <SortableCard key={card._id} card={card} onClick={onCardClick} />
          ))}
        </SortableContext>

        {list.cards.length === 0 && !addingCard && (
          <div className="empty-list">No cards yet</div>
        )}

        {addingCard ? (
          <form onSubmit={handleAddCard} className="add-card-form">
            <textarea
              placeholder="Card title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              autoFocus
              rows={2}
            />
            <div className="add-card-actions">
              <button type="submit" className="btn-primary btn-xs">Add</button>
              <button type="button" className="btn-cancel btn-xs" onClick={() => { setAddingCard(false); setNewCardTitle(""); }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="add-card-btn" onClick={() => setAddingCard(true)}>
            + Add Card
          </button>
        )}
      </div>
    </div>
  );
};

export default ListColumn;
