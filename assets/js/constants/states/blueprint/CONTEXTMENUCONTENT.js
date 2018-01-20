
angular.module('GMAO Tailor').constant('CONTEXTMENUCONTENT', [

    {
      name: 'Comparators',
      content: [ 'egal', 'higher', 'lower', 'higherOrEgal', 'lowerOrEgal' ]
    },

    {
      name: 'Functions',
      content: [
        {
          name: 'Array',
          content: [ 'indexOf' ]
        },

        {
          name: 'String',
          content: [ 'concat', 'matchByString', 'matchByRegHex' ]
        }
      ]
    },

    {
      name: 'Opperators',
      content: [ 'addition', 'substraction', 'multiplication', 'division', 'modulo' ]
    },

    {
      name: 'Parameters',
      content: [ 'boolOption', 'enum', 'property', 'RegHex', 'selection' ]
    },

    {
      name: 'Primary',
      content: [ 'array', 'bool', 'date', 'number', 'object', 'string' ]
    },

    {
      name: 'User Inputs',
      content: [ 'Input_Array', 'Input_Blueprint', 'Input_Boolean', 'Input_Date', 'Input_Number', 'Input_Object', 'Input_Selector', 'Input_String' ]
    },

    {
      name: 'Variables',
      content: [ 'parameter', 'return' ]
    }

]);
