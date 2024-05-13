if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const indexRouter = require('./controllers/index.js');
const authorRouter = require('./controllers/authors.js');
const bookRouter = require('./controllers/books.js');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout')
app.use(expressLayouts);
app.set(express.static('public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose.'));

app.use('/', indexRouter);
app.use('/authors', authorRouter);                     // this /authors will be appended to the path
app.use('/books', bookRouter);

app.listen(process.env.PORT || 3000);