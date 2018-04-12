const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(username, password, errorCallback, successCallback) {//username && password >= 8
    User.findOne({username: username}, (err, result, count) => {
      if(result){ //user already exists
        const errObj = {message: "USERNAME ALREADY EXISTS"};
        console.log(errObj.message);
        errorCallback(errObj);
      }

      else{ //user does not exist
        bcrypt.genSalt(10, function (err, salt) {
          if(err){
            const errObj = {message: "FAILED TO GEN SALT FOR PASSWORD"};
            console.log(errObj.message);
            errorCallback(errObj);
          }
          else{
            bcrypt.hash(password, 10, function(err,hash){
              if(err){
                const errObj = {message: "FAILED TO HASH PASSWORD"};
                console.log(errObj.message);
                errorCallback(errObj);
              }
              else{
                const newUser = new User({
                  username: username,
                  password: hash
                });
                newUser.save(function(err){
                  if(err){ //Doc save Error
                    const errObj = {message: "DOCUMENT SAVE ERROR"};
                    console.log(errObj.message);
                    errorCallback(errObj);
                  }
                  else{ //successful
                    successCallback(newUser);
                  }
                });
              }
            });
          }
        });
      }
    });
}

function login(username, password, errorCallback, successCallback) {
  User.findOne({username: username}, (err, user, count) => {
    if (!err && user) {
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
        if(err){
          const errObj = {message: "FAILED TO COMPARE PASSWORD"};
          console.log(errObj.message);
          errorCallback(errObj);
        }
        else{
         if(!passwordMatch){
           const errObj = {message: "PASSWORDS DO NOT MATCH"};
           console.log(errObj.message);
           errorCallback(errObj);
         }
         else{
           successCallback(user);
         }
       }
      });
    }
    else{
      const errObj = {message: "USER NOT FOUND"};
      console.log(errObj.message);
      errorCallback(errObj);
    }
});
}

function startAuthenticatedSession(req, user, cb) {
  req.session.regenerate((err) => {
  if (!err) {
    req.session.user = user;
    cb();
  }
  else {
    const errObj = {message: "FAILED TO START AUTH-SESSION"};
    console.log(errObj.message);
    cb(errObj);
  }
});
}

module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  register: register,
  login: login
};
