import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {updateTimestamps, toJSON} from '../helpers/mongooseConfig.js';

//Create new Type Model
let TypeModel = new mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    name: {
        type: String,
        // required: true,
    },
    code:{
        type: String,
        // required: true
    },
    value:{
        type: String,
        defualt: ''
    },
    parentId:{
        type: String,
    }
});

//Create ToJOSN function to remove _id (add id intead) and remove __v
TypeModel.method('toJSON', toJSON);

//Add 3 columns default
TypeModel.plugin(updateTimestamps);

export default mongoose.model('Type', TypeModel);
