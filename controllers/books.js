const express = require('express');
const router = express.Router();
const Author = require('../models/author.js');
const Book = require('../models/book.js');


// // multer code
// const path = require('path');
// const fs = require('fs');
// const multer = require('multer');
// const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// const uploadPath = path.join('public', Book.coverImageBasePath)
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })

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

// // router.post that uses multer
// router.post('/', upload.single('coverImage'), async (req, res) => {
//     const coverImageFileName = (req.file != null) ? req.file.filename : null
//     const book = new Book({
//         title: req.body.title,
//         author: req.body.author,
//         publishDate: new Date(req.body.publishDate),     // string being converted back into date
//         pageCount: req.body.pageCount,
//         coverImageName: coverImageFileName,
//         description: req.body.description
//     })

//     try {
//         const newBook = await book.save()
//         res.redirect(`books/${newBook.id}`)
//     } catch {
//         if(book.coverImageName != null){
//             removeBookCover(book.coverImageName)
//         }
//         renderNewPage(res, book, true)
//     }
// })
// // code to remove book covers for error uploads to file system when using multer
// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if(err) console.error(err)
//     })
// }

// router.post that doesn't use multer
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),     // string being converted back into date
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.coverImage)
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch {
        renderNewPage(res, book, true)
    }
})

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
function saveCover(book, coverImageEncoded){
    if(coverImageEncoded == null) return;
    const cover = JSON.parse(coverImageEncoded)   // JSON string
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImg = new Buffer.from(cover.data, 'base64')      // creating a new Buffer from cover.data and from 'base64' format
        book.coverImgType = cover.type
    }
}

router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show.ejs', {book: book});
    }
    catch {
        res.redirect('/');
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } 
    catch {
        redirect('/');
    }
})

router.put('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)    // string being converted back into date
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != null && req.body.cover != ''){  // so as to not accidentally delete the cover while editing the book
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`${book.id}`)
    } catch {
        if(book != null) {
            renderEditPage(res, book, true)
        }
        else {
            redirect('/')
        }
    }
})

router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id);
        await book.deleteOne();
        res.redirect('/books');
    } catch {
        if(book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Error deleting book.'
            })
        }
        else {
            res.redirect('/');
        }
    }
})

async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {authors: authors, book: book}
        if (hasError){
            if(form == 'edit'){
                params.errorMessage = 'Error updating book.'
            }
            else {
                params.errorMessage = 'Error creating new book.'
            }
        }
        res.render(`books/${form}.ejs`, params);
    } catch {
        res.redirect('books.ejs');
    }  
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError);
}

async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError);
}

module.exports = router;