angular.module('GMAO Tailor').service('Dialog', [ '$mdDialog', '$mdMedia', function($mdDialog, $mdMedia) {

  this.confirmDelete = function(ev, name) {
    return $mdDialog.show({
      controller: 'ConfirmDeleteDialogCtrl',
      templateUrl: '/templates/components/confirmDeleteDialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $mdMedia('sm')
    });
  };

}]);
