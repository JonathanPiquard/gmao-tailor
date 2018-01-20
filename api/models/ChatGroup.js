
////////////////////////////////////////////////////////////////////////////////
////////////////////*************** CHAT GROUP **************///////////////////
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

  var ChatGroupSchema = mongoose.Schema({

    group: { type: ObjectId, ref: 'Group', required: true },

    messages: [{
      author: { type: ObjectId, ref: 'User', required: true },
      content: { type: String, required: true, maxlength: 1000 },
      createdAt: { type: Date, required: true }
    }]

  });


  ChatGroupSchema.methods.initSocket = function(userId, contactIds, chatGroupIds) {
    var chatId = this._id.toString();
    var authorId = this.group.author._id.toString();

    var isMember = authorId === userId || this.group.members.some(function(member) {
      return member.user._id.toString() === userId;
    });

    if (isMember) {
      chatGroupIds.push(chatId);
      this.group.members.forEach(function(member) {
        var memberId = member.user._id.toString();

        if (memberId !== userId) {
          if (typeof contactIds[memberId] === 'undefined') {
            contactIds[memberId] = [];
          }
          contactIds[memberId].push(chatId);
        }
      });

      if (authorId !== userId) {
        if (typeof contactIds[authorId] === 'undefined') {
          contactIds[authorId] = [];
        }
        contactIds[authorId].push(chatId);
      }
    }
  };

  ChatGroupSchema.methods.simplify = function(userId) {
    var authorId = this.group.author._id.toString();

    var chatGroup = {
      name: this.group.name,
      messages: this.messages,
      members: [],
      _id: this._id,
      groupId: this.group._id
    };

    this.group.members.forEach(function(member) {
      var memberId = member.user._id.toString();

      if(memberId !== userId) {
        chatGroup.members.push({
          name: member.user.name,
          status: typeof io.sockets.idsByUserId[memberId] !== 'undefined',
          _id: memberId
        });
      }
    });

    if (authorId !== userId) {
      chatGroup.members.push({
        name: this.group.author.name,
        status: typeof io.sockets.idsByUserId[authorId] !== 'undefined',
        _id: authorId
      });
    }

    return chatGroup;
  };


  ChatGroupSchema.statics.findAndPopulateAll = function(filter, cb) {
    this.find(filter, function(err, chatGroups) {
      if (err) {
        cb(err);
      } else {
        var groupIds = chatGroups.map(function(chatGroup) { return chatGroup.group; });

        Group
          .find({ _id: { $in: groupIds } })
          .populate({ path: 'members.user', select: 'name _id' })
          .populate({ path: 'author', select: 'name _id' })
          .exec(function(err, groups) {
            if (err) {
              cb(err);
            } else {
              var groupsById = _.keyBy(groups, '_id');

              chatGroups.forEach(function(chatGroup) {
                chatGroup.group = groupsById[chatGroup.group];
              });

              return cb(null, chatGroups);
            }
        });
      }
    });
  };


  this.ChatGroup = mongoose.model('ChatGroup', ChatGroupSchema);
};
