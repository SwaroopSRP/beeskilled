const express = require("express");
const router = express.Router();
const { register, login, getMe, getUsers, updateRole } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/users", protect, authorize("admin"), getUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateRole);

module.exports = router;
