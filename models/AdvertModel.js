import mongoose from 'mongoose';

// Define a nested schema for rich description
const AdvertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
  carName: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  features: [String],
  imageUrls: [String],
  createdAt: { type: Date, default: Date.now },

  // New fields for Overview
  year: { type: Number, required: true },
  mileage: { type: Number, required: true },
  bodyType: { type: String, required: true },
  colour: { type: String, required: true },
  seats: { type: Number, required: true },
  doors: { type: Number, required: true },

  // New fields for Performance
  enginePower: { type: String, required: true },
  engineSize: { type: String, required: true },
  
  topSpeed: { type: String, required: true },
  acceleration: { type: String, required: true },

  // New fields for Running Cost
  fuelConsumption: { type: String },
  fuelCapacity: { type: String },
  urbanMpg: { type: String },
  extraUrbanMpg: { type: String },
  insuranceGroup: { type: String },
  co2Emissions: { type: String},
  euroEmissions: { type: String },
    // New fields to be added
/*
  transmission: { type: mongoose.Schema.Types.ObjectId, ref: 'Transmission', required: true },
  driveType: { type: mongoose.Schema.Types.ObjectId, ref: 'DriveType', required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType', required: true },
  */

  transmission: { type: String },
driveType: { type: String },
fuelType: { type: String },
transaction: { type: String },
  bids: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ],
});

const Advert = mongoose.model('Advert', AdvertSchema);

export default Advert;
