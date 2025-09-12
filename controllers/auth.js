const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// Render the sign-up form
router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs", { error: null, title: "Sign Up" });
});

// Handle sign-up form submission
router.post("/sign-up", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.render("auth/sign-up.ejs", { error: "Username already taken.", title: "Sign Up" });
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.render("auth/sign-up.ejs", { error: "Password and Confirm Password must match.", title: "Sign Up" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
    });

    // After creating the user, log them in by creating a session
    req.session.user = {
      username: user.username,
      id: user._id.toString(),
    };

    // Redirect to the home page
    req.session.save(() => {
      res.redirect(`/users/${user.id}/games`);
    });
  } catch (error) {
    console.log(error);
    res.render("auth/sign-up.ejs", { error: "Something went wrong. Please try again.", title: "Sign Up" });
  }
});

// Render the sign-in form
router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs", { error: null, title: "Sign In" });
});

// Handle sign-in form submission
router.post("/sign-in", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (!userInDatabase) {
      return res.render("auth/sign-in.ejs", { error: "Username not found.", title: "Sign In" });
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, userInDatabase.password);

    if (!isPasswordCorrect) {
      return res.render("auth/sign-in.ejs", { error: "Incorrect password.", title: "Sign In" });
    }

    req.session.user = {
      username: userInDatabase.username,
      id: userInDatabase._id.toString(),
    };

    req.session.save(() => {
      res.redirect(`/users/${userInDatabase.id}/games`);
    });
  } catch (error) {
    console.log(error);
    res.render("auth/sign-in.ejs", { error: "Something went wrong. Please try again.", title: "Sign In" });
  }
});

// Handle sign-out
router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
