const login = require('./login');
const register = require('./register');
const mongoose = require('mongoose');
const User = mongoose.model('User');


module.exports = function(passport){

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    login(passport);
    register(passport);

}
