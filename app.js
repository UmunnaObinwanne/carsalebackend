import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import advertRoutes from './routes/AdvertRoutes.js';
import modelRoute from './routes/ModelRoute.js';
import categoryRoute from './routes/CategoryRoute.js';
import optionsRouter from './routes/options.js';
import authRouter from './routes/AuthRoutes.js';
import profileRouter from './routes/profileRoute.js';
import session from 'express-session';
import passport from './config/passport.js';
import imageUpload from './routes/imageUpload.js';
import chatRoutes from './routes/MessageRoutes.js';
import http from 'http'; // Import http to create a server
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.io
import cors from 'cors';
import authCheck from './routes/authChecker.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'; // Import cookie-parser
import MongoStore from 'connect-mongo';
import messageRoute from './routes/MessageRoutes.js'

const app = express();

dotenv.config();

const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://broadwaymarketingconsults:${dbPassword}@carmartuk.0chjo.mongodb.net/carmart?retryWrites=true&w=majority&appName=CarmartUK`;


    const corsOptions = {
  origin: 'http://localhost:5173',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


// Use cookie-parser middleware
app.use(cookieParser());





// Middleware
app.use(bodyParser.json()); // Parses JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware configuration
app.use(session({
  secret: process.env.MY_APP_COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: uri, // Use the environment variable for your MongoDB connection string
    ttl: 24 * 60 * 60, // 1 day in seconds
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    sameSite: 'none', // 'none' for cross-site cookies in production
  },
}));

// Initialize Passport and restore authentication state from the session
app.use(passport.initialize());
app.use(passport.session());

// Error handling middleware for CSRF token errors (if using CSRF protection)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ name: 'forbidden', message: 'CSRF exception' });
  } else {
    next(err);
  }
});

// Create Socket.io server
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
// Database connection
mongoose.connect(uri, {})
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));



// Basic Route



// Pass io to route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/', advertRoutes);
app.use('/', modelRoute);
app.use('/', categoryRoute);
app.use('/', optionsRouter);
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', imageUpload);
app.use('/', messageRoute)
app.use('/', chatRoutes);
app.use('/', authCheck);
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;