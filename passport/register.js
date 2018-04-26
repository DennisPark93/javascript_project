const LocalStrategy   = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');

module.exports = function(passport){

	passport.use('register', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            findOrCreateUser = function(){
                User.findOne({ 'username' :  username }, function(err, user) {

                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }

                    if (user) {
                        console.log('User already exists with username: '+username);
                        return done(null, false, req.flash('message','User Already Exists'));
                    } else {

                        const newUser = new User({
                          username: username,
                          password: function(password){
											        return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
											    }
                        });
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);
                                throw err;
                            }
                            console.log('User Registration succesful');
                            return done(null, newUser);
                        });
                    }
                });
            };
            process.nextTick(findOrCreateUser);
        })
    );
}
