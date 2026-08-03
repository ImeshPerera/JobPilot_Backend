const Job = require("../models/Job");

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employer or Admin)
const createJob = async (req, res) => {
  const { title, company_name, description, requirements, location, salary, category } = req.body;

  try {
    if (!title || !company_name || !description) {
      return res.status(400).json({ message: "Title, company name, and description are required" });
    }

    const jobId = await Job.create({
      title,
      company_name,
      description,
      requirements,
      location,
      salary,
      category,
      employer_id: req.user.id,
    });

    const job = await Job.findById(jobId);
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error creating job" });
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error fetching jobs" });
  }
};

// @desc    Get a single job details
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server error fetching job details" });
  }
};

// @desc    Get all jobs posted by the logged-in employer
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.findByEmployerId(req.user.id);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching employer jobs:", error);
    res.status(500).json({ message: "Server error fetching your jobs" });
  }
};

// @desc    Update a job posting
// @route   PUT /api/jobs/:id
// @access  Private (Employer or Admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check ownership
    if (job.employer_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    const { title, company_name, description, requirements, location, salary, category, job_state } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (company_name) updateData.company_name = company_name;
    if (description) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (location !== undefined) updateData.location = location;
    if (salary !== undefined) updateData.salary = salary;
    if (category !== undefined) updateData.category = category;
    if (job_state !== undefined) updateData.job_state = job_state;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No update data provided" });
    }

    await Job.update(req.params.id, updateData);
    const updatedJob = await Job.findById(req.params.id);
    res.json(updatedJob);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Server error updating job" });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Employer or Admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check ownership
    if (job.employer_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await Job.delete(req.params.id);
    res.json({ message: "Job removed successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error deleting job" });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
};
