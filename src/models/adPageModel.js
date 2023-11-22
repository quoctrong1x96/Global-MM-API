import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';
import {updateTimestamps} from '../helpers/mongooseConfig.js';

var adPageModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4()
    },
    name: {
        type: String,
        required: true,
    },
    parentId:{
        type: String,
    },
    ordinalNumber: {
        type: Number
    },
    menuFlg:{
        type: Boolean
    },
    buttonFlg:{
        type: Boolean
    },
    icon:{
        type: String
    },
    fileUrls:{
        type: String
    }
});

adPageModel.plugin(updateTimestamps);

adPageModel.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

export default mongoose.model('AD_PAGE', adPageModel);