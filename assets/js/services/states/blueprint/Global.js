
angular.module('GMAO Tailor').service('Global', [ 'Settings', 'Element', 'Connection', 'Connector', 'Box', 'AllInstances', function(Settings, Element, Connection, Connector, Box, AllInstances) {

  //Keybindings
    var eventHandlers = {

      onKeyDown: {
        toggleSelectAll: function(event) {
          Element.toggleSelectionAll();
        },
        inverseSelection: function(event) {
          Element.toggleSelectionAll();
        },
        copySelected: function(event) {
          Element.copySelected();
        },
        pasteCopied: function(event) {
          Element.pasteCopied();
        },
        deleteSelected: function(event) {
          AllInstances.layer.Selected.deleteElements();
        },
        restoreZoom: function(event) {
          view.zoom = Settings.view.zoom.value;
        },
        plusZoom: function(event) {
          view.zoom += view.zoom * Settings.view.zoom.pitch;
        },
        minusZoom: function(event) {
          if (view.zoom - view.zoom * Settings.view.zoom.pitch > Math.max(0.01, Settings.view.zoom.pitch)) { //avoid bug because to close to 0
            view.zoom -= view.zoom * Settings.view.zoom.pitch;
          }
        },
        centerView: function(event) {
          view.center = project.activeLayer.position;
        },
        center: function(event) {
          //center on the view if there are not any elements selected
          if (AllInstances.layer.Selected.elements.length === 0) {
            eventHandlers.onKeyDown.centerView();

          } else { //center the elements selected
            var selectedElements = AllInstances.layer.Selected.elements.map(function(element) {
              return AllInstances.elements[element.id].data.components;
            });

            var groupSelectedElements = new Group(selectedElements);
            view.center = groupSelectedElements.position;

            //remove the group (and re-insert its children into the view instead of remove them too)
            project.activeLayer.addChildren(groupSelectedElements.removeChildren());
          }
        },
        moveUp: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.y -= Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.y -= Settings.view.move.pitch;
            });
          }
        },
        moveDown: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.y += Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.y += Settings.view.move.pitch;
            });
          }
        },
        moveLeft: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.x -= Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.x -= Settings.view.move.pitch;
            });
          }
        },
        moveRight: function(event) {
          if (AllInstances.layer.Selected.elements.length === 0) {
            project.activeLayer.position.x += Settings.view.move.pitch;

          } else { //center the elements selected
            AllInstances.layer.Selected.elements.forEach(function(element) {
              AllInstances.elements[element.id].data.components.position.x += Settings.view.move.pitch;
            });
          }
        }
      },

      onMouseDown: {
        move: function(event) { //move the view (actually project.activeLayer)
          event.delta = new Point(0, 0); //to start the delta (distance between two last mouse events)
        },
        select: function(event) {
          selection.components.segments.forEach(function(segment) {
            segment.point = event.point;
          });
          selection.components.visible = true;
        },
        deselect: function(event) {
          if (AllInstances.layer.Selected.elements.length > 0) {
            deselection.components.segments.forEach(function(segment) {
              segment.point = event.point;
            });
            deselection.components.visible = true;
          } else {
            return false; //action not valid so by returning false it will not become the currentAction
          }
        }
      },

      onMouseDrag: {
        move: function(event) { //move the view (actually activeLayer.project)
          project.activeLayer.translate(event.delta);
        },
        select: function(event) {
          selection.updateBottomRight(event.point);
        },
        deselect: function(event) {
          deselection.updateBottomRight(event.point);
        }
      },

      onMouseUp: {
        select: function(event) {
          selection.processContent();
        },
        deselect: function(event) {
          deselection.processContent();
        }
      }

    };

    function triggerAction(event, eventHandler) { //eventHandler: eventHandlers.*
      var actionName = Object.keys(eventHandler).find(function(actionName) {
        return Settings.keybindings[actionName].some(function(keys) { //verify if one of the keybindings at a time
          return keys.length === 0 || keys.every(function(key) { //verify if every key is pressed
            return event.modifiers[key] || typeof event.modifiers[key] === 'undefined' &&   //key is a modifier and is pressed || it's not a modifier ans it's not pressed
                    key === event.key.toUpperCase() || //key is the key which trigger the event
                    Key.isDown(key); //key is hold
          });
        });
      });

      console.log(actionName);

      return (!actionName) ? null : (eventHandler[actionName](event) === false) ? null : actionName; //=== false because it can be undefined too
    }



  //Init
    var tool = new Tool(),
        currentAction = null;
        selection = new Box('selection'),
        deselection = new Box('deselection'),
        contextMenuContent = document.getElementById('context-menu-content'),
        contextMenuTrigger = document.getElementById('context-menu-trigger');

    view.zoom = Settings.view.zoom.value;


  //Events
    tool.onKeyDown = function(event) {
      //event.point = view.getEventPoint(event); //there isn't any mouse coordinates on key events

      if (!Connector.connection.visible && !selection.components.visible && !deselection.components.visible) {
        triggerAction(event, eventHandlers.onKeyDown);
      }
    };

    tool.onMouseDown = function(event) {
      //if (contextMenu.visible) contextMenu.close();

      if (event.event.which !== 3) { //not right click
        var hitTest = project.activeLayer.hitTest(event.point); //return an object with the item as its item key or undefined if nothing is hit
        console.log('hitTest', hitTest);
        console.log('onMouseDown', event);

        if (!hitTest) { //if mouse down on the canvas and not on any paper js item then ...
          currentAction = triggerAction(event, eventHandlers.onMouseDown);

          if (selection.visible || deselection.visible) { //deselect if click outside selected elements
            var rect = new Rectangle({ x: event.point.x - 0.05, y: event.point.y - 0.05, width: 0.1, height: 0.1 });

            if (!event.modifiers.shift && !event.modifiers.control &&
                  AllInstances.layer.Selected.elements.length > 0 &&
                    (!hitTest ||
                    !project.activeLayer.getItem({ overlapping: rect, data: { selected: true } }) &&
                      !project.activeLayer.getItem({ overlapping: rect, data: { class: 'header' } }))) {

              Element.deselect(AllInstances.layer.Selected.elements);
            }
          }

        }
      } else { //right click : open context menu and set its position
        event.stop();

        if (!contextMenuContent) contextMenuContent = document.getElementById('context-menu-content');
        if (!contextMenuTrigger) contextMenuTrigger = document.getElementById('context-menu-trigger');

        contextMenuContent.style.top = event.event.clientY + 'px';
        contextMenuContent.style.left = event.event.clientX + 'px';
        contextMenuTrigger.click();
      }

    };

    tool.onMouseDrag = function(event) {
      console.log('onMouseDrag');
      if (currentAction) eventHandlers.onMouseDrag[currentAction](event);
    };

    tool.onMouseUp = function(event) {
      console.log('onMouseUp');
      if (currentAction) {
        if (typeof eventHandlers.onMouseUp[currentAction] !== 'undefined') eventHandlers.onMouseUp[currentAction](event);
        currentAction = null;
      }
    };

}]);
