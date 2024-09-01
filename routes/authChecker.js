import express from 'express';
import authenticateJWT from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/auth-check', authenticateJWT, (req, res) => {
    try {
        if (req.authenticated) {
            res.status(200).json({
                authenticated: true,
                userId: req.user.userId,
                // You can add more user info here if needed
                // username: req.user.username,
                // email: req.user.email,
            });
        } else {
            res.status(401).json({ authenticated: false, message: 'User not authenticated' });
        }
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ authenticated: false, message: 'Internal server error during authentication check' });
    }
});

export default router;