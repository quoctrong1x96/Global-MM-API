import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adRolePageModel = mongoose.Schema({
    roleId:{
        type: String,
        required: true,
    },
    pageId: {
        type: String,
        required: true,
    },
    value:{
        type: String,
    },
    activeFlg: {
        type: Boolean,
    }
});

adRolePageModel.plugin(updateTimestamps);

adRolePageModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_ROLE_PAGE', adRolePageModel);