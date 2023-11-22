import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adControlModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    controlId: {
        type: String,
        required: true,
    },
    pageId:{
        type: String,
    },
    name: {
        type: String
    },
    absoluteUrl:{
        type: String
    },
    methodRequest:{
        type: String
    }
});

adControlModel.plugin(updateTimestamps);

adControlModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_CONTROL', adControlModel);