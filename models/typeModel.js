var mongoose = require("mongoose");
var {v4: uuidv4} = require("uuid");
const {updateTimestamps} = require("../helpers/mongooseConfig");

var TypeModel = new mongoose.Schema({
    _id:{
        type: String,
        required: true,
        default: uuidv4
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
        defualt: ""
    },
    parentId:{
        type: String,
    }
});

TypeModel.plugin(updateTimestamps);

module.exports = mongoose.model("Type", TypeModel);