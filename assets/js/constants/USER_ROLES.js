
angular.module('GMAO Tailor').constant('USER_ROLES', {

    all: '*', //absolutely anyone even visitors

    allUsers: [ 'user', 'modo', 'admin' ], //anyone logged in

    user: ['user'],

    modo: ['modo'],

    admin: ['admin']

});
