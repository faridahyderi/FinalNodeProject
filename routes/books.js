const express = require('express');
const router = express.Router();

// Import controllers for books
const {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/books');

// Import the authentication and authorization middleware
const { auth, adminOnly } = require('../middleware/authentication');

// Routes for regular users (public access)
router.get('/', getAllBooks);  // View all books
router.get('/:id', getBook);  // View a single book

/* Admin routes (protected with adminOnly middleware)
router.get('/admin/manage-books', auth, adminOnly, (req, res) => {
  res.render('manage-books');  // Render the manage books page for admin
});*/

// Admin routes (protected with adminOnly middleware)
router.post('/', auth, adminOnly, createBook);  // Admin can create a book
router.patch('/:id', auth, adminOnly, updateBook);  // Admin can update a book
router.delete('/:id', auth, adminOnly, deleteBook);  // Admin can delete a book

module.exports = router;