// Imports
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
const User = require("./models/user.js");

// Route Imports
const gamesController = require('./controllers/games.js');
const authController = require("./controllers/auth.js");
const userController = require("./controllers/user.js");

// Middleware Imports
const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

// App-level constants
const app = express();
const port = process.env.PORT || "5001";

// Database Connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      // Session expires after 1 day
      maxAge: 1000 * 60 * 60 * 24 * 1,
    },
  })
);
app.use(passUserToView);
// Middleware to handle flash messages
app.use((req, res, next) => {
  // if there's a flash message in the session, make it available in the views
  if (req.session.error) {
    res.locals.error = req.session.error;
    delete req.session.error;
  }
  if (req.session.formInput) {
    res.locals.formInput = req.session.formInput;
    delete req.session.formInput;
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs", {
    title: "Welcome to Finish It!",
  });
});

app.get("/community", async (req, res) => {
  try {
    const users = await User.find({}).lean();

    // For each user, find their most recently added game.
    const usersWithActivity = users.map(user => {
      let latestGame = null;

      if (user.games && user.games.length > 0) {
        // Sort by dateAdded descending to find the most recent one.
        user.games.sort((a, b) => b.dateAdded - a.dateAdded);
        latestGame = user.games[0];
      }

      return { ...user, latestGame };
    });

    res.render("community/index.ejs", {
      users: usersWithActivity,
      title: "Community",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.use('/users/:userId/games', gamesController);

app.use("/auth", authController);
// The isSignedIn middleware will protect all routes below it
app.use(isSignedIn);

// Routers
app.use('/users', userController);

// Server Listening
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`)
});
