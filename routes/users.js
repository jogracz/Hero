const express = require('express');
const router = express.Router();

// @route    POST api/users
// @desc     register user
// @access   private
router.post('/', (req, res) => {
  res.send('Adding new user');
});

// @route    DELETE api/users/:id
// @desc     delete a  user
// @access   private
router.delete('/:id', (req, res) => {
  res.send('Deleting a user');
});

module.exports = router;
