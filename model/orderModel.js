const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userdbs", // Make sure this matches the name of your User model
    required: true,
  },
  order_id: {
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
  date: {
    type: String,
    required: true,
  },
  expected_delivery: {
    type: String,
    required: true,
  },
  status: {
    // default:"pending",
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
  total: {
    type: Number,
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
      ordered_status: {
        type: String,
        default: "placed",
      },
      cancellationReason: {
        type: String,
      },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
