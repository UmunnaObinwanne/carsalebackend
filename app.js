// app.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import advertRoutes from './routes/AdvertRoutes.js';
import pageRoutes from './routes/pages.js';
import modelRoute from './routes/ModelRoute.js'
import categoryRoute from './routes/CategoryRoute.js'
import optionsRouter from './routes/options.js';

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

// Routes
app.use('/', advertRoutes);
app.use('/', pageRoutes);
app.use('/', modelRoute);
app.use('/', categoryRoute);
app.use('/', optionsRouter);

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
