const mongoose = require("mongoose");

const wishList = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        price: Number,
      },
    ],
    orderby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userDb",
    },
  },
  {
    timestamps: true,
  }
);

const Wishlist= mongoose.model("WishList", wishList);
module.exports =Wishlist