import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adLogModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    userName: {
        type: String,
        required: true,
    },
    serviceName:{
        type: String,
    },
    actionRec: {
        type: Number
    },
    data:{
        type: String
    },
    ipAddress:{
        type: String
    }
});

adLogModel.plugin(updateTimestamps);

adLogModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_LOG', adLogModel);