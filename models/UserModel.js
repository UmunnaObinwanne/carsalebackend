import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  firebaseUid: { type: String, unique: true }, // Added field for Firebase UID
  About: { type: String },
  profilePicture: { type: String },
  Location: { type: String },
  City: { type: String },
  Area: { type: String },
  Street: { type: String },
  ZIP: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  NumberOfAdsPosted: { type: Number, default: 0 },
  NumberOfMessages: { type: Number, default: 0 },
  Favorites: { type: [String] }, // Define Favorites as an array of strings
  isAdmin: { type: Boolean, default: false },
  googleId: { type: String }, // Field for Google OAuth
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
