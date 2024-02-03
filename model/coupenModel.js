const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponName: String,
  couponCode: String,
  discountAmount: Number,
  description: String,
  expiryDate: Date,
  usedBy: { type: mongoose.Schema.Types.ObjectId, 
    ref: "userDb" },
});

const Coupons = mongoose.model("Coupon", couponSchema);

module.exports = Coupons;
