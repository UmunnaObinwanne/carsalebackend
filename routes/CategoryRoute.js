import express from 'express'

const router = express.Router();

import Categories from '../models/Category.js'


// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const response = await Categories.find()
        res.json(response)
        
    } catch (error) {
        res.status(500).json({ error: 'Error fetching categories', details: error.message })
    }
}); 


export default router;