require("dotenv").config();

const mongoose = require("mongoose");

function connectDB() {
  const CONNECTION_STRING = process.env.CONNECTION_STRING;
  mongoose
    .connect(CONNECTION_STRING)

    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error.message);
    });
}

module.exports = connectDB;
