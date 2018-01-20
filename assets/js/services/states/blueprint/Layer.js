
angular.module('GMAO Tailor').factory('Layer', [ '$mdDialog', 'AllInstances', 'Element', function($mdDialog, AllInstances, Element) {

  AllInstances.newCollection('layer');


  class Layer {
    constructor(layer) { // { name: String, description: String, elements: [ Element.id ] }
      var defaultAttributes = { description: '', elements: [], _id: AllInstances.newId() };
      angular.merge(this, defaultAttributes, layer);

      AllInstances.layer[this._id] = this;
    }


    //Methods
      getElements() {
        return this.elements.map(function(elementId) {
          return AllInstances.element[elementId];
        });
      }

      removeElement(index) {
        this.elements.splice(index, 1);
      }

      deleteElements() {
        Element.delete(this.elements);
      }

      duplicateElements() {
        Element.duplicate(this.elements);
      }

      toggle(attribute) { //e.i. toggleSelection on every element of this layer
        Element['toggle' + attribute](this.elements, true);
      }

      areAll(attribute) {
        return this.elements.every(function(elementId) {
          return AllInstances.element[elementId]['get' + attribute];
        });
      };

      delete() {
        delete AllInstances.layer[this._id]; //not the best way ...
      }


    //Statics
      static get all() {
        return AllInstances.layer.All;
      }

      static set all(value) {
        AllInstances.layer.All = value;
      }

      static get selected() {
        return AllInstances.layer.Selected;
      }

      static set selected(value) {
        AllInstances.layer.Selected = value;
      }

      static create(event, elements) {
        var _this = this;

        $mdDialog.show({ //ask name and description
          controller: 'NewLayerDialogCtrl',
          templateUrl: 'templates/components/newLayerDialog.html',
          parent: angular.element(document.body),
          targetEvent: event,
          clickOutsideToClose: true
        })
        .then(function(layer) { //given by $mdDialog.hide()
          layer.elements = elements.slice(); //just ids
          new _this(layer);

        }, function() { //cancel
          //nothing to do
        });
      }

      static deleteAll() { //remove all layers (except 'All' && 'Selected')
        angular.forEach(AllInstances.layer, function(layer, layerId) {
          if (layerId.length > 8) { //not 'All', 'Selected', 'Visible', 'Reduced' or 'Copied'
            delete AllInstances.layer[layerId];
          } else { //'All', 'Selected', 'Visible', 'Reduced' or 'Copied'
            layer.elements = [];
          }
        });
      }

      static importAll(layers) {
        var _this = this; //Layer
        this.deleteAll(); //reset

        layers.forEach(function(layer) {
          new _this(layer);
        });
      }

      static exportAll() {
        return Object.keys(AllInstances.layer)
          .filter(function(layerId) {
            return layerId > 8; //not 'All', 'Selected', 'Visible', 'Reduced' or 'Copied'
          })
          .map(function(layerId) {
            var layer = AllInstances.layer[layerId];

            return {
              name: layer.name,
              description: layer.description,
              elements: layer.elements
            };
          });
      }
  }


  new Layer({ name: 'All', description: 'All drawn elements', _id: 'All' });
  new Layer({ name: 'Selected', description: 'All selected elements', _id: 'Selected' });
  new Layer({ name: 'Visible', description: 'All visible elements', _id: 'Visible' });
  new Layer({ name: 'Reduced', description: 'All reduced elements', _id: 'Reduced' });
  new Layer({ name: 'Copied', description: 'All copied elements', _id: 'Copied' });


  return Layer;
}]);
