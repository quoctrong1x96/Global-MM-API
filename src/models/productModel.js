import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

const productSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true,
  },
  productName: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
  },
  status: {
    type: String,
    default: 'available',
  },
});

export default mongoose.model('Product', productSchema);