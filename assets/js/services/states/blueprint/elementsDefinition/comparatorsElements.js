
angular.module('GMAO Tailor').service('comparatorsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.egal = {
      name: 'Egal',
      properties: [
        { name: 'elements', type: 'array', arrayOf: [ 'mixed' ], required: true }, //mixed egals to all types
        { name: 'strictly egal (===)', keyName: 'strictlyEgal', type: 'bool', default: false }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.elements.every(function(currentValue, index, array) {
            return (values.strictlyEgal) ? array[0] === currentValue : array[0] == currentValue;
          });
        }
      }
    };

    elementsDefinition.higher = {
      name: 'Higher',
      properties: [
        { name: 'number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '> number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue > lowersHighest;
          });
        }
      }
    };

    elementsDefinition.lower = {
      name: 'Lower',
      properties: [
        { name: 'number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '< number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue > lowersHighest;
          });
        }
      }
    };

    elementsDefinition.higherOrEgal = {
      name: 'Higher or Egal',
      properties: [
        { name: 'number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '>= number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue >= lowersHighest;
          });
        }
      }
    };

    elementsDefinition.lowerOrEgal = {
      name: 'Lower or Egal',
      properties: [
        { name: 'number(s)', keyName:'lowers', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '<= number(s)', keyName:'highers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          var lowersHighest = values.lowers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (previousValue > currentValue) ? previousValue : currentValue;
          });

          return values.highers.every(function(currentValue, index, array) {
            return currentValue >= lowersHighest;
          });
        }
      }
    };

  };

}]);
