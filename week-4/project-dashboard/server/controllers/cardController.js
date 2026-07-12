const Card = require("../models/Card");
const List = require("../models/List");

exports.createCard = async (req, res) => {
  try {
    const { title, listId, description, assignee, dueDate, labels } = req.body;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }

    const position = list.cards.length;
    const card = await Card.create({
      title,
      description,
      list: listId,
      board: list.board,
      assignee,
      dueDate,
      labels,
      position,
    });

    list.cards.push(card._id);
    await list.save();

    const populated = await Card.findById(card._id).populate("assignee", "name email");
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate("assignee", "name email")
      .populate("board", "title")
      .populate("list", "title");

    if (!card) {
      return res.status(404).json({ success: false, error: "Card not found" });
    }

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("assignee", "name email");

    if (!card) {
      return res.status(404).json({ success: false, error: "Card not found" });
    }

    res.json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, error: "Card not found" });
    }

    await List.findByIdAndUpdate(card.list, { $pull: { cards: card._id } });
    await Card.findByIdAndDelete(card._id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Move card to different list or reorder within list
exports.moveCard = async (req, res) => {
  try {
    const { cardId, sourceListId, destListId, sourceIndex, destIndex } = req.body;

    // Remove from source list
    await List.findByIdAndUpdate(sourceListId, { $pull: { cards: cardId } });

    // Add to destination list at position
    const destList = await List.findById(destListId);
    destList.cards.splice(destIndex, 0, cardId);

    // Update positions
    for (let i = 0; i < destList.cards.length; i++) {
      await Card.findByIdAndUpdate(destList.cards[i], { position: i });
    }

    await destList.save();

    // Update card's list reference
    await Card.findByIdAndUpdate(cardId, { list: destListId });

    res.json({ success: true, data: { success: true } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
