const https = require('https');

/**
 * Keeps the server alive by pinging the specified URL at regular intervals.
 * @param {string} url - The URL to ping.
 */
const keepAlive = (url) => {
  if (!url) {
    console.log('⚠️ No URL provided for keep-alive. Skipping self-ping.');
    return;
  }

  console.log(`📡 Keep-alive initiated for: ${url}`);
  
  // Ping every 45 seconds (45000ms)
  setInterval(() => {
    https.get(url, (res) => {
      // console.log(`Ping status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`❌ Error in keep-alive ping: ${err.message}`);
    });
  }, 45000);
};

module.exports = keepAlive;
