
////////////////////////////////////////////////////////////////////////////////
//////////////////////*************** GROUP ***************/////////////////////
////////////////////////////////////////////////////////////////////////////////



/********************************* Description *********************************
  *                                                                            *
  * Each model created by the user is break down into advanced properties      *
  * known as BlueprintType. These BlueprintType pieced together form the       *
  * Blueprint. This last one is not only an object of BlueprintType, it's      *
  * contain also some other properties such as the parent Blueprint or the     *
  * icon. It's why only the "properties" attribute contains the                *
  * BlueprintType. The other attributes match the side properties like the     *
  * icon as told above. Each Blueprint leads to the creation of a new model    *
  * not to an instance of some model. So a Blueprint is the true scheme of a   *
  * model designed by the user. Each new model should reference to it.         *
  *                                                                            *
*///////////////////////////////////////////////////////////////////////////////



module.exports = function() {

  var enumRights = [
    'UpdateInformations',
    'WriteLevel', //create a level
    'UpdateLevel', //modify how levels are define
    'DeleteLevel', //delete a level
    'WriteChat', //send messages on the chat to the whole group by the chat belonging to the group
    'ReadChat',
    'WriteBlueprint', //share one of its Blueprint with the group
    'ReadBlueprint', //see what the Blueprint looks like
    'UpdateBlueprint', //modify one of the Blueprint group and so modify the Blueprint of the author of this Blueprint
    'DeleteBlueprint',
    'ReadElement',
    'UseElement', //use elments throught a blueprint
    'UpdateElement',
    'DeleteElement',
    'WriteMember', //add member
    'UpdateMember',
    'DeleteMember'
  ];

  var GroupSchema = mongoose.Schema({

    name: { type: String, required: true, maxlength: 25 },

    description: { type: String, maxlength: 1000 },

    visibility: { type: String, required: true, default: 'private', enum: [ 'private', 'public' ] }, //The group can be seen by users which are not in the group (for the market/search groups to join)

    tags: {
      type: Array,
      validate: {
        validator: function(tags) {
          return tags.length <= 30;
        },
        message: 'There are too many tags : maximum 30.'
      }
    },

    members: [{ //i.e. Administrator, Moderator, Visitor ...
      user: { type: ObjectId, ref: 'User', required: true },
      level: { type: Number, required: true, max: 300 } //need to exists if not the level will be the default level
    }],

    levels: [{ //if there are no levels every members will have all the rights
      name: { type: String, required: true, maxlength: 25 },
      description: { type: String, maxlength: 300 },
      _id: { type: Number, required: true },
      rights: [{
        type: String,
        enum: enumRights
      }]
    }],

    defaultLevel: String, //the level (its name) to give to member if the level is not define, for example if the member is the first

    maxWarningsBeforeSuspension: Number, //if a member gets too many warnings it's level pass to a level which the group has decide for a suspension

    durationSuspension: Date, //or Number if it can't be a day but a time to spend

    maxWarningsBeforeRemove: Number, //if a member gets too many warnings he will be remove from the group

    author: { type: ObjectId, ref: 'User', required: true }

  });


  //DOCUMENTS

  GroupSchema.methods.memberRights = function(memberId, cb) {
    if (memberId === this.author.str) {
      return enumRights;

    } else {
      var index = _.findIndex(this.members, { user: memberId }); //maybe wrong because memberId is a string and this.members is an array of number

      if (index === -1) {
        return []; //user not in the group so he has no rights
      } else {
        var levelId = this.members[index].level,
            index2 = _.findIndex(this.levels, { _id: levelId }),
            level = this.levels[index2];

        return level.rights;
      }
    }
  };

  this.Group = mongoose.model('Group', GroupSchema);
};
