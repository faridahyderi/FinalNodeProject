const Book = require('../models/Book');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// Get all books (Public Access)
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort('createdAt');
    res.status(StatusCodes.OK).json({ books, count: books.length });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching books' });
  }
};

// New controller function to render books for the admin view
async function renderBooksForAdmin(req, res) {
  try {
    const books = await Book.find();  // Fetch all books (not only those created by the admin)
    res.status(200).json({ books, count: books.length });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Error fetching books' });
  }
}



// Get a specific book (Public Access)
const getBook = async (req, res) => {
  const { id: bookId } = req.params;
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new NotFoundError(`No book with id ${bookId}`);
    }
    res.status(StatusCodes.OK).json({ book });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching book details' });
  }
};

// Create Book - Only Admin can do this
const createBook = async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new BadRequestError('You are not authorized to create books');
  }

  req.body.createdBy = req.user.userId; // Ensure the book is associated with the logged-in admin
  try {
    const book = await Book.create(req.body);
    res.status(StatusCodes.CREATED).json({ book });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error creating the book' });
  }
};

// Update Book - Only Admin can do this
const updateBook = async (req, res) => {
  const { id: bookId } = req.params;

  if (req.user.role !== 'admin') {
    throw new BadRequestError('You are not authorized to update books');
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new NotFoundError(`No book with id ${bookId}`);
    }

    const updatedBook = await Book.findByIdAndUpdate(bookId, req.body, { new: true, runValidators: true });
    res.status(StatusCodes.OK).json({ updatedBook });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating the book' });
  }
};

// Delete Book - Only Admin can do this
const deleteBook = async (req, res) => {
  const { id: bookId } = req.params;

  if (req.user.role !== 'admin') {
    throw new BadRequestError('You are not authorized to delete books');
  }

  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new NotFoundError(`No book found with id ${bookId}`);
    }

    await Book.findByIdAndRemove(bookId);
    res.status(StatusCodes.OK).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting the book' });
  }
};

module.exports = {
  getAllBooks,
  renderBooksForAdmin,
  getBook,
  createBook,
  updateBook,
  deleteBook,
};