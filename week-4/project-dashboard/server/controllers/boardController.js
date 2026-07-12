const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");

// Get all boards user has access to
exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { "members.user": req.user._id },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: boards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single board with lists and cards
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!board) {
      return res.status(404).json({ success: false, error: "Board not found" });
    }

    const lists = await List.find({ board: board._id })
      .populate({
        path: "cards",
        populate: { path: "assignee", select: "name email" },
      })
      .sort("position");

    res.json({ success: true, data: { ...board.toObject(), lists } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create board
exports.createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      ...req.body,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    // Create default lists
    const defaultLists = ["To Do", "In Progress", "Done"];
    for (let i = 0; i < defaultLists.length; i++) {
      const list = await List.create({
        title: defaultLists[i],
        board: board._id,
        position: i,
      });
      board.lists.push(list._id);
    }
    await board.save();

    res.status(201).json({ success: true, data: board });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update board
exports.updateBoard = async (req, res) => {
  try {
    const board = await Board.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("members.user", "name email");

    if (!board) {
      return res.status(404).json({ success: false, error: "Board not found" });
    }

    res.json({ success: true, data: board });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, error: "Board not found" });
    }

    // Delete all cards and lists
    await Card.deleteMany({ board: board._id });
    await List.deleteMany({ board: board._id });
    await Board.findByIdAndDelete(board._id);

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add member to board
exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const User = require("../models/User");

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, error: "Board not found" });
    }

    const exists = board.members.find(
      (m) => m.user.toString() === user._id.toString()
    );
    if (exists) {
      return res.status(400).json({ success: false, error: "User already a member" });
    }

    board.members.push({ user: user._id, role: role || "editor" });
    await board.save();

    const updated = await Board.findById(board._id).populate("members.user", "name email");
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Remove member
exports.removeMember = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    board.members = board.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );
    await board.save();

    const updated = await Board.findById(board._id).populate("members.user", "name email");
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
