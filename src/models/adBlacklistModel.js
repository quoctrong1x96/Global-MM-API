import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adBlacklistModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    name: {
        type: String
    },
    LockedCnt:{
        type: Number
    },
    data: {
        type: String
    }
});

adBlacklistModel.plugin(updateTimestamps);

adBlacklistModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_BLACKLIST', adBlacklistModel);