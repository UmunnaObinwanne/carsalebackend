import express from 'express';
import authenticateJWT from '../middleware/jwtMiddleware.js'; // Adjust path as needed

const router = express.Router();

router.get('/auth-check', authenticateJWT, (req, res) => {
  // Check if the request is authenticated based on the middleware
  if (req.authenticated) {
    res.status(200).json({ authenticated: true, userId: req.user.userId }); // Adjust according to your token payload
  } else {
    res.status(200).json({ authenticated: false });
  }
});

export default router;
