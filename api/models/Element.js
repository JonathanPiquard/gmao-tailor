
////////////////////////////////////////////////////////////////////////////////
/////////////////////*************** ELEMENT ***************////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * An element to use in a blueprint                                           *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////


module.exports = function() {


  var ElementSchema = new mongoose.Schema({

    name: { type: String, required: true, maxlength: 100 },

    description: { type: String, maxlength: 1000 },

    tags: {
      type: Array,
      validate: {
        validator: function(tags) {
          return tags.length <= 30;
        },
        message: 'There are too many tags : maximum 30.'
      }
    },

    rate: {
      like: [ { type: ObjectId, ref: 'User' } ],
      dislike: [ { type: ObjectId, ref: 'User' } ],
      star: [ { type: ObjectId, ref: 'User' } ], //the users think this Element is trendy
      warning: [ { type: ObjectId, ref: 'User' } ]
    },

    author: { type: ObjectId, ref: 'User', required: true }, //the id of the author (the User which has create the Element instance).

    versions: [{
      name: { type: String, required: true, maxlength: 25 }, //version name
      todo: { type: String, maxlength: 1000, default: '' },
      notes: { type: String, maxlength: 1000, default: '' },
      properties: {
        in: [{
          name: { type: String, required: true, maxlength: 25 },
          description: { type: String, maxlength: 1000 },
          helper: { type: String, maxlength: 500 },
          type: { type: [{ type: String, required: true, default: 'all', maxlength: 25 }] },
          required: { type: Boolean, default: false },
          multiple: { type: Boolean, default: false },
          validator: { type: String, maxlength: 10000 }
        }],
        out: [{
          name: { type: String, required: true, maxlength: 25 },
          description: { type: String, maxlength: 1000 },
          helper: { type: String, maxlength: 500 },
          type: { type: [{ type: String, required: true, default: 'all', maxlength: 25 }] },
          required: { type: Boolean, default: false },
          getter: { type: String, maxlength: 10000 }
        }]
      },
      hasBeenVerified: { type: Boolean, default: false }
    }],

    access: { //Access rights management

      public: {
        element: {
          read: { type: Boolean, default: false },
          use: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        }
      },

      users: [{
        user: { type: ObjectId, ref: 'User' },
        access: {
          element: {
            read: { type: Boolean, default: false },
            use: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
          }
        }
      }],

      groups: [{
        group: { type: ObjectId, ref: 'Group' },
        access: {
          element: {
            read: { type: Boolean, default: false },
            use: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
          }
        }
      }]
    },

    userAccess: { //the access rights of the user fetching it //never save because only "virtual"
      element: {
        read: Boolean,
        use: Boolean,
        update: Boolean,
        delete: Boolean
      }
    }

  });


  //DOCUMENT METHODS

  ElementSchema.methods.userAccessDoc = function(user, access, cb) { //action can be 'write', 'read', 'update' or 'delete'
    var _this = this,
        accessSplited = access.split('.'),
        model = accessSplited[0], //e.g. 'blueprint' or 'instance'
        action = accessSplited[1] //e.g. 'read', 'write', 'update' or 'delete'

    if (this.author._id.toString() === user._id.toString()) {
      return cb(null, true);
    } else if (this.access.users.some(function(accessUser) { return accessUser.user._id.toString() === user._id.toString() && accessUser.access[model][action]; })) {
      return cb(null, true);
    } else {
      var success = false;
      var error = null;

      this.access.groups.some(function(accessGroup) {
        if (accessGroup.access[model][action]) { //if the group has the right, and so if the user has the right from the group
          return accessGroup.group.memberRights(user._id, function(err, rights) { //synchronous
            if (err) {
              error = err;
              return true; //abort
            } else {
              var hasRight = rights.indexOf(action.capitalize() + model.capitalize()) > -1;
              if (hasRight) {
                success = true;
                return true; //abort
              } else {
                return false; //continue with the next group
              }
            }
          });
        } else {
          return true; //abort
        }
      });

      if (error) {
        return cb(error);
      } else if (success) {
        return cb(null, true); //hasRight to {{action}}
      } else {
        return cb(null, false);// not allowed
      }
    }
  };

  //can only be called after receiving the blueprint by Element.userAccessById() or Element.userAccess()
  ElementSchema.methods.appendUserAccess = function(user, access, cb) { //array of access : e.g. [ 'blueprint.update', 'blueprint.delete', 'instance.write' ] but not include 'blueprint.read'
    var _this = this;
    var accessLength = access.length;
    this.userAccess = { read: true };

    function iterate(index) {
      _this.userAccessDoc(user, access[index], function(err, hasRight) {
        if (err) {
          return cb(err);
        } else {
          var accessSplited = access[index].split('.'),
              model = accessSplited[0],
              action = accessSplited[1];

          _this.userAccess[model][action] = hasRight; //virtual so never saved

          if (accessLength !== index + 1) {
            return iterate(index + 1);
          } else {
            cb(null);
          }
        }
      });
    }

    iterate(0); //init
  };


  //MODEL METHODS

  ElementSchema.statics.userAccess = function(filter, userId, access, cb) { //action can be 'write', 'read', 'update' or 'delete'
    var accessSplited = access.split('.'),
        model = accessSplited[0], //e.g. 'blueprint' or 'instance'
        action = accessSplited[1] //e.g. 'read', 'write', 'update' or 'delete'

    var filterAccess = { $or: [
      { author: userId },
      { access: { users: { $elemMatch: { user: userId }, access: { [model]: { [action]: true } } } } },
      { $where: function() {
          return this.access.groups.some(function(accessGroup) {
            if (accessGroup.access[model][action]) {
              return accessGroup.group.memberRights(userId).indexOf(action.capitalize() + model.capitalize()) > -1;

            } else {
              return false;
            }
          });
        }
      }
    ]};

    var query = (typeof filter === 'string') ? Element.findOne(_.defaultsDeep(filterAccess, { _id: filter })) : Element.find(_.defaultsDeep(filterAccess, filter));

    query
      .populate('author', 'name _id')
      .populate('access.users.user', 'name _id')
      .populate('access.groups.group', 'name _id')
      .exec(function(err, blueprints) {
        if (err) {
          cb(err);
        } else {
          cb(null, blueprints);
        }
      });
  };

  //HOOKS

  //ElementSchema.plugin(require('captain-hook')); //add captain-hook pre and post document middlewares to Element

  this.Element = mongoose.model('Element', ElementSchema);
};
