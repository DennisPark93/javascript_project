const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

// users
// * our site requires authentication...
// * so users have a username and password
const User = new mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, unique: true, required: true}
});


// Store
// initial store cost, profit, revenue will be set to zero.
// it will be updated as we update items to the store
const Store = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storename: {type: String, required: true},
  store_address: {type: String, required: true},
  store_state: {type: String, required: true},
  store_zipcode: {type: Number, required: true},
  revenue: {type: Number, default: 0},
  cost: {type: Number, default: 0},
  profit: {type: Number, default: 0},
  updatedAt: Date
}, {
  _id: true
});

// item
// * each list must have a related store
// * it will contain retail, wholseale costs
// * will keep track of left stocks and items sold
const Item = new mongoose.Schema({
  store: {type: mongoose.Schema.Types.ObjectId, ref:'Store'},
  itemname: {type: String, required: true},
  description: {type: String, required: true},
  retail_cost: {type: Number, required: true},
  wholesale_cost: {type: Number, required: true},
  stock_left: {type: Number, required: true},
  num_sold: {type: Number, required: true},
  updatedAt: Date
}, {
  _id: true
});


// User.plugin(URLSlugs('username'))
Store.plugin(URLSlugs('storename'));

// register your model
mongoose.model('User', User);
mongoose.model('Store', Store);
mongoose.model('Item', Item);
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/shp381';
}
mongoose.connect(dbconf);
