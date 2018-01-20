/**
 * Group Controller
 *
 * This is merely meant as an example of how your Authentication controller
 * should look. It currently includes the minimum amount of functionality for
 * the basics of Passport.js to work.
 */


var GroupController = {


  all: function(req, res) {
    Group.find({}, 'name _id', function(err, groups) {
      if (err) {
        res.resolve(err);
      } else {
        res.status(200).json(groups);
      }
    });
  },

  write: function(req, res) {
    req.body.author = req.user._id;
    if (typeof req.body.levels[0] === 'undefined') delete req.body.levels;
    if (typeof req.body.members[0] === 'undefined') delete req.body.members;

    Group.populate(req.body, { path: 'members.user', select: 'name _id' }, function(err, group) { //create and populate
      if (err) {
        res.resolve(err);
      } else {
        ChatGroup.create({ group: group, createdAt: new Date() }, function(err, chatGroup) {
          if (err) {
            res.resolve(err);
          } else {
            group.author = { name: req.user.name, _id: req.user._id };
            chatGroup.group = group;
            io.chatGroups[chatGroup._id.str] = chatGroup;

            group.members.forEach(function(member) {
              io.getSocket(member.user._id.str, function(memberSocket) {
                memberSocket.newChat('chatGroups', chatGroup);
              });
            });
            res.status(200).json({ group: group, userRight: group.memberRights(req.user._id) });
          }
        });
      }
    });
  },

  read: function(req, res) {
    if (typeof req.params.id === 'string') {
      Group
        .findById(req.params.id)
        .populate('members.user', 'name _id')
        .populate('author', 'name _id')
        .exec(function(err, group) {
          if (err) {
            res.resolve(err);
          } else if (group) {
            var userRights = group.memberRights(req.user._id);

            if (group.visibility === 'private') {
              //find the user among members or author
              if (userRights.length > 0) {
                res.status(200).json({ group: group, userRights: userRights });
              } else {
                res.status(403).send('This group is private and you are not one of its members.');
              }
            } else { //public
              res.status(200).json({ group: group, userRights: userRights });
            }
          } else {
            res.status(404).send('The Group does not exist : wrong id.');
          }
      })
    } else {
      res.status(404).send('The id of the group is missing or invalid.');
    }
  },

  update: function(req, res) {
    if (typeof req.body.id === 'string') {
      Group.findById(req.body.id, function(err, group) {
        if (err) {
          res.status(403).send('Invalid parameter : id.');

        } else if (group) {
          var right = group.memberRights(req.user._id);

          if (rights.indexOf('UpdateInformations') > -1) {
            Avatar.store(req.body.avatar, 'groups/' + req.body.id, function(err) { //store avatar if there is one
              if (err) {
                res.resolve(err);
              } else {
                //update what the user has the right to update
              }
            });

          } else {
            res.status(403).send("You are not allowed to update the avatar : you do not have the rights to update the group's informations.");
          }
        } else {
          res.status(404).send('The Group does not exist : wrong id.')
        }
      });

    } else {
      res.status(403).send('Missing or invalid parameter : id.');
    }
  },

  delete: function(req, res) {
    if (typeof req.body.id === 'string') {
      Group.findById(req.body.id, function(err, group) {
        if (err) {
          res.resolve(err);

        } else if (group) {
          if (group.author.str === req.user._id) {
            ChatGroup.findOne({ group: group._id }, function(err, chatGroup) {

              delete io.chatGroups[chatGroup._id.str];
              group.members.forEach(function(member) {
                io.getSocket(member.user._id.str, function(memberSocket) {
                  memberSocket.userQuitChat(chatGroup, req.user._id);
                });
              });

              chatGroup.remove(function(err) {
                if (err) {
                  res.resolve(err);

                } else {
                  group.remove(function(err) {
                    if (err) {
                      res.resolve(err);

                    } else {
                      res.status(200).send();
                    }
                  });
                }
              });
            });
          } else {
            res.status(403).send('Only the author of the group is allowed to delete it.');
          }
        } else {
          res.status(404).send('No Group with this id.');
        }
      });
    } else {
      res.status('404').send('The id of the group is missing or invalid.');
    }
  },

  private: function(req, res) { //every groups the user is a member of
    Group.find({ members: { user: req.user._id } }, 'name description tags _id', function(err, groups) {
      if (err) {
        res.resolve(err);
      } else {
        res.status(200).json({ private: groups });
      }
    });
  },

  public: function(req, res) {
    Group.find({ visibility: 'public' }, 'name description tags _id', function(err, groups) {
      if (err) {
        res.resolve(err);
      } else {
        res.status(200).json({ public: groups });
      }
    });
  },

};

module.exports = GroupController;
