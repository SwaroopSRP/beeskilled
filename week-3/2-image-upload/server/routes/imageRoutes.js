const express = require("express");
const router = express.Router();
const { uploadImage, getImages, deleteImage } = require("../controllers/imageController");
const upload = require("../middleware/upload");

router.post("/upload", upload.single("image"), uploadImage);
router.get("/", getImages);
router.delete("/:id", deleteImage);

module.exports = router;
