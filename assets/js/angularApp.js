

/**
 * Main module of the application.
 */

/*
//executes a function which every item in the array has
Array.prototype.callForEach = function(key) {
  var args = arguments.slice(1);
  this.forEach(function(item) {
    item.prototype[key].apply(item, args);
  });
};

Array.prototype.returnForEach = function(keys) { //String, e.i. 'data.elementId' to get an array with every item.data.elementId
  return this.map(function(item) {
    var allKeys = keys.split('.');
    var toReturn = item;

    allKeys.forEach(function(key) {
      toReturn = toReturn[key];
    });

    return toReturn;
  });
};
*/


var app = angular.module('GMAO Tailor', [ 'ngRoute', 'ui.router', 'ngMaterial' ]);

app.config(['$urlRouterProvider', '$stateProvider', '$locationProvider', 'USER_ROLES', function($urlRouterProvider, $stateProvider, $locationProvider, USER_ROLES) {

  /*$locationProvider.html5Mode({
      enabled: true,
      requireBase: false
  });*/

  // For any unmatched url, redirect to /home
  $urlRouterProvider.otherwise(function($injector, $location) {
    window.location.replace('/home');
  });

  // Now set up the states
  $stateProvider
    .state('auth', {
      url: '^/auth',
      templateUrl: 'templates/states/auth.html',
      controller: 'AuthCtrl',
      data: {
        authorizedRoles: USER_ROLES.all
      }
    })
    .state('profile', {
      url: '^/profile',
      templateUrl: 'templates/states/profile.html',
      controller: 'ProfileCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers
      }
    })
    .state('blueprint', {
      url: '^/blueprint?blueprintId&id&version', //blueprintId only if it's a new element
      templateUrl: 'templates/states/blueprint.html',
      controller: 'BlueprintCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers
      }
    })
    .state('blueprints-private', {
      url: '^/blueprints/private?selectCategory&searchGroups&searchGroupsSelect',
      templateUrl: 'templates/states/objects.html',
      controller: 'ObjectsCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers,
        name: 'blueprint',
        visibility: 'private',
        filters: []
      }
    })
    .state('blueprints-public', {
      url: '^/blueprints/public',
      templateUrl: 'templates/states/objects.html',
      controller: 'ObjectsCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers,
        name: 'blueprint',
        visibility: 'public',
        filters: []
      }
    })
    .state('element', {
      url: '^/element?id&version',
      templateUrl: 'templates/states/element.html',
      controller: 'ElementCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers
      }
    })
    .state('elements-private', {
      url: '^/elements/private?selectCategory&searchGroups&searchGroupsSelect',
      templateUrl: 'templates/states/objects.html',
      controller: 'ObjectsCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers,
        name: 'element',
        visibility: 'private',
        filters: []
      }
    })
    .state('elements-public', {
      url: '^/elements/public',
      templateUrl: 'templates/states/objects.html',
      controller: 'ObjectsCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers,
        name: 'element',
        visibility: 'public',
        filters: []
      }
    })
    .state('group', {
      url: '^/group?id',
      templateUrl: 'templates/states/group.html',
      controller: 'GroupCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers
      }
    })
    .state('groups-private', {
      url: '^/groups/private?selectCategory&searchGroups&searchGroupsSelect',
      templateUrl: 'templates/states/objects.html',
      controller: 'ObjectsCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers,
        name: 'group',
        visibility: 'private',
        filters: [
          {
            name: 'Members Name',
            value: 'members.user.name'
          },
          {
            name: 'Members Level',
            value: 'members.level'
          }
        ]
      }
    })
    .state('groups-public', {
      url: '^/groups/public',
      templateUrl: 'templates/states/objects.html',
      controller: 'ObjectsCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers,
        name: 'group',
        visibility: 'public',
        filters: [
          {
            name: 'Members Name',
            value: 'members.user.name'
          },
          {
            name: 'Members Level',
            value: 'members.level'
          }
        ]
      }
    })
    .state('graph', {
      url: '^/graph/:id',
      templateUrl: 'templates/states/graph.html',
      controller: 'GraphCtrl',
      data: {
        authorizedRoles: USER_ROLES.allUsers
      }
    });

}])

/* Doesn't work

.config([ '$provide', function($provide) { //$q returns a promise which can be reach with then(fn, fn, fn) and now with success(fn) and error(fn)

  $provide.decorator('$q', [ '$delegate', function($delegate) {
    var defer = $delegate.defer;
    $delegate.defer = function() {
      var deferred = defer();
      deferred.promise.success = function(fn) {
        deferred.promise.then(function(response) {
          fn(response.data, response.status, response.headers);
        });
      return deferred.promise;
      };
      deferred.promise.error = function(fn) {
        deferred.promise.then(null, function(response) {
          fn(response.data, response.status, response.headers);
        });
        return deferred.promise;
      };
      return deferred;
    };
    return $delegate;
  }]);

}])

*/

.run([ '$window', '$rootScope', 'AUTH_EVENTS', 'USER_ROLES', 'AuthService', function($window, $rootScope, AUTH_EVENTS, USER_ROLES, AuthService) {

  paper.install(window); //Make the paper scope global, by injecting it into window

  function stateChangeStart() {
    $rootScope.$on('$stateChangeStart', function(event, next) {
      var authorizedRoles = next.data.authorizedRoles;

      if (!AuthService.isAuthorized(authorizedRoles) && authorizedRoles !== USER_ROLES.all) {
        event.preventDefault();

        if (AuthService.isAuthenticated()) {
          //user is not allowed
          $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);

        } else {
          //user is not logged in so he will need to log in or register
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, next.name);
        }
      }

    });
  }

  //if there is a token then auto log in
  if ($window.localStorage.token) {
    AuthService.currentUser(stateChangeStart); //defer until auto log in
  } else {
    stateChangeStart();
  }
}])

.config([ '$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push([
    '$injector',
    function($injector) {
      return $injector.get('AuthInterceptor');
    }
  ]);
}])

.factory('AuthInterceptor', [ '$window', '$rootScope', '$q', 'AUTH_EVENTS', function($window, $rootScope, $q, AUTH_EVENTS) {

  return {

    request: function (config) {
      config.headers = config.headers || {};
      if ($window.localStorage.token) {
        config.headers.authorization = 'Bearer ' + $window.localStorage.token;
      }
      return config;
    },

    responseError: function(response) {
      if (response.status == 419 || response.status == 440) delete $window.localStorage.token;

      if ([ 401, 403, 419, 440 ].indexOf(response.status) > -1) {
        $rootScope.$broadcast({
          401: AUTH_EVENTS.notAuthenticated,
          403: AUTH_EVENTS.notAuthorized,
          419: AUTH_EVENTS.sessionTimeout,
          440: AUTH_EVENTS.sessionTimeout
        }[response.status], response);

        return $q.reject(response);
      }
    }
  };
}]);



angular.module('GMAO Tailor').controller('ConfirmDeleteDialogCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {

  $scope.name = name;

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.validate = function() {
    $mdDialog.hide();
  };

}]);



angular.module('GMAO Tailor').controller('NewLayerDialogCtrl', ['$scope', '$timeout', '$mdDialog', function($scope, $timeout, $mdDialog) {

  $scope.layer = {}; //the new layer

  function focus() {
    document.getElementById('newLayerName').focus();
  }
  $timeout(focus, 501);

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.validate = function() {
    $mdDialog.hide($scope.layer);
  };

}]);



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


angular.module('GMAO Tailor').constant('AUTH_EVENTS', {

    updateUserSuccess: 'update-user-success',

    loginSuccess: 'auth-login-success',

    loginFailed: 'auth-login-failed',

    registerSuccess: 'auth-register-success',

    registerFailed: 'auth-register-failed',

    sessionTimeout: 'auth-session-timeout',

    notAuthenticated: 'auth-not-authenticated',

    notAuthorized: 'auth-not-authorized'

});


angular.module('GMAO Tailor').constant('USER_ROLES', {

    all: '*', //absolutely anyone even visitors

    allUsers: [ 'user', 'modo', 'admin' ], //anyone logged in

    user: ['user'],

    modo: ['modo'],

    admin: ['admin']

});


angular.module('GMAO Tailor').constant('CONTEXTMENUCONTENT', [

    {
      name: 'Comparators',
      content: [ 'egal', 'higher', 'lower', 'higherOrEgal', 'lowerOrEgal' ]
    },

    {
      name: 'Functions',
      content: [
        {
          name: 'Array',
          content: [ 'indexOf' ]
        },

        {
          name: 'String',
          content: [ 'concat', 'matchByString', 'matchByRegHex' ]
        }
      ]
    },

    {
      name: 'Opperators',
      content: [ 'addition', 'substraction', 'multiplication', 'division', 'modulo' ]
    },

    {
      name: 'Parameters',
      content: [ 'boolOption', 'enum', 'property', 'RegHex', 'selection' ]
    },

    {
      name: 'Primary',
      content: [ 'array', 'bool', 'date', 'number', 'object', 'string' ]
    },

    {
      name: 'User Inputs',
      content: [ 'Input_Array', 'Input_Blueprint', 'Input_Boolean', 'Input_Date', 'Input_Number', 'Input_Object', 'Input_Selector', 'Input_String' ]
    },

    {
      name: 'Variables',
      content: [ 'parameter', 'return' ]
    }

]);


angular.module('GMAO Tailor').controller('AppCtrl', ['$scope', '$state', '$mdMedia', 'AUTH_EVENTS', 'Socket', 'Contacts', 'Toast', function($scope, $state, $mdMedia, AUTH_EVENTS, Socket, Contacts, Toast) {

  $scope.sidenavLeft = {};
  $scope.sidenavRight = {};
  $scope.currentUser = null;
  $scope.socket = Socket;
  var toState = '';

  function setCurrentUser(event, user) {
    //backdrop hidden when higher than min-width
    $scope.sidenavLeft = { open: $scope.sidenavLeft.open || $mdMedia('min-width: 640px') };
    $scope.sidenavRight = { open: $scope.sidenavRight.open || $mdMedia('min-width: 960px') };

    $scope.currentUser = user;

    if (toState !== '') {
      $state.go(toState);
      toState = '';

    } else {
      if ($state.is('auth')) $state.go('elements-private'); //for the time being
    }
  }

  function onLogIn(event, user) {
    $scope.socket.connect();
    setCurrentUser(event, user);
  }

  $scope.searchFilter = function(selectBy, search) {
    var expression = {};
    expression[selectBy] = search; //ex: { id: 48} => every item with this property, only,  will be shown
    return expression;
  };


  //Contacts
  $scope.defContacts = Contacts.defContacts;
  $scope.Contacts = Contacts;


  $scope.$on(AUTH_EVENTS.loginSuccess, onLogIn);
  $scope.$on(AUTH_EVENTS.registerSuccess, onLogIn);
  $scope.$on(AUTH_EVENTS.updateUserSuccess, setCurrentUser);

  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event, wantedState) {
    //the state where the user wanted to go
    Toast.error('You need to log in to access this page.');
    $scope.currentUser = null;
    $state.go('auth');
  });

  $scope.$on(AUTH_EVENTS.sessionTimeout, function(event, response) {
    Toast.error(response.data);
    $scope.currentUser = null;
    $scope.socket.disconnect();
    $state.go('auth', {}, { reload: true, inherit: false });
  });

}]);


/**
 * Footer Controller
 */

angular.module('GMAO Tailor').controller('AppFooterCtrl', ['$scope', function($scope) {

}]);


/**
 * Header Controller
 */

angular.module('GMAO Tailor').controller('AppHeaderCtrl', ['$scope', '$state', '$mdSidenav', function($scope, $state, $mdSidenav) {

  //resize canvas to avoid bug on elements size
  function resizeCanvas() { //duplicata from BlueprintCtrl
    var event = document.createEvent('Event');

    // Define that the event name is 'build'.
    event.initEvent('resize', true, true);

    // target can be any Element or other EventTarget.
    window.dispatchEvent(event);
  }

  $scope.isState = function(stateName) {
    return $state.is(stateName);
  };

  $scope.toggleSidenav = function(navId) {
    $mdSidenav(navId) //easier to delay the resize (too soon otherwise)
      .toggle()
      .then(function(event, sidenav) {
        if ($scope.isState('blueprint')) resizeCanvas();
      });
  };

}]);


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


angular.module('GMAO Tailor').controller('AuthCtrl', [ '$scope', 'Toast', 'AuthService', function($scope, Toast, AuthService) {

  $scope.loginSubmit = function() {
    AuthService.login($scope.login, function(err, user) {
      if (err) {
        console.log(err);
        Toast.error(err);
      }
    });
  };

  $scope.registerSubmit = function() {
    AuthService.register($scope.register, function(err, user) {
      if (err) {
        console.log(err);
        Toast.error(err);
      }
    });
  };

}]);


