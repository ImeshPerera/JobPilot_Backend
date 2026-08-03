const express = require("express");
const {
  parseResume,
  suggestJobs,
  chatbotQuery,
} = require("../controllers/aiController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.post("/parse-resume", protect, parseResume);
router.get("/suggest-jobs", protect, suggestJobs);
router.post("/chatbot", chatbotQuery);

module.exports = router;
