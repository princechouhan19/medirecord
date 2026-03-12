const express = require('express');
const { getAuth } = require('../controllers/imagekit.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/auth', protect, getAuth);

module.exports = router;
