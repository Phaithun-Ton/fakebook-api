const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authenticate");
const upload = require("../middlewares/upload");

router.get("/me", authenticate, userController.getMe);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.patch(
  "/profile-img",
  authenticate, // req.user ออกมา
  upload.single("profileImg"), // req.file ออกมา
  userController.updateProfileImg
);

module.exports = router;
