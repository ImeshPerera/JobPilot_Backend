const Course = require("../models/Course");
const CourseEnrollment = require("../models/CourseEnrollment");

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Trainer or Admin)
const createCourse = async (req, res) => {
  const { title, description, thumbnail_url, video_url } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: "Course title is required" });
    }

    const courseId = await Course.create({
      title,
      description,
      thumbnail_url,
      video_url,
      trainer_id: req.user.id,
    });

    const course = await Course.findById(courseId);
    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server error creating course" });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Server error fetching courses" });
  }
};

// @desc    Get a single course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Server error fetching course details" });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private (Trainer or Admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.trainer_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to update this course" });
    }

    const { title, description, thumbnail_url, video_url } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (video_url !== undefined) updateData.video_url = video_url;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    await Course.update(req.params.id, updateData);
    const updatedCourse = await Course.findById(req.params.id);
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error updating course" });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private (Trainer or Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.trainer_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await Course.delete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error deleting course" });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const alreadyEnrolled = await CourseEnrollment.findEnrollment(req.user.id, req.params.id);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    await CourseEnrollment.enroll(req.user.id, req.params.id);
    res.status(201).json({ message: "Successfully enrolled in course" });
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Server error enrolling in course" });
  }
};

// @desc    Get enrolled courses for logged-in user
// @route   GET /api/courses/my/enrollments
// @access  Private
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.findByUserId(req.user.id);
    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ message: "Server error fetching enrollments" });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
const updateCourseProgress = async (req, res) => {
  const { progress } = req.body;

  try {
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Progress must be a percentage between 0 and 100" });
    }

    // Verify enrollment exists
    const enrollment = await CourseEnrollment.findEnrollment(req.user.id, req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "You are not enrolled in this course" });
    }

    await CourseEnrollment.updateProgress(req.user.id, req.params.id, progress);
    res.json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ message: "Server error updating progress" });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyEnrollments,
  updateCourseProgress,
};
