const express = require("express");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyEnrollments,
  updateCourseProgress,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.route("/")
  .get(getAllCourses)
  .post(protect, authorize("TRAINER", "ADMIN"), createCourse);

router.get("/my/enrollments", protect, getMyEnrollments);

router.route("/:id")
  .get(getCourseById)
  .put(protect, authorize("TRAINER", "ADMIN"), updateCourse)
  .delete(protect, authorize("TRAINER", "ADMIN"), deleteCourse);

router.post("/:id/enroll", protect, enrollInCourse);
router.put("/:id/progress", protect, updateCourseProgress);

module.exports = router;
