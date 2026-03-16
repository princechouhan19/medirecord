const mongoose = require('mongoose');

// Known stale indexes from old schema versions that must be dropped.
// Any unique index on nullable fields causes E11000 when multiple docs have null.
const STALE_INDEXES = [
  { collection: 'patients', index: 'aadhaar_1' },           // v1: unique aadhaar
  { collection: 'patients', index: 'aadhaar_1_clinic_1' },  // v2: unique aadhaar+clinic
  { collection: 'patients', index: 'phone_1_clinic_1' },    // possible old compound
  { collection: 'patients', index: 'phone_1' },             // possible old unique phone
  { collection: 'users',    index: 'aadhaar_1' },           // possible old user index
];

const dropStaleIndexes = async () => {
  try {
    for (const { collection, index } of STALE_INDEXES) {
      try {
        await mongoose.connection.collection(collection).dropIndex(index);
        console.log(`🗑  Dropped stale index: ${collection}.${index}`);
      } catch (e) {
        if (e.code !== 27 && e.codeName !== 'IndexNotFound') {
          console.warn(`  ⚠ Could not drop ${collection}.${index}: ${e.message}`);
        }
        // IndexNotFound (code 27) = already gone, silent skip
      }
    }
  } catch (e) {
    console.warn('Index cleanup warning:', e.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await dropStaleIndexes();
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
