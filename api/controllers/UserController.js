/**
 *
 * User Controller
 *
**/


var UserController = {

	update: function(req, res) {
		if (typeof req.body.oldPassword === 'string' && req.body.oldPassword.length >= 8) {
			//check if password matches
			bcrypt.compare(req.body.oldPassword, req.user.password, function(err, doesMatch) {
				if (err) {
					res.resolve(err);

				} else if (doesMatch) {

					if (typeof req.body.name === 'string') {
						var nameTrimmed = req.body.name.trim();
						if (nameTrimmed.length > 0) req.user.name = nameTrimmed;
					}
					if (typeof req.body.email === 'string') {
						var emailTrimmed = req.body.email.trim();
						if (emailTrimmed.length > 0) req.user.email = emailTrimmed;
					}

					if (typeof req.body.password !== 'string') req.body.password = '';

					if (req.body.password.length > 0) {

						if (req.body.password.length >= 8) { //it will be encrypted so the validation will be on the encrypted password
							bcrypt.hash(req.body.password, 5, function(err, bcryptedPassword) {
								if (err) {
									res.resolve(err);

								} else {
									req.user.password = bcryptedPassword;

									req.user.save(function(err, user) {
										if (err) {
											res.resolve(err);

										} else {
											Avatar.store(req.body.avatar, 'users/' + req.user._id, function(err) { //store the avatar if there is one
					              if (err) {
					                res.resolve(err);
					              } else {
													io.setUser(user.noPassword()); //same as a decode token gives

													var oldToken = req.body.token || req.query.token || req.headers.authorization.slice(7);
													BlackListedToken.create({ token: oldToken }, function(err, blackListedToken) {
											      if (err) {
											        res.resolve(err);
											      } else {
															var timeSpend = Date.now() - user.lastLoggedIn.getTime(); //in ms
															var fiveHours = 5*60*60; //in s
															res.status(200).json({
																user: user.noPassword(),
																token: jwt.sign(user.noPassword(), app.get('jwtSecret'), { expiresIn: fiveHours - Math.floor(timeSpend / 1000) }) //in s
															});
											      }
											    });
					              }
					            });
										}
									});
								}
							});
						} else {
							res.status(400).send('Update failed : invalid password.');
						}

					} else { //password not defined or invalid
						req.user.save(function(err, user) {
							if (err) {
								res.resolve(err);

							} else {
								Avatar.store(req.body.avatar, 'users/' + req.user._id, function(err) { //store the avatar if there is one
									if (err) {
										res.resolve(err);
									} else {
										io.setUser(user.noPassword()); //same as a decode token gives

										var oldToken = req.body.token || req.query.token || req.headers.authorization.slice(7);
										BlackListedToken.create({ token: oldToken }, function(err, blackListedToken) {
											if (err) {
												res.resolve(err);
											} else {
												var timeSpend = Date.now() - user.lastLoggedIn.getTime(); //in ms
												var fiveHours = 5*60*60; //in s
												res.status(200).json({
													user: user.noPassword(),
													token: jwt.sign(user.noPassword(), app.get('jwtSecret'), { expiresIn: fiveHours - Math.floor(timeSpend / 1000) }) //in s
												});
											}
										});
									}
								});
							}
						});
					}


				} else {
					 res.status(403).send('Update failed : wrong old password.');
				}
			});

		} else {
			res.status(403).send('Update failed : missing or invalid old password.');
		}
	},

	all: function(req, res) {
		User.find({}, 'name _id', function(err, users) {
			if (err) {
				res.resolve(err);
			} else {
				res.status(200).json(users);
			}
		});
	}


};

module.exports = UserController;
