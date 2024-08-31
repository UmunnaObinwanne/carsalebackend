import express from 'express';
import User from '../models/UserModel.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import isAuthenticated from '../middleware/IsAuthenticated.js';
import transporter from '../config/nodemailer.js';
import { check, validationResult } from 'express-validator';
import axios from 'axios';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Import JWT package if using JWT

// Setting up .env
dotenv.config();

// Initializing express
const router = express.Router();

// Nodemailer Emailer Origin
const senderEmail = process.env.email;

// Email validation function using Hunter
async function validateEmailWithHunter(email) {
    //Initialize the Hunter sdk with your api key:
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

        // Create a new user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error });
    }
});

//Login user

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not found, please register' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Determine if we're in production
        const isProduction = process.env.NODE_ENV === 'production';

        // Set the token as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // Use secure cookies in production
            sameSite: isProduction ? 'None' : 'Lax', // 'None' for cross-site cookies in production
            domain: isProduction ? process.env.FRONTEND_URL  : 'http://localhost:5173', // Set your domain in production
            maxAge: 3600000 // 1 hour
        });

        // Send the response
        res.json({
            message: 'User logged in successfully',
            userId: user._id.toString(),
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Unable to login user' });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token', { 
        path: '/', 
        sameSite: 'None',   
        secure: isProduction // Only set secure flag in production
    }); 
    res.status(200).json({ message: 'User logged out successfully' });
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


export default router;
