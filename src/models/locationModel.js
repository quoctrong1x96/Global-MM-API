import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';

var locationModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    name: {
        type: String,
        required: true,
    },
    value:{
        type: String,
        defualt: ''
    },
    typeId: {
        type: String,
        required: true,
    },
    parentId:{
        type: String,
    }
});

locationModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('Location', locationModel);