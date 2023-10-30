import mongoose from 'mongoose';
import user from './userModel.js';
import role from './roleModel.js';
import type from './typeModel.js';

mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = user;
db.role = role;
db.type = type;

db.ROLES = ['user', 'admin', 'moderator'];

export default db;