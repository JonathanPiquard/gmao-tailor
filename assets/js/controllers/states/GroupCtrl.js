
angular.module('GMAO Tailor').controller('GroupCtrl', [ '$scope', '$http', '$state', '$stateParams', 'Dialog', 'Toast', function($scope, $http, $state, $stateParams, Dialog, Toast) {

  //Defines users, from AppCtrl which add them to its scope
  $scope.defContacts('users');

  $scope.group = {
    name: '',
    description: '',
    visibility: 'private',
    tags: [],
    members: [],
    levels: [],
    defaultLevel: '',
    author: {
      name: $scope.currentUser.name,
      _id: $scope.currentUser._id
    }
  };

  function getLevel(levelId) {
    return $scope.group.levels.find(function(level) {
      return level._id === levelId;
    });
  }

  function getGroup(id) {
    $http
      .get('/api/group/read/' + id)
      .success(function(data) {
        $scope.group = data.group;

        $scope.group.members.forEach(function(member) {
          member.levelName = getLevel(member.level);
        });

        $scope.userRights = data.userRights;
      })
      .error(function(err) {
        console.log(err);
        Toast.error(err);
      });
  }


  //initialization
  if (typeof $stateParams.id !== 'undefined') {
    getGroup($stateParams.id);
  }


  $scope.search = {
    text: {
      members: '',
      levels: ''
    },
    select: {
      members: '$',
      levels: '$'
    }
  };

  $scope.current = {
    tab: 0
  };


  $scope.addMember = {
    members: [],
    searchText: '',
    selectedItem: '',
    level: {}, //init, it will be an object
    filter: function(user, index, array) {
      if (user.name.toLowerCase().indexOf($scope.addMember.searchText.toLowerCase()) > -1 && $scope.group.author._id !== user._id) {
        return $scope.group.members.every(function(member) {
          return member.user._id !== user._id;
        });
      } else {
        return false;
      }
    },
    valid: function() {
      return typeof $scope.addMember.members[0] !== 'undefined' && typeof $scope.addMember.level === 'string';
    },
    submit: function() {
      var level = $scope.group.levels.find(function(level) {
        return level._id === $scope.addMember.level;
      });

      var member = {
        user: {
          name: $scope.addMember.members[0].name,
          _id: $scope.addMember.members[0]._id
        },
        level: level._id,
        levelName: level.name
      };
      var foundMember = $scope.findMember($scope.addMember.members[0]._id);


      if (typeof foundMember !== 'undefined') { //member has to be updated
        foundMember = member;
      } else {
        $scope.group.members.push(member); //member has to be created
      }

      //reset
      $scope.addMember.members = [];
    }
  };

  $scope.findMember = function(memberId) {
    return $scope.group.members.find(function(member) {
      return memberId === member.user._id;
    });
  };

  $scope.loadMember = function(member) {
    $scope.addMember.members[0] = {
      name: member.user.name,
      _id: member.user._id
    };

    $scope.addMember.level = member.level;

    $scope.current.tab = 2;
  };

  $scope.removeMember = function(member) {
    $scope.group.members.splice($scope.group.members.indexOf(member), 1);
  };


  $scope.rights = {
    Informations: [
      { name: 'Update Informations' }
    ],
    Member: [
      { name: 'See', value: 'Read' },
      { name: 'Create', value: 'Write' },
      { name: 'Update' },
      { name: 'Delete' }
    ],
    Level: [
      { name: 'Create', value: 'Write' },
      { name: 'Update' },
      { name: 'Delete' }
    ],
    Chat: [
      { name: 'See', value: 'Read' },
      { name: 'Respond', value: 'Write' }
    ],
    Request: [
      { name: 'See', value: 'Read' },
      { name: 'Respond', value: 'Write' }
    ],
    Blueprint: [
      { name: 'See', value: 'Read' },
      { name: 'Add', value: 'Write' },
      { name: 'Update' },
      { name: 'Delete' }
    ],
    Instance: [
      { name: 'See', value: 'Read' },
      { name: 'Create', value: 'Write' },
      { name: 'Update' },
      { name: 'Delete' }
    ]
  };

  $scope.rightsSubjects = Object.keys($scope.rights);

  $scope.addLevel = {
    levelsIds: [ -1 ],
    level: {
      name: '',
      description: '',
      _id: 0,
      rights: []
    },
    submit: function() {
      var foundLevel = $scope.group.levels.find(function(level) {
        return level._id === $scope.addLevel.level._id;
      });

      if (typeof foundLevel !== 'undefined') { //level exist and has to be updated
        foundLevel = $scope.addLevel.level;

      } else {
        //new level
        var newLevel = {
          name: $scope.addLevel.level.name,
          description: $scope.addLevel.level.description,
          _id: Math.max.apply(null, $scope.addLevel.levelsIds) + 1,
          rights: $scope.addLevel.level.rights
        };
        $scope.group.levels.push(newLevel);
        $scope.addLevel.levelsIds.push(newLevel._id);
      }

      //reset
      $scope.addLevel.level =  {
        name: '',
        description: '',
        _id: Math.max.apply(null, $scope.addLevel.levelsIds) + 1,
        rights: []
      };
    },
    toggleChecked: function(category, right) {
      var index = $scope.addLevel.level.rights.indexOf((right.value || right.name) + category);
      if (index > -1) {
        $scope.addLevel.level.rights.splice(index, 1);
      }
      else {
        $scope.addLevel.level.rights.push((right.value || right.name) + category);
      }
    },
    isChecked: function(category, right) {
      return $scope.addLevel.level.rights.indexOf((right.value || right.name) + category) > -1;
    }
  };

  $scope.loadLevel = function(level) {
    $scope.addLevel.level = {
      name: level.name,
      description: level.description,
      _id: level._id,
      rights: level.rights
    };

    $scope.current.tab = 4;
  };

  $scope.removeLevel = function(level) {
    $scope.group.levels.splice($scope.group.levels.indexOf(level), 1);
  };

  $scope.setDefaultLevel = function(level) {
    if ($scope.group.defaultLevel === level._id) {
      $scope.group.defaultLevel = '';
    } else {
      $scope.group.defaultLevel = level._id;
    }
  };



  //directive avatar
  $scope.url = function() {
    return (typeof $stateParams.id === 'undefined') ? '/api/group/write' : '/api/group/update';
  };
  $scope.defaultSrc = '/avatars/groups/' + ($stateParams.id || 'default');


  $scope.groupSubmit = function() {
    $scope.submitForm($scope.group)
      .then(function(res) { //success
        $scope.group = res.group;
        $scope.userRights = res.userRights;

        //update url params without reload the state
        $state.transitionTo('.', { id: $scope.group._id }, { location: true, inherit: true, relative: $state.$current, notify: false });
      });
  };

  $scope.deleteGroup = function(ev) {
    Dialog
      .confirmDelete(ev, 'Group')
      .then(function() { //success : the user decides to crush down his group
        $http
          .delete('/api/group/delete', { params: { id: $scope.group._id} })
          .success(function() {
            $state.go('groups');
          })
          .error(function(err) {
            console.log(err);
            Toast.error(err);
          });
      });
  };

}]);
