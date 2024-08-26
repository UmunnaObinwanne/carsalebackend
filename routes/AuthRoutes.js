import express from 'express';

import dotenv from 'dotenv';

// Firebase Admin SDK
import admin from 'firebase-admin';
import UserModel from '../models/UserModel.js'; // Adjust the path as needed
import { check, validationResult } from 'express-validator';
import axios from 'axios'

//notImportant for now
import passport from 'passport';
import { JWT_SECRET } from '../config/jwtConfig.js';
import jwt from 'jsonwebtoken';
import authenticateJWT from '../middleware/jwtMiddleware.js';

// Setting up .env
dotenv.config();

// Initializing express
const router = express.Router();

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY, // Handle newlines in the private key
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  }),
});

// Firebase Authentication Routes


// Email validation function using Hunter
async function validateEmailWithHunter(email) {
    const hunterKey = process.env.ZERO_BOUNCE_API_KEY;
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${hunterKey}`;
    
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error validating email with Hunter:', error);
        return null;
    }
}

// Register new user
router.post('/register', [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[\W]/).withMessage('Password must contain at least one symbol'),
    check('email').isEmail().withMessage('Email is not valid')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Validate email with Hunter
    const response = await validateEmailWithHunter(email);
    if (!response || response.data.status !== 'valid') {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        // Log the incoming request data
        console.log('Received request data:', { email, password, username, firstName, lastName });

        // Create a new user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: username, // Set the display name in Firebase
        });

        // Log the userRecord returned by Firebase
        console.log('Firebase userRecord:', userRecord);

        // Update the user profile with the username in Firebase
        const updatedUserRecord = await admin.auth().updateUser(userRecord.uid, {
            displayName: username,
        });

        // Log the updated user record to ensure the displayName was set correctly
        console.log('Updated Firebase userRecord:', updatedUserRecord);

        // Save the user information to MongoDB
        const newUser = new UserModel({
            email,
            username,  // Store the username in MongoDB
            firebaseUid: userRecord.uid,
            firstName,
            lastName,
        });

        // Log the user data before saving to MongoDB
        console.log('Data to be saved in MongoDB:', newUser);

        await newUser.save();

        res.status(201).send({
            message: 'User created successfully',
            userId: newUser._id,
            firebaseUid: userRecord.uid,
            username: newUser.username,
            email: newUser.email,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send({ message: 'Error creating user', error: error.message });
    }
});

//Login User Logic
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Fetch user from Firebase
    const userRecord = await admin.auth().getUserByEmail(email);

    // Check if user exists in MongoDB
    const user = await UserModel.findOne({ firebaseUid: userRecord.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { firebaseUid: userRecord.uid, email: userRecord.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

  // Set the token in an HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: true, // Ensure secure is true in production
    sameSite: 'none', // Lax to allow cookies to be sent on same-site requests
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });

      console.log(token)
      
    // Send user details in the response
    res.status(200).json({
      message: 'User authenticated',
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        userId: user._id,
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (error.code === 'auth/invalid-password') {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(500).json({ message: 'Error logging in' });
  }
});

//handle log out
// Logout Route
router.post('/logout', (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'lax', // Lax to allow cookies to be sent on same-site requests
    });

    res.status(200).send({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).send({ message: 'Error during logout' });
  }
});


// Get user profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    // Extract Firebase UID from the JWT
    const userId = req.user.user_id;

    // Fetch user details from MongoDB
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    // Send the user details as the response
    res.json({user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Reset Password
// Route to generate reset token
router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(404).json({ message: 'No user exists with this username' });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        existingUser.resetPasswordToken = resetToken;
        existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await existingUser.save();

        console.log(`Generated Token: ${resetToken}`);
        console.log(`Token Expires At: ${new Date(existingUser.resetPasswordExpires)}`);

        const resetUrl = `http://localhost:5000/reset-password/${resetToken}`;

        const mailOptions = {
            from: senderEmail,
            to: existingUser.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `${resetUrl}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Reset password email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: "error resetting password", details: error.message });
    }
});

// Validate Token
router.get('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        console.log(`Token from request: ${req.params.token}`);
        console.log(`User found: ${user}`);

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or expired' });
        }
        res.json({ message: 'Token is valid' });
    } catch (error) {
        res.status(500).json({ error: 'error validating token', details: error.message });
    }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        // Hash the new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        res.status(500).json({ error: 'Error resetting password', details: error.message });
    }
});

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('https://carmart.netlify.app/used-cars', passport.authenticate('google', { session: false }), (req, res) => {
  if (req.user) {
    // Generate JWT Token
    const token = jwt.sign({ id: req.user._id, username: req.user.username }, JWT_SECRET, { expiresIn: '1d' });

    // Redirect to frontend with token
    res.redirect(`https://carmart.netlify.app/used-cars?token=${token}`);
  } else {
    res.redirect('https://carmart.netlify.app/used-cars?error=auth_failed');
  }
});


export default router;
