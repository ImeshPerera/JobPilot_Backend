const express = require("express");
const {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/")
  .get(getAllJobs)
  .post(protect, authorize("EMPLOYER", "ADMIN"), createJob);

router.get("/my-jobs", protect, authorize("EMPLOYER"), getMyJobs);

router.route("/:id")
  .get(getJobById)
  .put(protect, authorize("EMPLOYER", "ADMIN"), updateJob)
  .delete(protect, authorize("EMPLOYER", "ADMIN"), deleteJob);

module.exports = router;
