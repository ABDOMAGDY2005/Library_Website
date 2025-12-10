const db = require("../db");

exports.returnBook = async (req, res) => {
  const userId = req.user.id;
  const bookId = req.body.bookId;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Check if user actually borrowed this book
    const [borrowRows] = await conn.query(
      `SELECT * FROM Borrow
       WHERE User_ID = ? AND Book_ID = ? AND actual_return_date IS NULL`,
      [userId, bookId]
    );

    if (borrowRows.length === 0) {
      throw new Error("You have not borrowed this book");
    }

    // 2. Mark return date
    await conn.query(
      `UPDATE Borrow 
       SET actual_return_date = CURDATE()
       WHERE ID = ?`,
      [borrowRows[0].ID]
    );

    // 3. Increase available copies
    await conn.query(
      "UPDATE Books SET Available_Copies = Available_Copies + 1 WHERE ID = ?",
      [bookId]
    );

    // 4. Check if someone reserved the book
    const [reserveRows] = await conn.query(
      `SELECT * FROM Reserve 
       WHERE Book_ID = ? 
       AND book_availble_date IS NULL 
       ORDER BY reservation_date ASC 
       LIMIT 1`,
      [bookId]
    );

    if (reserveRows.length > 0) {
      // Make copy available for reserved user
      await conn.query(
        `UPDATE Reserve 
         SET book_availble_date = CURDATE()
         WHERE ID = ?`,
        [reserveRows[0].ID]
      );

      // Remove that copy again (held for reserved user)
      await conn.query(
        "UPDATE Books SET Available_Copies = Available_Copies - 1 WHERE ID = ?",
        [bookId]
      );
    }

    await conn.commit();
    res.json({ message: "Returned successfully" });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};
