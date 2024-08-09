const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const isAuthenticated = require("../middleware/isAuthenticated");

const Offer = require("../Models/Offer");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offers/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, brand, size, color, city } =
        req.body;

      const pictureToUpload = req.files.picture;

      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload)
      );

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ÉTAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,

        product_image: {
          secure_url: result.secure_url,
        },
      });

      const responseObj = newOffer;
      responseObj.owner = {
        account: req.user.account,
        _id: req.user._id,
      };

      await newOffer.save();
      return res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    let { title, priceMin, priceMax, sort, page } = req.query;
    const filters = {};

    if (title) {
      filters.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filters.product_price = {
        $gte: priceMin,
      };
    }

    if (priceMax) {
      filters.product_price = {
        $lte: priceMax,
      };
    }

    if (priceMin && priceMax) {
      filters.product_price = {
        $lte: priceMax,
        $gte: priceMin,
      };
    }

    const sorts = {};

    if (sort === "price-desc") {
      sorts = { product_price: "desc" };
    } else if (sort === "price-asc") {
      sorts = { product_price: "asc" };
    }

    page = 1;
    let limit;
    let offerToSkip;

    if (page) {
      limit = 20;
      offerToSkip = (page - 1) * limit;
    }

    const offers = await Offer.find(filters)
      .sort(sorts)
      .skip(offerToSkip)
      .limit(limit)
      .populate({
        path: "owner",
        select: "account _id",
      });

    if (offers.length === 0) {
      res
        .status(400)
        .json({ message: "Rien ne correspond à votre recherche." });
    } else {
      return res.status(201).json({ count: offers.length, offers: offers });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account _id",
    });

    if (offer) {
      res.json(offer);
    } else {
      res.status(400).json({ message: "Aucune annonce a été trouvé" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
