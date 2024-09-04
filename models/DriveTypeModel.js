import mongoose from 'mongoose';

const DriveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const DriveType = mongoose.model('DriveType', DriveTypeSchema);

export default DriveType;
