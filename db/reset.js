
// This script will remove all data from the 'users' collection in your database.
// Use with caution! It's intended for development purposes to clear out test data.

const dotenv = require('dotenv');
dotenv.config(); // Loads environment variables from .env file in the root
const mongoose = require('mongoose');
const User = require('../models/user.js');
const readline = require('readline');

async function resetDatabase() {
  try {
    // 1. Connect to the database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB to reset data.`);

    // 2. Delete all users
    const result = await User.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} users.`);

  } catch (error) {
    console.error('An error occurred while resetting the database:', error);
  } finally {
    // 3. Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Create a confirmation prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  This script will permanently delete ALL users from your database.');
rl.question('Are you sure you want to continue? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('Proceeding with database reset...');
    resetDatabase();
  } else {
    console.log('Database reset cancelled.');
  }
  rl.close();
});
