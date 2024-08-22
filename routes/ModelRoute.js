import express from 'express';
import CarModels from '../models/Model.js';

const router = express.Router();

// Get all Car Models
router.get('/models', async (req, res) => {
    try {
        const response = await CarModels.find();
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch car models', details: error.message });
    }
});

export default router;
