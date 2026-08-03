const db = require("../config/db");

class Course {
  static async create(courseData) {
    const { title, description, thumbnail_url, video_url, trainer_id } = courseData;
    const [result] = await db.query(
      "INSERT INTO courses (title, description, thumbnail_url, video_url, trainer_id) VALUES (?, ?, ?, ?, ?)",
      [title, description, thumbnail_url, video_url, trainer_id]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.query("SELECT * FROM courses ORDER BY created_at DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM courses WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByTrainerId(trainer_id) {
    const [rows] = await db.query("SELECT * FROM courses WHERE trainer_id = ? ORDER BY created_at DESC", [trainer_id]);
    return rows;
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updateData), id];
    await db.query(`UPDATE courses SET ${fields} WHERE id = ?`, values);
  }

  static async delete(id) {
    await db.query("DELETE FROM courses WHERE id = ?", [id]);
  }
}

module.exports = Course;
