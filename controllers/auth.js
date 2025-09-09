// Controllers & ROUTES // 

const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");



router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs");
});

router.post("/sign-up", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.send("Username already taken.");
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.send("Password and Confirm Password must match");
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;

    const user = await User.create(req.body);
    res.send(`Thanks for signing up ${user.username}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong.");
  }
});

module.exports = router;
