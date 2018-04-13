const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
const auth = require('./auth.js'); //auth will be used untill we implement passport.js
const app = express();
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Item = mongoose.model('Item');

const passport = require('passport'); //still implementing
const LocalStrategy = require('passport-local').Strategy; //still implementing

app.set('view engine', 'hbs');
app.set('view options', 'layout');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: true,
    saveUninitialized: true,
}));

// app.use(passport.initialize())//still implementing
// app.use(passport.session())//still implementing

app.use(function (req, res, next) {
  res.locals.user = req.session.user || null;
  next();
})

app.get('/', (req, res) => {
  if(req.session.user === null || req.session.user === undefined){
    res.redirect('/login');
  }
  else{
    Store.find({user: req.session.user._id}, function(err,store){
      if(!err){
        res.render('index', {store: store});
      }
    });
  }
});

//auth will be used untill we implement passport.js

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  auth.login(req.body.username, req.body.password,
    function(errObj){
      res.render('login', {message:errObj.message});
    },
    function(User){
      auth.startAuthenticatedSession(req, User, function(err){
        if(!err){
          res.redirect('/');}
        else{
          res.render('login', {message:err.message});
        }
      });
    });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  auth.register(req.body.username, req.body.password, function(errObj){
    res.render('register', {message:errObj.message});
  }, function(User){
    auth.startAuthenticatedSession(req, User, function(err){
      if(!err){
        res.redirect('/');}
      else{
        res.render('register', {message:err.message});
      }
    });
  });
});

app.get('/addstore', (req, res) => {
  if(req.session.user=== null || req.session.user === undefined){
    res.redirect('/login');
  }
  else{
    res.render('/addstore');
  }
});

app.post('/addstore', (req, res) => {
  if(req.session.user=== null || req.session.user === undefined){
    res.redirect('/login');
  }
  else{
    const newStore = new Store({
      user:req.session.user._id,
      storename: req.body.storename,
      store_address: req.body.store_address,
      store_state: req.body.store_state,
      store_zipcode: req.body.store_zipcode
    });
    newStore.save(function(err){
      if(err){
        const errmessage = "DOCUMENT SAVE ERROR";
        console.log(errmessage);
        res.render('addstore', {message: errmessage});
      }
      else{
        res.redirect('/');
      }
    });
  }
});

app.get('/:slug', (req, res) => {
  if(res.locals.user){
    Store.findOne({slug: req.params.slug}, function(err,store){
      if(res.session.user._id == store.user){
        res.render('store', {store: store});
      }
      else{
         res.redirect('/');
      }
    });
  }
  else{
    res.redirect('/');
  }
});

app.post('/:slug', (req, res) => {
  if(res.locals.user){
    if(req.body.remove){
      Store.remove({slug: req.params.slug}, function(err,store){
        res.redirect('/');
      });

    }
    else if(req.body.update){
      Store.findOneAndUpdate({slug: req.params.slug}, {$set: {store_address: req.body.store_address, store_state:req.body.store_state, store_zipcode:req.body.store_zipcode}}, {new: true}, function(err,store){
        res.render('store', {store: store});
      });
    }
  }
  else{
    res.redirect('/');
  }
});




// passport.use(new LocalStrategy(//still implementing
//   function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

app.listen(process.env.PORT || 3000);
