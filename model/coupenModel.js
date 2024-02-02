const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponName: String,
  couponCode: String,
  discountAmount: Number,
  description: String,
  expiryDate: Date,
});

const Coupons = mongoose.model("Coupon", couponSchema);

module.exports = Coupons;
