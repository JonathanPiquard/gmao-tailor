
angular.module('GMAO Tailor').controller('ElementCtrl', [ '$scope', '$http', '$state', 'Dialog', 'Toast', function($scope, $http, $state, Dialog, Toast) {

  // Code Mirror
  $scope.editorOptions = {
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    scrollbarStyle: 'simple',
    readOnly: false,
    tabSize: 2,
    smartIndent: true,
    mode: { name: "javascript", typescript: true },
    theme: 'monokai'
  };


  // Network Related

  function httpElement(method, action, params, versionName) {
    var config = {
      method: method,
      url: '/api/element/' + action
    };

    config[ (method.toLowerCase() === 'get') ? 'params' : 'data' ] = params || {};

    $http(config)
      .success(function(element) {
        element.versions.forEach(function(version) {
          version.properties.in.forEach(function(inProperty) {
            if (inProperty.validator === '') {
              inProperty.validator = defaultProperty.in.validator;
              inProperty.hasValidator = false;
            }
          });
          version.properties.out.forEach(function(outProperty) {
            if (outProperty.getter === '') {
              outProperty.getter = defaultProperty.out.getter;
              outProperty.hasGetter = false;
            }
          });
        });

        console.log('success httpElement', element);

        $scope.element = element;

        $scope.loadElement(versionName, true);
      })
      .error(function(err) {
        console.log(err);
        Toast.error(err);
      });
  }

  function readElement(id, versionName) {
    httpElement('GET', 'read', { id: id }, versionName);
  }

  $scope.loadElement = function(versionName, hideToast) {
    var version = $scope.element.versions.find(function(version) { return version.name === versionName; }) || $scope.element.versions[$scope.element.versions.length - 1];

    //update url params without reload the state
    $state.transitionTo('.', { id: $scope.element._id, version: version.name }, { location: true, inherit: true, relative: $state.$current, notify: false });

    $scope.current = {
      tab: 0,
      versionName: version.name,
      versionsName: $scope.element.versions.map(function(version) { return version.name; }),
      notes: version.notes,
      todo: version.todo,
      properties: version.properties,
      property: angular.copy(defaultProperty)
    };

    if (!hideToast) Toast.success($scope.element.name + ' (' + version.name + ') has been loaded !');
  };

  $scope.saveElement = function() {
    if ($scope.current.properties.in.length + $scope.current.properties.out.length > 0) {
      var action = (typeof $scope.element._id === 'undefined') ? 'write' : 'update';

      var element = {
        name: $scope.element.name,
        description: $scope.element.description,
        tags: $scope.element.tags,
        access: $scope.element.access,
        version: {
          name: $scope.current.versionName,
          notes: $scope.current.notes,
          todo: $scope.current.todo,
          properties: {
            in: $scope.current.properties.in.map(function(property) {
              return {
                name: property.name,
                description: property.description,
                helper: property.helper,
                type: property.type,
                required: property.required,
                multiple: property.multiple,
                validator: (property.hasValidator) ? property.validator : ''
              };
            }),
            out: $scope.current.properties.out.map(function(property) {
              return {
                name: property.name,
                description: property.description,
                helper: property.helper,
                type: property.type,
                required: property.required,
                getter: (property.hasGetter) ? property.getter : ''
              };
            })
          }
        }
      };

      if (typeof $scope.element._id !== 'undefined') element._id = $scope.element._id;

      console.log('element', element);

      httpElement('POST', action, { element: element }, $scope.current.versionName);
      Toast.success($scope.element.name + ' has been saved !');
    } else {
      Toast.error($scope.element.name + ' has no properties.');
    }
  };

  $scope.deleteElement = function(ev) {
    Dialog
      .confirmDelete(ev, 'Element')
      .then(function() { //success : the user decides to crush down his element
        $http
          .delete('/api/element/delete', { params: { id: $scope.element._id } })
          .success(function() {
            $state.go('elements-private');
          })
          .error(function(err) {
            console.log(err);
            Toast.error(err);
          });
      });
  };


  // Default objects

  var defaultProperty = {
    in: {
      name: '',
      description: '',
      helper: '',
      type: [ 'all' ],
      required: false,
      multiple: false,
      hasValidate: false,
      validator:
        '\n/**\n' +
        ' *  A Function to test if a connection with this In property and\n' +
        ' *  an Out property from another element is valid\n' +
        ' *  If valid the connection will be created else it will not\n' +
        ' *  and a message explaining the issue will be displayed.\n' +
        ' *  \n' +
        ' *  Note: A connection can only be made from an In property to an Out property\n' +
        '**/\n\n' +

        'function(property, outProperty, inProperties) {\n' +
        '  // inProperties corresponds to all the others In properties\n\n' +

        '  /** property/outProperty or property from inProperties looks like that :\n' +
        '   *  {\n' +
        '   *     name: String,\n' +
        '   *     description: String,\n' +
        '   *     helper: String,\n' +
        '   *     type: [ String ],\n' +
        '   *     required: Bool,\n' +
        '   *     \n' +
        '   *     // only property has a multiple attribute\n' +
        '   *     multiple: Bool,\n' +
        '   *     \n' +
        '   *     // only outProperty and property from inProperties has a value attribute.\n' +
        '   *     // outProperty will carry its value to property if the validation is successful\n' +
        '   *     // like every property from inProperties\n' +
        '   *     value: anything\n' +
        '   * }\n' +
        '  **/\n\n' +

        '  // return true -> validation successful\n' +
        '  // return false -> error with a generic message\n' +
        '  // return String -> error with a custom message\n' +
        '  return true;\n' +
        '}', //function to eval
      _id: null
    },
    out: {
      name: '',
      description: '',
      helper: '',
      type: [ 'all' ],
      required: false,
      hasGetValue: false,
      getter:
        '\n/**\n' +
        ' *  A Function to test if a connection with this In property and\n' +
        ' *  an Out property from another element is valid\n' +
        ' *  If valid the connection will be created else it will not\n' +
        ' *  and a message explaining the issue will be displayed.\n' +
        ' *  \n' +
        ' *  Note: A connection can only be made from an In property to an Out property\n' +
        '**/\n\n' +

        'function(property, outProperty, inProperties) {\n' +
        '  // inProperties corresponds to all the others In properties\n\n' +

        '  /** property/outProperty or property from inProperties looks like that :\n' +
        '   *  {\n' +
        '   *     name: String,\n' +
        '   *     description: String,\n' +
        '   *     helper: String,\n' +
        '   *     type: [ String ],\n' +
        '   *     required: Bool,\n' +
        '   *     \n' +
        '   *     // only property has a multiple attribute\n' +
        '   *     multiple: Bool,\n' +
        '   *     \n' +
        '   *     // only outProperty and property from inProperties has a value attribute.\n' +
        '   *     // outProperty will carry its value to property if the validation is successful\n' +
        '   *     // like every property from inProperties\n' +
        '   *     value: anything\n' +
        '   * }\n' +
        '  **/\n\n' +

        '  // return true -> validation successful\n' +
        '  // return false -> error with a generic message\n' +
        '  // return String -> error with a custom message\n' +
        '  return true;\n' +
        '}',
      _id: null
    }
  };

  $scope.element = {
    name: '',
    description: '',
    tags: [],
    author: {
      name: $scope.currentUser.name,
      _id: $scope.currentUser._id
    },
    versions: [],
    access: {
      public: {
        element: {
          read: false,
          use: false,
          update: false,
          delete: false
        }
      },
      users: [],
      groups: []
    },
    userAccess: {
      element: {
        read: true,
        use: true,
        update: true,
        delete: true
      }
    }
  };


  // Fetch the element if params

  if (typeof $state.params.id !== 'undefined') readElement($state.params.id, $state.params.version);


  // Helpers properties

  $scope.types = [
    'all',
    'bool',
    'color',
    'date',
    'file',
    'image',
    'number',
    'text'
  ];

  $scope.search = {
    text: {
      properties: {
        in: '',
        out: ''
      }
    },
    select: {
      properties: {
        in: '$',
        out: '$'
      }
    }
  };

  $scope.current = {
    tab : 0,
    versionName: '0.0.0',
    versionsName: [],
    notes: '',
    todo: '',
    selected: {
      in: '',
      out: ''
    },
    text: {
      in: '',
      out: ''
    },
    properties: {
      in: [],
      out: []
    },
    property: angular.copy(defaultProperty)
  };


  // Property

  var ids = { //easier to initialize it with a value which will be the max value; -1 -> 0
    in: [ -1 ],
    out: [ -1 ]
  };

  $scope.loadProperty = function(side, property) {
    $scope.current.property[side] = property;
    $scope.current.tab = (side === 'in') ? 2 : 4;
  };

  $scope.removeProperty = function(side, property, index) {
    if (property._id === $scope.current.property[side]._id) $scope.clearProperty(side);

    delete $scope.current.properties[side][index];
  };

  $scope.clearProperty = function(side) { // side: 'in' or 'out'
    $scope.current.property[side] = angular.copy(defaultProperty[side]);
  };

  $scope.submitProperty = function(side) {
    var currentProperty = $scope.current.property[side];

    if (currentProperty._id) { //update
      var foundProperty = $scope.current.properties[side].find(function(property) {
        return property._id === currentProperty._id;
      });

      if (typeof foundProperty !== 'undefined') {
        foundProperty = currentProperty;
        $scope.current.tab = (side === 'in') ? 1 : 3;
        $scope.clearProperty(side);

      } else { //err
        Toast.error('The property cannot be updated : it does not exist anymore. Click another time to add it as a new property');
        currentProperty._id = null;
      }

    } else { //add
      currentProperty._id =  Math.max.apply(null, ids[side]) + 1;
      ids[side].push(currentProperty._id);

      $scope.current.properties[side].push(currentProperty);
      $scope.current.tab = (side === 'in') ? 1 : 3;
      $scope.clearProperty(side);
    }
  };


  //Access Rights
  $scope.defaultRights = {
    user: {
      element: {
        read: true,
        use: true,
        update: false,
        delete: false
      }
    },
    group: {
      element: {
        read: true,
        use: false,
        update: false,
        delete: false
      }
    }
  };

}]);
