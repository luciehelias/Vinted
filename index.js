const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

const userRouter = require("./Routes/user");
const offerRouter = require("./Routes/offer");

app.use(userRouter);
app.use(offerRouter);
//app.use("/user", useRoutes);
//permet de faire un raccourci et éviter d'écrire /user dans toutes les routes

app.all("*", (req, res) => {
  return res.status(404).json("Not found");
});

app.listen(process.env.PORT, () => {
  console.log("Serveur started");
});
