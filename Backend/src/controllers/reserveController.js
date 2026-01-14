const db = require("../db");
const ReserveModel = require('../Models/Reserve');

exports.reserveBook = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookId = req.body.bookId;
    
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

        res.sendStatus(200);

    } 
    catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllReservedBooks = async (req, res) => {
  try {

    const rows = await ReserveModel.getAllReservedBooks();

    res.json(rows);

  } catch (err) {

    res.status(500);

  }
};

exports.getReservedBooksByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const rows = await ReserveModel.getReservedBooksByUserId(userId);

    res.json(rows);

  } catch (err) {
    
    res.status(500);

  }
};