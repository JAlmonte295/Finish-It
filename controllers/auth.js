const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

router.get("/sign-up", (req, res) => {
  res.render("auth/sign-up.ejs", { title: "Sign Up" });
});

router.post("/sign-up", async (req, res) => {
  try {
    let errorMessage;
    // Check for username, but make it case-insensitive
    const userInDatabase = await User.findOne({
      username: { $regex: new RegExp(`^${req.body.username}$`, "i") },
    });
    if (userInDatabase) {
      errorMessage = "Username already taken.";
    } else if (req.body.password !== req.body.confirmPassword) {
      errorMessage = "Password and Confirm Password must match.";
    }

    if (errorMessage) {
      req.session.error = errorMessage;
      req.session.formInput = { username: req.body.username };
      return req.session.save(() => res.redirect('/auth/sign-up'));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
    });

    req.session.user = {
      username: user.username,
      id: user._id.toString(),
    };

    req.session.save(() => {
      res.redirect(`/users/${user.id}/games`);
    });
  } catch (error) {
    req.session.error = "Something went wrong. Please try again.";
    return req.session.save(() => res.redirect('/auth/sign-up'));
  }
});

router.get("/sign-in", (req, res) => {
  res.render("auth/sign-in.ejs", { title: "Sign In" });
});

router.post("/sign-in", async (req, res) => {
  try {
    const from = req.get('Referer') || '/';
    const userInDatabase = await User.findOne({
      username: { $regex: new RegExp(`^${req.body.username}$`, "i") },
    });
    let errorMessage;

    if (!userInDatabase) {
      errorMessage = "Invalid username or password.";
    } else {
      const isPasswordCorrect = await bcrypt.compare(req.body.password, userInDatabase.password);
      if (!isPasswordCorrect) {
        errorMessage = "Invalid username or password.";
      }
    }

    if (errorMessage) {
      req.session.error = errorMessage;
      req.session.formInput = { username: req.body.username };
      return req.session.save(() => res.redirect(from));
    }

    req.session.user = {
      username: userInDatabase.username,
      id: userInDatabase._id.toString(),
    };

    req.session.save(() => {
      res.redirect(`/users/${userInDatabase.id}/games`);
    });
  } catch (error) {
    res.redirect('/');
  }
});

router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
