import express from 'express';
import dotenv from 'dotenv';
import SessionConfig from './config/Sessions.js'
import advertRoutes from './routes/AdvertRoutes.js';
import pageRoutes from './routes/pages.js'


const app = express();

dotenv.config();

// Apply other middlewares


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(SessionConfig);


app.use('/', advertRoutes);
app.use('/', pageRoutes);

// Basic Route // Define your routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});








