const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js');
const app = express();
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Item = mongoose.model('Item');

app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: true,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(3000);
