/**
 *
 * Authentication Controller
 *
**/

var AuthController = {


  currentUser: function(req, res) {
    res.status(200).json(req.user);
  },


  login: function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
      if (err) {
        res.resolve(err);

      } else if (!user) {
        res.status(403).send('Authentication failed. Wrong credentials.');

      } else {
        //check if password matches
        bcrypt.compare(req.body.password, user.password, function(err, doesMatch) {
          if (err) {
            res.resolve(err);
          } else if (doesMatch) {
            user.lastLoggedIn = new Date();

            user.save(function(err, user) {
							if (err) {
                res.resolve(err);
							} else {
	              // create a token
	              var token = jwt.sign(user.noPassword(), app.get('jwtSecret'), { expiresIn: '5h' });
	              res.status(200).json({ user: user.noPassword(), token: token });
							}
            });

          } else {
             res.status(403).send('Authentication failed. Wrong credentials.');
          }
        });
      }
    });
  },


  register: function(req, res) {
    if (typeof req.body.password === 'string') {
      if (req.body.password.length >= 8) { //it will be encrypted so the validation will be on the encrypted password
        User.findOne({ email: req.body.email }, function(err, user) {
            if (err) {
              res.resolve(err);
            } else if (user) {
              res.status(409).send('User already exists : email already taken.');

            } else {
              bcrypt.hash(req.body.password, 5, function(err, bcryptedPassword) {
                if (err) {
                  res.resolve(err);
                } else {
                  var newUser = {
                    name: req.body.name,
                    email: req.body.email,
                    password: bcryptedPassword,
                    lastLoggedIn: new Date()
                  };

                  User.create(newUser, function(err, user) {
                    if (err) {
                      res.resolve(err);
                    } else {
                      //create a token
                      var token = jwt.sign(user.toObject(), app.get('jwtSecret'), { expiresIn: '5h' });

                      res.status(200).json({ user: user.noPassword(), token: token });
                    }
                  });
                }
              });
            }
        });

      } else {
        res.status(400).send('Invalid password : it should be at least 8 caracters long.');
      }
    } else {
      res.status(400).send('Invalid or missing password.');
    }
  },


  logout: function(req, res) {
    var token = req.body.token || req.query.token || req.headers.authorization.slice(7);

    BlackListedToken.create({ token: token }, function(err, blackListedToken) {
      if (err) {
        res.resolve(err);
      } else {
        io.getSocket(req.user._id, function(socket) {
          socket.disconnect(true);
          res.status(200).send();
        });
      }
    });
  }


};

module.exports = AuthController;
