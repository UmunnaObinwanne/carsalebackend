import express from 'express';
import authenticateJWT from '../middleware/jwtMiddleware.js'; // Adjust path as needed

const router = express.Router();

router.get('/auth-check', authenticateJWT, (req, res) => {
    if (req.authenticated) {
        res.status(200).json({ authenticated: true, userId: req.user.userId });
    } else {
        res.status(401).json({ authenticated: false, message: 'User not authenticated' });
    }
});

export default router;
