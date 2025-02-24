const express = require('express');
const { auth, adminOnly } = require('../middleware/authentication');
const { createBook, deleteBook, renderBooksForAdmin } = require('../controllers/books'); // Add getAllBooks function

const router = express.Router();

// Route to get all books and render the admin page
router.get('/manage-books', auth, adminOnly, renderBooksForAdmin);  // Render books in the admin page

// Only accessible to admins
router.post('/add-book', auth, adminOnly, createBook); // Add a new book

// Delete a book - Only accessible to admins
router.delete('/delete-book/:id', auth, adminOnly, deleteBook); // Delete a book

module.exports = router;