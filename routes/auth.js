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
// User model
const User = require('../models/User');
// Auth middleware
const auth = require('../middleware/auth');

// @route    GET api/auth
// @desc     get logged in user
// @access   private
router.get('/', auth, async (req, res) => {
  try {
    // Get logged in user
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// @route    POST api/auth
// @desc     Login  user
// @access   public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please include a password').exists()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get login details from request
    const { email, password } = req.body;

    try {
      // Check email
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

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
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
