const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const userRoute = require("./routers/userRoute");
const adminRoute = require("./routers/adminRoute");
const nocache = require("nocache");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const path = require("path");
const connectDB = require("./database/connection");
const session = require("express-session");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  // res.setHeader("Expires", "0");
  next();
});
app.use(flash());
app.use(nocache());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(morgan("tiny"));

app.use(express.static("public"));
app.use(cookieParser());

// mongodb connection
connectDB();

// load assets
app.use(express.static(path.join(__dirname, "/public")));
// load routers /
app.use("/", userRoute);
app.use("/admin", adminRoute);

app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