angular.module('GMAO Tailor').controller('BlueprintCtrl', [ '$scope', '$http', '$timeout', '$state', 'Dialog', 'Toast', 'Element', 'Layer', 'Global', 'AllInstances', function($scope, $http, $timeout, $state, Dialog, Toast, Element, Layer, Global, AllInstances) {

  // Network Related
    function httpBlueprint(method, action, params, versionName, msg) {
      var config = {
        method: method,
        url: '/api/blueprint/' + action
      };
      config[ (method.toLowerCase() === 'get') ? 'params' : 'data' ] = params;

      $http(config)
        .success(function(blueprint) {
          console.log('success httpBlueprint', blueprint);
          $scope.blueprint = blueprint;

          $scope.loadBlueprint(versionName, msg);
        })
        .error(function(err) {
          console.log(err);
          Toast.error(err);
        });
    }

    function readBlueprint(id, versionName) {
      httpBlueprint('GET', 'read', { id: id }, versionName);
    }

    $scope.loadBlueprint = function(versionName, msg) {
      var version = $scope.blueprint.versions.find(function(version) { return version.name === versionName; }) || $scope.blueprint.versions[$scope.blueprint.versions.length - 1];

      //update url params without reload the state
      $state.transitionTo('.', { id: $scope.blueprint._id, version: version.name }, { location: true, inherit: true, relative: $state.$current, notify: false });

      Element.importAll(version.elements);
      Layer.importAll(version.layers);
      Connection.importAll(version.connections);

      $scope.current = {
        tab: 0,
        versionName: version.name,
        versionsName: $scope.blueprint.versions.map(function(version) { return version.name; }),
        notes: version.notes,
        todo: version.todo,
        layer: AllInstances.layer.All,
        element: {},
        definition: {}
      };

      Toast.success(msg || $scope.blueprint.name + ' (' + version.name + ') has been loaded !');
    };

    $scope.saveBlueprint = function() {
      var action = (typeof $scope.blueprint._id === 'undefined') ? 'write' : 'update';

      var blueprint = {
        name: $scope.blueprint.name,
        description: $scope.blueprint.description,
        access: $scope.blueprint.access,
        tags: $scope.blueprint.tags,
        _id: $scope.blueprint._id,
        version: {
          name: $scope.current.versionName,
          notes: $scope.current.notes,
          todo: $scope.current.todo,
          elements: Element.exportAll(),
          layers: Layer.exportAll(),
          connections: Connection.exportAll()
        }
      };

      console.log('$scope.blueprint', $scope.blueprint);

      httpBlueprint('POST', action, { blueprint: blueprint }, $scope.current.versionName, $scope.blueprint.name + ' (' + version.name + ') has been saved !');
    };

    $scope.deleteBlueprint = function(ev) {
      Dialog
        .confirmDelete(ev, 'Blueprint')
        .then(function() { //success : the user decides to crush down his blueprint
          $http
            .delete('/api/blueprint/delete', { params: { id: $scope.blueprint._id } })
            .success(function() {
              $state.go('blueprints-private');
            })
            .error(function(err) {
              console.log(err);
              Toast.error(err);
            });
        });
    };


  // Default objects
    $scope.blueprint = {
      name: '',
      description: '',
      tags: [],
      author: {
        name: $scope.currentUser.name,
        _id: $scope.currentUser._id
      },
      versions: [],
      access: {
        public: {
          blueprint: {
            read: false,
            update: false,
            delete: false
          },
          instance: {
            write: false
          }
        },
        users: [],
        groups: []
      },
      userAccess: {
        blueprint: {
          read: true,
          update: true,
          delete: true
        },
        instance: {
          write: true
        }
      }
    };


  // Fetch blueprint if params
    if (typeof $state.params.id !== 'undefined') readBlueprint($state.params.id, $state.params.version); //fetch the blueprint


  // Display Instances
    $scope.AllInstances = AllInstances;




  // Helpers properties
    $scope.current = {
      tab: 0,
      versionName: '0.0.0',
      versionsName: [],
      notes: '',
      todo: '',
      layer: AllInstances.layer.All,
      element: {},
      definition: {}
    };

    $scope.search = {
      text: {
        accessUsers: '',
        layers: '',
        layer: '',
        documentation: {
          in: '',
          out: ''
        }
      },
      select: {
        accessUsers: '$',
        layers: '$',
        layer: '$',
        documentation: {
          in: '$',
          out: '$'
        }
      }
    };



  // Right Sidenav View Helpers
    function loadElement(element) {
      $scope.current.element = element;
      $scope.current.definition = element.getDefinition();
    }

    $scope.openProperties = function(element) {
      loadElement(element);
      $scope.current.tab = 4;
    };

    $scope.openDocumentation = function(element) {
      loadElement(element);
      $scope.current.tab = 5;
    };

    $scope.openLayer = function(layer) {
      $scope.current.layer = layer;
      $scope.current.tab = 3;
    };

    $scope.isCurrentElementDefined = function() {
      return typeof $scope.current.element._id !== 'undefined';
    };

    $scope.versionValidation = function() {
      var pattern = new RegExp('^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$');
      return pattern.match($scope.current.version);
    };


  //Access Rights
    $scope.defaultRights = {
      user: {
        blueprint: {
          read: true,
          update: false,
          delete: false
        },
        instance: {
          write: false
        }
      },
      group: {
        blueprint: {
          read: true,
          update: false,
          delete: false
        },
        instance: {
          write: false
        }
      }
    };



  // Resize canvas to avoid bug on elements' size
    function resizeCanvas() {
      var event = document.createEvent('Event');

      // Define that the event name is 'resize'.
      event.initEvent('resize', true, true);

      // target can be any Element or other EventTarget.
      window.dispatchEvent(event);
    }

    $timeout(resizeCanvas);
}]);


angular.module('GMAO Tailor').controller('ElementCtrl', [ '$scope', '$http', '$state', 'Dialog', 'Toast', function($scope, $http, $state, Dialog, Toast) {

  // Code Mirror
  $scope.editorOptions = {
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    scrollbarStyle: 'simple',
    readOnly: false,
    tabSize: 2,
    smartIndent: true,
    mode: { name: "javascript", typescript: true },
    theme: 'monokai'
  };


  // Network Related

  function httpElement(method, action, params, versionName) {
    var config = {
      method: method,
      url: '/api/element/' + action
    };

    config[ (method.toLowerCase() === 'get') ? 'params' : 'data' ] = params || {};

    $http(config)
      .success(function(element) {
        element.versions.forEach(function(version) {
          version.properties.in.forEach(function(inProperty) {
            if (inProperty.validator === '') {
              inProperty.validator = defaultProperty.in.validator;
              inProperty.hasValidator = false;
            }
          });
          version.properties.out.forEach(function(outProperty) {
            if (outProperty.getter === '') {
              outProperty.getter = defaultProperty.out.getter;
              outProperty.hasGetter = false;
            }
          });
        });

        console.log('success httpElement', element);

        $scope.element = element;

        $scope.loadElement(versionName, true);
      })
      .error(function(err) {
        console.log(err);
        Toast.error(err);
      });
  }

  function readElement(id, versionName) {
    httpElement('GET', 'read', { id: id }, versionName);
  }

  $scope.loadElement = function(versionName, hideToast) {
    var version = $scope.element.versions.find(function(version) { return version.name === versionName; }) || $scope.element.versions[$scope.element.versions.length - 1];

    //update url params without reload the state
    $state.transitionTo('.', { id: $scope.element._id, version: version.name }, { location: true, inherit: true, relative: $state.$current, notify: false });

    $scope.current = {
      tab: 0,
      versionName: version.name,
      versionsName: $scope.element.versions.map(function(version) { return version.name; }),
      notes: version.notes,
      todo: version.todo,
      properties: version.properties,
      property: angular.copy(defaultProperty)
    };

    if (!hideToast) Toast.success($scope.element.name + ' (' + version.name + ') has been loaded !');
  };

  $scope.saveElement = function() {
    if ($scope.current.properties.in.length + $scope.current.properties.out.length > 0) {
      var action = (typeof $scope.element._id === 'undefined') ? 'write' : 'update';

      var element = {
        name: $scope.element.name,
        description: $scope.element.description,
        tags: $scope.element.tags,
        access: $scope.element.access,
        version: {
          name: $scope.current.versionName,
          notes: $scope.current.notes,
          todo: $scope.current.todo,
          properties: {
            in: $scope.current.properties.in.map(function(property) {
              return {
                name: property.name,
                description: property.description,
                helper: property.helper,
                type: property.type,
                required: property.required,
                multiple: property.multiple,
                validator: (property.hasValidator) ? property.validator : ''
              };
            }),
            out: $scope.current.properties.out.map(function(property) {
              return {
                name: property.name,
                description: property.description,
                helper: property.helper,
                type: property.type,
                required: property.required,
                getter: (property.hasGetter) ? property.getter : ''
              };
            })
          }
        }
      };

      if (typeof $scope.element._id !== 'undefined') element._id = $scope.element._id;

      console.log('element', element);

      httpElement('POST', action, { element: element }, $scope.current.versionName);
      Toast.success($scope.element.name + ' has been saved !');
    } else {
      Toast.error($scope.element.name + ' has no properties.');
    }
  };

  $scope.deleteElement = function(ev) {
    Dialog
      .confirmDelete(ev, 'Element')
      .then(function() { //success : the user decides to crush down his element
        $http
          .delete('/api/element/delete', { params: { id: $scope.element._id } })
          .success(function() {
            $state.go('elements-private');
          })
          .error(function(err) {
            console.log(err);
            Toast.error(err);
          });
      });
  };


  // Default objects

  var defaultProperty = {
    in: {
      name: '',
      description: '',
      helper: '',
      type: [ 'all' ],
      required: false,
      multiple: false,
      hasValidate: false,
      validator:
        '\n/**\n' +
        ' *  A Function to test if a connection with this In property and\n' +
        ' *  an Out property from another element is valid\n' +
        ' *  If valid the connection will be created else it will not\n' +
        ' *  and a message explaining the issue will be displayed.\n' +
        ' *  \n' +
        ' *  Note: A connection can only be made from an In property to an Out property\n' +
        '**/\n\n' +

        'function(property, outProperty, inProperties) {\n' +
        '  // inProperties corresponds to all the others In properties\n\n' +

        '  /** property/outProperty or property from inProperties looks like that :\n' +
        '   *  {\n' +
        '   *     name: String,\n' +
        '   *     description: String,\n' +
        '   *     helper: String,\n' +
        '   *     type: [ String ],\n' +
        '   *     required: Bool,\n' +
        '   *     \n' +
        '   *     // only property has a multiple attribute\n' +
        '   *     multiple: Bool,\n' +
        '   *     \n' +
        '   *     // only outProperty and property from inProperties has a value attribute.\n' +
        '   *     // outProperty will carry its value to property if the validation is successful\n' +
        '   *     // like every property from inProperties\n' +
        '   *     value: anything\n' +
        '   * }\n' +
        '  **/\n\n' +

        '  // return true -> validation successful\n' +
        '  // return false -> error with a generic message\n' +
        '  // return String -> error with a custom message\n' +
        '  return true;\n' +
        '}', //function to eval
      _id: null
    },
    out: {
      name: '',
      description: '',
      helper: '',
      type: [ 'all' ],
      required: false,
      hasGetValue: false,
      getter:
        '\n/**\n' +
        ' *  A Function to test if a connection with this In property and\n' +
        ' *  an Out property from another element is valid\n' +
        ' *  If valid the connection will be created else it will not\n' +
        ' *  and a message explaining the issue will be displayed.\n' +
        ' *  \n' +
        ' *  Note: A connection can only be made from an In property to an Out property\n' +
        '**/\n\n' +

        'function(property, outProperty, inProperties) {\n' +
        '  // inProperties corresponds to all the others In properties\n\n' +

        '  /** property/outProperty or property from inProperties looks like that :\n' +
        '   *  {\n' +
        '   *     name: String,\n' +
        '   *     description: String,\n' +
        '   *     helper: String,\n' +
        '   *     type: [ String ],\n' +
        '   *     required: Bool,\n' +
        '   *     \n' +
        '   *     // only property has a multiple attribute\n' +
        '   *     multiple: Bool,\n' +
        '   *     \n' +
        '   *     // only outProperty and property from inProperties has a value attribute.\n' +
        '   *     // outProperty will carry its value to property if the validation is successful\n' +
        '   *     // like every property from inProperties\n' +
        '   *     value: anything\n' +
        '   * }\n' +
        '  **/\n\n' +

        '  // return true -> validation successful\n' +
        '  // return false -> error with a generic message\n' +
        '  // return String -> error with a custom message\n' +
        '  return true;\n' +
        '}',
      _id: null
    }
  };

  $scope.element = {
    name: '',
    description: '',
    tags: [],
    author: {
      name: $scope.currentUser.name,
      _id: $scope.currentUser._id
    },
    versions: [],
    access: {
      public: {
        element: {
          read: false,
          use: false,
          update: false,
          delete: false
        }
      },
      users: [],
      groups: []
    },
    userAccess: {
      element: {
        read: true,
        use: true,
        update: true,
        delete: true
      }
    }
  };


  // Fetch the element if params

  if (typeof $state.params.id !== 'undefined') readElement($state.params.id, $state.params.version);


  // Helpers properties

  $scope.types = [
    'all',
    'bool',
    'color',
    'date',
    'file',
    'image',
    'number',
    'text'
  ];

  $scope.search = {
    text: {
      properties: {
        in: '',
        out: ''
      }
    },
    select: {
      properties: {
        in: '$',
        out: '$'
      }
    }
  };

  $scope.current = {
    tab : 0,
    versionName: '0.0.0',
    versionsName: [],
    notes: '',
    todo: '',
    selected: {
      in: '',
      out: ''
    },
    text: {
      in: '',
      out: ''
    },
    properties: {
      in: [],
      out: []
    },
    property: angular.copy(defaultProperty)
  };


  // Property

  var ids = { //easier to initialize it with a value which will be the max value; -1 -> 0
    in: [ -1 ],
    out: [ -1 ]
  };

  $scope.loadProperty = function(side, property) {
    $scope.current.property[side] = property;
    $scope.current.tab = (side === 'in') ? 2 : 4;
  };

  $scope.removeProperty = function(side, property, index) {
    if (property._id === $scope.current.property[side]._id) $scope.clearProperty(side);

    delete $scope.current.properties[side][index];
  };

  $scope.clearProperty = function(side) { // side: 'in' or 'out'
    $scope.current.property[side] = angular.copy(defaultProperty[side]);
  };

  $scope.submitProperty = function(side) {
    var currentProperty = $scope.current.property[side];

    if (currentProperty._id) { //update
      var foundProperty = $scope.current.properties[side].find(function(property) {
        return property._id === currentProperty._id;
      });

      if (typeof foundProperty !== 'undefined') {
        foundProperty = currentProperty;
        $scope.current.tab = (side === 'in') ? 1 : 3;
        $scope.clearProperty(side);

      } else { //err
        Toast.error('The property cannot be updated : it does not exist anymore. Click another time to add it as a new property');
        currentProperty._id = null;
      }

    } else { //add
      currentProperty._id =  Math.max.apply(null, ids[side]) + 1;
      ids[side].push(currentProperty._id);

      $scope.current.properties[side].push(currentProperty);
      $scope.current.tab = (side === 'in') ? 1 : 3;
      $scope.clearProperty(side);
    }
  };


  //Access Rights
  $scope.defaultRights = {
    user: {
      element: {
        read: true,
        use: true,
        update: false,
        delete: false
      }
    },
    group: {
      element: {
        read: true,
        use: false,
        update: false,
        delete: false
      }
    }
  };

}]);


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


