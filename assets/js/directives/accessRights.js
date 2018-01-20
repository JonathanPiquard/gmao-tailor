
angular.module('GMAO Tailor').directive('accessRights', function() {

  return {
    restrict: 'E',
    replace: true,
    scope: {
      'access': '=',
      'defaultRights': '=',
      'author': '=',
    },
    templateUrl: '/templates/directives/accessRights.html',
    controller: [ '$scope', 'Contacts', function($scope, Contacts) {

      Contacts.defContacts('users');
      Contacts.defContacts('groups');
      $scope.Contacts = Contacts;

      $scope.searchFilter = function(selectBy, search) {
        var expression = {};
        expression[selectBy] = search; //ex: { id: 48} => every item with this property, only,  will be shown
        return expression;
      };


      //Rights Model
        $scope.models = [];
        angular.forEach($scope.defaultRights.user, function(value, key) {
          $scope.models.push({ name: key, rights: Object.keys(value) });
        });


      //Utilities (view only)
        $scope.rights = {
          write: { name: 'Create', class: 'fa-plus' },
          read: { name: 'See', class: 'fa-eye' },
          use: { name: 'Use', class: 'fa-hand-grab-o' },
          update: { name: 'Update', class: 'fa-pencil' },
          delete: { name: 'Delete', class: 'fa-trash-o' }
        };

        $scope.checked = true;


      //Constructor
        function Handler(type) { //type : 'user' || 'group'
          var _this = this;

          this.type = type;
          this.contact = {}; //this.user || this.group
          this.contacts = []; //this.users || this.groups

          this.searchText = '';
          this.selectedItem = '';

          this.filter = function(contact, index, array) {
            if (contact.name.toLowerCase().indexOf(_this.searchText.toLowerCase()) > -1 && $scope.author._id !== contact._id) {
              return $scope.access[_this.type + 's'].every(function(accessContact) {
                return accessContact[_this.type]._id !== contact._id;
              });
            }
          };

          this.load = function() {
            this.contact = { access: angular.merge({}, $scope.defaultRights[this.type]) }; //e.i. contact.access
            this.contact[this.type] = { //e.i. contact.user
              name: this.contacts[0].name,
              _id: this.contacts[0]._id
            };
          };

          this.clear = function() {
            this.contact = {};
            this.contacts = [];
          };

          this.addContact = function() {
            $scope.access[this.type + 's'].push(this.contact);
            this.clear();
          };

          this.removeContact = function(contact) {
            $scope.access[this.type + 's'].splice($scope.access[this.type + 's'].indexOf(contact), 1);
          };

        }


      //Init
        $scope.Access = {
          user: new Handler('user'),
          group: new Handler('group')
        };

    }]
  };
});
