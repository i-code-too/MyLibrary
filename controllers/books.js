const express = require('express');
const router = express.Router();
const Author = require('../models/author.js');
const Book = require('../models/book.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const uploadPath = path.join('public', Book.coverImageBasePath)
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/all.ejs', {books: books, searchOptions: req.query})
    } catch {
        res.redirect('/')
    }
})

router.get('/new', async (req, res) => {
   renderNewPage(res, new Book())
})

router.post('/', upload.single('coverImage'), async (req, res) => {
    const coverImageFileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),     // string being converted back into date
        pageCount: req.body.pageCount,
        coverImageName: coverImageFileName,
        description: req.body.description
    })
    // res.send(req.body)

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('books')
        // console.log(req.body)
    } catch {
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {authors: authors, book: book}
        if (hasError){
            params.errorMessage = 'Error creating book.'
        }
        res.render('books/new.ejs', params)
    } catch {
        res.redirect('books.ejs')
    }  
}

module.exports = router;