angular.module('GMAO Tailor').controller('HomeCtrl', ['$scope', function($scope) {


}]);


angular.module('GMAO Tailor').controller('ObjectsCtrl', [ '$http', '$scope', '$state', 'Toast', function($http, $scope, $state, Toast) {

  $scope.name = $state.current.data.name + 's';
  $scope.filters = $state.current.data.filters;

  $scope.selectCategory = $state.params.selectCategory || '';
  $scope.search = {
    text: {
      groups: $state.params.searchGroups || ''
    },
    select: {
      groups: $state.params.searchGroupsSelect || '$'
    }
  };

  $http
    .get('/api/' + $scope.name + '/' + $state.current.data.visibility)
    .success(function(objects) {
      console.log(objects);
      $scope.categories = Object.keys(objects);
      $scope.objects = objects;

      $scope.categories.forEach(function(category) { //to have the search defined for each category
        $scope.search.text[category] = '';
        $scope.search.select[category] = $scope.search.select[category] || '$'; //to handle url params
      });
    })
    .error(function(err) {
      console.log(err);
      Toast.error(err);
    });

  $scope.goToObject = function(id) {
    $state.go($state.current.data.name, { id: id });
  };

}]);


angular.module('GMAO Tailor').controller('ProfileCtrl', [ '$scope', 'AuthService', function($scope, AuthService) {

  $scope.profile = {
    name: $scope.currentUser.name,
    email: $scope.currentUser.email,
    oldPassword: '',
    password: ''
  };

  //directive avatar
  $scope.url = '/api/user/update';
  $scope.defaultSrc = '/avatars/users/' + $scope.currentUser._id;


  $scope.clearProfile = function() {
    $scope.profile = {
      name: $scope.currentUser.name,
      email: $scope.currentUser.email,
      oldPassword: '',
      password: ''
    };

    $scope.avatarSrc = $scope.defaultSrc.slice();
  };

  $scope.submitProfile = function() {
    $scope.submitForm($scope.profile)
      .then(function(res) { //success
        AuthService.updateUser(res);
      });
  };

}]);


angular.module('GMAO Tailor').directive('accessRights', function() {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      'access': '=',
      'defaultRights': '=',
      'author': '=',
    },
    templateUrl: '/templates/directives/accessRights.html',
    controller: [ '$scope', 'Contacts', function($scope, Contacts) {

      Contacts.defContacts('users');
      Contacts.defContacts('groups');
      $scope.Contacts = Contacts;

      $scope.searchFilter = function(selectBy, search) {
        var expression = {};
        expression[selectBy] = search; //ex: { id: 48} => every item with this property, only,  will be shown
        return expression;
      };


      //Rights Model
        $scope.models = [];
        angular.forEach($scope.defaultRights.user, function(value, key) {
          $scope.models.push({ name: key, rights: Object.keys(value) });
        });


      //Utilities (view only)
        $scope.rights = {
          write: { name: 'Create', class: 'fa-plus' },
          read: { name: 'See', class: 'fa-eye' },
          use: { name: 'Use', class: 'fa-hand-grab-o' },
          update: { name: 'Update', class: 'fa-pencil' },
          delete: { name: 'Delete', class: 'fa-trash-o' }
        };

        $scope.checked = true;


      //Constructor
        function Handler(type) { //type : 'user' || 'group'
          var _this = this;

          this.type = type;
          this.contact = {}; //this.user || this.group
          this.contacts = []; //this.users || this.groups

          this.searchText = '';
          this.selectedItem = '';

          this.filter = function(contact, index, array) {
            if (contact.name.toLowerCase().indexOf(_this.searchText.toLowerCase()) > -1 && $scope.author._id !== contact._id) {
              return $scope.access[_this.type + 's'].every(function(accessContact) {
                return accessContact[_this.type]._id !== contact._id;
              });
            }
          };

          this.load = function() {
            this.contact = { access: angular.merge({}, $scope.defaultRights[this.type]) }; //e.i. contact.access
            this.contact[this.type] = { //e.i. contact.user
              name: this.contacts[0].name,
              _id: this.contacts[0]._id
            };
          };

          this.clear = function() {
            this.contact = {};
            this.contacts = [];
          };

          this.addContact = function() {
            $scope.access[this.type + 's'].push(this.contact);
            this.clear();
          };

          this.removeContact = function(contact) {
            $scope.access[this.type + 's'].splice($scope.access[this.type + 's'].indexOf(contact), 1);
          };

        }


      //Init
        $scope.Access = {
          user: new Handler('user'),
          group: new Handler('group')
        };

    }]
  };
});

angular.module('GMAO Tailor').directive('avatar', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: false,
    template:
      '<div class="avatar-container">' +
        '<img ng-src="{{avatarSrc}}" />' +
        '<md-button class="avatar-button md-error" ng-show="avatarSrc !== defaultSrc" ng-click="restoreAvatar()">' +
          '<i class="fa fa-refresh" aria-hidden="true"></i>' +
          '<span>Avatar</span>' +
        '</md-button>' +
        '<div ng-show="avatarSrc === defaultSrc">' +
          '<input id="input-avatar" type="file" accept="image/*">' +
          '<label for="input-avatar" class="avatar-button md-button md-raised md-primary">' +
            '<i class="fa fa-upload" aria-hidden="true"></i>' +
            '<span>Avatar</span>' +
          '</label>' +
        '</div>' +
      '</div>',
    controller: [ '$scope', '$q', '$http', 'Toast', function($scope, $q, $http, Toast) {

      $scope.restoreAvatar = function() {
        $scope.avatarSrc = $scope.defaultSrc.slice();
      };

      var inputAvatar =  document.getElementById('input-avatar');
      $scope.restoreAvatar(); //init

      // scales the image by (float) scale < 1
      // returns a canvas containing the scaled image.
      function downScaleImage(img, size) {
          var imgCV = document.createElement('canvas');
          imgCV.width = img.width;
          imgCV.height = img.height;
          var imgCtx = imgCV.getContext('2d');
          imgCtx.drawImage(img, 0, 0);
          return downScaleCanvas(imgCV, size);
      }

      // scales the canvas by (float) scale < 1
      // returns a new canvas containing the scaled image.
      function downScaleCanvas(cv, size) {
          var xScale = size / cv.width;
          var yScale = size / cv.height;
          var sqScale = xScale * yScale; // square scale = area of source pixel within target
          var sw = cv.width; // source image width
          var sh = cv.height; // source image height
          var tw = size; // target image width
          var th = size; // target image height
          var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
          var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
          var tX = 0, tY = 0; // rounded tx, ty
          var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
          // weight is weight of current source point within target.
          // next weight is weight of current source point within next target's point.
          var crossX = false; // does scaled px cross its current px right border ?
          var crossY = false; // does scaled px cross its current px bottom border ?
          var sBuffer = cv.getContext('2d').
          getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
          var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
          var sR = 0, sG = 0,  sB = 0; // source's current point r,g,b
          /* untested !
          var sA = 0;  //source alpha  */

          for (sy = 0; sy < sh; sy++) {
              ty = sy * yScale; // y src position within target
              tY = 0 | ty;     // rounded : target pixel's y
              yIndex = 3 * tY * tw;  // line index within target array
              crossY = (tY != (0 | ty + yScale));
              if (crossY) { // if pixel is crossing bottom target pixel
                  wy = (tY + 1 - ty); // weight of point within target pixel
                  nwy = (ty + yScale - tY - 1); // ... within y+1 target pixel
              }
              for (sx = 0; sx < sw; sx++, sIndex += 4) {
                  tx = sx * xScale; // x src position within target
                  tX = 0 | tx;    // rounded : target pixel's x
                  tIndex = yIndex + tX * 3; // target pixel index within target array
                  crossX = (tX != (0 | tx + xScale));
                  if (crossX) { // if pixel is crossing target pixel's right
                      wx = (tX + 1 - tx); // weight of point within target pixel
                      nwx = (tx + xScale - tX - 1); // ... within x+1 target pixel
                  }
                  sR = sBuffer[sIndex    ];   // retrieving r,g,b for curr src px.
                  sG = sBuffer[sIndex + 1];
                  sB = sBuffer[sIndex + 2];

                  /* !! untested : handling alpha !!
                     sA = sBuffer[sIndex + 3];
                     if (!sA) continue;
                     if (sA != 0xFF) {
                         sR = (sR * sA) >> 8;  // or use /256 instead ??
                         sG = (sG * sA) >> 8;
                         sB = (sB * sA) >> 8;
                     }
                  */
                  if (!crossX && !crossY) { // pixel does not cross
                      // just add components weighted by squared scale.
                      tBuffer[tIndex    ] += sR * sqScale;
                      tBuffer[tIndex + 1] += sG * sqScale;
                      tBuffer[tIndex + 2] += sB * sqScale;
                  } else if (crossX && !crossY) { // cross on X only
                      w = wx * yScale;
                      // add weighted component for current px
                      tBuffer[tIndex    ] += sR * w;
                      tBuffer[tIndex + 1] += sG * w;
                      tBuffer[tIndex + 2] += sB * w;
                      // add weighted component for next (tX+1) px
                      nw = nwx * yScale;
                      tBuffer[tIndex + 3] += sR * nw;
                      tBuffer[tIndex + 4] += sG * nw;
                      tBuffer[tIndex + 5] += sB * nw;
                  } else if (crossY && !crossX) { // cross on Y only
                      w = wy * xScale;
                      // add weighted component for current px
                      tBuffer[tIndex    ] += sR * w;
                      tBuffer[tIndex + 1] += sG * w;
                      tBuffer[tIndex + 2] += sB * w;
                      // add weighted component for next (tY+1) px
                      nw = nwy * xScale;
                      tBuffer[tIndex + 3 * tw    ] += sR * nw;
                      tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                      tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                  } else { // crosses both x and y : four target points involved
                      // add weighted component for current px
                      w = wx * wy;
                      tBuffer[tIndex    ] += sR * w;
                      tBuffer[tIndex + 1] += sG * w;
                      tBuffer[tIndex + 2] += sB * w;
                      // for tX + 1; tY px
                      nw = nwx * wy;
                      tBuffer[tIndex + 3] += sR * nw;
                      tBuffer[tIndex + 4] += sG * nw;
                      tBuffer[tIndex + 5] += sB * nw;
                      // for tX ; tY + 1 px
                      nw = wx * nwy;
                      tBuffer[tIndex + 3 * tw    ] += sR * nw;
                      tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                      tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                      // for tX + 1 ; tY +1 px
                      nw = nwx * nwy;
                      tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                      tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                      tBuffer[tIndex + 3 * tw + 5] += sB * nw;
                  }
              } // end for sx
          } // end for sy

          // create result canvas
          var resCV = document.createElement('canvas');
          resCV.width = tw;
          resCV.height = th;
          var resCtx = resCV.getContext('2d');
          var imgRes = resCtx.getImageData(0, 0, tw, th);
          var tByteBuffer = imgRes.data;
          // convert float32 array into a UInt8Clamped Array
          var pxIndex = 0; //
          for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
              tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
              tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
              tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
              tByteBuffer[tIndex + 3] = 255;
          }
          // writing result to canvas.
          resCtx.putImageData(imgRes, 0, 0);
          return resCV;
      }

      var reader = new FileReader();
      reader.onload = function (event) {
        var image = new Image();
        image.src = event.target.result;

        image.onload = function() {
          var canvas = downScaleImage(image, 128);
          var dataUrl = canvas.toDataURL(inputAvatar.files[0].type);

          $scope.avatarSrc = dataUrl; //display the new avatar
          delete inputAvatar.files[0];

          $scope.$apply();
        };
      };

      inputAvatar.onchange = function() {
        var newAvatar = inputAvatar.files[0];
        if (typeof newAvatar !== 'undefined') {
          if (newAvatar.type.indexOf('image') === 0) { //the type start by 'image/*'
            reader.readAsDataURL(newAvatar); //trigger reader.onload() and resize the avatar to $scope.avatarSrc
          } else {
            delete inputAvatar.files[0];
            Toast.error('An image is expected.');
          }
        }
      };

      $scope.submitForm = function(params) {
        return $q(function(resolve, reject) {
           var url = (typeof $scope.url === 'function') ? $scope.url() : $scope.url;
           if ($scope.avatarSrc !== $scope.defaultSrc) params.avatar = $scope.avatarSrc;

            $http
              .post(url, params)
              .success(function(res) {
                Toast.success('Saved !');
                $scope.restoreAvatar(); //now the new avatar is the default

                return resolve(res);
              })
              .error(function(err) {
                console.log(err);
                Toast.error(err);

                return reject(err);
              });

        });
      };


    }]
  };
});


