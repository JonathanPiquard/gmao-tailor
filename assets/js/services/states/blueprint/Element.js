
angular.module('GMAO Tailor').factory('Element', [ 'Settings', 'AllInstances', 'Connection', 'Connector', function(Settings, AllInstances, Connection, Connector) {

  AllInstances.newCollection('element');


  class Element {
    constructor(element) {
      var _this = this;

      //Init
        var defaultAttributes = {
          name: '',
          description: '',
          _id: AllInstances.newId()
        };

        angular.extend(this, defaultAttributes, element);

        var definiton = AllInstances.definition[this.definition];
        var version = definiton.getVersion(this.version);


        //Coordinates
          function getMaxLength(properties) {
            return Math.max.apply(null, properties.map(function(property) {
              return property.name.length;
            }));
          }

          if (typeof this.coordinates === 'undefined') {
            var propertiesMaxLength = getMaxLength(version.properties.in) + getMaxLength(version.properties.out) + 4;

            var width =  Math.max(propertiesMaxLength, definition.name.length, this.name) * 9 + 75; //75 for the padding where connectors will be
            var height = Math.max(version.properties.in.length, version.properties.out.length) * 40 + 50; //50 for the header and 40 for each property lines

            this.coordinates = {
              x: view.center.x - width / 2,
              y: view.center.y - height / 2,
              width: width,
              height: height
            };
          }


      //Main
        var main = {

          background: new Path.Rectangle({
            rectangle: new Rectangle(this.coordinates),
            fillColor: Settings.element.styles.rectPath.unselected.fillColor,
            data: {
              elementId: _this.id
            }
          })

        };


      //Header
        var header = {

          background: new Path.Rectangle({
            rectangle: new Rectangle(_this.coordinates.x, _this.coordinates.y, _this.coordinates.width, 50),
            fillColor: Settings.element.styles.rectHeaderPath.unselected.fillColor,
            data: {
              elementId: _this.id,
              class: 'header'
            }
          }),

          elementName: new PointText({
            point: [ _this.coordinates.x + _this.coordinates.width / 2, _this.coordinates.y + 20 ],
            content: _this.name,
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'center',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize
          }),

          definitionName: new PointText({
            point: [ _this.coordinates.x + _this.coordinates.width / 2, _this.coordinates.y + 45 ],
            content: definition.name,
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'center',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize * 0.75,
            data: {
              elementId: _this.id
            }
          }),

          in: new PointText({
            point: [ _this.coordinates.x + 20, _this.coordinates.y + 45 ],
            content: 'In',
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'left',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize
          }),

          out: new PointText({
            point: [ _this.coordinates.x + _this.coordinates.width - 20, _this.coordinates.y + 45 ],
            content: 'Out',
            fillColor: Settings.element.styles.textHeader.fillColor,
            justification: 'right',
            fontFamily: Settings.element.styles.textHeader.fontFamily,
            fontWeight: Settings.element.styles.textHeader.fontWeight,
            fontSize: Settings.element.styles.textHeader.fontSize
          })

        };

        header.background.onDoubleClick = function(event) {
          _this.toggleSelection();
        };

        header.definitionName.onDoubleClick = function(event) {
           _this.toggleReduction();
        };


      //Regroup components
        this.components = new Group({
          children: [ main.background, header.background, header.elementName, header.definitionName, header.in, header.out ],
          data: {
            class: 'element',
            elementId: this.id,
            connectors: new Group(),
            //connections: [], // [ Connection._id ]
            reduced: false,
            selected: false
          }
        });


      //Properties
        function createProperties(properties, side) {
          properties.forEach(function(property, index) {
            var coordinates = new Point( (side === 'in') ? _this.coordinates.x + 20 : _this.coordinates.x + _this.coordinates.width - 20, _this.coordinates.y + 70 + index * 40);

            var connector = new Connector(property, coordinates, side, elementId);

            var text = new PointText({
              point: [ (side === 'in') ? coordinates.x + 20 : coordinates.x - 20, coordinates.y ],
              content: property.name,
              fillColor: Settings.element.styles.colors[ (property.required) ? 'required' : 'notRequired' ],
              justification: (side === 'in') ? 'left' : 'right',
              fontFamily: Settings.element.styles.propertyText.fontFamily,
              fontWeight: (property.required) ? Settings.element.styles.font.required : Settings.element.styles.font.notRequired,
              fontSize: Settings.element.styles.propertyText.fontSize,
              data: {
                propertyIdentifier: property.identifier,
                elementId: _this._id,
                class: 'propertyName'
              }
            });

            text.onDoubleClick = function(event) {
              AllInstances.element[this.data.elementId].toggleReduction();
            };

            this.components.addChildren([ connector, property ]);
          });
        }

        var inProperties = createProperties(version.properties.in, 'in');
        var outProperties = createProperties(version.properties.out, 'out');


      //Events
        this.components.onMouseDown = function(event) {
          Connection.canDraw = false;
          event.delta = new Point(0, 0); //reset delta (distance between two event)
        };

        this.components.onMouseDrag = function(event) {
          if (this.data.selected) {
            AllInstances.layer.Selected.getElements().forEach(function(element) {
              element.move(event.delta);
            });
          } else {
            this.move(event.delta);
          }
        };

        this.components.onMouseUp = function(event) {
          Connection.canDraw = true;
          if (this.data.selected) {
            AllInstances.layer.Selected.getElements().forEach(function(element) {
              element.coordinates.x = element.components.position.x;
              element.coordinates.y = element.components.position.y;
            });
          } else {
            this.coordinates.x = this.components.position.x;
            this.coordinates.y = this.components.position.y;
          }
        };


      AllInstances.element[this._id] = this;
    }


    //Methods
      move(delta) {
        this.components.translate(delta);
        Connection.actualizeByElementId(this._id);
      }

      toggleReduction() {
        return this.setReduction(!this.components.data.reduced);
      }

      getReduction() {
        return this.components.data.reduced;
      }

      setReduction(value) {
        this.components.children.forEach(function(child, index) {
          if (index < 1 || index > 5) child.visible = !value; //every component except ones from the header
        });
        this.components.data.reduced = value;

        Connection.actualizeByElementId(this._id);

        if (value) {
          AllInstances.layer.Reduced.elements.push(this._id);
        } else {
          var index = AllInstances.layer.Reduced.elements.indexOf(this._id);
          if (index > -1) AllInstances.layer.Reduced.elements.splice(index, 1);
        }
      }

      toggleVisibility() {
        return this.setVisibility(!this.components.visible);
      }

      getVisibility() {
        return this.components.visible;
      }

      setVisibility(value) {
        this.components.visible = value;

        Connection.findByElementId(this._id).forEach(function(connection) {
          connection.visible = value;
        });

        if (value) {
          AllInstances.layer.Visible.elements.push(this._id);
        } else {
          var index = AllInstances.layer.Visible.elements.indexOf(this._id);
          if (index > -1) AllInstances.layer.Visible.elements.splice(index, 1);
        }
      }

      toggleSelection() {
        return this.setReduction(!this.components.data.selected);
      }

      getSelection() {
        return this.components.data.selected;
      }

      setSelection(value) {
        var state = (value) ? 'selected' : 'default';
        this.components.children[0].style.fillColor = Settings.Element[state].main.background.fillcolor;
        this.components.children[1].style.fillColor = Settings.Element[state].header.background.fillcolor;

        this.components.data.selected = value;

        if (value) {
          AllInstances.layer.Selected.elements.push(this._id);
        } else {
          var index = AllInstances.layer.Selected.elements.indexOf(this._id);
          if (index > -1) AllInstances.layer.Selected.elements.splice(index, 1);
        }
      }

      getDefinition() {
        var definition = angular.merge({}, AllInstances.definition[this.definition]); //copy

        return {
          name: definition.name,
          description: definition.description,
          properties: definition.getVersion(this.version).properties,
          author: definition.author,
          _id: definition._id
        };
      }

      duplicate() {
        Element.duplicate(this._id); //not the best way but avoid to duplicate the code from Element.duplicate
      }

      delete() {
        Element.delete(this._id); //definitively not the best way but avoid to duplicate the code from Element.delete
      }


    //Statics
      static toggleReduction(elementIds, same) { //same (Bool, optional): every elements will have the property
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        if (same) {
          var reduction = !AllInstances.element[ elementIds[0] ].components.data.reduced; //to have the same effect on every given elements
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].setReduction(reduction);
          });

        } else {
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].toggleReduction();
          });
        }
      }

      static toggleVisibility(elementIds, same) { //same (Bool, optional): every elements will have the property
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        if (same) {
          var visibility = !AllInstances.element[ elementIds[0] ].components.visible; //to have the same effect on every given elements
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].setVisibility(visibility);

          });
        } else {
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].toggleVisibility();
          });
        }
      }

      static toggleSelection(elementIds, same) { //same (Bool, optional): every elements will have the property
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        if (same) {
          var selection = !AllInstances.element[ elementIds[0] ].components.data.selected; //to have the same effect on every given elements
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].setSelection(selection);
          });

        } else {
          elementIds.forEach(function(elementId) {
            AllInstances.element[elementId].toggleSelection();
          });
        }
      }

      static toggleSelectionAll(same) { //same (Bool, optional): every elements will have the property
        if (same) {
          var selection = !AllInstances.element[Object.keys(AllInstances.element)[0]].components.data.selected; //to have the same effect on every given elements
          angular.forEach(AllInstances.element, function(element, elementId) {
            element.setSelection(selection);
          });

        } else {
          angular.forEach(AllInstances.element, function(element, elementId) {
            element.toggleSelection();
          });
        }
      }

      static copySelected() {
        AllInstances.layer.Copied.elements = AllInstances.layer.Selected.elements.slice();
      }

      static pasteCopied() {
        this.duplicate(AllInstances.layer.Copied.elements);
      }

      static duplicate(elementIds) {
        if (!Array.isArray(elementIds)) { elementIds = [ elementIds ]; }

        var connections = {}; //every connections to duplicate indexed by _id => avoid duplications

        var copyElements = elementIds.map(function(elementId) {
          var element = AllInstances.element[elementId];
          Connection.findByElementId(elementId).forEach(function(connection) { connections[connection._id] = connection; });

          return new Element(angular.merge({}, element, { _id: AllInstances.newId() }));
        });


        function updateContext(context, side) {
          var index = elementIds.indexOf(context[side].elementId);

          if (index > -1) {
            context[side].elementId = copyElements[index].elementId;
            context[side].connectorId = Connector.findOneId(context[side].elementId, context[side].propertyIdentifier);
          }
        }

        angular.forEach(connections, function(connection, connectionId) {
          var newContext = angular.merge({}, connection.data.context);

          updateContext(newContext, 'in');
          updateContext(newContext, 'out');

          new Connection(newContext);
        });
      }

      static delete(elementsId) {
        if (!Array.isArray(elementsId)) { elementsId = [ elementsId ]; }

        elementsId.forEach(function(elementId) {
          AllInstances.element[elementId].components.remove();
          Connection.remove(Connection.findByElementId(elementId));

          angular.forEach(AllInstances.layer, function(layer, layerId) {
            var index = layer.elements.indexOf(elementId);
            if (index > -1) layer.elements.splice(index, 1);
          });

          delete AllInstances.element[elementId];
        });
      }

      static deleteAll() { //remove all elements but does not erase them from layers or connections (used when Layer and Connection are reset too)
        angular.forEach(AllInstances.element, function(element, elementId) {
          element.components.remove();
        });

        AllInstances.newCollection('element');
      }

      static importAll(elements) {
        var _this = this; //Element
        this.deleteAll(); //reset

        elements.forEach(function(element) {
          new _this(element);
        });
      }

      static exportAll() {
        return Object.keys(AllInstances.element).map(function(elementId) {
          var element = AllInstances.element[elementId];

          return {
            name: element.name,
            description: element.description,
            coordinates: element.coordinates,
            version: element.version,
            definition: element.definition,
            _id: element._id
          };
        });
      }

  }


  return Element;

}]);
