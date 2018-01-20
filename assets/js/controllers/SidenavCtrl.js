
angular.module('GMAO Tailor').controller('SidenavCtrl', [ '$scope', '$state', '$mdDialog', 'AuthService', function($scope, $state, $mdDialog, AuthService) {

  //because ui-sref="blueprint" ui-sref-opts="{ reload: true, inherit: false }" for instance doesn't work
  $scope.goToNew = function(stateName) {
    $state.go(stateName, {}, { reload: true, inherit: false });
  };

  $scope.logout = AuthService.logout;


  //CHAT

  $scope.authenticated = false;

  $scope.current = {
    tab: 0,
    chat: null,
    message: ''
  };

  $scope.search = {
    text: {
      chats: '',
      chatGroups: ''
    },
    select: {
      chatGroups: ''
    }
  };

  $scope.addChat = {
    name: null,
    members: [],
    selectedItem: '',
    searchText: '',
    filter: function(user, index, array) {
      if (user.name.toLowerCase().indexOf($scope.addChat.searchText.toLowerCase()) > -1 && $scope.currentUser._id !== user._id) {
        return $scope.addChat.members.every(function(member) {
          return member._id !== user._id;
        });
      } else {
        return false;
      }
    }
  };

  function scrollDownMessages() {
    var messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
  }

  $scope.socket.onAuthentification(function(socket, data) {
    $scope.chats = data.chats;
    $scope.chatGroups = data.chatGroups;
    $scope.defContacts('users');

    $scope.current.chat = $scope.chats[0] || $scope.chatGroups[0] || null;
    scrollDownMessages();

    $scope.updateChat = function(event, chat) {
      var oldChat = {
        name: chat.name,
        members: chat.members.slice(),
        _id: chat._id
      };

      $mdDialog.show({
        controller: 'UpdateChatDialogCtrl',
        templateUrl: 'templates/components/updateChatDialog.html',
        parent: angular.element(document.body),
        targetEvent: event, // TODO:
        clickOutsideToClose: true,
        locals: { chat: chat }
      })
      .then(function(chatUpdated) { //given by $mdDialog.hide()
        if (chatUpdated.name !== oldChat.name || chatUpdated.members !== oldChat.members) {
          socket.emit('updateChat', chatUpdated);
          console.log('emit updateChat');
        }
      }, function() { //cancel
        //nothing to do
      });
    };

    socket.on('message', function(data) {
      console.log('new message received');

      var chat = $scope[data.type].find(function(chat) {
        return chat._id === data._id;
      });

      if (chat.messages.length > 0) {
        var lastMessage = chat.messages[chat.messages.length - 1];

        if (lastMessage.createdAt === data.message.createdAt && data.message.content.indexOf(lastMessage.content) > -1) {
          console.log('success');
          lastMessage.content = data.message.content;
        } else {
          chat.messages.push(data.message);
        }
      } else {
        chat.messages.push(data.message);
      }

      if ($scope.current.chat === chat) scrollDownMessages();
    });

    $scope.send = function() {
      var type = (typeof $scope.current.chat.groupId !== 'undefined') ? 'chatGroups' : 'chats';
      socket.emit('message', { type: type, _id: $scope.current.chat._id, message: $scope.current.message });
      $scope.current.message = '';
      console.log('new message sent');
    };

    $scope.loadChat = function(chat) {
      $scope.current.chat = chat;
      scrollDownMessages();
      $scope.current.tab = 0;
    };

    socket.on('quitChat', function(data) { //still need data.type because if the group corresponding to the chat is updated, the current user may not be a member of the group afterward, the same goes for the chatGroup
      console.log('on quitChat');
      if (data.userId === $scope.currentUser._id) {
        $scope[data.type] = $scope[data.type].filter(function(chat) {
          return chat._id !== data._id;
        });
      } else {
        $scope[data.type].forEach(function(chat) {
          if (chat._id === data._id) {
            chat.members = chat.members.filter(function(member) {
              return member._id !== $scope.currentUser._id;
            });
          }
        });
      }

      if ($scope.current.chat) {
        if ($scope.current.chat._id === data._id) $scope.current.chat = null;
      }
    });

    $scope.quitChat = function(chat) {
      socket.emit('quitChat', chat._id);
      console.log('emit quitChat');
    };

    socket.on('chat', function(chat) {
      console.log('new chat received');
      var chats = (typeof chat.groupId !== 'undefined') ? $scope.chatGroups : $scope.chats;

      var existingChat = chats.find(function(chatFilter) {
        return chatFilter._id === chat._id;
      });

      if (existingChat) {
        existingChat = chat;
      } else {
        chats.push(chat);
      }

      $scope.loadChat(chat);
    });

    $scope.addChat.submit = function() {
      var ids = $scope.addChat.members.map(function(member) {
        return member._id;
      });

      socket.emit('chat', { name: $scope.addChat.name || null, members: ids });
      console.log('new chat sent');
    };

    function memberUpdate(userId, isConnected) {
      [ 'chats', 'chatGroups' ].forEach(function(type) {
        $scope[type].forEach(function(chat) {
          chat.members.forEach(function(member) {
            if (member._id === userId) member.status = isConnected;
          });
        });
      });
      $scope.$apply();
    }

    socket.on('userConnection', function(userId) {
      memberUpdate(userId, true);
    });

    socket.on('userDisconnection', function(userId) {
      memberUpdate(userId, false);
    });


    //other socket.io emit/on
  });

}]);
