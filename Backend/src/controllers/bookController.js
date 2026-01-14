const db = require('../db');
const BooksModel  = require('../Models/Books')

exports.getAll = async (req, res) => {
    try{

        const books = await BooksModel.getAllBooks();

        res.status(200).json(books);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.getById = async (req, res) => {
    try{
        const id = Number(req.params.id);

        const book = BooksModel.getBookById(id);

        if(!book){
          
            return res.sendStatus(404);
        
        }

        res.status(200).json(book);

    }catch(err){

        res.sendStatus(500).json({err});

    }
};

exports.getBooksByAuthorId = async (req, res) => {
  try {
    const authorId = req.params.authorId;

    const rows = await BooksModel.getBooksByAuthorId(authorId);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBooksByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const rows = await BooksModel.getBooksByCategoryId(categoryId);

    res.json(rows);

  } catch (err) {

    res.status(500);
    
  }
};

exports.addBook = async (req, res) => {

    const { name, categoryId, authorId, availableCopies, Img_URL} = req.body || {};

    if (!name || !categoryId || !authorId || availableCopies == null) {
      return res.status(400).json({ error: "name, categoryId, authorId, and availableCopies are required." });
    }

    try {
    const result = await BooksModel.addBook(name,categoryId,authorId,availableCopies,Img_URL);

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