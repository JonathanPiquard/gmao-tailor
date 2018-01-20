
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
