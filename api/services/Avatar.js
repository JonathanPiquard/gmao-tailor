
////////////////////////////////////////////////////////////////////////////////
//////////////////************** AVATAR SERVICE **************//////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Store avatar                                                               *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////

var avatarFolder = require('../../config/avatar.js').avatarFolder;

module.exports = {

  store: function(avatar, path, cb) {
    if (typeof avatar !== 'undefined') {
      var matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches.length === 3 && matches[1].indexOf('image') > -1) {
        fs.writeFile(avatarFolder + path, matches[2], 'base64', function(err) { //avatar.slice(22) === avatar minus ''
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        });
      } else {
        cb(new Error('Invalid avatar : wrong encoding.'));
      }
    } else {
      cb(null); //no avatar but still there are others updates to make eventually
    }
  }

};
