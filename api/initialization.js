
////////////////////////////////////////////////////////////////////////////////
//////////////////************** INITIALIZATION **************//////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Initialization of every api files                                          *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

  this.Mixed = mongoose.Schema.Types.Mixed;
  this.ObjectId = mongoose.Schema.Types.ObjectId;

  app.set('jwtSecret', require('../config/jwt.js').secret); //set the secret for the whole app
  this.jwt = require('jsonwebtoken');
  this.bcrypt = require('bcryptjs');

  //list api files
    var apiFiles = { models: [], controllers: [], connections: [], services: [], policies: [], responses: [] };
    for (var key in apiFiles) {
      apiFiles[key] = fs.readdirSync('./api/' + key); //array of the names
      app[key] = {};
    }

  //responses
    app.use('/', function(req, res, next) {
      for (var key in apiFiles.responses) {
        var responseName = apiFiles.responses[key].replace('.js', '');
        res[responseName] = require('./responses/' + apiFiles.responses[key]);
      }

      next();
    });

  //services
    for (var key in apiFiles.services) {
      var serviceName = apiFiles.services[key].replace('.js', ''),
          serviceValue = require('./services/' + apiFiles.services[key]);

      this[serviceName] = serviceValue;
    }

  //models
    for (var key in apiFiles.models) {
      var modelName = apiFiles.models[key].replace('.js', ''),
        model = require('./models/' + apiFiles.models[key]); //function

      //model : this corresponds to app.js : this, so app, mongoose, Mixed and ObjectId are available
      _.bind(model, this)(); //return the Model
    }

  //policies
    _.bind(require('./policies/api.js'), this)(); //very first policy : protect /api/*
    apiFiles.policies.splice(apiFiles.policies.indexOf('api.js'), 1);
    for (var key in apiFiles.policies) {
      _.bind(require('./policies/' + apiFiles.policies[key]), this)(); //this corresponds to app.js this
    }

  //controllers
    for (var key in apiFiles.controllers) {
      var controllerName = (apiFiles.controllers[key]).replace('.js', ''),
          controllerValue = require('./controllers/' + apiFiles.controllers[key]);

      app.controllers[controllerName] = controllerValue;
    }

  //connections => socket.io handling
    // for (var key in apiFiles.connections) {
    //   _.bind(require('./connections/' + apiFiles.connections[key]), this)(); //this corresponds to app.js this
    // }

};
