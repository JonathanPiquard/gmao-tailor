
////////////////////////////////////////////////////////////////////////////////
///////////////////////*************** CHAT ***************/////////////////////
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

  var ChatSchema = mongoose.Schema({

    name: { type: String, default: null, maxlength: 25 },

    members: [{ type: ObjectId, ref: 'User', required: true }],

    messages: [{
      author: { type: ObjectId, ref: 'User', required: true },
      content: { type: String, required: true, maxlength: 1000 },
      createdAt: { type: Date, required: true }
    }]

  });


  ChatSchema.methods.initSocket = function(userId, contactIds, chatIds) {
    var chatId = this._id.toString();

    var isMember = this.members.some(function(member) {
      return member._id.toString() === userId;
    });

    if (isMember) {
      chatIds.push(chatId);
      this.members.forEach(function(member) {
        var memberId = member._id.toString();

        if (memberId !== userId) {
          if (typeof contactIds[memberId] === 'undefined') {
            contactIds[memberId] = [];
          }
          contactIds[memberId].push(chatId);
        }
      });
    }
  };

  ChatSchema.methods.simplify = function(userId) {
    var chat = {
      name: this.name,
      messages: this.messages,
      members: [],
      _id: this._id
    };

    this.members.forEach(function(member) {
      var memberId = member._id.toString();

      if (memberId !== userId) {
        chat.members.push({
          name: member.name,
          status: typeof io.sockets.idsByUserId[memberId] !== 'undefined',
          _id: memberId
        });
      }
    });

    return chat;
  };


  this.Chat = mongoose.model('Chat', ChatSchema);
};
