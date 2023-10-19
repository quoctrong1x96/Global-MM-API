 //Update ALL Schema for middle ware update createAt & updateAt
 module.exports =  updateTimestamps = function (schema) {
    schema.add({
        delFlag:{
          type: Number,
          default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
    });
  
    schema.pre('save', function (next) {
        this.updatedAt = new Date();
        next();
    });
    schema.pre('update', function (next) {
      this.update({}, { $set: { updatedAt: new Date() } });
      next();
  });
  };