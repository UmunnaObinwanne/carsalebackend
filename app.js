import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import advertRoutes from './routes/AdvertRoutes.js';
import modelRoute from './routes/ModelRoute.js'
import categoryRoute from './routes/CategoryRoute.js'
import optionsRouter from './routes/options.js';
import authRouter from './routes/AuthRoutes.js';
import profileRouter from './routes/profileRoute.js';
import session from 'express-session';
import passport from './config/passport.js';
import imageUpload from './routes/imageUpload.js';
import chatRoutes from './routes/MessageRoutes.js';
import http from 'http'; // Import http to create a server
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.io
import cors from 'cors'

dotenv.config();

const app = express();

// Enable trust proxy
app.set('trust proxy', 1); // Trust the first proxy, typically required when behind a reverse proxy like Vercel

const corsOptions = {
  origin: 'https://carmart.netlify.app/', // Replace with your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // This allows cookies and other credentials
};

app.use(cors(corsOptions));


// Session middleware configuration
app.use(session({
  secret: process.env.MY_APP_COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Ensures the cookie is sent only over HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'none' // Allows cross-site requests; necessary for some use cases
  }
}));

// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

// Creating socket.io server
const server = http.createServer(app);
const io = new SocketIOServer(server);

// Database connection
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://broadwaymarketingconsults:${dbPassword}@carmartuk.0chjo.mongodb.net/carmart?retryWrites=true&w=majority&appName=CarmartUK`;

mongoose.connect(uri, {})
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', advertRoutes);
app.use('/', modelRoute);
app.use('/', categoryRoute);
app.use('/', optionsRouter);
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', imageUpload);
app.use('/', chatRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('joinRoom', ({ chatId }) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  socket.on('sendMessage', ({ chatId, message }) => {
    io.to(chatId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

