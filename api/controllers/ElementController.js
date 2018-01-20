/**
 * Element Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */



var ElementController = {


  write: function(req, res) {
    req.body.element.author = req.user._id;
    console.log(req.body.element);
    console.log(req.body.element.version);
    console.log(req.body.element.version.properties.in);
    console.log(req.body.element.version.properties.in[0].validator.length);
    console.log(req.body.element.version.properties.out);

    //maybe a condition to check if req.body.element is an object in which properties is an object in which in or out in an array ...
    if (req.body.element.version.properties.in.length + req.body.element.version.properties.out.length > 0) {
      req.body.element.version.hasBeenVerified = false; //override if the the attribute has been defined to true
      req.body.element.versions = [ req.body.element.version ];

      Element.create(req.body.element, function(err, element) {
        if (err) {
          res.resolve(err);
        } else {
          element.userAccess = { //never save because only "virtual"
            element: { read: true, use: true, update: true, delete: true }
          };
          element.author = { name: req.user.name, _id: req.user._id };

          res.status(200).json(element);
        }
      });
    } else {
      res.status(400).send('Error : there are no properties defined.');
    }
  },


  read: function(req, res) {
    if (typeof req.body.id === 'string') {
      Element.userAccess(req.body.id, req.user._id, 'element.read', function(err, element) {
        if (err) {
          res.resolve(err);

        } else if (element) {
          var access = [ 'element.use', 'element.update', 'element.delete' ];
          element.appendUserAccess(req.user, access, function(err) { //mutates element
            if (err) {
              res.resolve(err);
            } else {
              res.status(200).json(element);
            }
          });
        } else {
          res.status(403).send('Not allow to see the Element.');
        }
      });
    } else  {
      res.status(404).send('No Element to fetch : missing id.');
    }
  },


  update: function(req, res) {
    if (typeof req.body.element === 'object' && typeof req.body.element._id === 'string') { //update a Element
      Element.userAccess(req.body.element._id, req.user._id, 'element.update', function(err, element) {
        if (err) {
          res.resolve(err);

        } else if (element) {
          element.name = req.body.element.name;
          element.description = req.body.element.description;
          element.access = req.body.element.access;
          element.tags = req.body.element.tags;

          var oldVersion = _.find(element.versions, { name: req.body.element.version.name });
          if (typeof oldVersion === 'undefined') {
            element.versions.push(req.body.element.version);
          } else {
            oldVersion = req.body.element.version;
          }

          element.save(function(err) {
            if (err) {
              res.resolve(err);

            } else {
              var access = [ 'element.use', 'element.delete' ];
              element.appendUserAccess(req.user, access, function(err) { //mutates element; it don't test if user can read but it assumes so because the user has other right on it and so it can read it to do so
                if (err) {
                  res.resolve(err);

                } else {
                  element.userAccess.element.update = true; //obviously
                  res.status(200).json(element);
                }
              });
            }
          });

        } else {
          res.status(403).send('Not allow to update the Element.');
        }
      });

    } else {
      res.status(400).send('Wrong request : missing or invalid parameters.')
    }
  },


  delete: function(req, res) {
    if (typeof req.body.id === 'string') {
      Element.userAccess(req.body.id, req.user._id, 'element.delete', function(err, element) {
        if (err) {
          res.resolve(err);

        } else if (element) {
          element.remove(function(err) {
            if (err) {
              res.resolve(err);
            } else {
              res.status(200).send();
            }
          });

        } else {
          res.status(403).send('Not allow to delete the Element.');
        }
      });
    } else {
      res.status(404).send('No Element to fetch : missing id.');
    }
  },


  private: function(req, res) {
    Element.userAccess({}, req.user._id, 'element.read', function(err, elements) {
      if (err) {
        res.resolve(err);
      } else {
        var data = { own: [], private: [], groups: [] };

        elements.forEach(function(element) {
          if (element.author._id.str === req.user._id) {
            data.own.push(element);
          } else if (element.access.users.some(function(accessUser) { return accessUser.element.read && accessUser.user.str === req.user._id; })) {
            data.groups.push(element);
          } else {
            data.private.push(element);
          }
        });

        res.status(200).json(data);
      }
    });
  },


  public: function(req, res) { //not working : maybe the find filter is too nested
    Element
      .find({ access: { public: { element: { read: true } } } }, 'name description author _id')
      .populate('author', 'name _id')
      .exec(function(err, elements) {
        if (err) {
          res.resolve(err);
        } else {
          res.status(200).json({ public: elements });
        }
      });
  }
};

module.exports = ElementController;
