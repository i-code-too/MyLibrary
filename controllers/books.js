const express = require('express');
const router = express.Router();
const Author = require('../models/author.js');
const Book = require('../models/book.js')

router.get('/', async (req, res) => {
    res.send('All Books')
})

router.get('/new', async (req, res) => {
    try {
        const authorList = await Author.find({})
        res.render('books/new.ejs', {authors: authorList, book: new Book()})
    } catch {
        res.redirect('/')
    }    
})

router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.authorName,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    try {
        const newBook = await book.save()
        res.redirect(books)
    } catch {
        res.render('books/new', {
            book: book,
            errorMessage: 'Error creating new book.'
        })
    }
})

module.exports = router;