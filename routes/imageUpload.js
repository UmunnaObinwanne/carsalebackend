import express from 'express';
import multerConfig from '../config/cloudinary.js'; // Path to your multer config

const router = express.Router();

router.post('/upload-image', multerConfig.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrls = req.files.map(file => file.path); // Cloudinary stores the URL in the `path` field

  res.json({ message: 'Images uploaded successfully', imageUrls });
});

export default router;
