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
