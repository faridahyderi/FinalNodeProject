const express = require('express');
const { borrowBook, returnBook, renewBook, getUserBorrowedBooks, getUserFines } = require('../controllers/borrow');
const { auth } = require('../middleware/authentication');

const router = express.Router();

router.post('/borrow', auth, borrowBook);
router.post('/return', auth, returnBook);
router.post('/renew', auth, renewBook);
router.get('/my-borrows', auth, getUserBorrowedBooks);
router.get('/my-fines', auth, getUserFines);

module.exports = router;