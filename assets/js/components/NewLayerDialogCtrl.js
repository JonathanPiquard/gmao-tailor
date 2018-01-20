

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
