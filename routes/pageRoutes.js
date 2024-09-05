import express from 'express';
import Page from '../models/pageModel.js'; // Import the Page model

// Route to serve a specific page by its slug
const router = express.Router();

// Custom route to fetch page by slug
router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true });
    console.log(page)

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({
      _id: page._id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      isPublished: page.isPublished,
      description: page.description,
      featuredImage: page.featuredImage,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/pages', async (req, res) => {
  try {
    const pages = await Page.find({ isPublished: true });
    return res.status(200).send(pages); // Ensure the response is JSON
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});




export default router;
