const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");

// GET /api/authors
router.get("/", authorController.getAllAuthors);

module.exports = router;
