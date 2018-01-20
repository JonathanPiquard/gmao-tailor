
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
