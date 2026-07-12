const express = require("express");
const router = express.Router();
const {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember,
} = require("../controllers/boardController");
const { protect, boardAccess } = require("../middleware/auth");

router.use(protect);

router.route("/").get(getBoards).post(createBoard);
router.route("/:id").get(getBoard).put(updateBoard).delete(deleteBoard);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;
