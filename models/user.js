// SCHEMA //

const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  dateAdded: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Dropped'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  boxArt: {
    type: String,
  },
  notes: {
    type: String,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  games: [gameSchema],
});


const User = mongoose.model("User", userSchema);

module.exports = User;
