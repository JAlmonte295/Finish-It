// SCHEMA //

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Dropped'],
  }
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
  applications: [applicationSchema],
});


const User = mongoose.model("User", userSchema);

module.exports = User;
