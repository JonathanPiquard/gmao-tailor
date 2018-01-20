
angular.module('GMAO Tailor').service('formInputsElements', [ function() {

  this.addTo = function(elementsDefinition) { //the service 'elementsDefinition' calls the method 'add' of every services with blueprint elements with 'this' as the parameter. So 'elementsDefinition' gains more keys and can hold every elements

    elementsDefinition.Input_ = {
      name: 'Input*',
      properties: [ //all the commun properties to all the BlueprintTypes (never used alone, has to be a specific type of BlueprintType)
        { name: 'name', type: 'string', required: true, description: 'The name given to the form input which the user has to complete.' },
        { name: 'description', type: 'string', description: 'A description to explain to what corresponds this form input.' },
        { name: 'helper', type: 'string', description: 'A quick text to explain what reponse the user should give you.' },
        { name: 'visibility', type: 'string', enum: [ 'reduce-panel', 'extend-panel', 'full-panel', 'full-panel-reduce' ], default: 'full-panel', description: 'The visibility allows you to choose to display or not this form input according to the state of diplay of the form.' },
        { name: 'required', type: 'bool', default: false, description: 'Does the user absolutly need to fullfill this form input ?' },
        { name: 'disabled', type: 'bool', default: false, description: 'Is this form input disabled ?' }
      ]
    };

    elementsDefinition.Input_String = {
      name: 'Input String',
      description: 'Ask the user to return a string (a text) throught a form. This string will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ], description: 'If you want to allow only some choices to this input. Indeed an enum is one of the available answer to the input. The type of the enum must correspond to the type of the value returned by the input.' },
        { name: 'match RegHex', type: 'RegHex', description: 'If you want that the value given by the user matchs some complexe criterias, you can give it a RegHex expression.' },
        { name: 'uppercase', type: 'bool', default: false, description: 'The value returned by the user should be converted into uppercase ?' },
        { name: 'lowercase', type: 'bool', default: false, description: 'The value returned by the user should be converted into lowercase ?' },
        { name: 'maxlength', type: 'number', description: 'How much the lenght of the returned value can be long ?' },
        { name: 'minlength', type: 'number', description: 'How much the lenght of the returned value can be short ?' }
      ],
      value: {
        name: 'string',
        type: 'string',
        description: 'The returned value : a string.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Number = {
      name: 'Input Number',
      description: 'Ask the user to return a number throught a form. This number will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'max', type: 'number', description: 'How much the returned value can be high ?' },
        { name: 'min', type: 'number', description: 'How much the returned value can be low ?' }
      ],
      value: {
        name: 'number',
        type: 'number',
        description: 'The returned value : a number.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Date = {
      name: 'Input Date',
      description: 'Ask the user to return a date throught a form. This date will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'format', type: 'string', default: 'medium', description: 'How the date should be display ? Check out angular ng-date doc or something like that' },
        { name: 'max', type: 'date', description: 'How much the returned value can be in the futur ?' },
        { name: 'min', type: 'date', description: 'How much the returned value can be in the past ?' }
      ],
      value: {
        name: 'date',
        type: 'date',
        description: 'The returned value : a date.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Boolean = {
      name: 'Input Bool',
      description: 'Ask the user to return a boolean (true or false) throught a form. This boolean will have to match the properties that you will set below.',
      properties: [
        { name: 'false option', keyName: 'falseOption', type: 'boolOption', description: 'A Bool Option to attribute an other value to true (then true).' },
        { name: 'true option', keyName: 'trueOption', type: 'boolOption', description: 'A Bool Option to attribute an other value to false (then false).' }
      ],
      value: {
        name: 'bool',
        type: 'bool',
        description: 'The returned value : bool or the value corresponding to the Bool Option of the returned value.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Array = {
      name: 'Input Array',
      description: 'The user can complete a form corresponding to the Form Inputs given (arrayOf), as many time as he wants. For example, if you want to have a field with the list of contacts, you can create a Form Input Array with all Form Inputs related to the creation of a contact. The user can complete the form as many time as he has contacts. The properties below help to bound the behavior of the element to what you want it to be !',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'array of', keyName: 'arrayOf', type: 'array', arrayOf: [ 'Input_' ], required: true, escription: 'All the Form Inputs the array should contain.' }
      ],
      value: {
        name: 'array',
        type: 'array',
        arrayOf: [ 'object' ],
        description: 'An array of object containing every values with the id of the Form Inputs as its keys.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Object = {
      name: 'Input Object',
      description: 'Ask the user to return the values of multiple Form Inputs throught a form. It acts like a folder of Form Inputs. It allows you to categorise the form. his object will have to match the properties that you will set below.',
      properties: [
        { name: 'enum', type: 'array', arrayOf: [ 'enum' ] },
        { name: 'object of', keyName: 'objectOf', type: 'array', arrayOf: [ 'Input_' ], required: true, description: 'The list of Form Inputs (can include other Form Input Object) to categorize.' }
      ],
      value: {
        name: 'object',
        type: 'object',
        description: 'An object with the returned value of every Form Input with their id as key.',
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Selector = {
      name: 'Input Selector',
      properties: [
        { name: 'selector of', keyName: 'selectorOf', type: 'array', arrayOf: [ 'selection' ], required: true, description: "You (or the user if allowed) can select an object of Form Inputs to complete. It's a big select of group of Form Inputs. For example if the user tells you he loves bike, you might want him to fulfill the caracteristics of his favorite bike, instead of completing those of a car." },
        { name: 'by user', keyName: 'byUser', type: 'bool', default: true, description: 'Can the user change himself the selection ?' },
        { name: 'selectorIndex', type: 'number', description: 'The id of the current Selection. This can define the default selection and even allow you to change it according to some logic.' } //if allowUser is false and then required
      ],
      value: {
        name: 'selection',
        type: 'selection',
        description: "An object containing all the returned values (corresponding to the Form Inputs of the current Selection) given by user, with the Form Inputs's ids as its keys.",
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

    elementsDefinition.Input_Blueprint = {
      name: 'Input Blueprint',
      description: 'Load another Blueprint (with you can interact throught "Parameters") like if you have create it right here into this Blueprint. This allows you to not repeting yourselft and to maintain your work easily.',
      properties: [ //to fullfill with the sidenav or a dialog
        { name: 'Blueprint id', type: 'number', required: true, description: 'The id of the Blueprint being fetched. You can set it manually or via the right sidenav (Tab "Element").' },
        { name: 'Parameters', type: 'array', arrayOf: [ 'property' ], description: 'All the Properties the Blueprint requests. They correspond to external variables. Some should be given if required, others are optional. Each of these Properties must have their property "key" corresponding to the property "key" of the Parameter given in the Blueprint fetched by this Form Input Blueprint.' }
      ],
      value: {
        name: 'Return Values',
        description: 'All the values the Blueprint thinks you should have. You can, like with any object, extract a value by connecting a Property which has its property "key" matching the property "key" of the Return (from the Blueprint fetched) giving the value.',
        type: 'object', //all the outputs
        get: function(values) { //values: object containing all the values of the properties
          //return values;
        }
      }
    };

  };

}]);
