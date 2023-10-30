import mongoose from 'mongoose';

/**
 * Update ALL Schema for middle ware update createAt & updateAt
 * @param {mongoose.Schema} schema Schema of mongodb object
 */
function updateTimestamps(schema) {
  schema.add({
    delFlag: {
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

async function openTransaction() {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
}

function toJSON(){
  const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
}

export { updateTimestamps, openTransaction, toJSON};