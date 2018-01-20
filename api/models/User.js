
////////////////////////////////////////////////////////////////////////////////
/////////////////////**************** USER ****************/////////////////////
////////////////////////////////////////////////////////////////////////////////


module.exports = function() {

  var UserSchema = mongoose.Schema({

    name: {
      type: String,
      required: true,
      maxLength: 25
    },

    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 5,
      maxlength: 50
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 256
    },

    role: { //maybe to keep
      type: String,
      enum: [ 'user', 'modo', 'admin' ],
      default: 'user'
    },

    lastLoggedIn: { type: Date, required: true }

  });

  UserSchema.path('email').validate(function(email) {
     var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
     return emailRegex.test(email);
  }, 'This is not a valid email.');


  UserSchema.methods.noPassword = function() {
    var obj = this.toObject();
    delete obj.password;

    return obj;
  };


  UserSchema.statics.verifyToken = function(token, cb) {
    var _this = this;

    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('jwtSecret'), function(err, user) {
        if (err) {
          cb({ status: 419, message: (err.name === 'TokenExpiredError') ? 'Session expired : you need to log in again.' : err.message });

        } else {
          BlackListedToken.findOne({ token: token }, function(err, blackListedToken) {
            if (err) {
              cb(err);
            } else if (blackListedToken) {
              cb({ status: 419, message: 'Session expired : you need to log in again.' });
            } else {
              cb(null, user);
            }
          });
        }
      });

    } else {
      cb({ status: 401, message: 'No token provided. You need to log in or provide one.' });
    }
  };


  this.User = mongoose.model('User', UserSchema);
};
