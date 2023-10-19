var mongoose = require("mongoose");
var { v4: uuidv4 } = require("uuid");
const updateTimestamps = require("../helpers/mongooseConfig");

var CountrySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuidv4, //Create GUID default uuidv4
  },
  countryName: {
    type: String, 
    required: true,
  },
  postalCode:{
    type: String,
  }
});

CountrySchema.plugin(updateTimestamps);



module.exports = mongoose.model('Country', CountrySchema);
