const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();


const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");

const port = process.env.PORT ? process.env.PORT : "5001";

const authController = require("./controllers/auth.js");


mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});


// Middleware //
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan('dev'));

// GET //
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use("/auth", authController);



// Port listen //
app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
