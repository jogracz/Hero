const express = require('express');
const router = express.Router();

// @route    GET api/auth
// @desc     get logged in user
// @access   private
router.get('/', (req, res) => {
  res.send('Get logged in user');
});

// @route    POST api/auth
// @desc     Login  user
// @access   public
router.post('/', (req, res) => {
  res.send('Log in user');
});

module.exports = router;
