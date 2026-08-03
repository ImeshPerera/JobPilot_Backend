const express = require("express");
const {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.post("/", protect, authorize("JOB_SEEKER"), applyForJob);
router.get("/my-applications", protect, authorize("JOB_SEEKER"), getMyApplications);
router.get("/job/:jobId", protect, authorize("EMPLOYER", "ADMIN"), getJobApplications);
router.put("/:id/status", protect, authorize("EMPLOYER", "ADMIN"), updateApplicationStatus);

module.exports = router;
