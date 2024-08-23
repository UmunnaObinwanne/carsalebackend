import express from 'express'
const router = express.Router()

router.get('/auth-check', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ authenticated: true, userId: req.user._id.toString() });
    } else {
        res.status(200).json({authenticated: false})
    }

})


export default router;

