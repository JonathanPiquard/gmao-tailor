
angular.module('GMAO Tailor').factory('Box', [ 'Settings', 'AllInstances', function(Settings, AllInstances) {

    return class Box { //rectangle to select or deselect

      constructor(type) { //'select' || 'deselect'
        this.components = new Path.Rectangle({
          from: [ 0, 0 ],
          to: [ 0, 0 ],
          strokeColor: Settings.Global[type].strokeColor,
          strokeWidth: Settings.Global[type].strokeWidth,
          fillColor: Settings.Global[type].fillColor,
          visible: false
        });

        this.type = type;
      }

      //Methods
        updateBottomRight(point) {
          this.components.segments[3].point = point; //rightBottom point => where the mouse is

          this.components.segments[2].point.x = point.x; //rightTop point
          this.components.segments[0].point.y = point.y; //leftBottom point
        }

        processContent() {
          var condition = (this.type === 'selection'),
              data = (condition) ? { class: 'element' } : { class: 'element', selected: true },

              overlapping = project.activeLayer.getItems({ overlapping: this.bounds, data: data }),
              inside = project.activeLayer.getItems({ inside: this.bounds, data: data });

          overlapping.concat(inside).forEach(function(elementComponent) {
            AllInstances.element[elementComponent.data.elementId].setSelection(condition);
          });

          this.components.visible = false;
       }

      //Statics
    };

}]);
