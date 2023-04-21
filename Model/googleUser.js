const mongoose = require("mongoose");
const googleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatarUrl: String,
  authType: String,
  isPremium: Boolean,
  likedSongs: [],
  playList: [],
});

const GoogleUser = mongoose.model("GoogleUser", googleSchema);

module.exports = GoogleUser;
