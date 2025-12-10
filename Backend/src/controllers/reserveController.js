const db = require("../db");

exports.reserveBook = async (req, res) => {
  const userId = req.user.id;
  const bookId = req.body.bookId;

  try {
    const [bookRows] = await db.query(
      "SELECT Available_Copies FROM Books WHERE ID = ?",
      [bookId]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (bookRows[0].Available_Copies > 0) {
      return res.status(400).json({
        error: "Cannot reserve a book that is available"
      });
    }

    await db.query(
      `INSERT INTO Reserve (User_ID, Book_ID, reservation_date, is_reservation_done)
       VALUES (?, ?, CURDATE(), false)`,
      [userId, bookId]
    );

    res.json({ message: "Book reserved successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.cancelReserve = async (req,res) => {
  try {
        const id = req.body.id;
        const [result] = await db.query(
            `UPDATE reserve
             SET is_reservation_done = 1
             WHERE ID = ?`,
            [id]
        );

        res.sendStatus(200);  // ✅ return ONLY the query result

    } 
    catch (err) {
    res.status(400).json({ error: err.message });
  }
}