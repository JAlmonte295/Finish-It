const dotenv = require('dotenv');
dotenv.config(); 
const mongoose = require('mongoose');
const User = require('../models/user.js');
const readline = require('readline');

async function resetDatabase() {
  try {

    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB to reset data.`);

    const result = await User.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} users.`);

  } catch (error) {
    console.error('An error occurred while resetting the database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

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
