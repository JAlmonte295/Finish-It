// Imports
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");

// Route Imports
const applicationsController = require('./controllers/applications.js');
const authController = require("./controllers/auth.js");

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
  })
);
app.use(passUserToView);

// Routes
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect(`/users/${req.session.user.id}/applications`);
  } else {
    res.render("index.ejs", {
  });
  }
});

app.use("/auth", authController);
app.use(isSignedIn);
app.use('/users/:userId/applications', applicationsController); // All routes here will be protected

// Server Listening
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
