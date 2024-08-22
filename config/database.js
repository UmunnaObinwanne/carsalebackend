// Import necessary modules
import mongoose from 'mongoose';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MongoDB URI with password and database name included
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://broadwaymarketingconsults:${dbPassword}@carmartuk.0chjo.mongodb.net/carmart?retryWrites=true&w=majority&appName=CarmartUK`;

console.log(uri)
// Define Mongoose connection options
const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
};

// Function to connect to MongoDB
async function connectToDatabase() {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(uri, clientOptions);
    console.log("Successfully connected to MongoDB!");

    // Ping the MongoDB server to confirm the connection
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Call the function to connect to the database
connectToDatabase();

// Export mongoose for use in other modules
export default mongoose;
