

angular.module('GMAO Tailor').controller('ConfirmDeleteDialogCtrl', ['$scope', '$mdDialog', function($scope, $mdDialog) {

  $scope.name = name;

  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.validate = function() {
    $mdDialog.hide();
  };

}]);
