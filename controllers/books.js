const express = require('express');
const router = express.Router();
const Author = require('../models/author.js');
const Book = require('../models/book.js');
const multer = require('multer');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: 'public/uploads/bookCovers',
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

function removeBookCover(fileName){
    fs.unlink(`public/uploads/bookCovers/${fileName}`, err => {
        if(err) console.error(err)
    })
}

router.get('/', async (req, res) => {
    res.render('books/all.ejs')
})

router.get('/new', async (req, res) => {
    try {
        const authors = await Author.find({})
        res.render('books/new.ejs', {authors: authors, book: new Book()})
    } catch {
        res.redirect('/')
    }    
})

router.post('/', upload.single('coverImage'), async (req, res) => {
    const coverImageFileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.authorName,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: coverImageFileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        res.render('books/new', {
            book: book,
            errorMessage: 'Error creating new book.'
        })
    }
})

module.exports = router;