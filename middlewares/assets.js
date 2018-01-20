
////////////////////////////////////////////////////////////////////////////////
//////////////////////************** ASSETS **************//////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Every routes related to assets sending                                     *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

  //serve assets/home/index.html
    app.get('/home', function(req, res) {
      fs.readFile(__dirname + '/../assets/home/index.html', function (err, data) {
        if (err) throw err;
        res.format({
          html: function(){
            res.send(data);
          }
        });
      });
    });

  //serve assets/index.html
    app.get('/', function(req, res) {
      fs.readFile(__dirname + '/../assets/index.html', function (err, data) {
        if (err) throw err;
        res.format({
          html: function(){
            res.send(data);
          }
        });
      });
    });

  //serve js files
    app.use('/js/bower.min.js', express.static(__dirname + '/../assets/js/bower.min.js'));
    app.use('/js/angularApp.js', express.static(__dirname + '/../assets/js/angularApp.js'));

  //serve css files
    app.use('/styles/bower.min.css', express.static(__dirname + '/../assets/styles/bower.min.css'));
    app.use('/styles/angularApp.css', express.static(__dirname + '/../assets/styles/angularApp.css'));

  //serve avatars
    app.use('/avatars/:type/:id', function(req, res) {
      fs.readFile(__dirname + '/../assets/images/avatars/' + req.params.type + '/' + req.params.id, function (err, avatar) {
      if (err) {
          fs.readFile(__dirname + '/../assets/images/avatars/' + req.params.type + '/default', function (err, defaultAvatar) {
              if (err) {
                  console.log(err);
                  res.send(err);
              } else {
                  res.format({
                    html: function(){
                      res.send(defaultAvatar);
                    }
                  });
              }
          });

      } else {
          res.format({
            html: function(){
              res.send(avatar);
            }
          });
      }
      });
    });

  //serve static files from assets/images, assets/fonts and assets/templates directories
    app.use('/images', express.static(__dirname + '/../assets/images/others'));
    app.use('/fonts', express.static(__dirname + '/../assets/fonts'));
    app.use('/templates', express.static(__dirname + '/../assets/templates'));
    app.use('/favicon.ico', express.static(__dirname + '/../assets/favicon.ico'));

  //serve static files from assets/home
    app.use('/home/assets', express.static(__dirname + '/../assets/home/assets'));

};
