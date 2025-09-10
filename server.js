const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const session = require("express-session");

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const applicationsController = require('./controllers/applications.js');

const authController = require("./controllers/auth.js");
const MongoStore = require("connect-mongo");

const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

const port = process.env.PORT ? process.env.PORT : "5001";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});


// Middleware //
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

app.use(passUserToView);

// GET //
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect(`/users/${req.session.user._id}/applications`);
  } else {
    res.render("index.ejs", {
  });
  }
});

app.use("/auth", authController);
app.use(isSignedIn);
app.use('/users/:userId/applications', applicationsController);

app.use(isSignedIn);



// Port listen //
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
