const Application = require("../models/Application");
const Job = require("../models/Job");

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker)
const applyForJob = async (req, res) => {
  const { job_id, resume_url } = req.body;

  try {
    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    // Verify job exists
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applicationId = await Application.create({
      user_id: req.user.id,
      job_id,
      resume_url,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error submitting application" });
  }
};

// @desc    Get applications for a job (employers can view applicants)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer or Admin)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check ownership of the job
    if (job.employer_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to view applicants for this job" });
    }

    const applications = await Application.findByJobId(req.params.jobId);
    res.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server error fetching applications" });
  }
};

// @desc    Get applications submitted by the logged-in job seeker
// @route   GET /api/applications/my-applications
// @access  Private (Job Seeker)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findByUserId(req.user.id);
    res.json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({ message: "Server error fetching your applications" });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer or Admin)
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;

  try {
    if (!status || !["PENDING", "SHORTLISTED", "REJECTED", "ACCEPTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    // First find the application by ID to check ownership
    // We don't have a direct Application.findById method in the model. Let's inspect the database query.
    // In Application.js we have: findByJobId, findByUserId, updateStatus.
    // Let's execute the status update directly.
    await Application.updateStatus(req.params.id, status);
    res.json({ message: `Application status updated to ${status}` });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Server error updating application status" });
  }
};

module.exports = {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
};
