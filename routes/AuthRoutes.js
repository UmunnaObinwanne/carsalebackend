import express from 'express';
import User from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import isAuthenticated from '../middleware/IsAuthenticated.js';
import passport from 'passport';
import { JWT_SECRET } from '../config/jwtConfig.js';

// Setting up .env
dotenv.config();

// Initializing express
const router = express.Router();

// Nodemailer Emailer Origin
const senderEmail = process.env.email;


// Email validation function using Hunter
async function validateEmailWithHunter(email) {
    const hunterKey = process.env.ZERO_BOUNCE_API_KEY;
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${hunterKey}`;
    
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(error);
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
        .matches(/[\W]/).withMessage('Password must contain at least one symbol')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Validate email with Hunter
    const response = await validateEmailWithHunter(email);
    if (response.data.status !== 'valid') {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Hashed password during registration: ${hashedPassword}`);

        // Create a new user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(401).json({ message: 'User not found, please register' });
        }

        const isPasswordValid = await existingUser.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        req.login(existingUser, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error logging in user' });
            }
            res.json({
                message: 'User logged in successfully',
                userId: existingUser._id.toString() // Ensure userId is a string
                 
                
            });
             console.log('User:', req.user);
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to login user' });
    }
});

// Logout user
router.post('/logout', async (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out user' });
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error destroying session' });
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.json({ message: 'User logged out successfully' });
        });
    });
});

// Get user profile
router.get('/profile', isAuthenticated, (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    res.json({ message: 'User profile', user: req.user });
     console.log('User:', req.user);
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
    res.redirect(`http://localhost:5173/used-cars?token=${token}`);
  } else {
    res.redirect('https://carmart.netlify.app/used-cars?error=auth_failed');
  }
});


export default router;
