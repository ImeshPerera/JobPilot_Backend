const db = require("../config/db");

class Job {
  static async create(jobData) {
    const { title, company_name, description, requirements, location, salary, category, employer_id, job_state = 'Active' } = jobData;
    const [result] = await db.query(
      "INSERT INTO jobs (title, company_name, description, requirements, location, salary, category, employer_id, job_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, company_name, description, requirements, location, salary, category, employer_id, job_state]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM jobs ORDER BY created_at DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM jobs WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByEmployerId(employer_id) {
    const [rows] = await db.query("SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC", [employer_id]);
    return rows;
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updateData), id];
    await db.query(`UPDATE jobs SET ${fields} WHERE id = ?`, values);
  }

  static async delete(id) {
    await db.query("DELETE FROM jobs WHERE id = ?", [id]);
  }
}

module.exports = Job;
