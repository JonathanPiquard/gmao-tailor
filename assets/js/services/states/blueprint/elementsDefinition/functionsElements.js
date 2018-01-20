
angular.module('GMAO Tailor').service('functionsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.concat = {
      name: 'Concat',
      properties: [
        { name: 'strings', type: 'array', arrayOf: [ 'string' ], required: true },
        { name: 'separator', type: 'string' }
      ],
      value: {
        name: 'value',
        type: 'string',
        get: function(values) { //values: object containing all the values of the properties
          return values.strings.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return (typeof values.separator !== 'undefined') ? previousValue += values.separator + currentValue : previousValue += currentValue;
          });
        }
      }
    };

    elementsDefinition.matchByString = {
      name: 'Match by String',
      properties: [
        { name: 'string(s)', keyName: 'strings', type: 'array', arrayOf: [ 'string' ], required: true },
        { name: 'match string(s)', keyName: 'matchStrings', type: 'array', arrayOf: [ 'string' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.matchStrings.every(function(matchString, index, array) {
            return values.strings.every(function(string, index, array) {
              return string.indexOf(matchString) > -1;
            });
          });
        }
      }
    };

    elementsDefinition.matchByRegHex = {
      name: 'Match by RegHex',
      properties: [
        { name: 'string(s)', keyName: 'strings', type: 'array', arrayOf: [ 'string' ], required: true },
        { name: 'match(s)', keyName: 'matchs', type: 'array', arrayOf: [ 'RegHex' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.matchs.every(function(match, index, array) {
            return values.strings.every(function(string, index, array) {
              return (string.match(match)) ? true : false; //match return null if the string does not match else an array
            });
          });
        }
      }
    };

    elementsDefinition.indexOf = {
      name: 'Index of',
      properties: [
        { name: 'array(s)', keyName:'arrays', type: 'array', arrayOf: [ 'array' ], required: true },
        { name: 'element(s) to find', keyName: 'elements', type: 'array', arrayOf: [ 'mixed' ], required: true }
      ],
      value: {
        name: 'value',
        type: 'bool',
        get: function(values) { //values: object containing all the values of the properties
          return values.elements.every(function(element) {
            return values.arrays.every(function(array) {
              return array.indexOf(element) > -1;
            });
          });
        }
      }
    };

  };

}]);
