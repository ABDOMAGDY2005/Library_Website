const db = require('../db');

exports.getAllReservedBooks = async (req, res) => {
    const [rows] = await db.query(
      `SELECT 
         Reserve.ID AS reservation_id,
         Reserve.Book_ID,
         Books.Name AS book_name,
         reserve.User_ID,
         users.Name as user_name,
         Reserve.reservation_date,
         Reserve.book_availble_date,
         Reserve.is_reservation_done,
         CASE
			WHEN Reserve.book_availble_date IS NULL AND reserve.is_reservation_done = 1 THEN 'Cancelled before a copy was available'
            WHEN Reserve.is_reservation_done = 1 THEN 'Finished'
            WHEN Reserve.book_availble_date IS NOT NULL THEN 'Waiting for user to borrow'
            ELSE 'Waiting for a copy of the book'
         END AS status
       FROM Reserve
       JOIN Books ON Reserve.Book_ID = Books.ID
       JOIN Users ON Reserve.User_ID = Users.ID;`
    );

    return rows;
};

exports.getReservedBooksByUserId = async (userId) => {
    const [rows] = await db.query(
      `SELECT 
         Reserve.ID AS reservation_id,
         Reserve.Book_ID,
         Books.Name AS book_name,
         Reserve.reservation_date,
         Reserve.book_availble_date,
         Reserve.is_reservation_done,
         CASE
			WHEN Reserve.book_availble_date IS NULL AND reserve.is_reservation_done = 1 THEN 'Cancelled before a copy was available'
            WHEN Reserve.is_reservation_done = 1 THEN 'Finished'
            WHEN Reserve.book_availble_date IS NOT NULL THEN 'Waiting for user to borrow'
            ELSE 'Waiting for a copy of the book'
         END AS status
       FROM Reserve
       JOIN Books ON Reserve.Book_ID = Books.ID
       WHERE Reserve.User_ID = ?`,
      [userId]
    );
    return rows;
}
