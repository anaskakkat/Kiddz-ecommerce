const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userDb",
      required: true,
    },
    orderId: {
      type: String,
    },
    delivery_address: {
      type: String,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    date: {
      type: String,
      required: true,
    },
    expected_delivery: {
      type: String,
      required: true,
    },
    status: {
      default: "Placed",
      type: String,
      required: true,
    },
    payment: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
    },
    razorpaOrderId: {
      type: String,
    },
    total: {
      type: Number,
    },
    cancelationReason: {
      type: String,
      default: "null",
    },
    returnReason: {
      type: String,
      default: "null",
    },
    razorpay_paymentID: {
      type: String,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        total_price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
