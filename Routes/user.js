const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

const User = require("../Models/User");
const fileUpload = require("express-fileupload");

const cloudinary = require("cloudinary").v2;

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    console.log(req.files);

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Information missing " });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(409).json({ message: "This email is already taken " });
    } else if (!username) {
      return res.status(409).json({ message: "Please choose an username " });
    } else {
      const salt = uid2(16);
      const hash = SHA256(password + salt).toString(encBase64);
      const token = uid2(64);

      const avatar = req.files.avatar;

      const result = await cloudinary.uploader.upload(convertToBase64(avatar));

      const newUser = new User({
        email: email,
        account: {
          username: username,
          avatar: result.secure_url,
        },
        newsletter: newsletter,
        token: token,
        hash: hash,
        salt: salt,
      });

      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { username, email, password, newsletter, avatar } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    const hash = SHA256(password + user.salt).toString(encBase64);
    if (hash === user.hash) {
      return res.status(201).json({
        _id: user._id,
        token: user.token,
        username: user.account,
      });
    } else {
      return res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error);
  }
});

module.exports = router;
