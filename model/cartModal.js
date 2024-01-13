const mongoose = require("mongoose");

const cartSchema =new  mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userdbs",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      qty: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
