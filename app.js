const express = require('express');
const mongoose = require('mongoose');

require('./db');
const session = require('express-session');
const path = require('path');
// const auth = require('./auth.js'); //auth will be used untill we implement passport.js
const app = express();
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Item = mongoose.model('Item');
const flash = require('connect-flash');
const passport = require('passport'); //still implementing
const LocalStrategy = require('passport-local').Strategy; //still implementing
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.set('view engine', 'hbs');
app.set('view options', 'layout');
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'add session secret here!',
    resave: true,
    saveUninitialized: true,
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const initPassport = require('./passport/init');
initPassport(passport);
var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()){
    res.locals.user = req.user.username;
		return next();
  }
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/login');
};

// app.use(function (req, res, next) {
//   res.locals.user = req.session.passport.user || null;
//   next();
// })
//
// app.use(function (req, res, next) {
//     if (req.isAuthenticated()) {
//       return next()
//     }
//     res.redirect('/login')
// });


app.get('/login', (req, res) => {
  res.render('login',{message: req.flash('message')});
});

app.post('/login', passport.authenticate('login', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash : true
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  res.render('register',{message: req.flash('message')});
});

app.post('/register', passport.authenticate('register', {
		successRedirect: '/',
		failureRedirect: '/register',
		failureFlash : true
}));

app.get('/', isAuthenticated, (req, res) => {
  if(req.user === null || req.user === undefined){
    res.redirect('/login');
  }
  else{
    Store.find({user: req.user._id}, function(err,store){
      if(store){
          let sr =[];
          let sc = [];
          let sp = [];
          store.forEach(function(ele){
            sr.push(ele.revenue);
            sc.push(ele.cost);
            sp.push(ele.profit);
          });

          const rsum = sr.reduce(function(total, cur){return total + cur;},0);
          const csum = sc.reduce(function(total, cur){return total + cur;},0);
          const psum = sp.reduce(function(total, cur){return total + cur;},0);
          User.findOneAndUpdate({_id: req.user._id}, {$set: {revenue:rsum, cost:csum, profit:psum}}, {new: true}, function(err,user){
            res.render('index', {store: store});
          });
      }

      else if(!store){
        res.render('index');
      }
      else{
        res.redirect('/');
      }
        // if(res.session.user._id == store.user){

    });
  }
});


//auth will be used untill we implement passport.js



app.get('/user', isAuthenticated, (req, res) => {
  // if(req.session.passport === null || req.session.passport === undefined){
  //   res.redirect('/login');
  // }
  // else{
  Store.find({user: req.user._id}, function(err,store){
    if(store){
        let sr =[];
        let sc = [];
        let sp = [];
        store.forEach(function(ele){
          sr.push(ele.revenue);
          sc.push(ele.cost);
          sp.push(ele.profit);
        });
        const rsum = sr.reduce(function(total, cur){return total + cur;},0);
        const csum = sc.reduce(function(total, cur){return total + cur;},0);
        const psum = sp.reduce(function(total, cur){return total + cur;},0);
        User.findOneAndUpdate({_id: req.user._id}, {$set: {revenue:rsum, cost:csum, profit:psum}}, {new: true}, function(err,user){
          res.render('user', {thisuser: user});
        });
    }

    else if(!store){
      User.findOne({_id: req.user._id},function(err,user){
        res.render('user', {thisuser: user});
      });
    }
    else{
      res.redirect('/');
    }
      // if(res.session.user._id == store.user){

  });
});

app.get('/addstore', isAuthenticated, (req, res) => {
  // if(req.session.passport === null || req.session.passport === undefined){
  //   res.redirect('/login');
  // }
  // else{
    res.render('addstore');
  // }
});

app.post('/addstore', isAuthenticated, (req, res) => {
  // if(req.session.passport=== null || req.session.passport === undefined){
  //   res.redirect('/login');
  // }
  // else{
    const newStore = new Store({
      user:req.user._id,
      storename: req.body.storename,
      store_address: req.body.store_address,
      store_state: req.body.store_state,
      store_zipcode: req.body.store_zipcode
    });
    newStore.save(function(err){
      if(err){
        const errmessage = "DOCUMENT SAVE ERROR";
        console.log(errmessage);
        res.render('addstore', {message: req.flash(errmessage)});
      }
      else{
        res.redirect('/');
      }
    });
  // }
});

