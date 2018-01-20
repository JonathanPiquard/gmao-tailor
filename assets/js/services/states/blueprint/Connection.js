angular.module('GMAO Tailor').factory('Connection', [ 'Settings', 'AllInstances', function(Settings, AllInstances) {

  AllInstances.newCollection('connection');

  var canDraw = true; //a connection can be drawn ? element (service) can prevent this (connection) to draw a connection for example if an element is moving

  class Connection {
    constructor(context) {
      angular.merge(this, new Path.Line({
        from: Connection.getSegmentPosition(context.out),
        to: Connection.getSegmentPosition(context.in),
        strokeColor: Settings.Connection.default.strokeColor,
        strokeWidth: Settings.Connection.default.strokeWidth,
        data: { context: context, _id: AllInstances.newId }
      }));

      if (typeof context.in !== 'undefined') { //set the in connector' available to false if the property is not multiple
        AllInstances.connector[context.in.connectorId].data.available = AllInstances.property[context.in.propertyIdentifier].data.definition.multiple;
      }

      //Events
        this.onDoubleClick = function(event) {
          delete AllInstances.connection[this._id];
          this.remove();
        };

        this.onMouseEnter = function(event) {
          this.strokeColor = Settings.Connection.hover.strokeColor;
          this.strokeWidth = Settings.Connection.hover.strokeWidth;
        };

        this.onMouseLeave = function(event) {
          this.strokeColor = Settings.Connection.default.strokeColor;
          this.strokeWidth = Settings.Connection.default.strokeWidth;
        };

      AllInstances.connection[this._id] = this;
    }


    //Methods
      actualize(side) { //side (optional) : which side has to be actualized
        if (typeof side === 'undefined') {
          this.firstSegment.point = Connection.getSegmentPosition(this.data.context.out);
          this.lastSegment.point =  Connection.getSegmentPosition(this.data.context.in);
        } else if (side === 'out') {
          this.firstSegment.point = Connection.getSegmentPosition(this.data.context.out);
        } else { //in (avoid to process another condition)
          this.lastSegment.point =  Connection.getSegmentPosition(this.data.context.in);
        }
      }


    //Statics
      static get canDraw() {
        return canDraw; //maybe this.canDraw is possible
      }

      static set canDraw(value) {
        canDraw = value; //maybe this.canDraw is possible
      }

      /*
      static getCanDraw() {
        canDraw = true;
      }

      static setCanDraw(value) {
        canDraw = value;
      }
      */

      static validate(context) {
        // TODO: advanced validation which will evaluate if there is any circular reference between elements and also call validator() or getter() from the properties' definition
        return true;
      }

      static getSegmentPosition(context) { //get the position corresponding to a context (context.in || context.out)
        var elementComponents = AllInstances.element[context.elementId].components,
            connector = AllInstances.connector[context.connectorId];

        return (elementComponents.data.reduced) ? elementComponents.children[6].position : connector.position;
      }

      static findById(ids) { // [ string ]
        return ids.map(function(id) {
          return AllInstances.connection[id];
        });
      }

      static findByElementId(elementId, side) { //side (optional) : return only connections to which the element owns the 'in' || 'out' connector
        var connectionsId;

        if (typeof side !== 'undefined') {
          connectionsId = Object.keys(AllInstances.connection).filter(function(connectionId) {
            return AllInstances.connection[connectionId].data.context[side].elementId === elementId;
          });
        } else {
          connectionsId = Object.keys(AllInstances.connection).filter(function(connectionId) {
            var context = AllInstances.connection[connectionId].data.context;
            return context.in.elementId === elementId || context.out.elementId === elementId;
          });
        }

        return connectionsId.map(function(connectionId) {
          return AllInstances.connection[connectionId];
        });
      }

      static findOne(contextIn, contextOut) { //find one by elementId and propertyIdentifier
        var foundId = Object.keys(AllInstances.connection).find(function(connectionId) {
          var context = AllInstances.connection[connectionId].data.context;
          return context.in.elementId === contextIn.elementId && context.in.propertyIdentifier === contextIn.propertyIdentifier &&
                 context.out.elementId === contextOut.elementId && context.out.propertyIdentifier === contextOut.propertyIdentifier;
        });
        return AllInstances.connection[foundId];
      }

      static actualize(connections, side) {
        connections.forEach(function(connection) {
          connection.actualize(side);
        });
      }

      static actualizeByElementId(elementId) {
        angular.forEach(AllInstances.connection, function(connection, connectionId) {
          if (connection.data.context.in.elementId === elementId) {
            connection.actualize('in');
          } else if (connection.data.context.out.elementId === elementId) {
            connection.actualize('out');
          }
        });
      }

      static delete(connections) {
        if (!Array.isArray(connections)) { connections = [ connections ]; }

        connections.forEach(function(connection) {
          AllInstances.connector[connection.data.context.in.connectorId].data.available = true;
          connection.remove();
          delete AllInstances.connection[connection._id];
        });
      }

      static deleteAll() { //does not make available the in connector (used when Layer and Element are reset too)
        angular.forEach(AllInstances.connection, function(connection, connectionId) {
          connection.remove();
        });
        AllInstances.newCollection('connection');
      }

      static importAll(contexts) {
        var _this = this; //Connection
        this.deleteAll(); //reset

        contexts.forEach(function(context) {
          new _this(context);
        });
      }

      static exportAll() {
        return Object.keys(AllInstances.connection).map(function(connectionId) {
          return AllInstances.connection[connectionId].data.context;
        });
      }

  }


  return Connection;

}]);
