angular.module('GMAO Tailor').factory('Connector', [ 'Settings', 'AllInstances', 'Connection', 'Toast', function(Settings, AllInstances, Connection, Toast) {

  AllInstances.newCollection('connector');
  new Project(document.getElementById('blueprintCanvas'));

  var connection = new Path.Line({ //use to draw a connection from a connector : just a path line not a Connection
    from: [ 0, 0 ],
    to: [ 0, 0 ],
    strokeColor: Settings.Connection.default.strokeColor,
    strokeWidth: Settings.Connection.default.strokeWidth,
    data: {},
    visible: false
  });


  class Connector {
    constructor(property, coordinates, side, elementId) {
      angular.merge(this, new Group({
        children: [
          //external circle
          new Path.Circle({
            center: coordinates,
            radius: 6,
            fillColor: new Color(Settings.Connector.styles.external[ (property.multiple) ? 'multiple' : 'default' ].fillColor),
            strokeColor: Settings.Connector.styles.external[ (property.multiple) ? 'multiple' : 'default' ].strokeColor,
            strokeWidth: 1,
            dashArray: [ 12, 6 ]
          }),
          //internal circle
          new Path.Circle({
            center: coordinates,
            radius: 1.5,
            fillColor: Settings.Connector.styles.internal.available.fillColor
          })
        ],
        data: {
          isRotating: false,
          totalRotation: 0,
          side: side,
          propertyIdentifier: property.identifier,
          class: 'connector'
        }
      }));
      if (side === 'in') this.data.available = true;

      this._id = AllInstances.newId();


      //Events
        this.onMouseEnter = function(event) {
          if (this.data.isRotating) this.scale(Settings.Connector.hover.scale);
        };

        this.onMouseLeave = function(event) {
          if (this.data.isRotating) this.scale(1 / Settings.Connector.hover.scale);
        };

        this.onFrame = function(event) {
          if (this.data.isRotating) { //has to rotate
            this.rotate(-Settings.Connector.rotating.spin);
            this.data.totalRotation += -Settings.Connector.rotating.spin;

          } else if (this.data.totalRotation !== 0) { //hasn't to rotate && has to complete last rotation
            if (this.data.totalRotation <= -360) this.data.totalRotation %= -360; //if |totalRotation| >= 360

            var rotation = (this.data.totalRotation > -Settings.Connector.rotating.spin) ? this.data.totalRotation : -Settings.Connector.rotating.spin;
            this.rotate(rotation);
            this.data.isRotating = false;
            this.data.totalRotation += rotation;
          }
        };

        //only out entries can draw a connecting line
        if (this.data.side === 'out') {

          this.onMouseDown = function(event) {
            if (Connection.canDraw) {

              connection.firstSegment.point = connection.lastSegment.point = this.position;
              connection.data.context.out = {
                elementId: this.data.elementId,
                connectorId: this._id,
                propertyIdentifier: this.data.propertyIdentifier
              };
              connection.visible = true;

              angular.forEach(AllInstances.connector, function(connector, connectorId) {
                connector.data.isRotating = connector.shouldRotate('in');
              });
            }
          };

          this.onMouseDrag = function(event) {
            if (connection.visible) connection.lastSegment.point = event.point;
          };

          this.onMouseUp = function(event) {
            if (connection.visible) {
              var inConnectorId = Object.keys(AllInstances.connector).find(function(connectorId) {
                return AllInstances.connector[connectorId].scaling === Settings.Connector.hover.scale && connectorId !== this._id;
              });

              if (typeof inConnectorId === 'undefined') {
                Connector.resetConnection('A connection can be made only from an Out to an In.');
              } else {
                var inConnector = AllInstances.connector[inConnectorId];
                connection.data.context.in = {
                  elementId: inConnector.data.elementId,
                  connectorId: inConnector._id,
                  propertyIdentifier: inConnector.data.propertyIdentifier
                };

                if (Connection.validate(connection.data.context)) { //high verification : to avoid any illogical connection
                  inConnector.data.available = AllInstances.property[inConnector.data.propertyIdentifier].data.definition.multiple;
                  new Connection(connection.data.context);
                  Connector.resetConnection();
                }
              }


              angular.forEach(AllInstances.connector, function(connector, connectorId) {
                connector.shouldRotate('out');
              });
            }
          };
        }


      AllInstances.connector[this._id] = this;
    }


    //Methods
      shouldRotate(side) { //which side should rotate if a connection with this (connector) is valid
        if (side !== this.data.side) {
          this.data.isRotating = false;

        } else if (this.data.side === 'out') { //side === this.data.side === 'out'
          this.data.isRotating = true;

        } else if (this.data.available) { //side === this.data.side === 'in' && available

          if (connection.data.context.out.elementId !== this.data.elementId) { //not the same element
            var thisType = AllInstances.property[this.data.propertyIdentifier].data.definition.type; // [ String ]

            var typeValid = thisType.indexOf('all') > -1 || thisType.some(function(type) {
              return AllInstances.property[connection.data.context.out.propertyIdentifier].data.definition.type.indexOf(type) > -1;
            });

            if (typeValid) {
              var alreadyExist = Connection.findOne(
                { elementId: this.data.elementId, propertyIdentifier: this.data.propertyIdentifier }, //In
                connection.data.context.out //Out
              );

              this.data.isRotating = typeof alreadyExist === 'undefined';
            } else {
              this.data.isRotating = false;
            }
          } else {
            this.data.isRotating = false;
          }
        } else {
          this.data.isRotating = false;
        }
      }


    //Statics
      static get connection() {
        return connection; //maybe this.connection is possible
      }

      static set connection(value) {
        connection = value; //maybe this.connection is possible
      }

      static resetConnection(msg) { //optional: if message then error;
        connection.visible = false;
        if (msg) Toast.error(msg);
      }

      static findOne(elementId, propertyIdentifier) { //find one by elementId and propertyIdentifier
        return AllInstances.connector[this.findOneId(elementId, propertyIdentifier)];
      }

      static findOneId(elementId, propertyIdentifier) { //find one by elementId and propertyIdentifier
        return Object.keys(AllInstances.connector).find(function(connectorId) {
          var connector = AllInstances.connector[connectorId];
          return connector.data.elementId === elementId && connector.data.propertyIdentifier === propertyIdentifier;
        });
      }
  }


  return Connector;

}]);
