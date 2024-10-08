import mongoose from 'mongoose';

const FuelTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const FuelType = mongoose.model('FuelType', FuelTypeSchema);

export default FuelType;
