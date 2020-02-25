const express = require('express');
const router = express.Router();
// Auth middleware
const auth = require('../middleware/auth');
// Bringing in express-validator
const { check, validationResult } = require('express-validator');
// User model
const User = require('../models/User');
// Idea model
const Idea = require('../models/Idea');

// @route    GET  api/ideas
// @desc     Show users ideas
// @access   private
router.get('/', auth, async (req, res) => {
  try {
    const ideas = await Idea.find({ user: req.user.id }).sort({ date: -1 });
    res.json(ideas);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route    POST  api/ideas
// @desc     Ad an idea
// @access   private
router.post(
  '/',
  [check('name', 'Please enter your idea name').exists()],
  auth,
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    // Get attributes from request
    const { name, description, points, realised } = req.body;

    try {
      // Create new idea
      const idea = new Idea({ name, description, points, realised });
      // Add user id
      idea.user = req.user.id;
      // Save new idea
      await idea.save();

      res.json(idea);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    PUT  api/ideas/:id
// @desc     Edit an idea
// @access   private
router.put('/:id', auth, async (req, res) => {
  const { name, description, points, realised } = req.body;
  const contactFields = {};
  if (name) contactFields.name = name;
  if (description) contactFields.description = description;
  if (points) contactFields.points = points;
  if (realised) contactFields.realised = realised;

  try {
    //Make sure the idea exists
    let idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ msg: 'Idea not found' });

    // Make sure the idea belongs to logeed in user
    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unothorized' });
    }

    // Update the idea
    idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true }
    );

    res.json(idea);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route    DELETE  api/ideas/:id
// @desc     Delete an idea
// @access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Make sure the idea exists
    let idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ msg: 'Idea not found' });

    // Make sure the idea belongs to logeed in user
    if (idea.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Unothorized' });
    }

    // Delete the idea
    await Idea.findByIdAndRemove(req.params.id);

    res.send('Idea deleted');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
