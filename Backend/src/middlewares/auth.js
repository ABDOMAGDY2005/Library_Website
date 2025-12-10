const db = require("../db");

async function authMiddleware(req, res, next) {
  // Read from headers
  const email = req.headers["email"];
  const password = req.headers["password"];

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

    const user = rows[0];

    req.user = {
      id: user.ID,
      name: user.Name,
      email: user.Email,
      isAdmin: user.is_Admin
    };

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = authMiddleware;
