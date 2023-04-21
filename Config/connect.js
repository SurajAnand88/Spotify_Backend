const mongoose = require("mongoose");

async function connect() {
  try {
    mongoose
      .connect(
        "mongodb+srv://eeeerr00:U9JLBwwQ8dC1zPkx@cluster0.jgnxi3c.mongodb.net/spotify"
      )
      .then(console.log("connected  to the databasee"));
  } catch (err) {
    console.log(err);
  }
}

module.exports = connect;
