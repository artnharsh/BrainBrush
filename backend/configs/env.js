require("dotenv").config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
};