angular.module('GMAO Tailor').directive('codeMirror', function() {
  return {
    restrict: 'A',
    scope:  {
      options: '=',
      val: '='
    },
    link: function(scope, elements, attrs) {
      var myCodeMirror = CodeMirror.fromTextArea(elements[0], scope.options);

      myCodeMirror.setValue(scope.val);

      scope.$watch('val', function(newValue, oldValue, scope) {
        myCodeMirror.setValue(newValue);
      });

      scope.$watch('options.theme', function(newValue, oldValue, scope) {
        myCodeMirror.setOption('theme', newValue);
      });
    }
  };
});


angular.module('GMAO Tailor').directive('contextMenu', [ function() {

  return {
    restrict: 'EA',
    replace: true,
    templateUrl: '/templates/directives/contextMenu.html',
    require: 'mdMenu',
    controller: [ '$scope', '$http', 'Definition', 'Element', function($scope, $http, Definition, Element) {
      $scope.lists = [];

      $http
        .get('/api/contextmenu')
        .success(function(data) {
          console.log('contextmenu', data);
          $scope.lists = data.lists;// { name: String, description: String, elements: [ { version, definition: { name, _id } } ] }
          Definition.import(data.definitions);
        })
        .error(function(err) {
          console.log(err);
        });

      $scope.createElement = function(definitionId, versionName) {
        new Element({ definition: definitionId, version: versionName });
      };
    }]
  };

}]);

/**
 * @name ng-scrollbar
 * @author angrytoro
 * @since 9/12/2014
 * @version 0.1
 * @beta 0.2
 * @see https://github.com/angrytoro/ngscrollbar
 * @copyright 2014 angrytoro
 * @license MIT: You are free to use and modify this code, on the condition that this copyright notice remains.
 *
 * @description The angular directive ng-scrollbar imitate the true browser scrollbar.
 * It's applied to the element which set height or width attribute and the overflow is auto, but exclude body element.
 * It's not necessary to imitate scrollbar for body element, if you use the AngularJS.
 * suggests: don't use the directive, if you don't have to. The scrollbar which is inbuilt in browser is more highly-efficient.
 * AngularJS is not fit for IE which version is less then 9, so the directive is not fit the IE(8,7,6,5).
 *
 *
 * @example
 * <div ng-scroll scrollbar-x="false" scrollbar-y="true" scroll-config="{ overlay: true, autoResize: true, size: 'small', dragSpeed: 1.2 }">
 *     <div>Any Content</div>
 * </div>
 *
 * @conf spec
 * scrollbar-x the value is true or false, to configure the x scrollbar create or no create, the default value is true. but the directive can decide whether it need be created if user not set the attribute.
 *
 * scrollbar-y the value is true or false, to configure the y scrollbar create or no create, the default value is true. but the directive can decide whether it need be created if user not set the attribute.
 *
 * scroll-config
 * default config is
 *
 * {
 *      dragSpeed: 1, //default browser delta value is 120 or -120
        autoResize: false, // if need auto resize, default false
        overlay: false, // if need show when mouse not enter the container element which need scrollbar, default false.
        size: 'small' //enum : 'small', 'medium', 'large'
 * }
 *
 */

angular.module('GMAO Tailor').directive('ngScroll', [
    function() {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
                scrollConfig: '=',
                scrollbarX: '@', // the value is true or false, to configure the x scrollbar create or no create.
                scrollbarY: '@' // the value is true or false, to configure the y scrollbar create or no create.
            },
            template: '<div class="ngscroll" ng-class="{ \'ngscroll-overlay\': config.overlay, \'small\': config.size === \'small\', \'medium\': config.size === \'medium\', \'large\': config.size === \'large\' }">' +
                            '<div class="ngscroll-content-container" ng-transclude>' +
                            '</div>' +
                            '<ng-scrollbar scrollbar-axis="x" ng-if="scrollbarX || scrollbarX === undefined"></ng-scrollbar>' +
                            '<ng-scrollbar scrollbar-axis="y" ng-if="scrollbarY || scrollbarY === undefined"></ng-scrollbar>' +
                            '<div class="ng-scrollbar-filler" ng-hide="(scrollbarX || scrollbarX === undefined) && (scrollbarY || scrollbarY === undefined)"></div>' +
                       '</div>',
            controller: function() {
                //nothing to do
            },
            compile: function(element) {
                element.css('overflow', 'hidden');
                return function(scope, element, attrs, ctrl) {

                    var defaultConfig = {
                        dragSpeed: 1, //default browser delta value is 120 or -120
                        autoResize: false, // if need auto resize, default false
                        overlay: false, // if need show when mouse not enter the container element which need scrollbar, default false.
                        size: 'small'
                    };

                    ctrl.config = angular.copy(angular.extend(defaultConfig, scope.scrollConfig || {}));
                    scope.config = ctrl.config;

                    scope.$watch('scrollConfig', function(newValue, oldValue, scope) {
                        ctrl.config = angular.extend(defaultConfig, newValue || {});
                        scope.config = ctrl.config;
                    });

                    ctrl.containerElement = element;
                    ctrl.contentElement = angular.element(element[0].querySelector('.ngscroll-content-container'));
                };
            }
        };
    }
])
.directive('ngScrollbar', [ '$timeout', function($timeout) {
    return {
        restrict: 'AE',
        replace: true,
        require: '^?ngScroll',
        scope: {
          'scrollbarAxis': '@'
        },
        template: '<div class="ngscrollbar-container ngscrollbar-container-{{scrollbarAxis}}"><div class="ngscrollbar"></div></div>',
        compile: function() {
            return function(scope, element, attrs, ctrl) {

                var docEl = angular.element(document),
                    side = (scope.scrollbarAxis === 'x') ? { name: 'width', offsetName: 'offsetWidth', screenAxis: 'screenX', direction: 'left', margin: 'margin-left' } : { name: 'height', offsetName: 'offsetHeight', screenAxis: 'screenY', direction: 'top', margin: 'margin-top' },
                    scrollbar = angular.element(element[0].querySelector('.ngscrollbar'));

                function getContentOffset() {
                    //console.log('getContentOffset', ctrl.contentElement[0][side.offsetName]);
                    return ctrl.contentElement[0][side.offsetName];
                }

                function getContainerOffset() {
                    //console.log('getContainerOffset', ctrl.containerElement[0][side.offsetName]);
                    return ctrl.containerElement[0][side.offsetName];
                }


                function reset() {
                    var oldMargin = parseInt(ctrl.contentElement.css(side.margin), 10);
                    ctrl.contentElement.css(side.margin, '0px');
                    if (getContentOffset() > getContainerOffset()) { //if is overflow
                        element.css('display', 'block');
                        scrollbar.css(side.name, Math.pow(getContainerOffset(), 2) / getContentOffset() + 'px'); //scrollbar offset
                        scrollTo(oldMargin);
                    } else {
                        element.css('display', 'none');
                    }
                }

                function scrollTo(offset) {
                    offset = Math.min(0, Math.max(offset, getContainerOffset() - getContentOffset()));
                    ctrl.contentElement.css(side.margin, offset + 'px');
                    scrollbar.css(side.direction, -offset / getContentOffset() * getContainerOffset() + 'px');
                }

                function scroll(distance) {
                    var offset = parseInt(ctrl.contentElement.css(side.margin), 10) + distance;
                    scrollTo(offset);
                }


                var offset,
                    scrollbarMousedown = false;

                scrollbar.on('mousedown', function(event) {
                    event.preventDefault();
                    scrollbarMousedown = true;
                    offset = event[side.screenAxis];
                    docEl.one('mouseup', function() {
                        scrollbarMousedown = false;
                    });
                });

                docEl.on('mousemove', function(event) {
                    if (scrollbarMousedown) {
                        event.preventDefault();
                        scroll(-(event[side.screenAxis] - offset) * ctrl.config.dragSpeed * getContentOffset() / getContainerOffset());
                        offset = event[side.screenAxis];
                    }
                });

                $timeout(function() {
                    reset();
                    if (!!document.createStyleSheet) { //if the browser is ie browser
                        ctrl.contentElement.on('DOMNodeInserted', reset);
                        ctrl.contentElement.on('DOMNodeRemoved', reset);
                    } else {
                        var observer = new MutationObserver(function(mutations) {
                            if (mutations.length) {
                                reset();
                            }
                        });
                        observer.observe(ctrl.contentElement[0], { childList: true, subtree: true });
                    }
                }, 5);

                // Redraw the scrollbar when window size changes.
                if (ctrl.config.autoResize) {
                    // Closure to guard against leaking variables.
                    (function() {
                        var redrawTimer;

                        angular.element(window).on('resize', function(e) {
                            if (redrawTimer) {
                                clearTimeout(redrawTimer);
                            }
                            redrawTimer = setTimeout(function() {
                                redrawTimer = null;
                                reset();
                            }, 50);
                        });
                    })();
                }


                /* Only for the vertical scrollbar */
                if (scope.scrollbarAxis === 'y') {
                    ctrl.containerElement.on('mousewheel', function(event) {
                        if (getContentOffset() <= getContainerOffset()) { //if is not overflow
                            return;
                        }
                        event.preventDefault();
                        if (event.originalEvent !== undefined) {
                            event = event.originalEvent;
                        }
                        scroll(event.wheelDeltaY || event.wheelDelta);
                    });

                    if (window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0) {
                        ctrl.containerElement.on('wheel', function(event) {
                            if (getContentOffset() <= getContainerOffset()) { //if is not overflow
                                return;
                            }
                            event.preventDefault();
                            if (event.originalEvent !== undefined) {
                                event = event.originalEvent;
                            }
                            scroll(-event.deltaY * 40);// the ff delta value is 3 or -3 when scroll and the chrome or ie is -120 or 120, so it must multiply by 40
                        });
                    }
                }

            };
        }
    };
}]);

angular.module('GMAO Tailor').factory('AuthService', [ '$window', '$rootScope', '$http', 'AUTH_EVENTS', 'Session', function($window, $rootScope, $http, AUTH_EVENTS, Session) {

  return {

    currentUser: function(cb) { //with a callback if asynchrone
      return $http
        .get('/api/auth/user')
        .success(function(user) {
          console.log(user);
          Session.create(user.id, user.role);
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, user);
          if (typeof cb !== 'undefined') return cb(null, user);
          return user;
        })
        .error(function(err) {
          console.log('err', err);
          //Erase the token if the user fails to log in
          delete $window.localStorage.token;
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed, err);
          if (typeof cb !== 'undefined') return cb(err);
          return err;
        });
    },

    login: function(credentials, cb) { //with a callback if asynchrone
      return $http
        .post('/auth/login', credentials)
        .success(function(res) {
          console.log(res.user);
          $window.localStorage.token = res.token;
          Session.create(res.user.id, res.user.role);
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, res.user);
          if (typeof cb !== 'undefined') return cb(null, res.user);
          return res.user;
        })
        .error(function(err) {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed, err);
          if (typeof cb !== 'undefined') return cb(err);
          return err;
        });
    },

    register: function(credentials, cb) { //with a callback if asynchrone
      return $http
        .post('/auth/register', credentials)
        .success(function(res) {
          console.log(res.user);
          $window.localStorage.token = res.token;
          Session.create(res.user.id, res.user.role);
          $rootScope.$broadcast(AUTH_EVENTS.registerSuccess, res.user);
          if (typeof cb !== 'undefined') return cb(null, res.user);
          return res.user;
        })
        .error(function(err) {
          $rootScope.$broadcast(AUTH_EVENTS.registerFailed, err);
          if (typeof cb !== 'undefined') return cb(err);
          return err;
        });
    },

    updateUser: function(res, cb) {
      console.log(res.user);
      $window.localStorage.token = res.token;
      Session.create(res.user.id, res.user.role);
      $rootScope.$broadcast(AUTH_EVENTS.updateUserSuccess, res.user);
      if (typeof cb !== 'undefined') return cb(null, res.user);
      return res.user;
    },

    logout: function() {
      $http
        .post('/api/auth/logout')
        .success(function() {
          console.log('logout succeeded');
          delete $window.localStorage.token;
          window.location = '/home';
        })
        .error(function(err) {
          console.log('logout failed', err);
        });
    },

    isAuthenticated: function() {
      return Session.userId !== null;
    },

    isAuthorized: function(authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) authorizedRoles = [authorizedRoles];

      return (this.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1);
    }

  };

}]);


angular.module('GMAO Tailor').service('Contacts', [ '$http', 'Toast', function($http, Toast) {

  var _this = this;

  this.allUsers = [];
  this.allGroups = [];
  this.allUsersObject = {};
  this.allGroupsObject = {};

  this.defContacts = function(type) { //type === 'users' or 'groups'
    var typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

    if (_this[ 'all' + typeCapitalized ].length === 0) {
      $http
        .get('/api/' + type + '/all')
        .success(function(contacts) {
          typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1); //need to be redefined because it can change during the time before success is called

          _this[ 'all' + typeCapitalized ] = contacts;

          _this[ 'all' + typeCapitalized + 'Object' ] = {}; //easier to load contacts from a Blueprint          
          contacts.forEach(function(contact) {
            _this[ 'all' + typeCapitalized + 'Object' ][contact._id] = contact;
          });
        })
        .error(function(err) {
          console.log(err);
          Toast.error(err);
        });
    }
  };

}]);

angular.module('GMAO Tailor').service('Dialog', [ '$mdDialog', '$mdMedia', function($mdDialog, $mdMedia) {

  this.confirmDelete = function(ev, name) {
    return $mdDialog.show({
      controller: 'ConfirmDeleteDialogCtrl',
      templateUrl: '/templates/components/confirmDeleteDialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm')
    });
  };

}]);


