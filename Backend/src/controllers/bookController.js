const db = require('../db');

exports.getAll = async (req, res) => {
    try{

        const [rows] = await db.query(`
            SELECT 
            
            Books.ID,
            Books.Name AS Book_Name,
            Authors.Name AS Author_Name,
            Categories.Name AS Category_Name,
            Books.Available_Copies,
            Books.Img_URL

            FROM Books
            JOIN Authors ON Books.Author_ID = Authors.ID
            JOIN Categories ON Books.Category_ID = Categories.ID
        `);

        res.status(200).json(rows);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.getById = async (req, res) => {
    try{
        const Id = Number(req.params.id);

        if(isNaN(Id)){
            res.sendStatus(404);
            return;
        }

        const [rows] = await db.query('select * from books where ID = ?',[Id]);

        if(rows.length === 0){
            res.sendStatus(404);
            return;
        }

        res.status(200).json(rows);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.getBorrowedBooks = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT 
         borrow.ID,
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
       FROM borrow
       JOIN books ON Borrow.Book_ID = Books.ID
       WHERE Borrow.User_ID = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReservedBooks = async (req, res) => {
  const userId = req.user.id;

  try {
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

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBooksByAuthor = async (req, res) => {
  const authorId = req.params.authorId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM Books WHERE Author_ID = ?`,
      [authorId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBooksByCategory = async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM Books WHERE Category_ID = ?`,
      [categoryId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBorrowedBooks = async (req, res) => {

  try {

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

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllReservedBooks = async (req, res) => {

  try {

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

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addBook = async (req, res) => {

    const { name, categoryId, authorId, availableCopies, Img_URL} = req.body || {};

    if (!name || !categoryId || !authorId || !availableCopies) {
      return res.status(400).json({ error: "name, categoryId, authorId, and availableCopies are required." });
    }

    try {
    const [result] = await db.query(
      `
        INSERT INTO books (name,category_id,author_id,available_copies,img_url)
        VALUES (?,?,?,?,?)
      `,
      [name,categoryId,authorId,availableCopies,Img_URL]
    );

    // result.insertId will exist if the user is inserted successfully
    if (!result.insertId) {
      return res.status(500).json({ error: "Failed to add book." });
    }

    return res.status(201).json({
      message: "book added successfully.",
      bookId: result.insertId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
};