import mongoose from 'mongoose';

const ModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Model = mongoose.model('Model', ModelSchema);

export default Model;
