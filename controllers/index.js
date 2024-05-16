const express = require('express');
const router = express.Router();
const Book = require('../models/book.js');

router.get('/', async (req, res) => {
    let books
    try {
        books = await Book.find({}).sort({createdAt: 'desc'}).limit(10).exec()  // top 10 books sorted in descending order
    } catch {
        books = []
    }
    res.render('index.ejs', {books: books})
});

module.exports = router;