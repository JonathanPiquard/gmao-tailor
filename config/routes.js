
module.exports = {

  'get /api/auth/user': 'AuthController.currentUser',

  'post /auth/login': 'AuthController.login',

  'post /auth/register': 'AuthController.register',

  'post /api/auth/logout': 'AuthController.logout',

  'post /api/user/update': '#UserController.update',

  'get /api/users/all': 'UserController.all',

  'get /api/groups/all': 'GroupController.all',

  'post /api/group/write': 'GroupController.write',

  'get /api/group/read/:id': 'GroupController.read',

  'post /api/group/update': 'GroupController.update',

  'delete /api/group/delete': 'GroupController.delete',

  'get /api/groups/private': 'GroupController.private',

  'get /api/groups/public': 'GroupController.public',

  'post /api/blueprint/write': 'BlueprintController.write',

  'get /api/blueprint/read': 'BlueprintController.read',

  'post /api/blueprint/update': 'BlueprintController.update',

  'delete /api/blueprint/delete': 'BlueprintController.delete',

  'get /api/blueprints/private': 'BlueprintController.private',

  'get /api/blueprints/public': 'BlueprintController.public',

  'get /api/contextmenu': 'BlueprintController.contextmenu',

  'post /api/element/write': 'ElementController.write',

  'get /api/element/read': 'ElementController.read',

  'post /api/element/update': 'ElementController.update',

  'delete /api/element/delete': 'ElementController.delete',

  'get /api/elements/private': 'ElementController.private',

  'get /api/elements/public': 'ElementController.public',

};
