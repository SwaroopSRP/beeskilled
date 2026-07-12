const express = require("express");
const router = express.Router();
const { createCard, getCard, updateCard, deleteCard, moveCard } = require("../controllers/cardController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createCard);
router.put("/move", moveCard);
router.route("/:id").get(getCard).put(updateCard).delete(deleteCard);

module.exports = router;
