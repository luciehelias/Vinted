const express = require("express");
const cors = require("cors");

const createStripe = require("stripe");

const router = express.Router();

const stripe = createStripe(process.env.STRIPE_API_SECRET);

const app = express();
app.use(cors());
app.use(express.json());

router.post("/payment", async (req, res) => {
  try {
    const { paymentIntent } = await stripe.paymentIntents.create({
      amount: (req.body.amount * 100).toFixed(0),
      currency: "eur",
      description: `Paiement effectué pour cet article : ${req.body.title}`,
      source: req.body.token,
    });

    res.json({ paymentIntent });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
