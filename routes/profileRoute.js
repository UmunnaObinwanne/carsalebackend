import express from 'express';
import User from '../models/UserModel.js';

import authenticateJWT from '../middleware/jwtMiddleware.js';
// Import Advert if it's needed
// import Advert from '../models/AdvertModel.js'; 

const router = express.Router();



// Update user profile
router.put('/profile', authenticateJWT, async (req, res) => {
  const { username, email, profilePicture, Location, City, Area, Street, ZIP, phone, About } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.profilePicture = profilePicture || user.profilePicture;
    user.Location = Location || user.Location;
    user.City = City || user.City;
    user.Area = Area || user.Area;
    user.Street = Street || user.Street;
    user.ZIP = ZIP || user.ZIP;
    user.phone = phone || user.phone;
    user.About = About || user.About;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all adverts posted by a specific user
router.get('/user-adverts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure Advert model is imported if used
    const adverts = await Advert.find({ postedBy: userId })
      .populate('category', 'name') // Populate category field with name
      .populate('model', 'name') // Populate model field with name
      .populate('postedBy', 'username') // Populate postedBy field with username
      .exec();

    if (!adverts || adverts.length === 0) {
      return res.status(404).json({ message: 'No adverts found for this user' });
    }

    res.status(200).json(adverts);
  } catch (error) {
    console.error('Error fetching user adverts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get profile of logged in user
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});



export default router;
