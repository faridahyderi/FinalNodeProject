const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

// Borrow a book
const borrowBook = async (req, res) => {
  const { bookId } = req.body; 
  const userId = req.user.userId; 

  // Check if the book exists
  const book = await Book.findById(bookId);
  if (!book) {
    throw new NotFoundError(`No book found with id ${bookId}`);
  }

  // Check if the book is on hold by another user
  if (book.status === 'on-hold' && String(book.holdBy) !== userId) {
    throw new BadRequestError('This book is currently on hold by another user');
  }

  // Check if the book is already borrowed
  const existingBorrow = await Borrow.findOne({ book: bookId, status: 'borrowed' });
  if (existingBorrow) {
    throw new BadRequestError('This book is already borrowed');
  }

  // Set due date (e.g., 14 days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  // Create a borrow record
  const borrow = await Borrow.create({
    book: bookId,
    user: userId,
    dueDate: dueDate,
  });

  // Update the book status
  /*book.status = 'borrowed';
  book.holdBy = null; // Remove hold if it was held by the borrower
  await book.save();*/
  await Book.findByIdAndUpdate(bookId, { status: 'borrowed', holdBy: null });
  res.status(StatusCodes.CREATED).json({ message: 'Book borrowed successfully', borrow });
};

// Return a book
const returnBook = async (req, res) => {
  const { borrowId } = req.body;
  const userId = req.user.userId;

  // Find the borrow record
  const borrow = await Borrow.findOne({ _id: borrowId, user: userId, status: 'borrowed' });
  if (!borrow) {
    throw new NotFoundError('Borrow record not found or book is already returned');
  }

  // Calculate fine if overdue
  const today = new Date();
  let fine = 0;
  if (borrow.dueDate < today) {
    const overdueDays = Math.ceil((today - borrow.dueDate) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    fine = overdueDays * 1; // Example: $1 per overdue day
  }

  // Update the borrow record
  borrow.status = 'returned';
  borrow.returnDate = today;
  borrow.fine = fine;
  await borrow.save();

  // Update book status to available
  const book = await Book.findById(borrow.book);
  book.status = 'available';
  await book.save();

  res.status(StatusCodes.OK).json({ message: 'Book returned successfully', borrow, fine });
};

// Renew a book
const renewBook = async (req, res) => {
  const { borrowId } = req.body;
  const userId = req.user.userId;

  // Find the borrow record
  const borrow = await Borrow.findOne({ _id: borrowId, user: userId, status: 'borrowed' });
  if (!borrow) {
    throw new NotFoundError('Borrow record not found');
  }

  // Check if the book is on hold by someone else
  const book = await Book.findById(borrow.book);
  if (book.status === 'on-hold' && String(book.holdBy) !== userId) {
    throw new BadRequestError('Cannot renew book as it is on hold by another user');
  }

  // Check if the renewal limit is reached (e.g., max 2 renewals)
  if (borrow.renewalCount >= 2) {
    throw new BadRequestError('Renewal limit reached');
  }

  // Extend due date by 14 days
  const newDueDate = new Date(borrow.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 14);

  // Update borrow record
  borrow.dueDate = newDueDate;
  borrow.renewalCount += 1;
  await borrow.save();

  res.status(StatusCodes.OK).json({ message: 'Book renewed successfully', borrow });
};

// View all books a user has checked out
const getUserBorrowedBooks = async (req, res) => {
  const userId = req.user.userId;

  const borrowedBooks = await Borrow.find({ user: userId, status: 'borrowed' }).populate('book');

  res.status(StatusCodes.OK).json({ borrowedBooks });
};

// View fines for a user
const getUserFines = async (req, res) => {
  const userId = req.user.userId;

  const fines = await Borrow.find({ user: userId, status: 'returned', fine: { $gt: 0 } });

  res.status(StatusCodes.OK).json({ fines });
};

module.exports = {
  borrowBook,
  returnBook,
  renewBook,
  getUserBorrowedBooks,
  getUserFines,
};