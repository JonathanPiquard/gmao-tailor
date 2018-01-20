
angular.module('GMAO Tailor').service('parametersElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.enum = {
      name: 'Enum',
      properties: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'mixed', required: true }
      ],
      value: {
        name: 'value',
        type: 'enum',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    elementsDefinition.property = { //need one for in and an other for out an object
      name: 'Property',
      properties: [
        { name: 'name', type: 'string', required: true },
        { name: 'value', type: 'mixed', required: true }
      ],
      value: {
        name: 'value',
        type: 'property',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    elementsDefinition.RegHex = {
      name: 'RegHex',
      properties: [
        { name: 'motif', type: 'string', required: true },
        { name: 'flags', type: 'string' },
        { name: 'helper', type: 'string' }
      ],
      value: {
        name: 'value',
        type: 'RegHex',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    //one choice for a Input_Selector
    elementsDefinition.selection = {
      name: 'Selection',
      properties: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'value', type: 'array', arrayOf: [ 'Input_' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'selection',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

    elementsDefinition.boolOption = {
      name: 'Bool Option',
      properties: [
        { name: 'label', type: 'string' },
        { name: 'value', type: 'mixed' }
      ],
      value: {
        name: 'value',
        type: 'boolOption',
        get: function(values) { //values: object containing all the values of the properties
          return values;
        }
      }
    };

  };

}]);
