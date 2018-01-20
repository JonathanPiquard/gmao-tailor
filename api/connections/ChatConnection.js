
////////////////////////////////////////////////////////////////////////////////
///////////////////************* CHAT CONNECTION *************//////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Handle socket.io chat                                                      *
  * Poorly designed, the principle is wrong, caching all the chats is quite    *
  * too heavy.                                                                 *
  *                                                                            *
  * Variables:                                                                 *
  *   this.app come from app.js : this.app (_.bind)                            *
  *   this.express come from app.js : this.express (_.bind)                    *
  *   this.mongoose come from app.js : this.mongoose (_.bind)                  *
  *   etc.                                                                     *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////


module.exports = function() {

  Chat
    .find()
    .populate('members', 'name _id')
    .exec(function(err, chats) {
      if (err) {
        console.error(err);
      } else {
        io.chats = _.keyBy(chats, '_id'); //create an object indexed by the chat's _id

        ChatGroup.findAndPopulateAll({}, function(err, chatGroups) {
          if (err) {
            console.error(err);
          } else {
            io.chatGroups = _.keyBy(chatGroups, '_id'); //create an object indexed by the chatGroup's _id

            io.sockets.idsByUserId = {}; //every authenticated sockets indexed by user._id

            io.getSocket = function(userId, cb) {
              if (typeof io.sockets.idsByUserId[userId] !== 'undefined') {
                cb(io.sockets.connected[ io.sockets.idsByUserId[userId] ]);
              }
            };

            io.setUser = function(user) {
              io.getSocket(user._id, function(socket) {
                socket.user = user; //eventually update the name which is used by the chat
              });
            };


            io.on('connection', function(socket) {

              socket.resolve = function(err) {
                this.emit('error', err);
              };

              socket.on('authentication', function(token) {
                User.verifyToken(token, function(err, user) { //service
                  if (err) {
                    socket.resolve(err);
                  } else {
                    socket.user = user;
                    io.sockets.idsByUserId[socket.user._id] = socket.id;

                    //current user contacts (people is in touched with)
                    socket.contactIds = {}; //an object indexed by member._id, with array of chat._id to which belongs the member

                    //chats which the current user is a member of
                    socket.chatIds = [];
                    socket.chatGroupIds = [];

                    for (_id in io.chats) {
                       if (io.chats.hasOwnProperty(_id)) {
                         io.chats[_id].initSocket(socket.user._id, socket.contactIds, socket.chatIds);
                       }
                    }
                    for (_id in io.chatGroups) {
                       if (io.chatGroups.hasOwnProperty(_id)) {
                         io.chatGroups[_id].initSocket(socket.user._id, socket.contactIds, socket.chatGroupIds);
                       }
                    }

                    socket.toContacts = function(cb) {
                      for (_id in this.contactIds) {
                         if (this.contactIds.hasOwnProperty(_id)) {
                           io.getSocket(_id, cb);
                         }
                      }
                    };

                    socket.emit('authenticated', {
                      chats: socket.chatIds.map(function(chatId) { return io.chats[chatId].simplify(socket.user._id); }),
                      chatGroups: socket.chatGroupIds.map(function(chatGroupId) { return io.chatGroups[chatGroupId].simplify(socket.user._id); })
                    });

                    //let every contacts know that's the user is authenticated
                    socket.toContacts(function(contactSocket) {
                      contactSocket.emit('userConnection', socket.user._id);
                    });

                    socket.newChat = function(chat) {
                      var _this = this,
                          chatId = chat._id.toString();

                      this[ (typeof chat.group === 'undefined') ? 'chatIds' : 'chatGroupIds' ].push(chatId); //add chat to chat list

                      chat.members.forEach(function(member) { //add members to contact list
                        var memberId = member._id.toString();

                        if (memberId !== _this.user._id) {
                          if (typeof _this.contactIds[memberId] !== 'undefined') {
                            _this.contactIds[memberId] = [];
                          }
                          _this.contactIds[memberId].push(chatId);
                        }
                      });

                      this.emit('chat', chat.simplify(this.user._id));
                    };

                    socket.on('chat', function(chat) { //to create a new chat
                      console.log('new chat received');
                      var existingChat = null;

                      if (chat.members.length === 1) {
                        socket.chatIds.forEach(function(chatId) {
                          if (io.chats[chatId].members.length === 2) {
                            if (io.chats[chatId].members[0]._id.toString() === chat.members[0]._id || io.chats[chatId].members[1]._id.toString() === chat.members[0]._id) {
                              existingChat = io.chats[chatId];
                            }
                          }
                        });
                      }

                      if (existingChat) {
                        socket.emit('chat', existingChat.simplify(socket.user._id));

                      } else {
                        if (typeof chat.name === 'string' && chat.members.length > 1) {
                          var chatTrimmed = chat.name.trim();
                          chat.name = (chatTrimmed.length > 0) ? chatTrimmed : null;
                        } else {
                          chat.name = null;
                        }

                        chat.members.push(socket.user._id);
                        chat.createdAt = new Date();

                        Chat.populate(chat, { path: 'members', select: 'name _id' }, function(err, chat) { //create and populate
                          if (err) {
                            socket.resolve(err);
                          } else {
                            var chatId = chat._id.toString();
                            io.chats[chatId] = chat;

                            chat.members.forEach(function(member) {
                              io.getSocket(member._id.toString(), function(memberSocket) {
                                memberSocket.newChat(chat);
                              });
                            });
                          }
                        });
                      }
                    });

                    socket.on('updateChat', function(chat) {
                      if (socket.chatIds.indexOf(chat._id) > -1) {
                        var existingChat = io.chats[chat._id];

                        if (existingChat) {
                          existingChat.members = existingChat.members.map(function(member) { return member._id.toString(); });

                          chat.members.forEach(function(member) {
                            if (socket.user._id !== member._id && existingChat.members.indexOf(member._id) === -1) {
                              existingChat.members.push(member._id);
                            }
                          });

                          if (existingChat.name !== chat.name) {
                            if (typeof chat.name === 'string' && existingChat.members.length > 1) {
                              var nameTrimmed = chat.name.trim();
                              existingChat.name = (nameTrimmed.length > 0) ? nameTrimmed : existingChat.name;
                            }
                          }

                          Chat.populate(existingChat, { path: 'members', select: 'name _id' }, function(err, chatUpdated) {
                            if (err) {
                              socket.resolve(err);
                            } else {
                              io.chats[chat._id] = chatUpdated;

                              chatUpdated.members.forEach(function(member) {
                                var memberId = member._id.toString();

                                io.getSocket(memberId, function(memberSocket) {
                                  if (memberSocket.chatIds.indexOf(chat._id) > -1) {
                                    memberSocket.emit('chat', chatUpdated.simplify(memberSocket.user._id));
                                  } else {
                                    memberSocket.newChat(chatUpdated);
                                  }
                                });
                              });
                            }
                          });
                        } else {
                          socket.resolve('This chat does not exist.');
                        }
                      } else {
                        socket.resolve('You are not a member of this chat.');
                      }
                    });

                    socket.userQuitChat = function(chat, userId) {
                      var chatId = chat._id.toString();

                      var ids = this[ (typeof chat.group === 'undefined') ? 'chatIds' : 'chatGroupIds' ]; //socket.chatIds || socket.chatGroupIds
                      ids.splice(ids.indexOf(chatId), 1);

                      if (this.contactIds[userId].length > 1) {
                        this.contactIds[userId].splice(this.contactIds[userId].indexOf(chatId), 1);
                      } else {
                        delete this.contactIds[userId];
                      }

                      this.emit('quitChat', {
                        type: (typeof chat.group === 'undefined') ? 'chats' : 'chatGroups',
                        _id: chatId,
                        userId: userId
                      });
                    };

                    socket.on('quitChat', function(chatId) {
                      console.log('on quitChat', chatId);
                      var chat = io.chats[chatId];

                      if (typeof chat !== 'undefined') {
                        if (socket.chatIds.indexOf(chatId) > -1) {
                          var chatToUpdate = {
                            name: chat.name,
                            members: chat.members.filter(function(member) {
                              return member._id.toString() !== socket.user._id;
                            }),
                            _id: chatId
                          };

                          if (chatToUpdate.members.length > 0) {
                            chatToUpdate.messages = chat.messages.slice();
                            chatToUpdate.messages.push({
                              content: socket.user.name + ' has quit the chat.',
                              author: socket.user._id,
                              createdAt: new Date()
                            });

                            Chat.populate(chatToUpdate, { path: 'members', select: 'name _id' }, function(err, chatUpdated) {
                              if (err) {
                                socket.resolve(err);
                              } else {
                                io.chats[chatId] = chatUpdated;

                                //self
                                socket.chatIds.splice(socket.chatIds.indexOf(chatId), 1);
                                socket.emit('quitChat', {
                                  type: 'chats',
                                  _id: chatId,
                                  userId: socket.user._id
                                });
                                //self end

                                chat.members.forEach(function(member) {
                                  var memberId = member._id.toString();

                                  //self
                                  if (socket.contactIds[memberId].length > 1) {
                                    socket.contactIds[memberId].splice(this.contactIds[memberId].indexOf(chatId), 1); //remove the chat from the contact array of chat you share
                                  } else {
                                    delete this.contactIds[memberId];
                                  }
                                  //self end

                                  //members except the user
                                  io.getSocket(memberId, function(memberSocket) {
                                    memberSocket.userQuitChat(chatUpdated, socket.user._id);
                                  });
                                });
                              }
                            });
                          } else {
                            chat.remove(function(err, chat) {
                              if (err) {
                                socket.resolve(err);
                              } else {
                                socket.userQuitChat(chat, socket.user._id);
                                delete io.chats[chatId];
                              }
                            });
                          }
                        } else {
                          socket.resolve('You are not a member of this chat.');
                        }
                      } else {
                        socket.resolve('This chat does not exist.');
                      }
                    });

                    socket.on('message', function(data) {
                      console.log('new message received');

                      if (typeof data.message === 'string') {
                        data.message = data.message.trim();
                        if (data.message.length > 0) {
                          if (data.type === 'chats' || data.type === 'chatGroups') {
                            var chat = io[type][data._id];

                            if (typeof chat !== 'undefined') {
                              if (socket[ data.type.slice(0, -1) + 'Ids' ].indexOf(data._id) > -1) {

                                if (chat.messages.length > 0) {
                                  var lastMessage = chat.messages[chat.messages.length - 1];

                                  if (lastMessage.author.toString() === socket.user._id && Date.now() - lastMessage.createdAt.getTime() < 60*1000) { //60seconds
                                    lastMessage.content += '\n' + data.message;
                                  } else {
                                    chat.messages.push({
                                      author: socket.user._id,
                                      content: data.message,
                                      createdAt: new Date()
                                    });
                                  }
                                } else {
                                  chat.messages.push({
                                    author: socket.user._id,
                                    content: data.message,
                                    createdAt: new Date()
                                  });
                                }

                                chat.save(function(err, chatUpdated) {
                                  if (err) {
                                    socket.resolve(err);
                                  } else {
                                    //io[type][data._id] = chatUpdated; //chat or io[type][data._id] is already updated and is populated ...

                                    if (type === 'chats') {
                                      var members = chatUpdated.members;
                                    } else {
                                      var members = chatUpdated.group.members.map(function(member) {
                                        return member.user;
                                      });
                                    }

                                    members.forEach(function(member) {
                                      io.getSocket(member._id.toString(), function(memberSocket) {
                                        memberSocket.emit('quitChat', {
                                          type: type,
                                          _id: chat._id,
                                          message: chat.messages[chat.messages.length - 1]
                                        });
                                      });
                                    });
                                  }
                                });

                              } else {
                                socket.resolve('You are not a member of this chat.');
                              }
                            } else {
                              socket.resolve('This chat does not exist.');
                            }
                          } else {
                            socket.resolve("There is not such type: it must be 'chats' or 'chatGroups'.");
                          }
                        }
                      } else {
                        socket.resolve('Message invalid : it should be a string.');
                      }
                    });

                    socket.on('disconnect', function() {
                      delete io.sockets.idsByUserId[this.user._id];

                      //let every contacts know that's the user is no longer connected
                      this.toContacts(function(contactSocket) {
                        contactSocket.emit('userDisonnection', this.user._id);
                      });
                    });
                  }
                });
              });
            });
          }
        });
      }
    });
};
