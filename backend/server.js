const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const keepAlive = require('./src/utils/keep-alive');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MediRecord Server running on port ${PORT}`);
    
    // Start keep-alive ping if RENDER_EXTERNAL_URL is set
    if (process.env.RENDER_EXTERNAL_URL) {
      keepAlive(process.env.RENDER_EXTERNAL_URL);
    }
  });
});
