/**
 * Blueprint Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */



var BlueprintController = {


  write: function(req, res) {
    req.body.blueprint.author = req.user._id;
    req.body.blueprint.versions = [ req.body.blueprint.version ];

    Blueprint.create(req.body.blueprint, function(err, blueprint) { //save and populate
      if (err) {
        res.resolve(err);
      } else {
        blueprint.userAccess = { //never save because only "virtual"
          blueprint: { read: true, update: true, delete: true },
          instance: { write: true }
        };
        blueprint.author = { name: req.user.name, _id: req.user._id };

        res.status(200).json(blueprint);
      }
    });
  },


  read: function(req, res) {
    if (typeof req.body.id === 'string') {
      Blueprint.userAccess(req.body.id, req.user._id, 'blueprint.read', function(err, blueprint) {
        if (err) {
          res.resolve(err);

        } else if (blueprint) {
          var access = [ 'blueprint.update', 'blueprint.delete', 'instance.write' ];
          blueprint.appendUserAccess(req.user, access, function(err) { //mutates blueprint
            if (err) {
              res.resolve(err);
            } else {
              res.status(200).json(blueprint);
            }
          });
        } else {
          res.status(403).send('Not allow to see the Blueprint.');
        }
      });
    } else  {
      res.status(404).send('No Blueprint to fetch : missing id.');
    }
  },


  update: function(req, res) {
    if (typeof req.body.blueprint === 'object' && typeof req.body.blueprint._id === 'string') { //update a Blueprint
      Blueprint.userAccess(req.body.blueprint._id, req.user._id, 'blueprint.update', function(err, blueprint) {
        if (err) {
          res.resolve(err);

        } else if (blueprint) {
          blueprint.name = req.body.blueprint.name;
          blueprint.description = req.body.blueprint.description;
          blueprint.access = req.body.blueprint.access;
          blueprint.tags = req.body.blueprint.tags;

          var oldVersion = _.find(blueprint.versions, { name: req.body.blueprint.version.name });
          if (typeof oldVersion === 'undefined') {
            blueprint.versions.push(req.body.blueprint.version);
          } else {
            oldVersion = req.body.blueprint.version;
          }

          blueprint.save(function(err) {
            if (err) {
              res.resolve(err);

            } else {
              var access = [ 'blueprint.delete', 'instance.write' ];
              blueprint.appendUserAccess(req.user, access, function(err) { //mutates blueprint; it don't test if user can read but it assumes so because the user has other right on it and so it can read it to do so
                if (err) {
                  res.resolve(err);

                } else {
                  blueprint.userAccess.blueprint.update = true; //obviously
                  res.status(200).json(blueprint);
                }
              });
            }
          });

        } else {
          res.status(403).send('Not allow to update the Blueprint.');
        }
      });

    } else {
      res.status(400).send('Wrong request : missing or invalid parameters.')
    }
  },


  delete: function(req, res) {
    if (typeof req.body.id === 'string') {
      Blueprint.userAccess(req.body.id, req.user._id, 'blueprint.delete', function(err, blueprint) {
        if (err) {
          res.resolve(err);

        } else if (blueprint) {
          blueprint.remove(function(err) {
            if (err) {
              res.resolve(err);
            } else {
              res.status(200).send();
            }
          });

        } else {
          res.status(403).send('Not allow to delete the Blueprint.');
        }
      });
    } else {
      res.status(404).send('No Blueprint to fetch : missing id.');
    }
  },


  private: function(req, res) {
    Blueprint.userAccess({}, req.user._id, 'blueprint.read', function(err, blueprints) {
      if (err) {
        res.resolve(err);
      } else {
        var data = { own: [], private: [], groups: [] };

        blueprints.forEach(function(blueprint) {
          if (blueprint.author._id.str === req.user._id) {
            data.own.push(blueprint);
          } else if (blueprint.access.users.some(function(accessUser) { return accessUser.blueprint.read && accessUser.user.str === req.user._id; })) {
            data.groups.push(blueprint);
          } else {
            data.private.push(blueprint);
          }
        });

        res.status(200).json(data);
      }
    });
  },


  public: function(req, res) { //not working : maybe the find filter is too nested
    Blueprint
      .find({ access: { public: { blueprint: { read: true } } } }, 'name description author _id')
      .populate('author', 'name _id')
      .exec(function(err, blueprints) {
        if (err) {
          res.resolve(err);
        } else {
          res.status(200).json({ public: blueprints });
        }
      });
  },


  contextmenu: function(req, res) { //not working : maybe the find filter is too nested
    res.status(200).send({ lists: [], definitions: [] });
  }


};

module.exports = BlueprintController;
