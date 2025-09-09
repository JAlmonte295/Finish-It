const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const session = require("express-session");


const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const port = process.env.PORT ? process.env.PORT : "5001";

const authController = require("./controllers/auth.js");
const MongoStore = require("connect-mongo");


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


// GET //
app.get("/", (req, res) => {
  res.render("index.ejs", {
    user: req.session.user,
  });
});

app.use("/auth", authController);



// Port listen //
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