angular.module('GMAO Tailor').service('Session', function() {

        //init
        this.userId = null;
        this.userRole = null;

        //functions
        this.create = function(userId, userRole) {
          this.userId = userId;
          this.userRole = userRole;
        };

        this.destroy = function() {
          this.userId = null;
          this.userRole = null;
        };

});

angular.module('GMAO Tailor').factory('Settings', [ function() {

  return {

    Connection: {
      default: {
        strokeColor: '#55aab6',
        strokeWidth: 2
      },
      hover: {
        strokeColor: '#4e919a',
        strokeWidth: 4
      }
    },

    Connector: {
      styles: {
        external: {
          default: {
            fillColor: 'rgba(255,255,255,0)',
            strokeColor: '#222222'
          },
          multiple: {
            fillColor: 'rgba(255,255,255,0)',
            strokeColor: '#c057eb'
          }
        },
        internal: {
          available: {
            fillColor: '#5ad97d'
          }
        }
      },
      hover: {
        scale: 1.2
      },
      rotating: {
        spin: 4
      }
    },

    view: {
      zoom : {
        value: 0.85,
        pitch: 0.1
      },
      move: {
        pitch: 1
      }
    },

    keybindings: { //[ keybindings ] === [ [key] ]
      toggleSelectAll: [  [ 'control', 'A' ], [ 'A' ]  ],
      inverseSelection: [ [ 'shift', 'A' ], [ 'Q' ] ],
      copySelected: [  [ 'control', 'C' ], [ 'C' ]  ],
      pasteCopied: [  [ 'control', 'V' ], [ 'V' ]  ],
      move: [ [] ], //no need to press a key (move the view)
      select: [  [ 'control' ]  ],
      deselect: [  [ 'shift' ]  ],
      restoreZoom: [  [ 'tab' ]  ],
      plusZoom: [  [ '+' ]  ],
      minusZoom: [  [ '-' ]  ],
      center: [  [ 'space' ]  ], //view or selected
      centerView: [  [ 'control', 'space' ], [ 'enter' ]  ],
      deleteSelected: [  [ 'delete' ]  ],
      restoreInterface: [  [ 'escape' ]  ], //abort selection/deselection, deselect all, center on view, restore zoom, close context menu, ...
      moveUp: [  [ 'up' ]  ],
      moveDown: [  [ 'down' ]  ],
      moveLeft: [  [ 'left' ]  ],
      moveRight: [  [ 'right' ]  ]
    },

    Global: {
      selection: {
        strokeColor: '#447DF4',
        strokeWidth: 2,
        fillColor: 'rgba(68, 125, 244, 0.7)'
      },

      deselection: {
        strokeColor: '#447DF4',
        strokeWidth: 2,
        fillColor: 'rgba(250, 250, 250, 0.1)'
      }
    },

    Element: {
      default: {
        main: {
          background: {
            fillColor: '#fff'
          },
          property: {
            fontFamily: 'Calibri',
            fontWeight: 'normal',
            fontSize: 20
          }
        },
        header: {
          background: {
            fillColor: '#78CE88'
          },
          text: {
            fillColor: '#fff',
            fontFamily: 'Calibri',
            fontWeight: 'normal',
            fontSize: 20
          }
        }
      },
      selected: {
        main: {
          background: {
            fillColor: 'rgba(255, 255, 255, .65)'
          }
        },
        header: {
          background: {
            fillColor: 'rgba(121 ,207, 137, .65)'
          }
        }
      },
      required: {
        main: {
          property: {
            fontWeight: 'italic bold'
          }
        }
      }
    }

  };

}]);


angular.module('GMAO Tailor').service('Socket', [ '$window', 'Toast', function($window, Toast) {

        //init
        var _this = this;

        this.socket = null;
        this.authenticated = false;
        var onAuthentification = []; //several functions to call when socket.on('authentication')

        //functions
        this.connect = function() {
          _this.socket = io();

          _this.socket.on('error', function(err) {
            console.log(err);
            Toast.error(err.message || err);
          });

          _this.socket.on('connect', function() {
            _this.socket.emit('authentication', $window.localStorage.token);

            _this.socket.on('authenticated', function(data) {
              _this.authenticated = true;

              onAuthentification.forEach(function(eventHandler) {
                eventHandler(_this.socket, data);
              });
            });
          });
        };

        this.disconnect = function() {
          if (_this.authenticated) {
            _this.socket.disconnect();
          }
        };

        this.onAuthentification = function(eventHandler) {
          onAuthentification.push(eventHandler);
        };

}]);

angular.module('GMAO Tailor').service('Toast', [ '$mdToast', function($mdToast) {

  function createToast(msg, cssClass) {
    cssClass = (cssClass) ? ' ' + cssClass : '';
    $mdToast.show({
      template: '<md-toast class="md-toast' + cssClass + '">' + msg + '</md-toast>',
      hideDelay: 3000,
      position: 'bottom left'
    });
  }

  this.default = function(msg) {
    createToast(msg);
  };

  this.error = function(msg) {
    createToast(msg, 'md-error');
  };

  this.success = function(msg) {
    createToast(msg, 'md-success');
  };

}]);


