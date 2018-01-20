
angular.module('GMAO Tailor').controller('BlueprintCtrl', [ '$scope', '$http', '$timeout', '$state', 'Dialog', 'Toast', 'Element', 'Layer', 'Global', 'AllInstances', function($scope, $http, $timeout, $state, Dialog, Toast, Element, Layer, Global, AllInstances) {

  // Network Related
    function httpBlueprint(method, action, params, versionName, msg) {
      var config = {
        method: method,
        url: '/api/blueprint/' + action
      };
      config[ (method.toLowerCase() === 'get') ? 'params' : 'data' ] = params;

      $http(config)
        .success(function(blueprint) {
          console.log('success httpBlueprint', blueprint);
          $scope.blueprint = blueprint;

          $scope.loadBlueprint(versionName, msg);
        })
        .error(function(err) {
          console.log(err);
          Toast.error(err);
        });
    }

    function readBlueprint(id, versionName) {
      httpBlueprint('GET', 'read', { id: id }, versionName);
    }

    $scope.loadBlueprint = function(versionName, msg) {
      var version = $scope.blueprint.versions.find(function(version) { return version.name === versionName; }) || $scope.blueprint.versions[$scope.blueprint.versions.length - 1];

      //update url params without reload the state
      $state.transitionTo('.', { id: $scope.blueprint._id, version: version.name }, { location: true, inherit: true, relative: $state.$current, notify: false });

      Element.importAll(version.elements);
      Layer.importAll(version.layers);
      Connection.importAll(version.connections);

      $scope.current = {
        tab: 0,
        versionName: version.name,
        versionsName: $scope.blueprint.versions.map(function(version) { return version.name; }),
        notes: version.notes,
        todo: version.todo,
        layer: AllInstances.layer.All,
        element: {},
        definition: {}
      };

      Toast.success(msg || $scope.blueprint.name + ' (' + version.name + ') has been loaded !');
    };

    $scope.saveBlueprint = function() {
      var action = (typeof $scope.blueprint._id === 'undefined') ? 'write' : 'update';

      var blueprint = {
        name: $scope.blueprint.name,
        description: $scope.blueprint.description,
        access: $scope.blueprint.access,
        tags: $scope.blueprint.tags,
        _id: $scope.blueprint._id,
        version: {
          name: $scope.current.versionName,
          notes: $scope.current.notes,
          todo: $scope.current.todo,
          elements: Element.exportAll(),
          layers: Layer.exportAll(),
          connections: Connection.exportAll()
        }
      };

      console.log('$scope.blueprint', $scope.blueprint);

      httpBlueprint('POST', action, { blueprint: blueprint }, $scope.current.versionName, $scope.blueprint.name + ' (' + version.name + ') has been saved !');
    };

    $scope.deleteBlueprint = function(ev) {
      Dialog
        .confirmDelete(ev, 'Blueprint')
        .then(function() { //success : the user decides to crush down his blueprint
          $http
            .delete('/api/blueprint/delete', { params: { id: $scope.blueprint._id } })
            .success(function() {
              $state.go('blueprints-private');
            })
            .error(function(err) {
              console.log(err);
              Toast.error(err);
            });
        });
    };


  // Default objects
    $scope.blueprint = {
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
          blueprint: {
            read: false,
            update: false,
            delete: false
          },
          instance: {
            write: false
          }
        },
        users: [],
        groups: []
      },
      userAccess: {
        blueprint: {
          read: true,
          update: true,
          delete: true
        },
        instance: {
          write: true
        }
      }
    };


  // Fetch blueprint if params
    if (typeof $state.params.id !== 'undefined') readBlueprint($state.params.id, $state.params.version); //fetch the blueprint


  // Display Instances
    $scope.AllInstances = AllInstances;




  // Helpers properties
    $scope.current = {
      tab: 0,
      versionName: '0.0.0',
      versionsName: [],
      notes: '',
      todo: '',
      layer: AllInstances.layer.All,
      element: {},
      definition: {}
    };

    $scope.search = {
      text: {
        accessUsers: '',
        layers: '',
        layer: '',
        documentation: {
          in: '',
          out: ''
        }
      },
      select: {
        accessUsers: '$',
        layers: '$',
        layer: '$',
        documentation: {
          in: '$',
          out: '$'
        }
      }
    };



  // Right Sidenav View Helpers
    function loadElement(element) {
      $scope.current.element = element;
      $scope.current.definition = element.getDefinition();
    }

    $scope.openProperties = function(element) {
      loadElement(element);
      $scope.current.tab = 4;
    };

    $scope.openDocumentation = function(element) {
      loadElement(element);
      $scope.current.tab = 5;
    };

    $scope.openLayer = function(layer) {
      $scope.current.layer = layer;
      $scope.current.tab = 3;
    };

    $scope.isCurrentElementDefined = function() {
      return typeof $scope.current.element._id !== 'undefined';
    };

    $scope.versionValidation = function() {
      var pattern = new RegExp('^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$');
      return pattern.match($scope.current.version);
    };


  //Access Rights
    $scope.defaultRights = {
      user: {
        blueprint: {
          read: true,
          update: false,
          delete: false
        },
        instance: {
          write: false
        }
      },
      group: {
        blueprint: {
          read: true,
          update: false,
          delete: false
        },
        instance: {
          write: false
        }
      }
    };



  // Resize canvas to avoid bug on elements' size
    function resizeCanvas() {
      var event = document.createEvent('Event');

      // Define that the event name is 'resize'.
      event.initEvent('resize', true, true);

      // target can be any Element or other EventTarget.
      window.dispatchEvent(event);
    }

    $timeout(resizeCanvas);
}]);
