
////////////////////////////////////////////////////////////////////////////////
////////////////////************** BODYPARSER **************////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Parse url parameters into req.body                                         *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

    var bodyParser = require('body-parser');

    // use body parser so we can get info from POST and/or URL parameters
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

};