angular.module('GMAO Tailor').service('AllInstances', [ function() {

  var _this = this;

  this.newCollection = function(key) {
    this[key] = {}; //every instances of a constructor indexed by id
  };

  this.toArray = function(collection) {
    return Object.keys(this[collection]).map(function(id) {
      return _this[collection][id];
    });
  };


  //generate UUID (the uniqueness relies on the random factor)
  this.newId = function() {
    var d = Date.now(); //same as new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };

}]);


angular.module('GMAO Tailor').factory('Box', [ 'Settings', 'AllInstances', function(Settings, AllInstances) {

    return class Box { //rectangle to select or deselect

      constructor(type) { //'select' || 'deselect'
        this.components = new Path.Rectangle({
          from: [ 0, 0 ],
          to: [ 0, 0 ],
          strokeColor: Settings.Global[type].strokeColor,
          strokeWidth: Settings.Global[type].strokeWidth,
          fillColor: Settings.Global[type].fillColor,
          visible: false
        });

        this.type = type;
      }

      //Methods
        updateBottomRight(point) {
          this.components.segments[3].point = point; //rightBottom point => where the mouse is

          this.components.segments[2].point.x = point.x; //rightTop point
          this.components.segments[0].point.y = point.y; //leftBottom point
        }

        processContent() {
          var condition = (this.type === 'selection'),
              data = (condition) ? { class: 'element' } : { class: 'element', selected: true },

              overlapping = project.activeLayer.getItems({ overlapping: this.bounds, data: data }),
              inside = project.activeLayer.getItems({ inside: this.bounds, data: data });

          overlapping.concat(inside).forEach(function(elementComponent) {
            AllInstances.element[elementComponent.data.elementId].setSelection(condition);
          });

          this.components.visible = false;
       }

      //Statics
    };

}]);

angular.module('GMAO Tailor').factory('Connection', [ 'Settings', 'AllInstances', function(Settings, AllInstances) {

  AllInstances.newCollection('connection');

  var canDraw = true; //a connection can be drawn ? element (service) can prevent this (connection) to draw a connection for example if an element is moving

  class Connection {
    constructor(context) {
      angular.merge(this, new Path.Line({
        from: Connection.getSegmentPosition(context.out),
        to: Connection.getSegmentPosition(context.in),
        strokeColor: Settings.Connection.default.strokeColor,
        strokeWidth: Settings.Connection.default.strokeWidth,
        data: { context: context, _id: AllInstances.newId }
      }));

      if (typeof context.in !== 'undefined') { //set the in connector' available to false if the property is not multiple
        AllInstances.connector[context.in.connectorId].data.available = AllInstances.property[context.in.propertyIdentifier].data.definition.multiple;
      }

      //Events
        this.onDoubleClick = function(event) {
          delete AllInstances.connection[this._id];
          this.remove();
        };

        this.onMouseEnter = function(event) {
          this.strokeColor = Settings.Connection.hover.strokeColor;
          this.strokeWidth = Settings.Connection.hover.strokeWidth;
        };

        this.onMouseLeave = function(event) {
          this.strokeColor = Settings.Connection.default.strokeColor;
          this.strokeWidth = Settings.Connection.default.strokeWidth;
        };

      AllInstances.connection[this._id] = this;
    }


    //Methods
      actualize(side) { //side (optional) : which side has to be actualized
        if (typeof side === 'undefined') {
          this.firstSegment.point = Connection.getSegmentPosition(this.data.context.out);
          this.lastSegment.point =  Connection.getSegmentPosition(this.data.context.in);
        } else if (side === 'out') {
          this.firstSegment.point = Connection.getSegmentPosition(this.data.context.out);
        } else { //in (avoid to process another condition)
          this.lastSegment.point =  Connection.getSegmentPosition(this.data.context.in);
        }
      }


    //Statics
      static get canDraw() {
        return canDraw; //maybe this.canDraw is possible
      }

      static set canDraw(value) {
        canDraw = value; //maybe this.canDraw is possible
      }

      /*
      static getCanDraw() {
        canDraw = true;
      }

      static setCanDraw(value) {
        canDraw = value;
      }
      */

      static validate(context) {
        // TODO: advanced validation which will evaluate if there is any circular reference between elements and also call validator() or getter() from the properties' definition
        return true;
      }

      static getSegmentPosition(context) { //get the position corresponding to a context (context.in || context.out)
        var elementComponents = AllInstances.element[context.elementId].components,
            connector = AllInstances.connector[context.connectorId];

        return (elementComponents.data.reduced) ? elementComponents.children[6].position : connector.position;
      }

      static findById(ids) { // [ string ]
        return ids.map(function(id) {
          return AllInstances.connection[id];
        });
      }

      static findByElementId(elementId, side) { //side (optional) : return only connections to which the element owns the 'in' || 'out' connector
        var connectionsId;

        if (typeof side !== 'undefined') {
          connectionsId = Object.keys(AllInstances.connection).filter(function(connectionId) {
            return AllInstances.connection[connectionId].data.context[side].elementId === elementId;
          });
        } else {
          connectionsId = Object.keys(AllInstances.connection).filter(function(connectionId) {
            var context = AllInstances.connection[connectionId].data.context;
            return context.in.elementId === elementId || context.out.elementId === elementId;
          });
        }

        return connectionsId.map(function(connectionId) {
          return AllInstances.connection[connectionId];
        });
      }

      static findOne(contextIn, contextOut) { //find one by elementId and propertyIdentifier
        var foundId = Object.keys(AllInstances.connection).find(function(connectionId) {
          var context = AllInstances.connection[connectionId].data.context;
          return context.in.elementId === contextIn.elementId && context.in.propertyIdentifier === contextIn.propertyIdentifier &&
                 context.out.elementId === contextOut.elementId && context.out.propertyIdentifier === contextOut.propertyIdentifier;
        });
        return AllInstances.connection[foundId];
      }

      static actualize(connections, side) {
        connections.forEach(function(connection) {
          connection.actualize(side);
        });
      }

      static actualizeByElementId(elementId) {
        angular.forEach(AllInstances.connection, function(connection, connectionId) {
          if (connection.data.context.in.elementId === elementId) {
            connection.actualize('in');
          } else if (connection.data.context.out.elementId === elementId) {
            connection.actualize('out');
          }
        });
      }

      static delete(connections) {
        if (!Array.isArray(connections)) { connections = [ connections ]; }

        connections.forEach(function(connection) {
          AllInstances.connector[connection.data.context.in.connectorId].data.available = true;
          connection.remove();
          delete AllInstances.connection[connection._id];
        });
      }

      static deleteAll() { //does not make available the in connector (used when Layer and Element are reset too)
        angular.forEach(AllInstances.connection, function(connection, connectionId) {
          connection.remove();
        });
        AllInstances.newCollection('connection');
      }

      static importAll(contexts) {
        var _this = this; //Connection
        this.deleteAll(); //reset

        contexts.forEach(function(context) {
          new _this(context);
        });
      }

      static exportAll() {
        return Object.keys(AllInstances.connection).map(function(connectionId) {
          return AllInstances.connection[connectionId].data.context;
        });
      }

  }


  return Connection;

}]);

angular.module('GMAO Tailor').factory('Connector', [ 'Settings', 'AllInstances', 'Connection', 'Toast', function(Settings, AllInstances, Connection, Toast) {

  AllInstances.newCollection('connector');
  new Project(document.getElementById('blueprintCanvas'));

  var connection = new Path.Line({ //use to draw a connection from a connector : just a path line not a Connection
    from: [ 0, 0 ],
    to: [ 0, 0 ],
    strokeColor: Settings.Connection.default.strokeColor,
    strokeWidth: Settings.Connection.default.strokeWidth,
    data: {},
    visible: false
  });


  class Connector {
    constructor(property, coordinates, side, elementId) {
      angular.merge(this, new Group({
        children: [
          //external circle
          new Path.Circle({
            center: coordinates,
            radius: 6,
            fillColor: new Color(Settings.Connector.styles.external[ (property.multiple) ? 'multiple' : 'default' ].fillColor),
            strokeColor: Settings.Connector.styles.external[ (property.multiple) ? 'multiple' : 'default' ].strokeColor,
            strokeWidth: 1,
            dashArray: [ 12, 6 ]
          }),
          //internal circle
          new Path.Circle({
            center: coordinates,
            radius: 1.5,
            fillColor: Settings.Connector.styles.internal.available.fillColor
          })
        ],
        data: {
          isRotating: false,
          totalRotation: 0,
          side: side,
          propertyIdentifier: property.identifier,
          class: 'connector'
        }
      }));
      if (side === 'in') this.data.available = true;

      this._id = AllInstances.newId();


      //Events
        this.onMouseEnter = function(event) {
          if (this.data.isRotating) this.scale(Settings.Connector.hover.scale);
        };

        this.onMouseLeave = function(event) {
          if (this.data.isRotating) this.scale(1 / Settings.Connector.hover.scale);
        };

        this.onFrame = function(event) {
          if (this.data.isRotating) { //has to rotate
            this.rotate(-Settings.Connector.rotating.spin);
            this.data.totalRotation += -Settings.Connector.rotating.spin;

          } else if (this.data.totalRotation !== 0) { //hasn't to rotate && has to complete last rotation
            if (this.data.totalRotation <= -360) this.data.totalRotation %= -360; //if |totalRotation| >= 360

            var rotation = (this.data.totalRotation > -Settings.Connector.rotating.spin) ? this.data.totalRotation : -Settings.Connector.rotating.spin;
            this.rotate(rotation);
            this.data.isRotating = false;
            this.data.totalRotation += rotation;
          }
        };

        //only out entries can draw a connecting line
        if (this.data.side === 'out') {

          this.onMouseDown = function(event) {
            if (Connection.canDraw) {

              connection.firstSegment.point = connection.lastSegment.point = this.position;
              connection.data.context.out = {
                elementId: this.data.elementId,
                connectorId: this._id,
                propertyIdentifier: this.data.propertyIdentifier
              };
              connection.visible = true;

              angular.forEach(AllInstances.connector, function(connector, connectorId) {
                connector.data.isRotating = connector.shouldRotate('in');
              });
            }
          };

          this.onMouseDrag = function(event) {
            if (connection.visible) connection.lastSegment.point = event.point;
          };

          this.onMouseUp = function(event) {
            if (connection.visible) {
              var inConnectorId = Object.keys(AllInstances.connector).find(function(connectorId) {
                return AllInstances.connector[connectorId].scaling === Settings.Connector.hover.scale && connectorId !== this._id;
              });

              if (typeof inConnectorId === 'undefined') {
                Connector.resetConnection('A connection can be made only from an Out to an In.');
              } else {
                var inConnector = AllInstances.connector[inConnectorId];
                connection.data.context.in = {
                  elementId: inConnector.data.elementId,
                  connectorId: inConnector._id,
                  propertyIdentifier: inConnector.data.propertyIdentifier
                };

                if (Connection.validate(connection.data.context)) { //high verification : to avoid any illogical connection
                  inConnector.data.available = AllInstances.property[inConnector.data.propertyIdentifier].data.definition.multiple;
                  new Connection(connection.data.context);
                  Connector.resetConnection();
                }
              }


              angular.forEach(AllInstances.connector, function(connector, connectorId) {
                connector.shouldRotate('out');
              });
            }
          };
        }


      AllInstances.connector[this._id] = this;
    }


    //Methods
      shouldRotate(side) { //which side should rotate if a connection with this (connector) is valid
        if (side !== this.data.side) {
          this.data.isRotating = false;

        } else if (this.data.side === 'out') { //side === this.data.side === 'out'
          this.data.isRotating = true;

        } else if (this.data.available) { //side === this.data.side === 'in' && available

          if (connection.data.context.out.elementId !== this.data.elementId) { //not the same element
            var thisType = AllInstances.property[this.data.propertyIdentifier].data.definition.type; // [ String ]

            var typeValid = thisType.indexOf('all') > -1 || thisType.some(function(type) {
              return AllInstances.property[connection.data.context.out.propertyIdentifier].data.definition.type.indexOf(type) > -1;
            });

            if (typeValid) {
              var alreadyExist = Connection.findOne(
                { elementId: this.data.elementId, propertyIdentifier: this.data.propertyIdentifier }, //In
                connection.data.context.out //Out
              );

              this.data.isRotating = typeof alreadyExist === 'undefined';
            } else {
              this.data.isRotating = false;
            }
          } else {
            this.data.isRotating = false;
          }
        } else {
          this.data.isRotating = false;
        }
      }


    //Statics
      static get connection() {
        return connection; //maybe this.connection is possible
      }

      static set connection(value) {
        connection = value; //maybe this.connection is possible
      }

      static resetConnection(msg) { //optional: if message then error;
        connection.visible = false;
        if (msg) Toast.error(msg);
      }

      static findOne(elementId, propertyIdentifier) { //find one by elementId and propertyIdentifier
        return AllInstances.connector[this.findOneId(elementId, propertyIdentifier)];
      }

      static findOneId(elementId, propertyIdentifier) { //find one by elementId and propertyIdentifier
        return Object.keys(AllInstances.connector).find(function(connectorId) {
          var connector = AllInstances.connector[connectorId];
          return connector.data.elementId === elementId && connector.data.propertyIdentifier === propertyIdentifier;
        });
      }
  }


  return Connector;

}]);


angular.module('GMAO Tailor').factory('Definition', [ 'AllInstances', function(AllInstances) {

  AllInstances.newCollection('definition');


  return class Definition {
    constructor(definition) {
      angular.merge(this, definition);

      AllInstances.definition[this._id] = this;
    }


    //Methods
      getVersion(versionName) {
        return this.versions.find(function(version) {
          return version.name === versionName;
        });
      }


    //Statics
      static import(definitions, reset) { //reset: Bool : remove all definitions before import
        if (reset) AllInstances.newCollection('definition');
        var _this = this;

        definitions.forEach(function(definition) {
          new _this(definition);
        });
      }
  };

}]);


angular.module('GMAO Tailor').factory('Element', [ 'Settings', 'AllInstances', 'Connection', 'Connector', function(Settings, AllInstances, Connection, Connector) {

  AllInstances.newCollection('element');


  class Element {
    constructor(element) {
      var _this = this;

      //Init
        var defaultAttributes = {
          name: '',
          description: '',
          _id: AllInstances.newId()
        };

        angular.extend(this, defaultAttributes, element);

        var definiton = AllInstances.definition[this.definition];
        var version = definiton.getVersion(this.version);


        //Coordinates
          function getMaxLength(properties) {
            return Math.max.apply(null, properties.map(function(property) {
              return property.name.length;
            }));
          }

          if (typeof this.coordinates === 'undefined') {
            var propertiesMaxLength = getMaxLength(version.properties.in) + getMaxLength(version.properties.out) + 4;

            var width =  Math.max(propertiesMaxLength, definition.name.length, this.name) * 9 + 75; //75 for the padding where connectors will be
            var height = Math.max(version.properties.in.length, version.properties.out.length) * 40 + 50; //50 for the header and 40 for each property lines

            this.coordinates = {
              x: view.center.x - width / 2,
              y: view.center.y - height / 2,
              width: width,
              height: height
            };
          }


      //Main
        var main = {

          background: new Path.Rectangle({
            rectangle: new Rectangle(this.coordinates),
            fillColor: Settings.element.styles.rectPath.unselected.fillColor,
            data: {
              elementId: _this.id
            }
          })

        };


      //Header
        var header = {

          background: new Path.Rectangle({
            rectangle: new Rectangle(_this.coordinates.x, _this.coordinates.y, _this.coordinates.width, 50),
            fillColor: Settings.element.styles.rectHeaderPath.unselected.fillColor,
            data: {
              elementId: _this.id,
              class: 'header'
            }
          }),

          elementName: new PointText({
            point: [ _this.coordinates.x + _this.coordinates.width / 2, _this.coordinates.y + 20 ],
            content: _this.name,
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'center',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize
          }),

          definitionName: new PointText({
            point: [ _this.coordinates.x + _this.coordinates.width / 2, _this.coordinates.y + 45 ],
            content: definition.name,
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'center',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize * 0.75,
            data: {
              elementId: _this.id
            }
          }),

          in: new PointText({
            point: [ _this.coordinates.x + 20, _this.coordinates.y + 45 ],
            content: 'In',
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'left',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize
          }),

          out: new PointText({
            point: [ _this.coordinates.x + _this.coordinates.width - 20, _this.coordinates.y + 45 ],
            content: 'Out',
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'right',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize
          })

        };

        header.background.onDoubleClick = function(event) {
          _this.toggleSelection();
        };

        header.definitionName.onDoubleClick = function(event) {
           _this.toggleReduction();
        };


      //Regroup components
        this.components = new Group({
          children: [ main.background, header.background, header.elementName, header.definitionName, header.in, header.out ],
          data: {
            class: 'element',
            elementId: this.id,
            connectors: new Group(),
            //connections: [], // [ Connection._id ]
            reduced: false,
            selected: false
          }
        });


      //Properties
        function createProperties(properties, side) {
          properties.forEach(function(property, index) {
            var coordinates = new Point( (side === 'in') ? _this.coordinates.x + 20 : _this.coordinates.x + _this.coordinates.width - 20, _this.coordinates.y + 70 + index * 40);

            var connector = new Connector(property, coordinates, side, elementId);

            var text = new PointText({
              point: [ (side === 'in') ? coordinates.x + 20 : coordinates.x - 20, coordinates.y ],
              content: property.name,
              fillColor: Settings.element.styles.colors[ (property.required) ? 'required' : 'notRequired' ],
              justification: (side === 'in') ? 'left' : 'right',
              fontFamily: Settings.element.styles.propertyText.fontFamily,
              fontWeight: (property.required) ? Settings.element.styles.font.required : Settings.element.styles.font.notRequired,
              fontSize: Settings.element.styles.propertyText.fontSize,
              data: {
                propertyIdentifier: property.identifier,
                elementId: _this._id,
                class: 'propertyName'
              }
            });

            text.onDoubleClick = function(event) {
              AllInstances.element[this.data.elementId].toggleReduction();
            };

            this.components.addChildren([ connector, property ]);
          });
        }

        var inProperties = createProperties(version.properties.in, 'in');
        var outProperties = createProperties(version.properties.out, 'out');


      //Events
        this.components.onMouseDown = function(event) {
          Connection.canDraw = false;
          event.delta = new Point(0, 0); //reset delta (distance between two event)
        };

        this.components.onMouseDrag = function(event) {
          if (this.data.selected) {
            AllInstances.layer.Selected.getElements().forEach(function(element) {
              element.move(event.delta);
            });
          } else {
            this.move(event.delta);
          }
        };

        this.components.onMouseUp = function(event) {
          Connection.canDraw = true;
          if (this.data.selected) {
            AllInstances.layer.Selected.getElements().forEach(function(element) {
              element.coordinates.x = element.components.position.x;
              element.coordinates.y = element.components.position.y;
            });
          } else {
            this.coordinates.x = this.components.position.x;
            this.coordinates.y = this.components.position.y;
          }
        };


      AllInstances.element[this._id] = this;
    }


    //Methods
      move(delta) {
        this.components.translate(delta);
        Connection.actualizeByElementId(this._id);
      }

      toggleReduction() {
        return this.setReduction(!this.components.data.reduced);
      }

      getReduction() {
        return this.components.data.reduced;
      }

      setReduction(value) {
        this.components.children.forEach(function(child, index) {
          if (index < 1 || index > 5) child.visible = !value; //every component except ones from the header
        });
        this.components.data.reduced = value;

        Connection.actualizeByElementId(this._id);

        if (value) {
          AllInstances.layer.Reduced.elements.push(this._id);
        } else {
          var index = AllInstances.layer.Reduced.elements.indexOf(this._id);
          if (index > -1) AllInstances.layer.Reduced.elements.splice(index, 1);
        }
      }

      toggleVisibility() {
        return this.setVisibility(!this.components.visible);
      }

      getVisibility() {
        return this.components.visible;
      }

      setVisibility(value) {
        this.components.visible = value;

        Connection.findByElementId(this._id).forEach(function(connection) {
          connection.visible = value;
        });

        if (value) {
          AllInstances.layer.Visible.elements.push(this._id);
        } else {
          var index = AllInstances.layer.Visible.elements.indexOf(this._id);
          if (index > -1) AllInstances.layer.Visible.elements.splice(index, 1);
        }
      }

      toggleSelection() {
        return this.setReduction(!this.components.data.selected);
      }

      getSelection() {
        return this.components.data.selected;
      }

      setSelection(value) {
        var state = (value) ? 'selected' : 'default';
        this.components.children[0].style.fillColor = Settings.Element[state].main.background.fillcolor;
        this.components.children[1].style.fillColor = Settings.Element[state].header.background.fillcolor;

        this.components.data.selected = value;

        if (value) {
          AllInstances.layer.Selected.elements.push(this._id);
        } else {
          var index = AllInstances.layer.Selected.elements.indexOf(this._id);
          if (index > -1) AllInstances.layer.Selected.elements.splice(index, 1);
        }
      }

      getDefinition() {
        var definition = angular.merge({}, AllInstances.definition[this.definition]); //copy

        return {
          name: definition.name,
          description: definition.description,
          properties: definition.getVersion(this.version).properties,
          author: definition.author,
          _id: definition._id
        };
      }

      duplicate() {
        Element.duplicate(this._id); //not the best way but avoid to duplicate the code from Element.duplicate
      }

      delete() {
        Element.delete(this._id); //definitively not the best way but avoid to duplicate the code from Element.delete
      }


    //Statics
      static toggleReduction(elementIds, same) { //same (Bool, optional): every elements will have the property
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        if (same) {
          var reduction = !AllInstances.element[ elementIds[0] ].components.data.reduced; //to have the same effect on every given elements
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].setReduction(reduction);
          });

        } else {
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].toggleReduction();
          });
        }
      }

      static toggleVisibility(elementIds, same) { //same (Bool, optional): every elements will have the property
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        if (same) {
          var visibility = !AllInstances.element[ elementIds[0] ].components.visible; //to have the same effect on every given elements
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].setVisibility(visibility);

          });
        } else {
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].toggleVisibility();
          });
        }
      }

      static toggleSelection(elementIds, same) { //same (Bool, optional): every elements will have the property
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        if (same) {
          var selection = !AllInstances.element[ elementIds[0] ].components.data.selected; //to have the same effect on every given elements
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].setSelection(selection);
          });

        } else {
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].toggleSelection();
          });
        }
      }

      static toggleSelectionAll(same) { //same (Bool, optional): every elements will have the property
        if (same) {
          var selection = !AllInstances.element[Object.keys(AllInstances.element)[0]].components.data.selected; //to have the same effect on every given elements
          angular.forEach(AllInstances.element, function(element, elementId) {
            element.setSelection(selection);
          });

        } else {
          angular.forEach(AllInstances.element, function(element, elementId) {
            element.toggleSelection();
          });
        }
      }

      static copySelected() {
        AllInstances.layer.Copied.elements = AllInstances.layer.Selected.elements.slice();
      }

      static pasteCopied() {
        this.duplicate(AllInstances.layer.Copied.elements);
      }

      static duplicate(elementIds) {
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        var connections = {}; //every connections to duplicate indexed by _id => avoid duplications

        var copyElements = elementIds.map(function(elementId) {
          var element = AllInstances.element[elementId];
          Connection.findByElementId(elementId).forEach(function(connection) { connections[connection._id] = connection; });

          return new Element(angular.merge({}, element, { _id: AllInstances.newId() }));
        });


        function updateContext(context, side) {
          var index = elementIds.indexOf(context[side].elementId);

          if (index > -1) {
            context[side].elementId = copyElements[index].elementId;
            context[side].connectorId = Connector.findOneId(context[side].elementId, context[side].propertyIdentifier);
          }
        }

        angular.forEach(connections, function(connection, connectionId) {
          var newContext = angular.merge({}, connection.data.context);

          updateContext(newContext, 'in');
          updateContext(newContext, 'out');

          new Connection(newContext);
        });
      }

      static delete(elementsId) {
        if (!Array.isArray(elementsId)) { elementsId = [ elementsId ]; }

        elementsId.forEach(function(elementId) {
          AllInstances.element[elementId].components.remove();
          Connection.remove(Connection.findByElementId(elementId));

          angular.forEach(AllInstances.layer, function(layer, layerId) {
            var index = layer.elements.indexOf(elementId);
            if (index > -1) layer.elements.splice(index, 1);
          });

          delete AllInstances.element[elementId];
        });
      }

      static deleteAll() { //remove all elements but does not erase them from layers or connections (used when Layer and Connection are reset too)
        angular.forEach(AllInstances.element, function(element, elementId) {
          element.components.remove();
        });

        AllInstances.newCollection('element');
      }

      static importAll(elements) {
        var _this = this; //Element
        this.deleteAll(); //reset

        elements.forEach(function(element) {
          new _this(element);
        });
      }

      static exportAll() {
        return Object.keys(AllInstances.element).map(function(elementId) {
          var element = AllInstances.element[elementId];

          return {
            name: element.name,
            description: element.description,
            coordinates: element.coordinates,
            version: element.version,
            definition: element.definition,
            _id: element._id
          };
        });
      }

  }


  return Element;

}]);


