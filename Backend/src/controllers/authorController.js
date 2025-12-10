const db = require("../db");

exports.getAllAuthors = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM authors`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};