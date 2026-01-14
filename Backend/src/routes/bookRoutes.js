const express = require("express");
const router = express.Router();

const adminMiddleware = require("../middlewares/admin");
const bookController = require("../controllers/bookController");
const borrowController = require("../controllers/borrowController");
const reserveController = require("../controllers/reserveController");

//
// BOOK ROUTES
//

// Get all books
router.get("/", bookController.getAll);

// Get books borrowed by logged-in user
router.get("/borrowed", borrowController.getBorrowedBooksByUser);

// Get all borrowed books (ADMIN)
router.get("/borrowed/all", adminMiddleware, borrowController.getAllBorrowedBooks);

// Get books reserved by logged-in user
router.get("/reserved", reserveController.getReservedBooksByUser);

// Get all reserved books (ADMIN)
router.get("/reserved/all", adminMiddleware, reserveController.getAllReservedBooks);

// Get books by author
router.get("/author/:authorId", bookController.getBooksByAuthorId);

// Get books by category
router.get("/category/:categoryId", bookController.getBooksByCategoryId);

// Get a single book by ID
router.get("/:id", bookController.getById);

// Add a book (ADMIN)
router.post("/", adminMiddleware, bookController.addBook);


//
// BORROW / RETURN / RESERVE
//

router.post("/borrow", borrowController.borrowBook);
router.post("/return", retController.returnBook);
router.post("/reserve", reserveController.reserveBook);
router.post("/cancelReserve", reserveController.cancelReserve);

module.exports = router;
