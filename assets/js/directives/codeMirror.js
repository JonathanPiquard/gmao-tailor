
angular.module('GMAO Tailor').directive('codeMirror', function() {
  return {
    restrict: 'A',
    scope:  {
      options: '=',
      val: '='
    },
    link: function(scope, elements, attrs) {
      var myCodeMirror = CodeMirror.fromTextArea(elements[0], scope.options);

      myCodeMirror.setValue(scope.val);

      scope.$watch('val', function(newValue, oldValue, scope) {
        myCodeMirror.setValue(newValue);
      });

      scope.$watch('options.theme', function(newValue, oldValue, scope) {
        myCodeMirror.setOption('theme', newValue);
      });
    }
  };
});
