
////////////////////////////////////////////////////////////////////////////////
//////////////////////************** ROUTES **************//////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Routes handling                                                            *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

    app.routes = require('./../config/routes.js');

    Object.keys(app.routes).forEach(function(key) {
        var keySpl = key.split(' '), //method, path
            valueSpl = app.routes[key].split('.'); //controller, action

        var method = keySpl[0].toLowerCase(),
            path = keySpl[1],
            controller = valueSpl[0],
            action = valueSpl[1];

        if (controller.charAt(0) === '#') { //if the controller needs the current informations about the current user (req.user) and not something which can have been changed since the login and the token creation
            controller = controller.slice(1);

            app[method](path, function(req, res) { //wrap the controller to get first the user as it she/he is now
                User.findById(req.user._id, function(err, user) {
                    if (err) {
                        res.resolve(err);
                    } else if (!user) {
                        res.resolve({ status: 500, message: 'Token invalid.' });
                    } else {
                        req.user = user;
                        app.controllers[controller][action](req, res);
                    }
                });
            });

        } else {
            app[method](path, app.controllers[controller][action]);
        }
    });

};
