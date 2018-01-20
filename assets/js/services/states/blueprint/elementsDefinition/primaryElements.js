
angular.module('GMAO Tailor').service('primaryElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.array = {
      name: 'Array',
      properties: [
        { name: 'type', type: 'string', required: true }
      ],
      value: {
        name: 'array',
        type: 'array', //all the outputs
        arrayOf: [ 'mixed' ],
        in: {
          type: 'array', //all the inputs
          arrayOf: [ 'mixed' ]
        },
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.bool = {
      name: 'Bool',
      properties: [],
      value: {
        name: 'bool',
        type: 'bool', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.date = {
      name: 'Date',
      properties: [],
      value: {
        name: 'date',
        type: 'date', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.number = {
      name: 'Number',
      properties: [],
      value: {
        name: 'number',
        type: 'number', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.object = {
      name: 'Object',
      properties: [],
      value: {
        name: 'object',
        type: 'object', //all the outputs
        in: {
          type: 'array', //all the inputs
          arrayOf: [ 'property' ]
        },
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.string = {
      name: 'String',
      properties: [],
      value: {
        name: 'string',
        type: 'string', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.mixed = { //to avoid any problem when reachingthe name corresponding to an element type
      name: '*',
      properties: [],
      value: {
        name: 'string',
        type: 'string', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

  };

}]);
