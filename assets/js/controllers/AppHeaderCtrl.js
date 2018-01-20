
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
