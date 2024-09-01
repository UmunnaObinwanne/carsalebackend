import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import advertRoutes from './routes/AdvertRoutes.js';
import modelRoute from './routes/ModelRoute.js';
import categoryRoute from './routes/CategoryRoute.js';
import optionsRouter from './routes/options.js';
import authRouter from './routes/AuthRoutes.js';
import profileRouter from './routes/profileRoute.js';
import imageUpload from './routes/imageUpload.js';
import chatRoutes from './routes/MessageRoutes.js';
import authCheck from './routes/authChecker.js';
import messageRoute from './routes/MessageRoutes.js';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Database connection
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://broadwaymarketingconsults:${dbPassword}@carmartuk.0chjo.mongodb.net/carmart?retryWrites=true&w=majority&appName=CarmartUK`;

mongoose.connect(uri, {})
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL, //change this in .env when on localhost
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.MY_APP_COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: uri,
    ttl: 24 * 60 * 60,
  }),
  cookie: {
    secure: true, //change this when on localhost
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
  },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: corsOptions,
});

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
app.use('/', messageRoute);
app.use('/', chatRoutes);
app.use('/', authCheck);

// Socket.io event handlers
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;