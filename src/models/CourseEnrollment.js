const db = require("../config/db");

class CourseEnrollment {
  static async enroll(userId, courseId) {
    const [result] = await db.query(
      "INSERT INTO course_enrollments (user_id, course_id) VALUES (?, ?)",
      [userId, courseId]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      "SELECT ce.*, c.title, c.description, c.thumbnail_url FROM course_enrollments ce JOIN courses c ON ce.course_id = c.id WHERE ce.user_id = ?",
      [userId]
    );
    return rows;
  }

  static async findEnrollment(userId, courseId) {
    const [rows] = await db.query(
      "SELECT * FROM course_enrollments WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );
    return rows[0];
  }

  static async updateProgress(userId, courseId, progress) {
    await db.query(
      "UPDATE course_enrollments SET progress = ? WHERE user_id = ? AND course_id = ?",
      [progress, userId, courseId]
    );
  }
}

module.exports = CourseEnrollment;
