const imagekit = require('../config/imagekit');

// GET /api/imagekit/auth - for client-side ImageKit SDK auth
const getAuth = (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate ImageKit auth.' });
  }
};

module.exports = { getAuth };
