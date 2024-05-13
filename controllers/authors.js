const express = require('express');
const router = express.Router();
const Author = require('../models/author.js');

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
    //                 errorMessage: 'Error creating Author'
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
                errorMessage: 'Error creating new author.'
            }
        )
    }
})

module.exports = router;