
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
