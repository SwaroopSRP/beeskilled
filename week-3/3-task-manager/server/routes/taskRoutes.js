const express = require("express");
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(protect);

router.get("/stats", getStats);
router.route("/").get(getTasks).post(upload.single("attachment"), createTask);
router.route("/:id").get(getTask).put(upload.single("attachment"), updateTask).delete(deleteTask);

module.exports = router;
