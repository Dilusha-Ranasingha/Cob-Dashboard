const mongoose = require('mongoose');

let retries = 0;
const maxRetries = 10;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Please add it to your .env file.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      // force IPv4 on some networks where IPv6/DNS causes issues
      family: 4,
    });
    console.log('MongoDB Connected');

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (err) {
    const code = err?.code || err?.codeName || err?.name;
    console.error(`Mongo connection failed${code ? ` (${code})` : ''}: ${err?.message || err}`);

    if (retries < maxRetries) {
      const backoff = Math.min(30000, 2000 * Math.pow(1.5, retries));
      retries += 1;
      console.log(`Retrying Mongo connection in ${Math.round(backoff / 1000)}s... (attempt ${retries}/${maxRetries})`);
      await delay(backoff);
      return connectDB();
    }

    console.error('Max Mongo connection retries reached. Server will continue without DB connection.');
    // Do not exit; allow server to keep running so routes can return proper errors
  }
}

module.exports = connectDB;