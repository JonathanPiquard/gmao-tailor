
angular.module('GMAO Tailor').service('Session', function() {

        //init
        this.userId = null;
        this.userRole = null;

        //functions
        this.create = function(userId, userRole) {
          this.userId = userId;
          this.userRole = userRole;
        };

        this.destroy = function() {
          this.userId = null;
          this.userRole = null;
        };

});
