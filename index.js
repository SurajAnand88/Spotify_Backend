const express = require("express");
const connect = require("./Config/connect");
const {
  registerRoute,
  loginRoute,
  loggedInUserRoute,
  addLikedSongRouter,
  removeLikedSongRouter,
  likedSongsRouter,
  premiumUserRouter,
  googleAuthRoute,
} = require("./Routes/userRoute");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
const port = process.env.PORT || 4000;

connect();

app.post("/signup", registerRoute);
app.post("/login", loginRoute);
app.get("/loginUser", loggedInUserRoute);
app.get("/loggedInUser", loggedInUserRoute);
app.get("/getLikedSongList/:id", likedSongsRouter);
app.post("/addSong/:id", addLikedSongRouter);
app.post("/removeSong/:id", removeLikedSongRouter);
app.get("/premium/:id", premiumUserRouter);
app.post("/user/google-auth", googleAuthRoute);

app.listen(port, () => {
  console.log(`server listening at port ${port}`);
});
