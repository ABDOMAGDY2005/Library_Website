const db = require("../db");

exports.getAllBorrowedBooks = async () => {
  const [rows] = await db.query(
      `SELECT 
         borrow.ID,
         Book_ID,
         Books.Name AS book_name,
         User_ID,
         users.Name AS user_name,
         Borrow.borrow_date,
         Borrow.expected_return_date,
         Borrow.actual_return_date,
         CASE 
            WHEN Borrow.actual_return_date IS NULL THEN 'Not Returned'
            ELSE 'Returned'
         END AS status,
			 GREATEST(
				DATEDIFF(
					IFNULL(actual_return_date, CURDATE()),   
					expected_return_date
				) * fine_per_day,
				0
			) AS Fine
       FROM borrow
       JOIN books ON Borrow.Book_ID = Books.ID
       join users on Borrow.User_ID = users.ID`
    );

  return rows;
};

exports.getBorrowedBooksByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT 
        Borrow.ID,
        Book_ID,
        Books.Name AS book_name,
        Borrow.borrow_date,
        Borrow.expected_return_date,
        Borrow.actual_return_date,
        CASE 
          WHEN Borrow.actual_return_date IS NULL THEN 'Not Returned'
          ELSE 'Returned'
        END AS status,
        GREATEST(
          DATEDIFF(
            IFNULL(actual_return_date, CURDATE()),
            expected_return_date
          ) * fine_per_day,
          0
        ) AS Fine
     FROM Borrow
     JOIN Books ON Borrow.Book_ID = Books.ID
     WHERE Borrow.User_ID = ?`,
    [userId]
  );

  return rows;
};