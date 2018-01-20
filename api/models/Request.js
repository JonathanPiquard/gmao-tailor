
////////////////////////////////////////////////////////////////////////////////
/////////////////////*************** REQUEST ***************////////////////////
////////////////////////////////////////////////////////////////////////////////

//any resquest between users like agree to a friendship or agree to give the right to do something or even to just ask for something with just a message

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

  var RequestSchema = mongoose.Schema({

    author: { type: ObjectId, ref: 'User', require: true },

    receivers: [{ type: ObjectId, ref: 'User' }], //one or many

    receiverGroups: [{ type: ObjectId, ref: 'Group' }], //one or many

    title: String,

    content: { type: String, required: true },

    complete: { type: Boolean, default: false, required: true }, //is the request over ?

    //type of the request and what it should return : to do later whenether something seems to be request

  });

  this.Request = mongoose.model('Request', RequestSchema);
};
