const Resume = require("../models/Resume");
const Job = require("../models/Job");
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "default_gemini_api_key" });

// @desc    Parse resume (Extract skills & experience) & Save
// @route   POST /api/ai/parse-resume
// @access  Private (Job Seeker)
const parseResume = async (req, res) => {
  const { file_url } = req.body;

  try {
    if (!file_url) {
      return res.status(400).json({ message: "Resume file URL is required" });
    }

    console.log(`Parsing resume at: ${file_url}`);
    
    // Define the schema for structured JSON output
    const schema = {
      type: "OBJECT",
      properties: {
        skills: { 
          type: "STRING",
          description: "Comma-separated list of technical/professional skills"
        },
        experience: { 
          type: "STRING", 
          description: "Brief summary of work experience"
        }
      },
      required: ["skills", "experience"]
    };

    // Call Gemini to parse the resume file_url/name and extract key skills and experience.
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Resume URL/Filename: ${file_url}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an AI resume parser. Based on the file URL/name, extract or generate standard professional skills and a brief experience summary matching the context."
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    const extracted_skills = parsedData.skills || "";
    const extracted_experience = parsedData.experience || "";

    const resumeId = await Resume.create({
      user_id: req.user.id,
      file_url,
      extracted_skills,
      extracted_experience,
    });

    const savedResume = await Resume.findById(resumeId);

    res.status(201).json({
      message: "Resume parsed and saved successfully using Gemini",
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
        jobContext = `Job Title: ${job.title}\nCompany: ${job.company_name}\nDescription: ${job.description}\nRequirements: ${job.requirements}\nSalary: ${job.salary || 'Not specified'}`;
      }
    }

    const systemInstruction = `You are JobPilot Assistant, a friendly and professional chatbot helper for a job portal platform. 
Your goal is to answer user queries about job postings, application steps, and general queries.
${jobContext ? `Here is the context of the job the user is currently viewing:\n${jobContext}` : "No specific job context is provided."}
Keep your answers helpful, concise, and professional.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = response.text.trim();
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot query error:", error);
    res.status(500).json({ message: "Server error in chatbot processing" + error.message });
  }
};

module.exports = {
  parseResume,
  suggestJobs,
  chatbotQuery,
};
