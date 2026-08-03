const Resume = require("../models/Resume");
const Job = require("../models/Job");

// @desc    Parse resume (Extract skills & experience) & Save
// @route   POST /api/ai/parse-resume
// @access  Private (Job Seeker)
const parseResume = async (req, res) => {
  const { file_url } = req.body;

  try {
    if (!file_url) {
      return res.status(400).json({ message: "Resume file URL is required" });
    }

    // In a production app, you would integrate IBM Watson or OpenAI API here to read the PDF/doc and extract skills.
    // For now, we will simulate the extraction based on common skills.
    console.log(`Parsing resume at: ${file_url}`);
    
    // Simulating extraction
    const extracted_skills = "React, Node.js, Express, JavaScript, SQL, Git";
    const extracted_experience = "2 years of experience as a full stack software engineer, building web applications.";

    const resumeId = await Resume.create({
      user_id: req.user.id,
      file_url,
      extracted_skills,
      extracted_experience,
    });

    const savedResume = await Resume.findById(resumeId);

    res.status(201).json({
      message: "Resume parsed and saved successfully",
      resume: savedResume,
    });
  } catch (error) {
    console.error("Error parsing resume:", error);
    res.status(500).json({ message: "Server error parsing resume" });
  }
};

// @desc    Suggest jobs based on user's extracted skills
// @route   GET /api/ai/suggest-jobs
// @access  Private (Job Seeker)
const suggestJobs = async (req, res) => {
  try {
    // Get user's latest resume
    const resumes = await Resume.findByUserId(req.user.id);
    if (resumes.length === 0) {
      return res.status(400).json({ message: "Please parse a resume first to get recommendations" });
    }

    const latestResume = resumes[0];
    const skillsList = latestResume.extracted_skills
      .split(",")
      .map((s) => s.trim().toLowerCase());

    // Fetch all jobs
    const allJobs = await Job.findAll();

    // Basic keyword matching between job details and user skills
    const recommendations = allJobs.map((job) => {
      let matchCount = 0;
      const jobText = `${job.title} ${job.description} ${job.requirements} ${job.category}`.toLowerCase();
      
      skillsList.forEach((skill) => {
        if (jobText.includes(skill)) {
          matchCount++;
        }
      });

      return { job, score: matchCount };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((match) => match.job);

    res.json(recommendations);
  } catch (error) {
    console.error("Error matching jobs:", error);
    res.status(500).json({ message: "Server error suggesting jobs" });
  }
};

// @desc    FAQ Chatbot assistant for job postings
// @route   POST /api/ai/chatbot
// @access  Public
const chatbotQuery = async (req, res) => {
  const { message, job_id } = req.body;

  try {
    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    let jobContext = "";
    if (job_id) {
      const job = await Job.findById(job_id);
      if (job) {
        jobContext = `Job Title: ${job.title}. Company: ${job.company_name}. Description: ${job.description}. Requirements: ${job.requirements}. `;
      }
    }

    // In a fully-integrated system, you would call Botpress, Dialogflow, or OpenAI here.
    // Let's implement a rule-based response framework simulating an AI helper.
    let responseText = "I'm JobPilot Assistant. How can I help you today?";
    const query = message.toLowerCase();

    if (query.includes("skill") || query.includes("require")) {
      responseText = jobContext 
        ? `This job requires the following qualifications: ${jobContext.includes("Requirements:") ? jobContext.split("Requirements:")[1].trim() : "Please refer to the job post details."}`
        : "Most jobs on our platform require tech skills like JavaScript, SQL, Python, or design skills, depending on the category.";
    } else if (query.includes("salary") || query.includes("pay")) {
      responseText = jobContext
        ? `The salary info listed is: ${jobContext.includes("Salary:") ? jobContext.split("Salary:")[1].split(".")[0].trim() : "Not specified. You can discuss this in the interview."}`
        : "Salary ranges vary. You can view individual job postings to check details.";
    } else if (query.includes("apply") || query.includes("how to")) {
      responseText = "To apply, simply upload your resume on your profile page, parse your skills, and click 'Apply' on any job post.";
    } else if (jobContext) {
      responseText = `Regarding the position for "${jobContext.split(".")[0].split(":")[1].trim()}", please submit your resume so we can evaluate your match!`;
    }

    res.json({ reply: responseText });
  } catch (error) {
    console.error("Chatbot query error:", error);
    res.status(500).json({ message: "Server error in chatbot processing" });
  }
};

module.exports = {
  parseResume,
  suggestJobs,
  chatbotQuery,
};
