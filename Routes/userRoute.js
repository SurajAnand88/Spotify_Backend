const express = require("express");
const User = require("../Model/user");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const generateAccessToken = require("../Config/generateAccessToken");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { generateOtp } = require("../Config/generateOtp");
const GoogleUser = require("../Model/googleUser");

const registerRoute = async (req, res, next) => {
  const data = req.body;
  data.authType = "form";
  try {
    const user = await User.find({ email: [data.email] });
    if (user.length > 0) {
      res.status(500).send("user already registered with this email");
    } else {
      data.password = bcrypt.hashSync(data.password);
      await User.create({
        ...data,
        avatarUrl:
          "https://th.bing.com/th/id/OIP.P2_NTApRZV05L-lamcKRQAAAAA?w=162&h=180&c=7&r=0&o=5&pid=1.7",
        isPremium: false,
      });
      const otp = await generateOtp();
      res
        .cookie("OTP", otp, {
          expires: new Date(Date.now() + 30000),
        })
        .send("Registration Successful")
        .status(200);
    }
  } catch (error) {
    res.send(error.message).status(500);
  }
};

const loginRoute = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: [email] }).select(
      "_id name email password authType avatarUrl isPremium likedSongs playList"
    );

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        const token = await generateAccessToken(user.toJSON());
        user.toJSON();
        delete user.password;
        res
          .send({
            token,
            user,
            message: "Access Granted , You have Logged in successfully",
          })
          .status(200);
      } else {
        res.send("Invalid Password").status(300);
      }
    } else {
      res.send("Invalid Email").status(400);
    }
  } catch (error) {
    res.send(error.message).status(500);
  }
};

const loggedInUserRoute = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split(" ")[1];
      if (token) {
        let user = await jwt.verify(token, process.env.JSONTOKEN_PRIVATE_KEY);

        if (user.authType === "google") {
          user = await GoogleUser.findOne({ _id: user._id }).select(
            "_id name email authType avatarUrl isPremium likedSongs playList"
          );
        } else {
          user = await User.findOne({ _id: user._id }).select(
            "_id name email authType avatarUrl isPremium likedSongs playList"
          );
        }
        res
          .send({
            user,
          })
          .status(200);
      } else {
        res.send("Invalid Token ").status(300);
      }
    } else {
      res.send("Invalid authorization Headers");
    }
  } catch (error) {
    res.send(error.message).status(500);
  }
};

//Google auth route

async function googleAuthRoute(req, res) {
  const data = req.body;
  try {
    let user = await GoogleUser.findOne({
      email: data.email,
    });

    if (!user) {
      user = await GoogleUser.create({
        name: data.name,
        avatarUrl: data.picture,
        email: data.email,
        authType: "google",
        isPremium: false,
      });
    }
    const token = await generateAccessToken(user.toJSON());
    res
      .send({
        user,
        token,
      })
      .status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

//AddlikedSong
const addLikedSongRouter = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    var song = null;
    var users = await User.findOne({ _id: id }).select(
      "_id name email authType avatarUrl isPremium likedSongs playList"
    );

    if (!users) {
      users = await GoogleUser.findOne({ _id: id }).select(
        "_id name email authType avatarUrl isPremium likedSongs playList"
      );
      song = await GoogleUser.findOne({ "likedSongs.songName": data.songName });
    } else {
      song = await User.findOne({ "likedSongs.songName": data.songName });
    }

    if (song === null) {
      if (users.authType === "google") {
        await GoogleUser.updateOne(
          { _id: id },
          {
            $push: {
              likedSongs: data,
            },
          }
        );
      } else {
        await User.updateOne(
          { _id: id },
          {
            $push: {
              likedSongs: data,
            },
          }
        );
      }
    }
    var user;
    if (users.authType === "google") {
      user = await GoogleUser.findOne({ _id: id }).select(
        "_id name email authType avatarUrl isPremium likedSongs playList"
      );
    } else {
      user = await User.findOne({ _id: id }).select(
        "_id name email authType avatarUrl isPremium likedSongs playList"
      );
    }
    res.send({ user }).status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const removeLikedSongRouter = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    var users = await User.findOne({ _id: id }).select(
      "_id name email authType avatarUrl isPremium likedSongs playList"
    );

    if (!users) {
      users = await GoogleUser.findOne({ _id: id }).select(
        "_id name email authType avatarUrl isPremium likedSongs playList"
      );
    }
    if (users.authType === "google") {
      await GoogleUser.updateOne(
        { _id: id },
        {
          $pull: {
            likedSongs: { songName: data.songName },
          },
        }
      );
    } else {
      await User.updateOne(
        { _id: id },
        {
          $pull: {
            likedSongs: { songName: data.songName },
          },
        }
      );
    }

    var user = await User.findOne({ _id: id }).select(
      "_id name email authType avatarUrl isPremium likedSongs playList"
    );

    if (!user) {
      user = await GoogleUser.findOne({ _id: id }).select(
        "_id name email authType avatarUrl isPremium likedSongs playList"
      );
    }

    res.send({ user }).status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const likedSongsRouter = async (req, res) => {
  console.log("LIKes");
  try {
    // const { id } = req.params;
    var likedSongs;

    const { authorization } = req.headers;
    if (authorization) {
      const token = authorization.split(" ")[1];
      if (token) {
        let user = await jwt.verify(token, process.env.JSONTOKEN_PRIVATE_KEY);
        console.log(user);
        if (user.authType === "google") {
          likedSongs = await GoogleUser.findOne({ _id: user.id }).select(
            "likedSongs"
          );
        } else {
          likedSongs = await User.findOne({ _id: user.id }).select(
            "likedSongs"
          );
        }
        console.log(likedSongs);
        res.send(likedSongs).status(200);
      } else {
        res.send("Invalid Token ").status(300);
      }
    } else {
      res.send("Invalid authorization Headers");
    }

    // var user = await User.findOne({ _id: id }).select(
    //   "_id name email authType avatarUrl isPremium likedSongs playList"
    // );

    // if (!user) {
    //   user = await GoogleUser.findOne({ _id: id }).select(
    //     "_id name email authType avatarUrl isPremium likedSongs playList"
    //   );
    //   var { likedSongs } = await GoogleUser.findOne({ _id: id }).select(
    //     "likedSongs"
    //   );
    // } else {
    //   var { likedSongs } = await User.findOne({ _id: id }).select("likedSongs");
    // }

    // res.send(likedSongs).status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const premiumUserRouter = async (req, res) => {
  try {
    const { id } = req.params;
    var users = await User.findOne({ id: id });
    var user;
    if (!users) {
      user = await GoogleUser.updateOne(
        { _id: id },
        {
          $set: {
            isPremium: true,
          },
        }
      );
    } else {
      user = await User.updateOne(
        { _id: id },
        {
          $set: {
            isPremium: true,
          },
        }
      );
    }
    res.send({ user }).status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  registerRoute,
  loginRoute,
  loggedInUserRoute,
  googleAuthRoute,
  addLikedSongRouter,
  removeLikedSongRouter,
  likedSongsRouter,
  premiumUserRouter,
};
