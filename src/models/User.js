const db = require("../config/db");

class User {
  static async create(userData) {
    const { first_name, last_name, email, password, role, user_state = 'Active' } = userData;
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, email, password, role, user_state) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, password, role, user_state]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updateData), id];
    await db.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
  }

  static async delete(id) {
    await db.query("DELETE FROM users WHERE id = ?", [id]);
  }
}

module.exports = User;
