
////////////////////////////////////////////////////////////////////////////////
//////////////////////**************** API ***************//////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * If the url contains '/api' then it verifies if the client is authentified  *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

  app.use('/api', function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers.authorization.slice(7);

    // a service
    User.verifyToken(token, function(err, user) {
      if (err) {
        res.resolve(err);
      } else {
        req.user = user;
        return next();
      }
    });

  });
};
