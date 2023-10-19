var mongoose = require("mongoose");
var {v4: uuidv4} = require("uuid");

var locationModel = mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4
    },
    name: {
        type: String,
        required: true,
    },
    value:{
        type: String,
        defualt: ""
    },
    typeId: {
        type: String,
        required: true,
    },
    parentId:{
        type: String,
    }
});

module.exports = mongoose.model("Location", locationModel);