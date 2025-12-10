const db = require("../db");

exports.borrowBook = async (req, res) => {
  const userId = req.user.id;
  const bookId = req.body.bookId;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ============================
    // 1. Check Reservation First
    // ============================
    const [reserveRows] = await conn.query(
      `SELECT * FROM Reserve
       WHERE User_ID = ? AND Book_ID = ?
       AND book_availble_date IS NOT NULL 
       AND is_reservation_done = FALSE
       ORDER BY book_availble_date ASC
       LIMIT 1`,
      [userId, bookId]
    );

    if (reserveRows.length > 0) {
      // Borrow using reservation
      await conn.query(
        `INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date)
         VALUES (?, ?, 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY))`,
        [bookId, userId]
      );

      await conn.query(
        `UPDATE Reserve SET is_reservation_done = TRUE WHERE ID = ?`,
        [reserveRows[0].ID]
      );

      await conn.commit();
      return res.json({ message: "Borrowed using reservation" });
    }

    // ============================
    // 2. If no reservation → check copies
    // ============================
    const [bookRows] = await conn.query(
      "SELECT Available_Copies FROM Books WHERE ID = ?",
      [bookId]
    );

    if (bookRows.length === 0) {
      throw new Error("Book not found");
    }

    const copies = bookRows[0].Available_Copies;

    if (copies <= 0) {
      throw new Error("No available copies and no active reservation");
    }

    // Normal borrow (copies available)
    await conn.query(
      "UPDATE Books SET Available_Copies = Available_Copies - 1 WHERE ID = ?",
      [bookId]
    );

    await conn.query(
      `INSERT INTO Borrow (Book_ID, User_ID, fine_per_day, borrow_date, expected_return_date)
       VALUES (?, ?, 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY))`,
      [bookId, userId]
    );

    await conn.commit();
    return res.json({ message: "Borrowed successfully (normal borrow)" });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};
