const express = require('express');
const { getGuilds } = require('../controllers/guildController');
const router = express.Router();

router.get('/', getGuilds);

module.exports = router;
