import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adRoleModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    name: {
        type: String,
        required: true,
    },
    defaultFlg:{
        type: Boolean,
    },
    pageId: {
        type: String,
    },
    parentId:{
        type: String
    },
    delFlg:{
        type: Boolean
    }
});

adRoleModel.plugin(updateTimestamps);

adRoleModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_ROLE', adPageModel);