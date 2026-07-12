const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Not authorized" });
  }
};

// Check if user has system-level role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Not authorized for this action" });
    }
    next();
  };
};

// Check if user has access to a specific board
exports.boardAccess = (...boardRoles) => {
  return async (req, res, next) => {
    const Board = require("../models/Board");
    const boardId = req.params.boardId || req.body.boardId || req.params.id;

    if (!boardId) {
      return res.status(400).json({ success: false, error: "Board ID required" });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, error: "Board not found" });
    }

    // Owner always has access
    if (board.owner.toString() === req.user._id.toString()) {
      req.board = board;
      return next();
    }

    // System admin always has access
    if (req.user.role === "admin") {
      req.board = board;
      return next();
    }

    // Check board-level role
    const member = board.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ success: false, error: "No access to this board" });
    }

    if (boardRoles.length && !boardRoles.includes(member.role)) {
      return res.status(403).json({ success: false, error: "Insufficient board permissions" });
    }

    req.board = board;
    req.boardRole = member.role;
    next();
  };
};
