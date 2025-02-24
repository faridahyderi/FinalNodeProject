const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true, // Ensures dueDate is always set when borrowed
  },
  returnDate: {
    type: Date,
  },
  renewalCount: {
    type: Number,
    default: 0, // Track how many times the book has been renewed
  },
  fine: {
    type: Number,
    default: 0, // Track fines for overdue books
  },
  status: {
    type: String,
    enum: ['borrowed', 'renewed', 'returned', 'overdue'],
    default: 'borrowed',
  },
});

const Borrow = mongoose.model('Borrow', BorrowSchema);
module.exports = Borrow;