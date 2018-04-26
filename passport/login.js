const LocalStrategy   = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');

module.exports = function(passport){

	const passwordmatch = function(user, password){
			return bcrypt.compareSync(password, user.password);
	}

	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            User.findOne({'username':  username },
                function(err, user) {
                    if (err)
                        return done(err);
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done(null, false, req.flash('message', 'User Not found.'));
                    }
                    if (!passwordmatch(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    return done(null, user);
                }
            );
        })
    );
}
