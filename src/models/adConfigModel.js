import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adConfigModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    value: {
        type: String,
        required: true,
    },
    description:{
        type: String
    },
    sercurityValue: {
        type: String
    }
});

adConfigModel.plugin(updateTimestamps);

adConfigModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_CONFIG', adConfigModel);