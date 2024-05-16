const mongoose = require('mongoose')
const path = require('path')

const coverImageBasePath = 'uploads/bookCovers'

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        require: true,
        default: Date.now
    },
    coverImageName: {   // actual image file itself will be stored on the server in the file system; here we are storing only name of the image
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

// virtual property derives it's value from real properties mentioned in schema above
bookSchema.virtual('coverImagePath').get(function(){  // not using arrow function since we need 'this' property to refer to the actual book itself
    if(this.coverImageName != null){
        return path.join('/', coverImageBasePath, this.coverImageName) // root path will be /public
    }
})

module.exports = mongoose.model('Book', bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;