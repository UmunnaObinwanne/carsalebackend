import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import advertRoutes from './routes/AdvertRoutes.js';


const app = express();

dotenv.config();

// Apply other middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Route // Define your routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.use('/', advertRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});








