const jwt = require("jsonwebtoken");

const generateAccessToken = async (data) => {
  if (data.password) {
    delete data.password;
  }
  return jwt.sign(data, process.env.JSONTOKEN_PRIVATE_KEY);
};

module.exports = generateAccessToken;
