
angular.module('GMAO Tailor').factory('Definition', [ 'AllInstances', function(AllInstances) {

  AllInstances.newCollection('definition');


  return class Definition {
    constructor(definition) {
      angular.merge(this, definition);

      AllInstances.definition[this._id] = this;
    }


    //Methods
      getVersion(versionName) {
        return this.versions.find(function(version) {
          return version.name === versionName;
        });
      }


    //Statics
      static import(definitions, reset) { //reset: Bool : remove all definitions before import
        if (reset) AllInstances.newCollection('definition');
        var _this = this;

        definitions.forEach(function(definition) {
          new _this(definition);
        });
      }
  };

}]);
