import express from 'express';
import Advert from '../models/AdvertModel.js'; // Path to your Advert model
import UserModel from '../models/UserModel.js'; // Path to your User model
import authenticateJWT from '../middleware/jwtMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();


//Create new advert

// Route to create a new advert
router.post('/create-advert', authenticateJWT, async (req, res) => {
  try {
    const {
      title,
      category,
      model,
      price,
      description,
      postalCode,
      country,
      city,
      isFeatured,
      imageUrls,
      features,

      // New fields
      year,
      mileage,
      bodyType,
      colour,
      seats,
      doors,
      enginePower,
      engineSize,
      carName,
      topSpeed,
      acceleration,
      fuelConsumption,
      fuelCapacity,
      urbanMpg,
      extraUrbanMpg,
      insuranceGroup,
      co2Emissions,
      euroEmissions,
      transmission,
      driveType,
      fuelType,
      transaction
    } = req.body;

    console.log(req.body)

    // Get user ID from session
    const userId = req.user.userId; // Now this should be defined

    const user = await UserModel.findById(userId);

    console.log('post ad', user)

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Create a new advert
    const newAdvert = new Advert({
      title,
      category,
      model,
      price,
      description,
      country,
      city,
      postalCode,
      isFeatured,
      postedBy: user._id, // Store user ID in the `postedBy` field
      imageUrls, // Make sure this field is included
      features,

      // New fields
      year,
      mileage,
      bodyType,
      colour,
      seats,
      doors,
      enginePower,
      engineSize,
      carName,
      topSpeed,
      acceleration,
      fuelConsumption,
      fuelCapacity,
      urbanMpg,
      extraUrbanMpg,
      insuranceGroup,
      co2Emissions,
      euroEmissions,
         transmission,
      driveType,
      fuelType,
      transaction
    });
    // Save the advert to the database
    await newAdvert.save();

    // Increment the number of ads posted by the user
    user.NumberOfAdsPosted += 1;
    await user.save();

    res.status(201).json({ message: 'Advert created successfully', advert: newAdvert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});


router.get('/filter', async (req, res) => {
  try {
    console.log('Query parameters:', req.query);

    const { model, minPrice, maxPrice, minYear, maxYear, city, country, postalCode } = req.query;

    // Initialize the filter object
    const filter = {};

    // Validate and add model to filter if valid
    if (model && mongoose.Types.ObjectId.isValid(model)) {
      filter.model = new mongoose.Types.ObjectId(model);
    } else if (model) {
      console.log(`Invalid model ID: ${model}`);
    }

    // Validate and add location to filter if valid
    if (country) {
      filter.country = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
    }
    if (city) {
      // Use regex for case-insensitive search
      filter.city = new RegExp(`^${city}$`, 'i');
    }
    if (postalCode) {
      filter.postalCode = postalCode.charAt(0).toUpperCase() + postalCode.slice(1).toLowerCase();
    }

    // Handle price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice && !isNaN(minPrice)) {
        filter.price.$gte = parseFloat(minPrice); // Greater than or equal to minPrice
      }
      if (maxPrice && !isNaN(maxPrice)) {
        filter.price.$lte = parseFloat(maxPrice); // Less than or equal to maxPrice
      }
    }

    // Handle year range
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear && !isNaN(minYear)) {
        filter.year.$gte = parseInt(minYear, 10); // Greater than or equal to minYear
      }
      if (maxYear && !isNaN(maxYear)) {
        filter.year.$lte = parseInt(maxYear, 10); // Less than or equal to maxYear
      }
    }

    console.log('Filter object:', filter); // Debugging: Output the filter object

    // Fetch adverts based on filter
    const adverts = await Advert.find(filter)
      .populate('category', 'name')
      .populate('model', 'name')
      .populate('postedBy', 'username')
      .exec();

    res.status(200).json(adverts);
  } catch (error) {
    console.error('Error fetching adverts with filter:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});





//Get all adverts
router.get('/used-cars', async (req, res) => {
  try {
    const adverts = await Advert.find().populate('category', 'name') // Populate category field with name
      .populate('model', 'name') // Populate model field with name
      .populate('postedBy', 'username') // Populate postedBy field with username
      .exec();
    return res.status(200).json(adverts)
  } catch(error) {
    res.status(500).json({message: error.message})
  }
})

router.get('/adverts/:id', async (req, res) => {
  try {
    const advertId = req.params.id;


    if (!mongoose.Types.ObjectId.isValid(advertId)) {
    return res.status(400).json({ message: 'Invalid Advert ID' });
  }


    
    const advert = await Advert.findById(advertId)
      .populate('category', 'name') // Populate category field with name
      .populate('model', 'name') // Populate model field with name
      .populate('postedBy', 'username') // Populate postedBy field with username
      .exec();
    
    if (!advert) {
      return res.status(404).json({ message: 'Advert not found' });
    }

    res.json(advert);
  } catch (error) {
    console.error('Error fetching advert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all adverts posted by a specific user
router.get('/user-adverts/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

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


//post a bid
router.post('/bids',  authenticateJWT, async (req, res) => {
  const { advertId, amount } = req.body;
  const userId = req.user.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  console.log('this is the endpoint for bids', userId)

  try {
    const advert = await Advert.findById(advertId);

    if (!advert) {
      return res.status(404).json({ message: 'Advert not found' });
    }

    // Add the new bid
    advert.bids.push({ userId, amount });
    await advert.save();

    res.status(200).json({ message: 'Bid submitted successfully' });
  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({ message: 'Failed to submit bid' });
  }
});

// Edit advert
router.put('/edit-advert/:id', authenticateJWT, async (req, res) => {
  try {
    const advertId = req.params.id;
    const userId = req.user.userId;
    const {
      title,
      category,
      model,
      price,
      description,
      postalCode,
      country,
      city,
      imageUrls,
      features,

      // New fields
      year,
      mileage,
      bodyType,
      colour,
      seats,
      doors,
      enginePower,
      engineSize,
      topSpeed,
      acceleration,
      fuelConsumption,
      fuelCapacity,
      urbanMpg,
      carName,
      insuranceGroup,
      co2Emissions,
      euroEmissions, 
      transmission,
      driveType,
      fuelType,
      transaction
    } = req.body;

    // Check if the advert ID is valid
    if (!mongoose.Types.ObjectId.isValid(advertId)) {
      return res.status(400).json({ message: 'Invalid Advert ID' });
    }

    // Find the advert and ensure the user is the one who posted it
    const advert = await Advert.findById(advertId);
    if (!advert) {
      return res.status(404).json({ message: 'Advert not found' });
    }

    if (advert.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this advert' });
    }

    // Update advert fields
    advert.title = title || advert.title;
    advert.category = category || advert.category;
    advert.model = model || advert.model;
    advert.price = price || advert.price;
    advert.description = description || advert.description;
    advert.postalCode = postalCode || advert.postalCode;
    advert.country = country || advert.country;
    advert.city = city || advert.city;
    advert.imageUrls = imageUrls || advert.imageUrls;
    advert.features = features || advert.features;
    advert.year = year || advert.year;
    advert.mileage = mileage || advert.mileage;
    advert.bodyType = bodyType || advert.bodyType;
    advert.colour = colour || advert.colour;
    advert.seats = seats || advert.seats;
    advert.doors = doors || advert.doors;
    advert.enginePower = enginePower || advert.enginePower;
    advert.engineSize = engineSize || advert.engineSize;
    advert.carName = carName || advert.carName;
    advert.topSpeed = topSpeed || advert.topSpeed;
    advert.acceleration = acceleration || advert.acceleration;
    advert.fuelConsumption = fuelConsumption || advert.fuelConsumption;
    advert.fuelCapacity = fuelCapacity || advert.fuelCapacity;
    advert.urbanMpg = urbanMpg || advert.urbanMpg;
    advert.insuranceGroup = insuranceGroup || advert.insuranceGroup;
    advert.co2Emissions = co2Emissions || advert.co2Emissions;
    advert.euroEmissions = euroEmissions || advert.euroEmissions;
    advert.transmission = transmission || advert.transmission;
    advert.driveType = driveType || advert.driveType;
    advert.fuelType = fuelType || advert.fuelType;
    advert.transaction = transaction || advert.transaction;

    // Save the updated advert
    await advert.save();

    res.status(200).json({ message: 'Advert updated successfully', advert });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete advert
router.delete('/delete-advert/:id', authenticateJWT, async (req, res) => {
  try {
    const advertId = req.params.id;
    const userId = req.user.userId;

    // Check if the advert ID is valid
    if (!mongoose.Types.ObjectId.isValid(advertId)) {
      return res.status(400).json({ message: 'Invalid Advert ID' });
    }

    // Find the advert and ensure the user is the one who posted it
    const advert = await Advert.findById(advertId);
    if (!advert) {
      return res.status(404).json({ message: 'Advert not found' });
    }

    if (advert.postedBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this advert' });
    }

    // Delete the advert
    await Advert.findByIdAndDelete(advertId);

    // Decrement the number of ads posted by the user
    const user = await UserModel.findById(userId);
    if (user) {
      user.NumberOfAdsPosted -= 1;
      await user.save();
    }

    res.status(200).json({ message: 'Advert deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
});




export default router;
