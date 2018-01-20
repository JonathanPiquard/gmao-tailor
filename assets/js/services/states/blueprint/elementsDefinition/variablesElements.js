
angular.module('GMAO Tailor').service('variablesElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.parameter = {
      name: 'Parameter',
      properties: [
        { name: 'key', type: 'string', required: true },
        { name: 'type', type: 'string', required: true, default: 'string', enum: [] }, //enum = all keys of elementsDefinition
        { name: 'required', type: 'bool', default: 'false' }
      ],
      value: {
        name: 'value',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          //to do
        }
      }
    };

    elementsDefinition.return = {
      name: 'Return',
      properties: [
        { name: 'key', type: 'string', required: true },
        { name: 'value', type: 'mixed', required: true }
      ]
    };

  };

}]);
