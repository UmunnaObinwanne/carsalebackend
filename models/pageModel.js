// models/pageModel.js
import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  featuredImage: { type: String, required: false }, // Storing the path of the uploaded image
  slug: { type: String, required: true, unique: true }, // e.g., "about-us"
  content: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  
  description: { type: String, required: false },
}, { timestamps: true });

const Page = mongoose.model('Page', pageSchema);

export default Page;