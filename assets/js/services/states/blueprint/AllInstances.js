
angular.module('GMAO Tailor').service('AllInstances', [ function() {

  var _this = this;

  this.newCollection = function(key) {
    this[key] = {}; //every instances of a constructor indexed by id
  };

  this.toArray = function(collection) {
    return Object.keys(this[collection]).map(function(id) {
      return _this[collection][id];
    });
  };


  //generate UUID (the uniqueness relies on the random factor)
  this.newId = function() {
    var d = Date.now(); //same as new Date().getTime()
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  };

}]);