app.get('/store/:slug', isAuthenticated, (req, res) => {
  // if(res.locals.user){
    Store.findOne({slug: req.params.slug}, function(err,store){

      Item.find({store: store._id}, function(err,items){
        if(items){
          let r =[];
          let c = [];
          items.forEach(function(ele){
            r.push(ele.retail_cost*ele.num_sold);
            c.push(ele.wholesale_cost*ele.num_sold);
          });
          if(r !== [] && c!==[]){
          const rsum = r.reduce(function(total, cur){return total + cur;},0);
          const csum = c.reduce(function(total, cur){return total + cur;},0);
          const psum = rsum - csum;
          Store.findOneAndUpdate({slug: req.params.slug}, {$set: {revenue:rsum, cost:csum, profit:psum}}, {new: true}, function(err,store2){
          res.render('store', {store: store2, item: items});
          });
          }
        }

        else if(!items){
          res.render('store', {store: store});
        }
        else{
          res.redirect('/');
        }
      // if(res.session.user._id == store.user){

      });
      // }
      // else{
      //    res.redirect('/');
      // }
    });
  // }
  // else{
  //   res.redirect('/');
  // }
});

app.post('/store/:slug', isAuthenticated, (req, res) => {
  // if(res.locals.user){
    if(req.body.additem){
      Store.findOne({slug: req.params.slug}, function(err,store){
        const newItem = new Item({
          store: store._id,
          itemname: req.body.itemname,
          description: req.body.description,
          retail_cost: req.body.retail_cost,
          wholesale_cost: req.body.wholesale_cost,
          stock_left: req.body.stock_left,
          num_sold: req.body.num_sold
        });
        newItem.save(function(err){
          if(err){
            const errmessage = "DOCUMENT SAVE ERROR";
            console.log(errmessage);
            res.render('store', {store: store, message: errmessage});
          }
          else{
            Item.find({store: store._id}, function(err,items){
              let r =[];
              let c = [];
              items.forEach(function(ele){
                r.push(ele.retail_cost*ele.num_sold);
                c.push(ele.wholesale_cost*ele.num_sold);
              });
              const rsum = r.reduce((total, amount) => total + amount);
              const csum = c.reduce((total, amount) => total + amount);
              const psum = rsum - csum;
              Store.findOneAndUpdate({slug: req.params.slug}, {$set: {revenue:rsum, cost:csum, profit:psum}}, {new: true}, function(err,store2){
                res.render('store', {store: store2, item: items});
              });
            });
          }
        });
      });
    }
    else if(req.body.updateitem){
      Store.findOne({slug: req.params.slug}, function(err,store){
        Item.findOneAndUpdate({itemname: req.body.itemname}, {$set: {itemname: req.body.itemname, description: req.body.description, retail_cost: req.body.retail_cost, wholesale_cost: req.body.wholesale_cost, stock_left: req.body.stock_left, num_sold: req.body.num_sold}}, {new: true}, function(err,item){
          let r =[];
          let c = [];
          items.forEach(function(ele){
            r.push(ele.retail_cost*ele.num_sold);
            c.push(ele.wholesale_cost*ele.num_sold);
          });
          const rsum = r.reduce(function(total, cur){return total + cur;},0);
          const csum = c.reduce(function(total, cur){return total + cur;},0);
          const psum = rsum - csum;
          Store.findOneAndUpdate({slug: req.params.slug}, {$set: {revenue:rsum, cost:csum, profit:psum}}, {new: true}, function(err,store2){
          res.render('store', {store: store2, item:item});
          });
        });
      });
    }
    else if(req.body.removeitem){
      Store.findOne({slug: req.params.slug}, function(err,store){
        Item.remove({store:store.id, itemname: req.body.itemname,description: req.body.description,retail_cost: req.body.retail_cost,wholesale_cost: req.body.wholesale_cost,stock_left: req.body.stock_left, num_sold: req.body.num_sold}, function(err,store){
          res.redirect('/store/'+req.params.slug);
        });
      });

    }
    else if(req.body.remove){
      Store.remove({slug: req.params.slug}, function(err,store){
        res.redirect('/');
      });

    }
    else if(req.body.update){
      Store.findOneAndUpdate({slug: req.params.slug}, {$set: {store_address: req.body.store_address, store_state:req.body.store_state, store_zipcode:req.body.store_zipcode}}, {new: true}, function(err,store){
        Item.find({store: store._id}, function(err,items){
          if(items){
            let r =[];
            let c = [];
            for(let i=0; i<items.length; i++){
              r.push(items[i].retail_cost*items[i].num_sold);
              c.push(items[i].wholesale_cost*items[i].num_sold);
            }
            if(r !== [] && c!==[]){
            const rsum = r.reduce(function(total, cur){return total + cur;},0);
            const csum = c.reduce(function(total, cur){return total + cur;},0);
            const psum = rsum - csum;
            Store.findOneAndUpdate({slug: req.params.slug}, {$set: {revenue:rsum, cost:csum, profit:psum}}, {new: true}, function(err,store2){
            res.render('store', {store: store2, item: items});
            });
            }
          }

          else if(!items){
            res.render('store', {store: store});
          }
          else{
            res.redirect('/');
          }
        });
      });
    }
  // }
  // else{
  //   res.redirect('/');
  // }
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
