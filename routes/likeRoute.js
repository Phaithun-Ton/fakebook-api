const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const likeController = require("../controllers/likeController");

router.post("/", authenticate, likeController.createLike);
router.delete("/:id", authenticate, likeController.deleteLike);

module.exports = router;
