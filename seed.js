const bcrypt = require("bcryptjs");
const db = require("./src/config/db");

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // 1. Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash("admin123", salt);
    const hashedEmployerPassword = await bcrypt.hash("employer123", salt);
    const hashedTrainerPassword = await bcrypt.hash("trainer123", salt);
    const hashedSeekerPassword = await bcrypt.hash("seeker123", salt);

    // 2. Clear old data (optional, to avoid duplicate entry errors)
    console.log("Clearing existing tables...");
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE course_enrollments");
    await db.query("TRUNCATE TABLE saved_jobs");
    await db.query("TRUNCATE TABLE resumes");
    await db.query("TRUNCATE TABLE applications");
    await db.query("TRUNCATE TABLE courses");
    await db.query("TRUNCATE TABLE jobs");
    await db.query("TRUNCATE TABLE users");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    // 3. Insert Users
    console.log("Inserting users...");
    const users = [
      ["Admin", "User", "admin@jobpilot.com", hashedAdminPassword, "ADMIN", "Active", "I am the administrator."],
      ["Elite", "Employer", "employer@jobpilot.com", hashedEmployerPassword, "EMPLOYER", "Active", "Hiring tech talent worldwide."],
      ["Expert", "Trainer", "trainer@jobpilot.com", hashedTrainerPassword, "TRAINER", "Active", "Tech instructor and industry mentor."],
      ["Jane", "Seeker", "seeker@jobpilot.com", hashedSeekerPassword, "JOB_SEEKER", "Active", "Junior Web Developer looking for frontend roles."]
    ];

    const userIds = [];
    for (const user of users) {
      const [result] = await db.query(
        "INSERT INTO users (first_name, last_name, email, password, role, user_state, bio) VALUES (?, ?, ?, ?, ?, ?, ?)",
        user
      );
      userIds.push(result.insertId);
    }
    const [adminId, employerId, trainerId, seekerId] = userIds;

    // Update job seeker's skills list
    await db.query("UPDATE users SET skills = ? WHERE id = ?", ["JavaScript, React, HTML, CSS", seekerId]);

    // 4. Insert Jobs
    console.log("Inserting jobs...");
    const jobs = [
      [
        "React Developer",
        "TechCorp Inc.",
        "We are looking for a skilled React Developer to join our team.",
        "React, JavaScript, HTML5, CSS3, Git",
        "Remote / New York",
        "$80,000 - $100,000",
        "Frontend Engineering",
        "Active",
        employerId
      ],
      [
        "Node.js Backend Engineer",
        "CloudFlow Systems",
        "Seeking a backend engineer to design scalable Express API architectures.",
        "Node.js, Express, MySQL, REST APIs",
        "San Francisco, CA",
        "$95,000 - $120,000",
        "Backend Engineering",
        "Active",
        employerId
      ]
    ];

    const jobIds = [];
    for (const job of jobs) {
      const [result] = await db.query(
        "INSERT INTO jobs (title, company_name, description, requirements, location, salary, category, job_state, employer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        job
      );
      jobIds.push(result.insertId);
    }
    const [reactJobId, nodeJobId] = jobIds;

    // 5. Insert Courses
    console.log("Inserting courses...");
    const courses = [
      [
        "Modern React from Scratch",
        "Learn React hooks, routing, state management, and build clean production applications.",
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
        "https://www.youtube.com/watch?v=Ke90Tje7VS0",
        trainerId
      ],
      [
        "Mastering Node.js and Express",
        "Deep dive into asynchronous JavaScript, Express routing, databases, and middleware.",
        "https://images.unsplash.com/photo-1599507593499-a3f7f7d9a2cc",
        "https://www.youtube.com/watch?v=Oe421EPjeBE",
        trainerId
      ]
    ];

    const courseIds = [];
    for (const course of courses) {
      const [result] = await db.query(
        "INSERT INTO courses (title, description, thumbnail_url, video_url, trainer_id) VALUES (?, ?, ?, ?, ?)",
        course
      );
      courseIds.push(result.insertId);
    }
    const [reactCourseId, nodeCourseId] = courseIds;

    // 6. Insert Applications
    console.log("Inserting application...");
    await db.query(
      "INSERT INTO applications (user_id, job_id, resume_url, status) VALUES (?, ?, ?, ?)",
      [seekerId, reactJobId, "https://jobpilot.com/uploads/resumes/jane_seeker_resume.pdf", "PENDING"]
    );

    // 7. Insert Resumes (Parsed Resume details)
    console.log("Inserting resume parsing logs...");
    await db.query(
      "INSERT INTO resumes (user_id, file_url, extracted_skills, extracted_experience) VALUES (?, ?, ?, ?)",
      [seekerId, "https://jobpilot.com/uploads/resumes/jane_seeker_resume.pdf", "React, JavaScript, HTML, CSS, Git", "1 year building React applications in personal portfolios."]
    );

    // 8. Insert Saved Jobs
    console.log("Inserting saved job...");
    await db.query(
      "INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)",
      [seekerId, nodeJobId]
    );

    // 9. Insert Course Enrollments
    console.log("Inserting course enrollment...");
    await db.query(
      "INSERT INTO course_enrollments (user_id, course_id, progress) VALUES (?, ?, ?)",
      [seekerId, reactCourseId, 35]
    );

    console.log("\nDatabase seeded successfully!");
    console.log("Sample Users created:");
    console.log("  - Admin: admin@jobpilot.com / admin123");
    console.log("  - Employer: employer@jobpilot.com / employer123");
    console.log("  - Trainer: trainer@jobpilot.com / trainer123");
    console.log("  - Job Seeker: seeker@jobpilot.com / seeker123");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
};

seedDatabase();
