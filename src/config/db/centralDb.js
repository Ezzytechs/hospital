const mongoose = require('mongoose');

async function connectCentralDb(uri) {
  if (!uri) {
    console.error('CENTRAL_MONGO_URI not provided');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      // recommended options are default in Mongoose 6+
    });
    console.log('Central DB connected');
  } catch (err) {
    console.error('Central DB connection failed', err);
    process.exit(1);
  }
}

module.exports = connectCentralDb;


