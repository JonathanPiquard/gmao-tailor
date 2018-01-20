
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
