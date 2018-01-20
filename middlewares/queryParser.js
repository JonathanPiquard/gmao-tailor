
////////////////////////////////////////////////////////////////////////////////
///////////////////************** QUERY PARSER **************///////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Parse req.query into req.body                                                          *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

    app.use('/', function(req, res, next) {
        if (Object.keys(req.query).length !== 0) {
            req.body = _.defaultsDeep(req.body, req.query);
        }

        next();
    });

};
