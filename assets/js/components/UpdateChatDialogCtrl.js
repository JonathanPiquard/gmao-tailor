

angular.module('GMAO Tailor').controller('UpdateChatDialogCtrl', ['$scope', '$timeout', '$mdDialog', 'chat', function($scope, $timeout, $mdDialog, chat) {

  $scope.chat = chat;

  function focus() {
    document.getElementById('updateChatName').focus();
  }
  $timeout(focus, 501);

  $scope.hide = function() {
    $mdDialog.hide();
  };

  $scope.cancel = function() {
    $mdDialog.cancel();
  };

  $scope.validate = function() {
    $mdDialog.hide($scope.chat);
  };


  $scope.search = {
    text: {
      members: ''
    },
    select: {
      members: '$'
    }
  };

  $scope.addMembers = {
    members: [],
    searchText: '',
    selectedItem: '',
    filter: function(user, index, array) {
      if (user.name.toLowerCase().indexOf($scope.addMembers.searchText.toLowerCase()) > -1 && user._id !== $scope.currentUser._id) {
        return $scope.chat.members.every(function(member) {
          return member.user._id !== user._id;
        });
      } else {
        return false;
      }
    }
  };

  $scope.lastMessage = function(memberId) {
    var lastMessage = {
      content: '',
      createdAt: 0
    };

    $scope.chat.messages.forEach(function(message) {
      if (message.author === memberId) {
        if (lastMessage.createdAt <= message.createdAt) lastMessage = message;
      }
    });

    return lastMessage.content;
  };

}]);
