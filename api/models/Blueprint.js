
////////////////////////////////////////////////////////////////////////////////
////////////////////*************** BLUEPRINT ***************///////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Each model created by the user is break down into advanced properties      *
  * known as BlueprintType. These BlueprintType pieced together form the       *
  * Blueprint. This last one is not only an object of BlueprintType, it's      *
  * contain also some other properties such as the parent Blueprint or the     *
  * icon. It's why only the "properties" attribute contains the                *
  * BlueprintType. The other attributes match the side properties like the     *
  * icon as told above. Each Blueprint leads to the creation of a new model    *
  * not to an instance of some model. So a Blueprint is the true scheme of a   *
  * model designed by the user. Each new model should reference to it.         *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////


module.exports = function() {


  var BlueprintSchema = new mongoose.Schema({

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

    parent: { type: ObjectId, ref: 'Blueprint' }, //the id of parent Blueprint

    author: { type: ObjectId, ref: 'User', required: true }, //the id of the author (the User which has create the Blueprint instance).

    versions: [{
      name: { type: String, required: true, maxlength: 25 }, //version name
      todo: { type: String, maxlength: 1000, default: '' },
      notes: { type: String, maxlength: 1000, default: '' },
      connectionss: [{
        inElementId: { type: Number, required: true },
        inProperty: {
          name: { type: String, required: true, maxlength: 50 }, //no real maxlength because the user does'nt set it
          type: { type: String, required: true, maxlength: 35 } //no real maxlength because the user does'nt set it
        },
        outElementId: { type: Number, required: true },
        outProperty: {
          name: { type: String, required: true, maxlength: 50 }, //no real maxlength because the user does'nt set it
          type: { type: String, required: true, maxlength: 35 } //no real maxlength because the user does'nt set it
        }
      }],
      elements: [{
        coordinates: {
          height: Number,
          width: Number,
          x: Number,
          y: Number
        },
        type: { type: String, required: true },
        value: Object,
        id: { type: Number, required: true }
      }],
      layers: [{
        name: { type: String, required: true, maxlength: 25 },
        description: { type: String, maxlength: 200, default: '' },
        elements: [{ type: Number, required: true }]
      }]
    }],

    access: { //Access rights management

      public: {
        blueprint: {
          read: { type: Boolean, default: false },
          update: { type: Boolean, default: false },
          delete: { type: Boolean, default: false }
        },
        instance: {
          write: { type: Boolean, default: false }
        }
      },

      users: [{
        user: { type: ObjectId, ref: 'User' },
        access: {
          blueprint: {
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
          },
          instance: {
            write: { type: Boolean, default: false }
          }
        }
      }],

      groups: [{
        group: { type: ObjectId, ref: 'Group' },
        access: {
          blueprint: {
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
          },
          instance: {
            write: { type: Boolean, default: false }
          }
        }
      }]
    },

    userAccess: { //the access rights of the user fetching it //never save because only "virtual"
      blueprint: {
        read: Boolean,
        update: Boolean,
        delete: Boolean
      },
      instance: {
        write: Boolean
      }
    }

  });


  //DOCUMENT METHODS

  BlueprintSchema.methods.userAccessDoc = function(user, access, cb) { //action can be 'write', 'read', 'update' or 'delete'
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

  //can only be called after receiving the blueprint by Blueprint.userAccessById() or Blueprint.userAccess()
  BlueprintSchema.methods.appendUserAccess = function(user, access, cb) { //array of access : e.g. [ 'blueprint.update', 'blueprint.delete', 'instance.write' ] but not include 'blueprint.read'
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

  BlueprintSchema.statics.userAccess = function(filter, userId, access, cb) { //action can be 'write', 'read', 'update' or 'delete'
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

    var query = (typeof filter === 'string') ? Blueprint.findOne(_.defaultsDeep(filterAccess, { _id: filter })) : Blueprint.find(_.defaultsDeep(filterAccess, filter));

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

  //BlueprintSchema.plugin(require('captain-hook')); //add captain-hook pre and post document middlewares to Blueprint

  this.Blueprint = mongoose.model('Blueprint', BlueprintSchema);
};
