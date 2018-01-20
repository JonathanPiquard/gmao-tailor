
angular.module('GMAO Tailor').service('Socket', [ '$window', 'Toast', function($window, Toast) {

        //init
        var _this = this;

        this.socket = null;
        this.authenticated = false;
        var onAuthentification = []; //several functions to call when socket.on('authentication')

        //functions
        this.connect = function() {
          _this.socket = io();

          _this.socket.on('error', function(err) {
            console.log(err);
            Toast.error(err.message || err);
          });

          _this.socket.on('connect', function() {
            _this.socket.emit('authentication', $window.localStorage.token);

            _this.socket.on('authenticated', function(data) {
              _this.authenticated = true;

              onAuthentification.forEach(function(eventHandler) {
                eventHandler(_this.socket, data);
              });
            });
          });
        };

        this.disconnect = function() {
          if (_this.authenticated) {
            _this.socket.disconnect();
          }
        };

        this.onAuthentification = function(eventHandler) {
          onAuthentification.push(eventHandler);
        };

}]);