angular.module('GMAO Tailor').service('Global', [ 'Settings', 'Element', 'Connection', 'Connector', 'Box', 'AllInstances', function(Settings, Element, Connection, Connector, Box, AllInstances) {

  //Keybindings
    var eventHandlers = {

      onKeyDown: {
        toggleSelectAll: function(event) {
          Element.toggleSelectionAll();
        },
        inverseSelection: function(event) {
          Element.toggleSelectionAll();
        },
        copySelected: function(event) {
          Element.copySelected();
        },
        pasteCopied: function(event) {
          Element.pasteCopied();
        },
        deleteSelected: function(event) {
          AllInstances.layer.Selected.deleteElements();
        },
        restoreZoom: function(event) {
          view.zoom = Settings.view.zoom.value;
        },
        plusZoom: function(event) {
          view.zoom += view.zoom * Settings.view.zoom.pitch;
        },
        minusZoom: function(event) {
          if (view.zoom - view.zoom * Settings.view.zoom.pitch > Math.max(0.01, Settings.view.zoom.pitch)) { //avoid bug because to close to 0
            view.zoom -= view.zoom * Settings.view.zoom.pitch;
          }
        },
        centerView: function(event) {
          view.center = project.activeLayer.position;
        },
        center: function(event) {
          //center on the view if there are not any elements selected
          if (AllInstances.layer.Selected.elements.length === 0) {
            eventHandlers.onKeyDown.centerView();

          } else { //center the elements selected
            var selectedElements = AllInstances.layer.Selected.elements.map(function(element) {
              return AllInstances.elements[element.id].data.components;
            });

            var groupSelectedElements = new Group(selectedElements);
            view.center = groupSelectedElements.position;

            //remove the group (and re-insert its children into the view instead of remove them too)
            project.activeLayer.addChildren(groupSelectedElements.removeChildren());
          }
        },
        moveUp: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.y -= Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.y -= Settings.view.move.pitch;
            });
          }
        },
        moveDown: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.y += Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.y += Settings.view.move.pitch;
            });
          }
        },
        moveLeft: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.x -= Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.x -= Settings.view.move.pitch;
            });
          }
        },
        moveRight: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.x += Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.x += Settings.view.move.pitch;
            });
          }
        }
      },

      onMouseDown: {
        move: function(event) { //move the view (actually project.activeLayer)
          event.delta = new Point(0, 0); //to start the delta (distance between two last mouse events)
        },
        select: function(event) {
          selection.components.segments.forEach(function(segment) {
            segment.point = event.point;
          });
          selection.components.visible = true;
        },
        deselect: function(event) {
          if (AllInstances.layer.Selected.elements.length > 0) {
            deselection.components.segments.forEach(function(segment) {
              segment.point = event.point;
            });
            deselection.components.visible = true;
          } else {
            return false; //action not valid so by returning false it will not become the currentAction
          }
        }
      },

      onMouseDrag: {
        move: function(event) { //move the view (actually activeLayer.project)
          project.activeLayer.translate(event.delta);
        },
        select: function(event) {
          selection.updateBottomRight(event.point);
        },
        deselect: function(event) {
          deselection.updateBottomRight(event.point);
        }
      },

      onMouseUp: {
        select: function(event) {
          selection.processContent();
        },
        deselect: function(event) {
          deselection.processContent();
        }
      }

    };

    function triggerAction(event, eventHandler) { //eventHandler: eventHandlers.*
      var actionName = Object.keys(eventHandler).find(function(actionName) {
        return Settings.keybindings[actionName].some(function(keys) { //verify if one of the keybindings at a time
          return keys.length === 0 || keys.every(function(key) { //verify if every key is pressed
            return event.modifiers[key] || typeof event.modifiers[key] === 'undefined' &&   //key is a modifier and is pressed || it's not a modifier ans it's not pressed
                    key === event.key.toUpperCase() || //key is the key which trigger the event
                    Key.isDown(key); //key is hold
          });
        });
      });

      console.log(actionName);

      return (!actionName) ? null : (eventHandler[actionName](event) === false) ? null : actionName; //=== false because it can be undefined too
    }



  //Init
    var tool = new Tool(),
        currentAction = null;
        selection = new Box('selection'),
        deselection = new Box('deselection'),
        contextMenuContent = document.getElementById('context-menu-content'),
        contextMenuTrigger = document.getElementById('context-menu-trigger');

    view.zoom = Settings.view.zoom.value;


  //Events
    tool.onKeyDown = function(event) {
      //event.point = view.getEventPoint(event); //there isn't any mouse coordinates on key events

      if (!Connector.connection.visible && !selection.components.visible && !deselection.components.visible) {
        triggerAction(event, eventHandlers.onKeyDown);
      }
    };

    tool.onMouseDown = function(event) {
      //if (contextMenu.visible) contextMenu.close();

      if (event.event.which !== 3) { //not right click
        var hitTest = project.activeLayer.hitTest(event.point); //return an object with the item as its item key or undefined if nothing is hit
        console.log('hitTest', hitTest);
        console.log('onMouseDown', event);

        if (!hitTest) { //if mouse down on the canvas and not on any paper js item then ...
          currentAction = triggerAction(event, eventHandlers.onMouseDown);

          if (selection.visible || deselection.visible) { //deselect if click outside selected elements
            var rect = new Rectangle({ x: event.point.x - 0.05, y: event.point.y - 0.05, width: 0.1, height: 0.1 });

            if (!event.modifiers.shift && !event.modifiers.control &&
                  AllInstances.layer.Selected.elements.length > 0 &&
                    (!hitTest ||
                    !project.activeLayer.getItem({ overlapping: rect, data: { selected: true } }) &&
                      !project.activeLayer.getItem({ overlapping: rect, data: { class: 'header' } }))) {

              Element.deselect(AllInstances.layer.Selected.elements);
            }
          }

        }
      } else { //right click : open context menu and set its position
        event.stop();

        if (!contextMenuContent) contextMenuContent = document.getElementById('context-menu-content');
        if (!contextMenuTrigger) contextMenuTrigger = document.getElementById('context-menu-trigger');

        contextMenuContent.style.top = event.event.clientY + 'px';
        contextMenuContent.style.left = event.event.clientX + 'px';
        contextMenuTrigger.click();
      }

    };

    tool.onMouseDrag = function(event) {
      console.log('onMouseDrag');
      if (currentAction) eventHandlers.onMouseDrag[currentAction](event);
    };

    tool.onMouseUp = function(event) {
      console.log('onMouseUp');
      if (currentAction) {
        if (typeof eventHandlers.onMouseUp[currentAction] !== 'undefined') eventHandlers.onMouseUp[currentAction](event);
        currentAction = null;
      }
    };

}]);


angular.module('GMAO Tailor').factory('Layer', [ '$mdDialog', 'AllInstances', 'Element', function($mdDialog, AllInstances, Element) {

  AllInstances.newCollection('layer');


  class Layer {
    constructor(layer) { // { name: String, description: String, elements: [ Element.id ] }
      var defaultAttributes = { description: '', elements: [], _id: AllInstances.newId() };
      angular.merge(this, defaultAttributes, layer);

      AllInstances.layer[this._id] = this;
    }


    //Methods
      getElements() {
        return this.elements.map(function(elementId) {
          return AllInstances.element[elementId];
        });
      }

      removeElement(index) {
        this.elements.splice(index, 1);
      }

      deleteElements() {
        Element.delete(this.elements);
      }

      duplicateElements() {
        Element.duplicate(this.elements);
      }

      toggle(attribute) { //e.i. toggleSelection on every element of this layer
        Element['toggle' + attribute](this.elements, true);
      }

      areAll(attribute) {
        return this.elements.every(function(elementId) {
          return AllInstances.element[elementId]['get' + attribute];
        });
      };

      delete() {
        delete AllInstances.layer[this._id]; //not the best way ...
      }


    //Statics
      static get all() {
        return AllInstances.layer.All;
      }

      static set all(value) {
        AllInstances.layer.All = value;
      }

      static get selected() {
        return AllInstances.layer.Selected;
      }

      static set selected(value) {
        AllInstances.layer.Selected = value;
      }

      static create(event, elements) {
        var _this = this;

        $mdDialog.show({ //ask name and description
          controller: 'NewLayerDialogCtrl',
          templateUrl: 'templates/components/newLayerDialog.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose: true
        })
        .then(function(layer) { //given by $mdDialog.hide()
          layer.elements = elements.slice(); //just ids
          new _this(layer);

        }, function() { //cancel
          //nothing to do
        });
      }

      static deleteAll() { //remove all layers (except 'All' && 'Selected')
        angular.forEach(AllInstances.layer, function(layer, layerId) {
          if (layerId.length > 8) { //not 'All', 'Selected', 'Visible', 'Reduced' or 'Copied'
            delete AllInstances.layer[layerId];
          } else { //'All', 'Selected', 'Visible', 'Reduced' or 'Copied'
            layer.elements = [];
          }
        });
      }

      static importAll(layers) {
        var _this = this; //Layer
        this.deleteAll(); //reset

        layers.forEach(function(layer) {
          new _this(layer);
        });
      }

      static exportAll() {
        return Object.keys(AllInstances.layer)
          .filter(function(layerId) {
            return layerId > 8; //not 'All', 'Selected', 'Visible', 'Reduced' or 'Copied'
          })
          .map(function(layerId) {
            var layer = AllInstances.layer[layerId];

            return {
              name: layer.name,
              description: layer.description,
              elements: layer.elements
            };
          });
      }
  }


  new Layer({ name: 'All', description: 'All drawn elements', _id: 'All' });
  new Layer({ name: 'Selected', description: 'All selected elements', _id: 'Selected' });
  new Layer({ name: 'Visible', description: 'All visible elements', _id: 'Visible' });
  new Layer({ name: 'Reduced', description: 'All reduced elements', _id: 'Reduced' });
  new Layer({ name: 'Copied', description: 'All copied elements', _id: 'Copied' });


  return Layer;
}]);


