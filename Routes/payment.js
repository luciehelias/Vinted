const express = require("express");
const createStripe = require("stripe");

const router = express.Router();

const stripe = createStripe(process.env.STRIPE_API_SECRET);

router.post("/payment", async (req, res) => {
  console.log(req.body);
  try {
    let { paymentIntent } = await stripe.paymentIntents.create({
      amount: (req.body.amount * 100).toFixed(0),
      currency: "eur",
      description: `Paiement vinted pour : ${req.body.title}`,
      source: req.body.token,
    });

    res.json({ paymentIntent });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
