const mongoose = require('mongoose');
const Book = require('./book.js')

const authorSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        }
    }
)

// function to not delete authors that have books linked to them on the website
authorSchema.pre('deleteOne', {document: true, query: false}, async function(next){   // not using arrow function since we are using 'this' inside function
    try {
        const books = await Book.find({ author: this.id });
        if (books.length > 0) {
            next(new Error('!! This author still has books !!'))
        }
        else {
            next()
        }
    } 
    catch (err) {    // happens when we had trouble finding a book with that author in database for some reason other than it not existing
            next(err)
    }
})

module.exports = mongoose.model('Author', authorSchema)