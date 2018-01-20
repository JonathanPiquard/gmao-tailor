
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
