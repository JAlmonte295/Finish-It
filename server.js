const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const MongoStore = require("connect-mongo");
const User = require("./models/user.js");

const gamesController = require('./controllers/games.js');
const authController = require("./controllers/auth.js");
const userController = require("./controllers/user.js");

const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');

const app = express();
const port = process.env.PORT || "5001";

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false, 
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 1,
    },
  })
);
app.use(passUserToView);
app.use((req, res, next) => {
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

app.get("/", (req, res) => {
  res.render("index.ejs", {
    title: "Welcome to Finish It!",
  });
});

app.get("/community", async (req, res) => {
  try {
    const users = await User.find({}).lean();

    const usersWithActivity = users.map(user => {
      let latestGame = null;

      if (user.games && user.games.length > 0) {
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
    res.redirect("/");
  }
});

app.use('/users/:userId/games', gamesController);

app.use("/auth", authController);
app.use(isSignedIn);

app.use('/users', userController);

app.listen(port);
