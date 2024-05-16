const mongoose = require('mongoose')

// // included in code that is using multer
// const path = require('path')
// const coverImageBasePath = 'uploads/bookCovers'

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
    // // below property used when code uses multer
    // coverImageName: {   // actual image file itself will be stored on the server in the file system; here we are storing only name of the image
    //     type: String,
    //     required: true
    // },
    // below two properties used when code does not use multer
    coverImg: {
        type: Buffer,
        required: true
    },
    coverImgType: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
})

// // virtual property derives it's value from real properties mentioned in schema above - included in code using multer
// bookSchema.virtual('coverImagePath').get(function(){  // not using arrow function since we need 'this' property to refer to the actual book itself
//     if(this.coverImageName != null){
//         return path.join('/', coverImageBasePath, this.coverImageName) // root path will be /public
//     }
// })

// virtual property derives it's value from real properties mentioned in schema above - included in code that is not using multer
bookSchema.virtual('coverImagePath').get(function(){  // not using arrow function since we need 'this' property to refer to the actual book itself
    if(this.coverImg != null && this.coverImgType != null){
        return `data:${this.coverImgType};charset=utf-8;base64,${this.coverImg.toString('base64')}`  // data object allows us to take Buffer data and use that as the source for the image
    }
})

module.exports = mongoose.model('Book', bookSchema);
// // included in code using multer
// module.exports.coverImageBasePath = coverImageBasePath;