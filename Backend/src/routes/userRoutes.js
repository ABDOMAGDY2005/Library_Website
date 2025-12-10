const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const adminMiddleware = require("../middlewares/admin");

//
// USER SELF INFO
//

// Get own info
router.get("/me/info", userController.getMyInfo);

//
// USER MANAGEMENT ROUTES
//

// Get all users (ADMIN)
router.get("/", adminMiddleware, userController.getAll);

// Get user by ID (ADMIN)
router.get("/:id", adminMiddleware, userController.getById);

// Update own profile
router.put("/me/update", userController.updateUser);

//
// ADMIN ACTIONS
//

// Make user an admin (ADMIN)
router.post("/:id/make-admin", adminMiddleware, userController.makeAdmin);

// Remove admin role (ADMIN)
router.post("/:id/remove-admin", adminMiddleware, userController.removeAdmin);

module.exports = router;
