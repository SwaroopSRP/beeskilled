const Note = require("../models/Note");

// @desc    Get all notes for logged in user
// @route   GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { user: req.user._id };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const notes = await Note.find(query).sort({ pinned: -1, createdAt: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create note
// @route   POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }

    note.pinned = !note.pinned;
    await note.save();

    res.json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
