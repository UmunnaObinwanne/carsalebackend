import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    isAdmin: { type: Boolean, default: false},
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, { usernameField: "username" });

// Hash password before saving
userSchema.methods.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
};


userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;


