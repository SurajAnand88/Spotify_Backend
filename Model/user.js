const { default: mongoose } = require("mongoose");

const userScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatarUrl: String,
  authType: String,
  isPremium: Boolean,
  likedSongs: [],
  playList: [],
});

const User = mongoose.model("user", userScheme);

module.exports = User;
