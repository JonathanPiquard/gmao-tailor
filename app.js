
////////////////////////////////////////////////////////////////////////////////
//////////////////////**************** APP ****************/////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * The main server file which sets up the server and integrates every         *
  * components of the server.                                                *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



(function() {

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  //global variables
  this.express = require('express');
  this.app = this.express(); //give access to controllers, models and services
  this._ = require('lodash');
  this.mongoose = require('mongoose');
  this.fs = require('fs');

  //connect moogoose to the database
  this.db = mongoose.connect('mongodb://localhost/GMAO_Tailor');

  //server network initialization
  var http = require('http').Server(app),
      port = process.env.PORT || 1337,
      contentLength = require('express-content-length-validator'),
      helmet = require('helmet'),
      cors = require('cors');

  //max size accepted for the content-length
  app.use(contentLength.validateMax({
    max: 128 * 128 + 25, //max size of an avatar
    status: 400,
    message: 'This request has some content which exceeds the limit length.'
  }));

  //helmet : protection
  app.use(helmet());

  app.use(helmet.csp({
    // Specify directives as normal.
    directives: {
      defaultSrc: [ "'self'" ],
      scriptSrc: [ "'self'" ],
      styleSrc: [ "'self'" ],
      imgSrc: [ "'self'" ],
      sandbox: ['allow-forms', 'allow-scripts'],
      reportUri: '/report-violation',

      objectSrc: [] // An empty array allows nothing through
    },

    // Set to true if you only want browsers to report errors, not block them
    reportOnly: false,

    // Set to true if you want to blindly set all headers: Content-Security-Policy,
    // X-WebKit-CSP, and X-Content-Security-Policy.
    setAllHeaders: false,

    // Set to true if you want to disable CSP on Android where it can be buggy.
    disableAndroid: false,

    // Set to false if you want to completely disable any user-agent sniffing.
    // This may make the headers less compatible but it will be much faster.
    // This defaults to `true`.
    browserSniff: true
  }));

  app.use(helmet.noCache()); //only on development not production

  app.options('*', cors());


  //bodyParser : parse url parameters into req.body
  _.bind(require('./middlewares/bodyParser.js'), this)();

  //socket.io
  this.io = require('socket.io')(http);

  //initialization of every api files
  _.bind(require('./api/initialization.js'), this)();

  //middlewares
  var middlewares = fs.readdirSync('./middlewares'); //array of the names
  _.pull(middlewares, 'assets.js', 'bodyParser.js', 'routes.js'); //Removes all given values from array
  _.bind(require('./middlewares/assets.js'), this)();
  for (var key in middlewares) {
    middleware = require('./middlewares/' + middlewares[key]); //function
    _.bind(middleware, this)();
  }
  _.bind(require('./middlewares/routes.js'), this)();

  //listen to the network by the port => server starts
  http.listen(port, function() {
    console.log('listening on localhost:1337');
  });

})();
