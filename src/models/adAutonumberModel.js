import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adAutoNumberModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    format: {
        type: String,
        required: true,
    },
    step:{
        type: Number,
        defualt: 1,
        required: true
    },
    current: {
        type: Number,
        required: true,
    }
});

adAutoNumberModel.plugin(updateTimestamps);

adAutoNumberModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('Ad_Autonumber', adAutoNumberModel);