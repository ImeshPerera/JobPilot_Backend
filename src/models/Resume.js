const db = require("../config/db");

class Resume {
  static async create(resumeData) {
    const { user_id, file_url, extracted_skills, extracted_experience } = resumeData;
    const [result] = await db.query(
      "INSERT INTO resumes (user_id, file_url, extracted_skills, extracted_experience) VALUES (?, ?, ?, ?)",
      [user_id, file_url, extracted_skills, extracted_experience]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      "SELECT * FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC",
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM resumes WHERE id = ?", [id]);
    return rows[0];
  }

  static async delete(id) {
    await db.query("DELETE FROM resumes WHERE id = ?", [id]);
  }
}

module.exports = Resume;