angular.module('GMAO Tailor').service('comparatorsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.egal = {
      name: 'Egal',
      properties: [
        { name: 'elements', type: 'array', arrayOf: [ 'mixed' ], required: true }, //mixed egals to all types
        { name: 'strictly egal (===)', keyName: 'strictlyEgal', type: 'bool', default: false }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.elements.every(function(currentValue, index, array) {
            return (values.strictlyEgal) ? array[0] === currentValue : array[0] == currentValue;
          });
        }
      }
    };

    elementsDefinition.higher = {
      name: 'Higher',
      properties: [
        { name: 'number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '> number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue > lowersHighest;
          });
        }
      }
    };

    elementsDefinition.lower = {
      name: 'Lower',
      properties: [
        { name: 'number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '< number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue > lowersHighest;
          });
        }
      }
    };

    elementsDefinition.higherOrEgal = {
      name: 'Higher or Egal',
      properties: [
        { name: 'number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '>= number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue >= lowersHighest;
          });
        }
      }
    };

    elementsDefinition.lowerOrEgal = {
      name: 'Lower or Egal',
      properties: [
        { name: 'number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '<= number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue >= lowersHighest;
          });
        }
      }
    };

  };

}]);


angular.module('GMAO Tailor').service('formInputsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.Input_ = {
      name: 'Input*',
      properties: [ //all the commun properties to all the BlueprintTypes (never used alone, has to be a specific type of BlueprintType)
        { name: 'name', type: 'string', required: true, description: 'The name given to the form input which the user has to complete.' },
        { name: 'description', type: 'string', description: 'A description to explain to what corresponds this form input.' },
        { name: 'helper', type: 'string', description: 'A quick text to explain what reponse the user should give you.' },
        { name: 'visibility', type: 'string', enum: [ 'reduce-panel', 'extend-panel', 'full-panel', 'full-panel-reduce' ], default: 'full-panel', description: 'The visibility allows you to choose to display or not this form input according to the state of diplay of the form.' },
        { name: 'required', type: 'bool', default: false, description: 'Does the user absolutly need to fullfill this form input ?' },
        { name: 'disabled', type: 'bool', default: false, description: 'Is this form input disabled ?' }
      ]
    };

    elementsDefinition.Input_String = {
      name: 'Input String',
      description: 'Ask the user to return a string (a text) throught a form. This string will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ], description: 'If you want to allow only some choices to this input. Indeed an enum is one of the available answer to the input. The type of the enum must correspond to the type of the value returned by the input.' },
        { name: 'match RegHex', type: 'RegHex', description: 'If you want that the value given by the user matchs some complexe criterias, you can give it a RegHex expression.' },
        { name: 'uppercase', type: 'bool', default: false, description: 'The value returned by the user should be converted into uppercase ?' },
        { name: 'lowercase', type: 'bool', default: false, description: 'The value returned by the user should be converted into lowercase ?' },
        { name: 'maxlength', type: 'number', description: 'How much the lenght of the returned value can be long ?' },
        { name: 'minlength', type: 'number', description: 'How much the lenght of the returned value can be short ?' }
      ],
      value: {
        name: 'string',
        type: 'string',
        description: 'The returned value : a string.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Number = {
      name: 'Input Number',
      description: 'Ask the user to return a number throught a form. This number will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'max', type: 'number', description: 'How much the returned value can be high ?' },
        { name: 'min', type: 'number', description: 'How much the returned value can be low ?' }
      ],
      value: {
        name: 'number',
        type: 'number',
        description: 'The returned value : a number.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Date = {
      name: 'Input Date',
      description: 'Ask the user to return a date throught a form. This date will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'format', type: 'string', default: 'medium', description: 'How the date should be display ? Check out angular ng-date doc or something like that' },
        { name: 'max', type: 'date', description: 'How much the returned value can be in the futur ?' },
        { name: 'min', type: 'date', description: 'How much the returned value can be in the past ?' }
      ],
      value: {
        name: 'date',
        type: 'date',
        description: 'The returned value : a date.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Boolean = {
      name: 'Input Bool',
      description: 'Ask the user to return a boolean (true or false) throught a form. This boolean will have to match the properties that you will set below.',
      properties: [
        { name: 'false option', keyName: 'falseOption', type: 'boolOption', description: 'A Bool Option to attribute an other value to true (then true).' },
        { name: 'true option', keyName: 'trueOption', type: 'boolOption', description: 'A Bool Option to attribute an other value to false (then false).' }
      ],
      value: {
        name: 'bool',
        type: 'bool',
        description: 'The returned value : bool or the value corresponding to the Bool Option of the returned value.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Array = {
      name: 'Input Array',
      description: 'The user can complete a form corresponding to the Form Inputs given (arrayOf), as many time as he wants. For example, if you want to have a field with the list of contacts, you can create a Form Input Array with all Form Inputs related to the creation of a contact. The user can complete the form as many time as he has contacts. The properties below help to bound the behavior of the element to what you want it to be !',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'array of', keyName: 'arrayOf', type: 'array', arrayOf: [ 'Input_' ], required: true, escription: 'All the Form Inputs the array should contain.' }
      ],
      value: {
        name: 'array',
        type: 'array',
        arrayOf: [ 'object' ],
        description: 'An array of object containing every values with the id of the Form Inputs as its keys.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Object = {
      name: 'Input Object',
      description: 'Ask the user to return the values of multiple Form Inputs throught a form. It acts like a folder of Form Inputs. It allows you to categorise the form. his object will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'object of', keyName: 'objectOf', type: 'array', arrayOf: [ 'Input_' ], required: true, description: 'The list of Form Inputs (can include other Form Input Object) to categorize.' }
      ],
      value: {
        name: 'object',
        type: 'object',
        description: 'An object with the returned value of every Form Input with their id as key.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Selector = {
      name: 'Input Selector',
      properties: [
        { name: 'selector of', keyName: 'selectorOf', type: 'array', arrayOf: [ 'selection' ], required: true, description: "You (or the user if allowed) can select an object of Form Inputs to complete. It's a big select of group of Form Inputs. For example if the user tells you he loves bike, you might want him to fulfill the caracteristics of his favorite bike, instead of completing those of a car." },
        { name: 'by user', keyName: 'byUser', type: 'bool', default: true, description: 'Can the user change himself the selection ?' },
        { name: 'selectorIndex', type: 'number', description: 'The id of the current Selection. This can define the default selection and even allow you to change it according to some logic.' } //if allowUser is false and then required
      ],
      value: {
        name: 'selection',
        type: 'selection',
        description: "An object containing all the returned values (corresponding to the Form Inputs of the current Selection) given by user, with the Form Inputs's ids as its keys.",
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Blueprint = {
      name: 'Input Blueprint',
      description: 'Load another Blueprint (with you can interact throught "Parameters") like if you have create it right here into this Blueprint. This allows you to not repeting yourselft and to maintain your work easily.',
      properties: [ //to fullfill with the sidenav or a dialog
        { name: 'Blueprint id', type: 'number', required: true, description: 'The id of the Blueprint being fetched. You can set it manually or via the right sidenav (Tab "Element").' },
        { name: 'Parameters', type: 'array', arrayOf: [ 'property' ], description: 'All the Properties the Blueprint requests. They correspond to external variables. Some should be given if required, others are optional. Each of these Properties must have their property "key" corresponding to the property "key" of the Parameter given in the Blueprint fetched by this Form Input Blueprint.' }
      ],
      value: {
        name: 'Return Values',
        description: 'All the values the Blueprint thinks you should have. You can, like with any object, extract a value by connecting a Property which has its property "key" matching the property "key" of the Return (from the Blueprint fetched) giving the value.',
        type: 'object', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

  };

}]);


angular.module('GMAO Tailor').service('functionsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.concat = {
      name: 'Concat',
      properties: [
        { name: 'strings', type: 'array', arrayOf: [ 'string' ], required: true },
        { name: 'separator', type: 'string' }
      ],
      value: {
        name: 'value',
        type: 'string',
        get: function(values) { //values: object containing all the values of the properties
          return values.strings.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (typeof values.separator !== 'undefined') ? previousValue += values.separator + currentValue : previousValue += currentValue;
          });
        }
      }
    };

    elementsDefinition.matchByString = {
      name: 'Match by String',
      properties: [
        { name: 'string(s)', keyName: 'strings', type: 'array', arrayOf: [ 'string' ], required: true },
        { name: 'match string(s)', keyName: 'matchStrings', type: 'array', arrayOf: [ 'string' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.matchStrings.every(function(matchString, index, array) {
            return values.strings.every(function(string, index, array) {
              return string.indexOf(matchString) > -1;
            });
          });
        }
      }
    };

    elementsDefinition.matchByRegHex = {
      name: 'Match by RegHex',
      properties: [
        { name: 'string(s)', keyName: 'strings', type: 'array', arrayOf: [ 'string' ], required: true },
        { name: 'match(s)', keyName: 'matchs', type: 'array', arrayOf: [ 'RegHex' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.matchs.every(function(match, index, array) {
            return values.strings.every(function(string, index, array) {
              return (string.match(match)) ? true : false; //match return null if the string does not match else an array
            });
          });
        }
      }
    };

    elementsDefinition.indexOf = {
      name: 'Index of',
      properties: [
        { name: 'array(s)', keyName:'arrays', type: 'array', arrayOf: [ 'array' ], required: true },
        { name: 'element(s) to find', keyName: 'elements', type: 'array', arrayOf: [ 'mixed' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.elements.every(function(element) {
            return values.arrays.every(function(array) {
              return array.indexOf(element) > -1;
            });
          });
        }
      }
    };

  };

}]);


angular.module('GMAO Tailor').service('opperatorsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.addition = {
      name: 'Addition',
      properties: [
        { name: 'numbers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'sum',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
         return values.numbers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
           return previousValue + currentValue;
         }); //return the last returned value so the sum
        }
      }
    };

    elementsDefinition.substraction = {
      name: 'Substraction',
      properties: [
        { name: 'number(s)', keyName: 'minuends', type: 'array', arrayOf: [ 'number', 'date' ], required: true }, //the key in values will be the keyName if exists or the name
        { name: '- number(s)', keyName: 'substrahends', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'difference',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          var sumMinuends = values.minuends.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          });

          var sumSubstrahends = values.substrahends.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          }); //return the last returned value so the sum

          return sumMinuends - sumSubstrahends;
        }
      }
    };

    elementsDefinition.multiplication = {
      name: 'Multiplication',
      properties: [
        { name: 'numbers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'product',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
         return values.numbers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
           return previousValue * currentValue;
         }); //return the last returned value so the product
        }
      }
    };

    elementsDefinition.division = {
      name: 'Division',
      properties: [
        { name: 'numerator(s)', keyName: 'numerators', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: 'denominator(s)', keyName: 'denominators', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'quotient',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          var ProductNumerators = values.numerators.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          });

          var ProductDenominators = values.denominators.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          }); //return the last returned value so the quotient

          return ProductNumerators / ProductDenominators;
        }
      }
    };

    elementsDefinition.modulo = {
      name: 'Modulo',
      properties: [
        { name: 'number', keyName: 'number', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '% number', keyName: 'modulator', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'module',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          return values.number % values.modulator;
        }
      }
    };

  };

}]);


angular.module('GMAO Tailor').service('parametersElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.enum = {
      name: 'Enum',
      properties: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'mixed', required: true }
      ],
      value: {
        name: 'value',
        type: 'enum',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    elementsDefinition.property = { //need one for in and an other for out an object
      name: 'Property',
      properties: [
        { name: 'name', type: 'string', required: true },
        { name: 'value', type: 'mixed', required: true }
      ],
      value: {
        name: 'value',
        type: 'property',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    elementsDefinition.RegHex = {
      name: 'RegHex',
      properties: [
        { name: 'motif', type: 'string', required: true },
        { name: 'flags', type: 'string' },
        { name: 'helper', type: 'string' }
      ],
      value: {
        name: 'value',
        type: 'RegHex',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    //one choice for a Input_Selector
    elementsDefinition.selection = {
      name: 'Selection',
      properties: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'array', arrayOf: [ 'Input_' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'selection',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    elementsDefinition.boolOption = {
      name: 'Bool Option',
      properties: [
        { name: 'label', type: 'string' },
        { name: 'value', type: 'mixed' }
      ],
      value: {
        name: 'value',
        type: 'boolOption',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

  };

}]);


angular.module('GMAO Tailor').service('primaryElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.array = {
      name: 'Array',
      properties: [
        { name: 'type', type: 'string', required: true }
      ],
      value: {
        name: 'array',
        type: 'array', //all the outputs
        arrayOf: [ 'mixed' ],
        in: {
          type: 'array', //all the inputs
          arrayOf: [ 'mixed' ]
        },
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.bool = {
      name: 'Bool',
      properties: [],
      value: {
        name: 'bool',
        type: 'bool', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.date = {
      name: 'Date',
      properties: [],
      value: {
        name: 'date',
        type: 'date', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.number = {
      name: 'Number',
      properties: [],
      value: {
        name: 'number',
        type: 'number', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.object = {
      name: 'Object',
      properties: [],
      value: {
        name: 'object',
        type: 'object', //all the outputs
        in: {
          type: 'array', //all the inputs
          arrayOf: [ 'property' ]
        },
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.string = {
      name: 'String',
      properties: [],
      value: {
        name: 'string',
        type: 'string', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.mixed = { //to avoid any problem when reachingthe name corresponding to an element type
      name: '*',
      properties: [],
      value: {
        name: 'string',
        type: 'string', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

  };

}]);


angular.module('GMAO Tailor').service('variablesElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.parameter = {
      name: 'Parameter',
      properties: [
        { name: 'key', type: 'string', required: true },
        { name: 'type', type: 'string', required: true, default: 'string', enum: [] }, //enum = all keys of elementsDefinition
        { name: 'required', type: 'bool', default: 'false' }
      ],
      value: {
        name: 'value',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          //to do
        }
      }
    };

    elementsDefinition.return = {
      name: 'Return',
      properties: [
        { name: 'key', type: 'string', required: true },
        { name: 'value', type: 'mixed', required: true }
      ]
    };

  };

}]);
