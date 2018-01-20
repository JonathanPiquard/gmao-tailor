

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
