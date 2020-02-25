const express = require('express');
const router = express.Router();
// Bringing in express-validator
const { check, validationResult } = require('express-validator');
// For password hashing
const bcrypt = require('bcryptjs');
// For user authentication
const jwt = require('jsonwebtoken');
// config to get to the jwt secret
const config = require('config');
// Auth middleware
const auth = require('../middleware/auth');
// User model
const User = require('../models/User');
//Idea model
const Idea = require('../models/Idea');

// @route    POST api/users
// @desc     register user
// @access   public
router.post(
  '/',
  [
    check('name', 'Please add name').exists(),
    check('email', 'Please, include a valid email').isEmail(),
    check('password', 'Please a password with 6 or more characters').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Get attributes from request
    const { name, email, password } = req.body;

    try {
      // Check if a user wth this email already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }
      // Create new user
      user = new User({
        name,
        email,
        password
      });

      // encrypting password with bcrypt
      const salt = await bcrypt.genSalt(10);
      // add encrypted password to new user
      user.password = await bcrypt.hash(password, salt);

      //Save new user
      await user.save();

      // Object to send with jwt
      const payload = {
        user: {
          id: user.id
        }
      };

      // Sign JWT and return a token
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 36000
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/users
// @desc     delete a  user
// @access   private
router.delete('/', auth, async (req, res) => {
  try {
    // Make sure user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Remove user
    await User.findByIdAndRemove(req.user.id);
    // Remove ideas belonging to this user
    await Idea.find({ user: req.user.id }).remove();

    res.send('User deleted');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
