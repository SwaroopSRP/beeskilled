const List = require("../models/List");
const Board = require("../models/Board");
const Card = require("../models/Card");

exports.createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, error: "Board not found" });
    }

    const position = board.lists.length;
    const list = await List.create({ title, board: boardId, position });

    board.lists.push(list._id);
    await board.save();

    res.status(201).json({ success: true, data: list });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateList = async (req, res) => {
  try {
    const list = await List.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ success: false, error: "List not found" });
    }

    // Delete all cards in the list
    await Card.deleteMany({ list: list._id });

    // Remove from board
    await Board.findByIdAndUpdate(list.board, { $pull: { lists: list._id } });
    await List.findByIdAndDelete(list._id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Reorder lists (drag and drop)
exports.reorderLists = async (req, res) => {
  try {
    const { boardId, listIds } = req.body;

    for (let i = 0; i < listIds.length; i++) {
      await List.findByIdAndUpdate(listIds[i], { position: i });
    }

    await Board.findByIdAndUpdate(boardId, { lists: listIds });

    res.json({ success: true, data: { listIds } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
