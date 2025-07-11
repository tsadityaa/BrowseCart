const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://tsaditya35:sPSyEOnNHWFDBqc6@firstproj.9bglr.mongodb.net/TripSaga");
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
