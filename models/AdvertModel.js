import mongoose from 'mongoose';

// Define a nested schema for rich description
const AdvertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model', required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  isFeatured: { type: Boolean, default: false },
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
  brochureEngineSize: { type: String, required: true },
  topSpeed: { type: String, required: true },
  acceleration: { type: String, required: true },

  // New fields for Running Cost
  fuelConsumption: { type: String, required: true },
  fuelCapacity: { type: String, required: true },
  urbanMpg: { type: String, required: true },
  extraUrbanMpg: { type: String, required: true },
  insuranceGroup: { type: String, required: true },
  co2Emissions: { type: String, required: true },
  euroEmissions: { type: String, required: true },
});

const Advert = mongoose.model('Advert', AdvertSchema);

export default Advert;
