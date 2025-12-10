const db = require('../db');

exports.login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(401).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM Users WHERE Email = ? AND Password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.status(200).json({"message" : "Valid email and password","name":rows[0].Name,"is_Admin" : rows[0].is_Admin});

  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

exports.register = async (req, res) => {
  const { email, password, name, birth_date } = req.body || {};

  if (!email || !password || !name || !birth_date) {
    return res.status(400).json({ error: "Email, password, name, and birth_date are required." });
  }

  try {
    const [result] = await db.query(
      `
        INSERT INTO users (email, password, name, birth_date,is_Admin)
        VALUES (?, ?, ?, ?,false);
      `,
      [email, password, name, birth_date]
    );

    // result.insertId will exist if the user is inserted successfully
    if (!result.insertId) {
      return res.status(500).json({ error: "Failed to register user." });
    }

    return res.status(201).json({
      message: "User registered successfully.",
      userId: result.insertId
    });

  } catch (err) {
    console.error(err);

    // Duplicate email check (MySQL error code 1062)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: "Email already exists." });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
}
