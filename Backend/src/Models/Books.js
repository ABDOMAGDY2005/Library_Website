const db = require('../db');

exports.getAllBooks = async () => {
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
    return rows;
};

exports.getBookById = async (id) => {
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
        WHERE Books.ID = ?
    `, [id]);

    return rows[0];
};

exports.getBooksByAuthorId = async (authorId) => {
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
        WHERE Books.Author_ID = ?
    `, [authorId]);
    return rows;
};

exports.getBooksByCategoryId = async (categoryId) => {
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
        WHERE Books.Category_ID = ?
    `, [categoryId]);
    return rows;
};

exports.addBook = async (name,categoryId,authorId,availableCopies,Img_URL = null) => {
    const [result] = await db.query(
      `
        INSERT INTO books (name,category_id,author_id,available_copies,img_url)
        VALUES (?,?,?,?,?)
      `,
      [name,categoryId,authorId,availableCopies,Img_URL]
    );
    return result;
}