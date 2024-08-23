// app.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import advertRoutes from './routes/AdvertRoutes.js';
import pageRoutes from './routes/pages.js';
import modelRoute from './routes/ModelRoute.js'
import categoryRoute from './routes/CategoryRoute.js'
import optionsRouter from './routes/options.js';
import authRouter from './routes/AuthRoutes.js';
import profileRouter from './routes/profileRoute.js'
import session from 'express-session';
import passport from './config/passport.js'; // Adjust path as needed
import imageUpload from './routes/imageUpload.js'



dotenv.config();

const app = express();

// Database connection
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://broadwaymarketingconsults:${dbPassword}@carmartuk.0chjo.mongodb.net/carmart?retryWrites=true&w=majority&appName=CarmartUK`;

mongoose.connect(uri, {
})
.then(() => console.log('Successfully connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware configuration
app.use(session({
  secret: process.env.MY_APP_COOKIE_SECRET, // Use the secret from environment variables
  resave: false,
  saveUninitialized: false,
cookie: {
secure: true, // Ensure cookies are only sent over HTTPS
    httpOnly: true, // Helps prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'none' // Allows cookies to be sent in cross-site requests
  }
}));

// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.use('/', advertRoutes);
app.use('/', pageRoutes);
app.use('/', modelRoute);
app.use('/', categoryRoute);
app.use('/', optionsRouter);
app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', imageUpload)

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
