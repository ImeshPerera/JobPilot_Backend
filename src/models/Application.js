const db = require("../config/db");

class Application {
  static async create(applicationData) {
    const { user_id, job_id, resume_url } = applicationData;
    const [result] = await db.query(
      "INSERT INTO applications (user_id, job_id, resume_url) VALUES (?, ?, ?)",
      [user_id, job_id, resume_url]
    );
    return result.insertId;
  }

  static async findByJobId(job_id) {
    const [rows] = await db.query(
      "SELECT a.*, u.first_name, u.last_name, u.email FROM applications a JOIN users u ON a.user_id = u.id WHERE a.job_id = ?",
      [job_id]
    );
    return rows;
  }

  static async findByUserId(user_id) {
    const [rows] = await db.query(
      "SELECT a.*, j.title, j.company_name FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.user_id = ?",
      [user_id]
    );
    return rows;
  }

  static async updateStatus(id, status) {
    await db.query("UPDATE applications SET status = ? WHERE id = ?", [status, id]);
  }
}

module.exports = Application;
