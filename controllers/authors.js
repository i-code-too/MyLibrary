const express = require('express');
const router = express.Router();
const Author = require('../models/author.js');
const Book = require('../models/book.js');

router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/all.ejs', {authors: authors, searchOptions: req.query})
    } catch {
        res.redirect('/')
    }
})

// router.get('/new') should always be above router.get('/:id'), otherwise 'new' will taken as the id parameter in the path
router.get('/new', async (req, res) => {
    try {
        res.render('authors/new.ejs', {author: new Author()});  // creating new Author object to repopulate in case error occurs when user submits form
    } catch {
        res.redirect('/')
    }  
})

router.post('/', async (req, res) => {
    const author = new Author({name: req.body.name})
    
    // // non async-await code
    // author.save((err, newAuthor) => {
    //     if(err){
    //         res.render('authors/new', 
    //             {
    //                 // author: author,
    //                 errorMessage: '!! Error creating Author !!'
    //             }
    //         )
    //     }
    //     else {
    //         // res.redirect(`authors/${newAuthor.id}`)
    //         res.redirect(`authors`)
    //     }
    // })

    // async-await code
    try {
        const newAuthor = await author.save();
        // res.redirect(`authors/${newAuthor.id}`);
        res.redirect('authors');
    } catch {
        res.render('authors/new', {
                author: author,
                errorMessage: '!! Error creating new author !!'
            }
        )
    }
})

router.get('/:id', async (req, res) => {          // signifies that after colon, we will be sending a variable called id in the path
    try {
        // // req.params contain all the parameters sent in url; since we have sent only id in url, only id will be present in params
        // res.send('Show Author ' + req.params.id)       // using + will concatenate the string, whereas using , will send second argument as variable       
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: author.id}).limit(6).exec();
        res.render('authors/show.ejs', {author: author, booksByAuthor: books});
    } catch {
        res.redirect('/');
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit.ejs', {author: author});    // check for error
    } catch {
        res.redirect('/authors');
    }
})

router.put('/:id', async (req, res) => {         // put method cannot be used directly by server, therefore we use method-override
    let author
    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`${author.id}`);
    } catch {
        if(author == null) {
            res.redirect('/')
        }
        else {
            res.render('authors/edit', {
                    author: author,
                    errorMessage: '!! Error updating author !!'
                }
            )
        }
    }
})

router.delete('/:id', async (req, res) => {         // delete method cannot be used directly by server, therefore we use method-override
    let author
    let books
    try {
        author = await Author.findById(req.params.id);
        books = await Book.find({author: author.id}).limit(6).exec();
        await author.deleteOne();
        res.redirect('/authors');
    } catch (err) {
        console.log(err)
        if(author == null) {
            res.redirect('/');
        }
        else {
            res.render('authors/show', {
                author: author,
                booksByAuthor: books,
                errorMessage:  '!! Error deleting author since the author still has books stored under their name !!'
            });
        }
    }
})

module.exports = router;