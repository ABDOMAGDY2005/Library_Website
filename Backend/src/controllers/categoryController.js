const db = require("../db");

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM categories`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};