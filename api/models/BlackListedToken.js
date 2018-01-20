
////////////////////////////////////////////////////////////////////////////////
/////////////////************* BLACK LISTED TOKEN *************/////////////////
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

  var BlackListedTokenSchema = mongoose.Schema({

    token: { type: String, required: true },

    createdAt: { type: Date, expires: 60*60*5 } //5h until expired

  });

  this.BlackListedToken = mongoose.model('BlackListedToken', BlackListedTokenSchema);
};
