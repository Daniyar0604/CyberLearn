const express = require("express");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads/avatars")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) return cb(new Error("Only jpg/png/webp allowed"));
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

router.post("/avatar", upload.single("avatar"), async (req, res) => {
  try {
    // временно: userId из body (позже лучше через JWT)
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });
    if (!req.file) return res.status(400).json({ message: "file required" });

    const avatarFile = req.file.filename;

    const db = require("../config/db");
    await db.query("UPDATE users SET avatar = ? WHERE id = ?", [avatarFile, userId]);

    res.json({
      message: "Avatar updated",
      avatar: avatarFile,
      url: `http://localhost:5000/uploads/avatars/${avatarFile}`,
    });
  } catch (e) {
    res.status(500).json({ message: "Upload failed", error: e.message });
  }
});

module.exports = router;
