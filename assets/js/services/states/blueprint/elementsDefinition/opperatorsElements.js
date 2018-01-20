
angular.module('GMAO Tailor').service('opperatorsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.addition = {
      name: 'Addition',
      properties: [
        { name: 'numbers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'sum',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
         return values.numbers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
           return previousValue + currentValue;
         }); //return the last returned value so the sum
        }
      }
    };

    elementsDefinition.substraction = {
      name: 'Substraction',
      properties: [
        { name: 'number(s)', keyName: 'minuends', type: 'array', arrayOf: [ 'number', 'date' ], required: true }, //the key in values will be the keyName if exists or the name
        { name: '- number(s)', keyName: 'substrahends', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'difference',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          var sumMinuends = values.minuends.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          });

          var sumSubstrahends = values.substrahends.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          }); //return the last returned value so the sum

          return sumMinuends - sumSubstrahends;
        }
      }
    };

    elementsDefinition.multiplication = {
      name: 'Multiplication',
      properties: [
        { name: 'numbers', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'product',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
         return values.numbers.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
           return previousValue * currentValue;
         }); //return the last returned value so the product
        }
      }
    };

    elementsDefinition.division = {
      name: 'Division',
      properties: [
        { name: 'numerator(s)', keyName: 'numerators', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: 'denominator(s)', keyName: 'denominators', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'quotient',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          var ProductNumerators = values.numerators.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          });

          var ProductDenominators = values.denominators.reduce(function(previousValue, currentValue, index, array) { //the previousValue is the value returned by the call of this function for the previous element of the array
            return previousValue + currentValue;
          }); //return the last returned value so the quotient

          return ProductNumerators / ProductDenominators;
        }
      }
    };

    elementsDefinition.modulo = {
      name: 'Modulo',
      properties: [
        { name: 'number', keyName: 'number', type: 'array', arrayOf: [ 'number', 'date' ], required: true },
        { name: '% number', keyName: 'modulator', type: 'array', arrayOf: [ 'number', 'date' ], required: true }
      ],
      value: {
        name: 'module',
        type: 'mixed',
        get: function(values) { //values: object containing all the values of the properties
          return values.number % values.modulator;
        }
      }
    };

  };

}]);
