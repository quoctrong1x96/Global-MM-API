import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import {updateTimestamps} from '../helpers/mongooseConfig.js';

var CountrySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuidv4(), //Create GUID default uuidv4
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



export default  mongoose.model('Country', CountrySchema);
