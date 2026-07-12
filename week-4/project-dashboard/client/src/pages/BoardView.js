import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ListColumn from "../components/ListColumn";
import CardModal from "../components/CardModal";
import MembersModal from "../components/MembersModal";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const BoardView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchBoard = useCallback(async () => {
    try {
      const res = await api.get("/api/boards/" + id);
      setBoard(res.data.data);
      setLists(res.data.data.lists || []);
    } catch (err) {
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const res = await api.post("/api/lists", { title: newListTitle, boardId: id });
      setLists([...lists, { ...res.data.data, cards: [] }]);
      setNewListTitle("");
      setAddingList(false);
    } catch (err) {
      console.error("Failed to add list");
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Delete this list and all its cards?")) return;
    try {
      await api.delete("/api/lists/" + listId);
      setLists(lists.filter((l) => l._id !== listId));
    } catch (err) {
      console.error("Failed to delete list");
    }
  };

  const handleAddCard = async (listId, title) => {
    try {
      const res = await api.post("/api/cards", { title, listId });
      setLists(
        lists.map((l) =>
          l._id === listId ? { ...l, cards: [...l.cards, res.data.data] } : l
        )
      );
    } catch (err) {
      console.error("Failed to add card");
    }
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleUpdateCard = async (cardId, updates) => {
    try {
      const res = await api.put("/api/cards/" + cardId, updates);
      setLists(
        lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) => (c._id === cardId ? res.data.data : c)),
        }))
      );
      setSelectedCard(res.data.data);
    } catch (err) {
      console.error("Failed to update card");
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await api.delete("/api/cards/" + cardId);
      setLists(
        lists.map((l) => ({
          ...l,
          cards: l.cards.filter((c) => c._id !== cardId),
        }))
      );
    } catch (err) {
      console.error("Failed to delete card");
    }
  };

  const findListByCardId = (cardId) => {
    return lists.find((l) => l.cards.some((c) => c._id === cardId));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const list = findListByCardId(active.id);
    if (list) {
      const card = list.cards.find((c) => c._id === active.id);
      setActiveCard(card);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const sourceList = findListByCardId(activeId);
    let destList = findListByCardId(overId);
    if (!destList) destList = lists.find((l) => l._id === overId);

    if (!sourceList || !destList || sourceList._id === destList._id) return;

    setLists((prev) => {
      const source = prev.find((l) => l._id === sourceList._id);
      const dest = prev.find((l) => l._id === destList._id);
      const sourceCards = [...source.cards];
      const destCards = [...dest.cards];
      const cardIndex = sourceCards.findIndex((c) => c._id === activeId);
      const [card] = sourceCards.splice(cardIndex, 1);
      const overIndex = destCards.findIndex((c) => c._id === overId);
      if (overIndex >= 0) {
        destCards.splice(overIndex, 0, card);
      } else {
        destCards.push(card);
      }
      return prev.map((l) => {
        if (l._id === source._id) return { ...l, cards: sourceCards };
        if (l._id === dest._id) return { ...l, cards: destCards };
        return l;
      });
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const sourceList = findListByCardId(active.id);
    let destList = findListByCardId(over.id);
    if (!destList) destList = lists.find((l) => l._id === over.id);
    if (!sourceList || !destList) return;

    if (sourceList._id !== destList._id) {
      try {
        await api.put("/api/cards/move", {
          cardId: active.id,
          sourceListId: sourceList._id,
          destListId: destList._id,
          sourceIndex: sourceList.cards.findIndex((c) => c._id === active.id),
          destIndex: destList.cards.findIndex((c) => c._id === over.id) || 0,
        });
      } catch (err) {
        fetchBoard();
      }
    } else {
      const oldIndex = sourceList.cards.findIndex((c) => c._id === active.id);
      const newIndex = sourceList.cards.findIndex((c) => c._id === over.id);
      if (oldIndex !== newIndex) {
        setLists((prev) => {
          const list = prev.find((l) => l._id === sourceList._id);
          const newCards = arrayMove(list.cards, oldIndex, newIndex);
          return prev.map((l) =>
            l._id === list._id ? { ...l, cards: newCards } : l
          );
        });
      }
    }
  };

  if (loading) return <div className="loading">Loading board...</div>;
  if (!board) return <div className="loading">Board not found</div>;

  return (
    <div className="board-view">
      <header className="board-header">
        <div className="board-header-left">
          <button className="btn-back" onClick={() => navigate("/")}>Back</button>
          <h1>{board.title}</h1>
        </div>
        <div className="board-header-right">
          <span className="member-count" onClick={() => setShowMembersModal(true)}>
            {board.members?.length || 0} members
          </span>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="lists-container">
          {lists.map((list) => (
            <ListColumn
              key={list._id}
              list={list}
              onDeleteList={handleDeleteList}
              onAddCard={handleAddCard}
              onCardClick={handleCardClick}
            />
          ))}

          {addingList ? (
            <div className="list-column add-list-column">
              <form onSubmit={handleAddList} className="add-list-form">
                <input
                  type="text"
                  placeholder="List title"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  autoFocus
                />
                <div className="add-list-actions">
                  <button type="submit" className="btn-primary btn-sm">Add</button>
                  <button type="button" className="btn-cancel btn-sm" onClick={() => { setAddingList(false); setNewListTitle(""); }}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <button className="add-list-btn" onClick={() => setAddingList(true)}>
              + Add List
            </button>
          )}
        </div>

        <DragOverlay>
          {activeCard ? (
            <div className="card-overlay">{activeCard.title}</div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {showCardModal && selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => { setShowCardModal(false); setSelectedCard(null); }}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
          boardMembers={board.members}
        />
      )}

      {showMembersModal && (
        <MembersModal
          board={board}
          onClose={() => setShowMembersModal(false)}
          onUpdate={setBoard}
        />
      )}
    </div>
  );
};

export default BoardView;
