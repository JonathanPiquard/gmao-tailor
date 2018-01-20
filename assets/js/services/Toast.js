angular.module('GMAO Tailor').service('Toast', [ '$mdToast', function($mdToast) {

  function createToast(msg, cssClass) {
    cssClass = (cssClass) ? ' ' + cssClass : '';
    $mdToast.show({
      template: '<md-toast class="md-toast' + cssClass + '">' + msg + '</md-toast>',
      hideDelay: 3000,
      position: 'bottom left'
    });
  }

  this.default = function(msg) {
    createToast(msg);
  };

  this.error = function(msg) {
    createToast(msg, 'md-error');
  };

  this.success = function(msg) {
    createToast(msg, 'md-success');
  };

}]);
