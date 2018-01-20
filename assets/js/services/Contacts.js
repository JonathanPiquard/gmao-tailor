
angular.module('GMAO Tailor').service('Contacts', [ '$http', 'Toast', function($http, Toast) {

  var _this = this;

  this.allUsers = [];
  this.allGroups = [];
  this.allUsersObject = {};
  this.allGroupsObject = {};

  this.defContacts = function(type) { //type === 'users' or 'groups'
    var typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);

    if (_this[ 'all' + typeCapitalized ].length === 0) {
      $http
        .get('/api/' + type + '/all')
        .success(function(contacts) {
          typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1); //need to be redefined because it can change during the time before success is called

          _this[ 'all' + typeCapitalized ] = contacts;

          _this[ 'all' + typeCapitalized + 'Object' ] = {}; //easier to load contacts from a Blueprint          
          contacts.forEach(function(contact) {
            _this[ 'all' + typeCapitalized + 'Object' ][contact._id] = contact;
          });
        })
        .error(function(err) {
          console.log(err);
          Toast.error(err);
        });
    }
  };

}]);
